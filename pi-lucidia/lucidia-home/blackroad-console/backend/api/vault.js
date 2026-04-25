import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { db } from '../db/init.js';
import { authenticateToken } from '../auth/middleware.js';
import { logActivity } from '../services/logger.js';

const router = express.Router();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

// Encrypt token value
function encryptToken(value) {
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
}

// Decrypt token value
function decryptToken(encrypted) {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// GET /api/vault/tokens - List all tokens
router.get('/tokens', authenticateToken, (req, res) => {
  try {
    const tokens = db.prepare(`
      SELECT id, provider, name, env_var, icon, created_at,
             last_rotated, expires_at, usage_count, status
      FROM vault_tokens
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ tokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vault/tokens/:id - Get single token (with decrypted value)
router.get('/tokens/:id', authenticateToken, (req, res) => {
  try {
    const token = db.prepare(`
      SELECT * FROM vault_tokens
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Decrypt the value
    token.value = decryptToken(token.encrypted_value);
    delete token.encrypted_value;

    // Log access
    logActivity(req.user.id, 'access', 'vault_token', token.id, `Accessed token: ${token.name}`);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vault/tokens - Create new token
router.post('/tokens', authenticateToken, (req, res) => {
  try {
    const { provider, name, value, envVar, icon, expiresAt } = req.body;

    if (!provider || !name || !value || !envVar) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const encryptedValue = encryptToken(value);
    const now = Date.now();

    db.prepare(`
      INSERT INTO vault_tokens
      (id, user_id, provider, name, encrypted_value, env_var, icon,
       created_at, last_rotated, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, provider, name, encryptedValue, envVar,
      icon || '🔑', now, now, expiresAt || null
    );

    logActivity(req.user.id, 'create', 'vault_token', id, `Created token: ${name}`);

    res.status(201).json({
      id,
      message: 'Token created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/vault/tokens/:id - Update token
router.patch('/tokens/:id', authenticateToken, (req, res) => {
  try {
    const { name, value, envVar, status } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (value) {
      updates.push('encrypted_value = ?');
      params.push(encryptToken(value));
    }
    if (envVar) {
      updates.push('env_var = ?');
      params.push(envVar);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id, req.user.id);

    const result = db.prepare(`
      UPDATE vault_tokens
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    logActivity(req.user.id, 'update', 'vault_token', req.params.id, 'Updated token');

    res.json({ message: 'Token updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vault/tokens/:id/rotate - Rotate token
router.post('/tokens/:id/rotate', authenticateToken, (req, res) => {
  try {
    const { newValue } = req.body;

    if (!newValue) {
      return res.status(400).json({ error: 'New value required' });
    }

    const now = Date.now();
    const expiresAt = now + (90 * 24 * 60 * 60 * 1000); // 90 days

    const result = db.prepare(`
      UPDATE vault_tokens
      SET encrypted_value = ?,
          last_rotated = ?,
          expires_at = ?,
          status = 'active'
      WHERE id = ? AND user_id = ?
    `).run(encryptToken(newValue), now, expiresAt, req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    logActivity(req.user.id, 'rotate', 'vault_token', req.params.id, 'Rotated token');

    res.json({
      message: 'Token rotated successfully',
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/vault/tokens/:id - Delete token
router.delete('/tokens/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM vault_tokens
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    logActivity(req.user.id, 'delete', 'vault_token', req.params.id, 'Deleted token');

    res.json({ message: 'Token deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vault/stats - Get vault statistics
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalTokens: db.prepare('SELECT COUNT(*) as count FROM vault_tokens WHERE user_id = ?').get(req.user.id).count,
      activeTokens: db.prepare('SELECT COUNT(*) as count FROM vault_tokens WHERE user_id = ? AND status = ?').get(req.user.id, 'active').count,
      expiringTokens: db.prepare(`
        SELECT COUNT(*) as count FROM vault_tokens
        WHERE user_id = ? AND expires_at < ? AND expires_at > ?
      `).get(req.user.id, Date.now() + (7 * 24 * 60 * 60 * 1000), Date.now()).count,
      connectedTools: db.prepare('SELECT COUNT(*) as count FROM cli_tools WHERE user_id = ? AND connected = 1').get(req.user.id).count,
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vault/cli-tools - Get connected CLI tools
router.get('/cli-tools', authenticateToken, (req, res) => {
  try {
    const tools = db.prepare(`
      SELECT * FROM cli_tools
      WHERE user_id = ?
      ORDER BY connected DESC, category, name
    `).all(req.user.id);

    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/vault/cli-tools/:id - Update CLI tool connection status
router.patch('/cli-tools/:id', authenticateToken, (req, res) => {
  try {
    const { connected } = req.body;

    const result = db.prepare(`
      UPDATE cli_tools
      SET connected = ?, last_used = ?
      WHERE id = ? AND user_id = ?
    `).run(connected ? 1 : 0, Date.now(), req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.json({ message: 'Tool updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
