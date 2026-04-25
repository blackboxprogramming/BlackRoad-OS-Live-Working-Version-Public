import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/init.js';
import { authenticateToken } from '../auth/middleware.js';
import { logActivity } from '../services/logger.js';
import { broadcastAgentUpdate } from '../websocket/handler.js';

const router = express.Router();

// GET /api/agents - List all agents
router.get('/', authenticateToken, (req, res) => {
  try {
    const agents = db.prepare(`
      SELECT * FROM agents
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    // Parse JSON fields
    agents.forEach(agent => {
      if (agent.metadata) agent.metadata = JSON.parse(agent.metadata);
    });

    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id - Get single agent with metrics
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const agent = db.prepare(`
      SELECT * FROM agents
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get recent metrics
    const metrics = db.prepare(`
      SELECT * FROM agent_metrics
      WHERE agent_id = ?
      ORDER BY timestamp DESC
      LIMIT 100
    `).all(req.params.id);

    if (agent.metadata) agent.metadata = JSON.parse(agent.metadata);

    res.json({ agent, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents - Create new agent
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      name, type, personality, capabilities,
      family, homeServer, metadata
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type required' });
    }

    const id = uuidv4();
    const now = Date.now();

    db.prepare(`
      INSERT INTO agents
      (id, user_id, name, type, status, personality, capabilities,
       family, home_server, created_at, last_seen, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, name, type, 'initializing',
      personality || null,
      capabilities || null,
      family || null,
      homeServer || null,
      now, now,
      metadata ? JSON.stringify(metadata) : null
    );

    logActivity(req.user.id, 'create', 'agent', id, `Created agent: ${name}`);
    broadcastAgentUpdate({ id, name, type, status: 'initializing' });

    res.status(201).json({ id, message: 'Agent created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/agents/:id - Update agent
router.patch('/:id', authenticateToken, (req, res) => {
  try {
    const { status, personality, capabilities, metadata } = req.body;
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (personality) {
      updates.push('personality = ?');
      params.push(personality);
    }
    if (capabilities) {
      updates.push('capabilities = ?');
      params.push(capabilities);
    }
    if (metadata) {
      updates.push('metadata = ?');
      params.push(JSON.stringify(metadata));
    }

    updates.push('last_seen = ?');
    params.push(Date.now());

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id, req.user.id);

    const result = db.prepare(`
      UPDATE agents
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    logActivity(req.user.id, 'update', 'agent', req.params.id, 'Updated agent');
    broadcastAgentUpdate({ id: req.params.id, status });

    res.json({ message: 'Agent updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents/:id/metrics - Add agent metrics
router.post('/:id/metrics', authenticateToken, (req, res) => {
  try {
    const { cpuUsage, memoryUsage, taskCount, uptime } = req.body;

    db.prepare(`
      INSERT INTO agent_metrics
      (agent_id, timestamp, cpu_usage, memory_usage, task_count, uptime)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      Date.now(),
      cpuUsage || null,
      memoryUsage || null,
      taskCount || null,
      uptime || null
    );

    // Update agent last_seen
    db.prepare('UPDATE agents SET last_seen = ? WHERE id = ?')
      .run(Date.now(), req.params.id);

    res.json({ message: 'Metrics recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/agents/:id - Delete agent
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM agents
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    logActivity(req.user.id, 'delete', 'agent', req.params.id, 'Deleted agent');
    broadcastAgentUpdate({ id: req.params.id, deleted: true });

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
