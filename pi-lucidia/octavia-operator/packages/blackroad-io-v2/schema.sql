CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT, role TEXT DEFAULT 'user', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS stats (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS domains (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now')));
INSERT OR IGNORE INTO stats (key, value) VALUES ('agents', '1000'), ('domains', '21'), ('github_orgs', '16'), ('repositories', '40+');
INSERT OR IGNORE INTO domains (id, name) VALUES ('d1', 'blackroad.io'), ('d2', 'lucidia.earth'), ('d3', 'roadchain.io'), ('d4', 'aliceqi.com');
