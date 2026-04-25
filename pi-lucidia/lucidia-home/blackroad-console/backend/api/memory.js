import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { db } from '../db/init.js';
import { authenticateToken } from '../auth/middleware.js';
import { logActivity } from '../services/logger.js';

const router = express.Router();

// Generate PS-SHA-∞ hash (simulated infinite cascade)
function generatePSHash(content) {
  let hash = CryptoJS.SHA256(content).toString();
  // Cascade 100 times
  for (let i = 0; i < 100; i++) {
    hash = CryptoJS.SHA256(hash + content).toString();
  }
  return hash;
}

// GET /api/memory - List all memories
router.get('/', authenticateToken, (req, res) => {
  try {
    const { type, category, agentId } = req.query;
    let query = 'SELECT * FROM memories WHERE user_id = ?';
    const params = [req.user.id];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (agentId) {
      query += ' AND agent_id = ?';
      params.push(agentId);
    }

    query += ' ORDER BY created_at DESC';

    const memories = db.prepare(query).all(...params);

    // Parse JSON fields
    memories.forEach(memory => {
      if (memory.connections) memory.connections = JSON.parse(memory.connections);
      if (memory.metadata) memory.metadata = JSON.parse(memory.metadata);
    });

    res.json({ memories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/memory/:id - Get single memory
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const memory = db.prepare(`
      SELECT * FROM memories
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    if (memory.connections) memory.connections = JSON.parse(memory.connections);
    if (memory.metadata) memory.metadata = JSON.parse(memory.metadata);

    // Update accessed_at
    db.prepare('UPDATE memories SET accessed_at = ? WHERE id = ?')
      .run(Date.now(), req.params.id);

    res.json({ memory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/memory - Create new memory
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      type, category, content, encrypted,
      agentId, connections, metadata
    } = req.body;

    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content required' });
    }

    const id = uuidv4();
    const now = Date.now();
    const hash = generatePSHash(content);

    db.prepare(`
      INSERT INTO memories
      (id, user_id, agent_id, type, category, content, encrypted,
       hash, created_at, accessed_at, connections, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, agentId || null, type, category || null,
      content, encrypted ? 1 : 0, hash, now, now,
      connections ? JSON.stringify(connections) : null,
      metadata ? JSON.stringify(metadata) : null
    );

    logActivity(req.user.id, 'create', 'memory', id, `Created ${type} memory`);

    res.status(201).json({ id, hash, message: 'Memory created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/memory/:id - Update memory
router.patch('/:id', authenticateToken, (req, res) => {
  try {
    const { content, connections, metadata } = req.body;
    const updates = [];
    const params = [];

    if (content) {
      updates.push('content = ?', 'hash = ?');
      params.push(content, generatePSHash(content));
    }
    if (connections) {
      updates.push('connections = ?');
      params.push(JSON.stringify(connections));
    }
    if (metadata) {
      updates.push('metadata = ?');
      params.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id, req.user.id);

    const result = db.prepare(`
      UPDATE memories
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    logActivity(req.user.id, 'update', 'memory', req.params.id, 'Updated memory');

    res.json({ message: 'Memory updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/memory/:id - Delete memory
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM memories
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    logActivity(req.user.id, 'delete', 'memory', req.params.id, 'Deleted memory');

    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/memory/graph - Get memory graph data
router.get('/graph/data', authenticateToken, (req, res) => {
  try {
    const memories = db.prepare(`
      SELECT id, type, category, created_at, connections, encrypted
      FROM memories
      WHERE user_id = ?
    `).all(req.user.id);

    // Build graph structure
    const nodes = memories.map(m => ({
      id: m.id,
      type: m.type,
      category: m.category,
      encrypted: m.encrypted === 1,
      createdAt: m.created_at
    }));

    const edges = [];
    memories.forEach(m => {
      if (m.connections) {
        const connections = JSON.parse(m.connections);
        connections.forEach(targetId => {
          edges.push({ from: m.id, to: targetId });
        });
      }
    });

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
