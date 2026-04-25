import { db } from '../db/init.js';

export function logActivity(userId, type, resourceType, resourceId, details) {
  try {
    db.prepare(`
      INSERT INTO activity_log
      (user_id, type, action, resource_type, resource_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      type,
      type, // action is same as type for now
      resourceType || null,
      resourceId || null,
      details || null,
      Date.now()
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export function getActivityLog(userId, limit = 100) {
  return db.prepare(`
    SELECT * FROM activity_log
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(userId, limit);
}
