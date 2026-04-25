import jwt from 'jsonwebtoken';
import { db } from '../db/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if session exists and is valid
    const session = db.prepare(`
      SELECT * FROM sessions
      WHERE token = ? AND expires_at > ?
    `).get(token, Date.now());

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update last activity
    db.prepare('UPDATE sessions SET last_activity = ? WHERE id = ?')
      .run(Date.now(), session.id);

    // Attach user to request
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      sessionId: decoded.sessionId
    };
  } catch (error) {
    // Invalid token, but continue without auth
  }

  next();
}
