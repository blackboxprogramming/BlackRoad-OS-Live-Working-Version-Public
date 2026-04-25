-- BlackRoad Platform Schema — D1 Database
-- BR Wiki + Road TV
-- Tables: pages, page_blocks, videos, video_notes

-- ============================================================
-- BR WIKI
-- ============================================================

-- Wiki pages (agents + humans)
CREATE TABLE IF NOT EXISTS pages (
  id         TEXT PRIMARY KEY,              -- slug: "agents/cecilia", "humans/alexa"
  type       TEXT NOT NULL CHECK(type IN ('agent', 'human')),
  name       TEXT NOT NULL,                 -- display name
  email      TEXT,
  role       TEXT,
  color      TEXT,                          -- hex color
  model      TEXT,                          -- LLM model (agents only)
  host       TEXT,                          -- IP/hostname (agents only)
  status     TEXT DEFAULT 'active',         -- active, standby, offline
  summary    TEXT,                          -- short description
  quote      TEXT,                          -- signature quote
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Hash-linked content blocks (the "blockchain")
-- Each edit is a new block, linked to the previous one
CREATE TABLE IF NOT EXISTS page_blocks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id    TEXT NOT NULL REFERENCES pages(id),
  prev_hash  TEXT,                          -- hash of previous block (null for first)
  hash       TEXT NOT NULL,                 -- SHA-256 of content + prev_hash + timestamp
  block_type TEXT NOT NULL CHECK(block_type IN ('note', 'activity', 'edit', 'skill', 'connection')),
  author     TEXT NOT NULL,                 -- who wrote this block
  content    TEXT NOT NULL,                 -- the actual content (JSON or plain text)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_blocks_page ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON page_blocks(hash);

-- Page capabilities/skills
CREATE TABLE IF NOT EXISTS page_skills (
  page_id    TEXT NOT NULL REFERENCES pages(id),
  skill      TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,            -- 1 = primary skill, 0 = secondary
  PRIMARY KEY (page_id, skill)
);

-- Connections between pages (tunneled with)
CREATE TABLE IF NOT EXISTS page_connections (
  from_id    TEXT NOT NULL REFERENCES pages(id),
  to_id      TEXT NOT NULL REFERENCES pages(id),
  strength   INTEGER DEFAULT 50,           -- 0-100 bond strength
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (from_id, to_id)
);

-- ============================================================
-- ROAD TV
-- ============================================================

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id          TEXT PRIMARY KEY,             -- slug: "circuit-board-demo"
  title       TEXT NOT NULL,
  description TEXT,
  author      TEXT NOT NULL,                -- page_id of creator
  duration    TEXT,                          -- "4:32"
  category    TEXT CHECK(category IN ('tutorial', 'demo', 'build', 'explainer', 'experiment')),
  r2_key      TEXT,                         -- R2 storage key for the video file
  thumbnail   TEXT,                         -- R2 key for thumbnail
  tags        TEXT,                          -- comma-separated tags
  status      TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'unlisted')),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_videos_author ON videos(author);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);

-- Video notes (comments from the network)
CREATE TABLE IF NOT EXISTS video_notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id   TEXT NOT NULL REFERENCES videos(id),
  author     TEXT NOT NULL,                 -- page_id of commenter
  content    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_video ON video_notes(video_id);

-- Video <-> page links (which agents/humans appear in a video)
CREATE TABLE IF NOT EXISTS video_appearances (
  video_id   TEXT NOT NULL REFERENCES videos(id),
  page_id    TEXT NOT NULL REFERENCES pages(id),
  PRIMARY KEY (video_id, page_id)
);
