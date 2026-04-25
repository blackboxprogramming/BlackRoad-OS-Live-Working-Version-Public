import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/init.js';
import { authenticateToken } from '../auth/middleware.js';
import { broadcastHealthUpdate } from '../websocket/handler.js';

const router = express.Router();

// GET /api/health/nodes - Get all health nodes
router.get('/nodes', authenticateToken, (req, res) => {
  try {
    const nodes = db.prepare(`
      SELECT * FROM health_nodes
      WHERE user_id = ?
      ORDER BY name
    `).all(req.user.id);

    nodes.forEach(node => {
      if (node.metadata) node.metadata = JSON.parse(node.metadata);
    });

    res.json({ nodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/health/nodes - Register new node
router.post('/nodes', authenticateToken, (req, res) => {
  try {
    const { name, type, ipAddress, metadata } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO health_nodes
      (id, user_id, name, type, ip_address, status, last_heartbeat, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, name, type, ipAddress || null,
      'initializing', Date.now(),
      metadata ? JSON.stringify(metadata) : null
    );

    res.status(201).json({ id, message: 'Node registered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/health/nodes/:id/heartbeat - Update node heartbeat
router.post('/nodes/:id/heartbeat', authenticateToken, (req, res) => {
  try {
    const { status, cpuUsage, memoryUsage, diskUsage, metadata } = req.body;

    const result = db.prepare(`
      UPDATE health_nodes
      SET status = ?,
          cpu_usage = ?,
          memory_usage = ?,
          disk_usage = ?,
          last_heartbeat = ?,
          metadata = ?
      WHERE id = ? AND user_id = ?
    `).run(
      status || 'online',
      cpuUsage || null,
      memoryUsage || null,
      diskUsage || null,
      Date.now(),
      metadata ? JSON.stringify(metadata) : null,
      req.params.id,
      req.user.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    broadcastHealthUpdate({
      id: req.params.id,
      status,
      cpuUsage,
      memoryUsage,
      diskUsage
    });

    res.json({ message: 'Heartbeat recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health/stats - Get health statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalNodes: db.prepare('SELECT COUNT(*) as count FROM health_nodes WHERE user_id = ?').get(req.user.id).count,
      onlineNodes: db.prepare('SELECT COUNT(*) as count FROM health_nodes WHERE user_id = ? AND status = ?').get(req.user.id, 'online').count,
      offlineNodes: db.prepare('SELECT COUNT(*) as count FROM health_nodes WHERE user_id = ? AND status = ?').get(req.user.id, 'offline').count,
      avgCpu: db.prepare('SELECT AVG(cpu_usage) as avg FROM health_nodes WHERE user_id = ? AND cpu_usage IS NOT NULL').get(req.user.id).avg || 0,
      avgMemory: db.prepare('SELECT AVG(memory_usage) as avg FROM health_nodes WHERE user_id = ? AND memory_usage IS NOT NULL').get(req.user.id).avg || 0,
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/health/nodes/:id - Remove node
router.delete('/nodes/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM health_nodes
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({ message: 'Node removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
