// PROPRIETARY AND CONFIDENTIAL. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.
// RoadWork — The Task Manager | roadwork.blackroad.io

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    color TEXT DEFAULT '#ffffff',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    assignee TEXT DEFAULT '',
    due_date TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`
];

function secHeaders(resp) {
  const h = new Headers(resp.headers);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Content-Security-Policy', "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io");
  return new Response(resp.body, { status: resp.status, headers: h });
}

const ROOT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RoadWork</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
/**
 * mockup-base.css — BlackRoad OS Design System
 * Pure black and white. No color. No gradients.
 * All mockups link this file.
 */

/* ── Canonical tokens ────────────────────────────────────────────────── */
:root {
  /* Accent (white only — no gradients, no color) */
  --g:         linear-gradient(90deg, #ffffff, #ffffff);
  --g135:      linear-gradient(135deg, #ffffff, #ffffff);
  --grad:      var(--g);
  --grad-tint: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.06));

  /* Canvas scale */
  --bg:       #000000;
  --card:     #0a0a0a;
  --elevated: #111111;
  --hover:    #181818;

  /* Surface scale (s1–s6) */
  --s1: #0a0a0a;
  --s2: #111111;
  --s3: #1a1a1a;
  --s4: #222222;
  --s5: #2a2a2a;
  --s6: #333333;

  /* Borders */
  --border: #1a1a1a;

  /* Text */
  --text:  #f5f5f5;
  --sub:   #737373;
  --muted: #444444;
  --dim:   #525252;
  --white: #ffffff;
  --white80: rgba(255,255,255,0.80);
  --white60: rgba(255,255,255,0.60);
  --white40: rgba(255,255,255,0.40);
  --white20: rgba(255,255,255,0.20);
  --white10: rgba(255,255,255,0.10);
  --white05: rgba(255,255,255,0.05);

  /* Status (grayscale only) */
  --green:     #ffffff;
  --green-dim: rgba(255,255,255,0.10);
  --amber:     #999999;
  --amber-dim: rgba(255,255,255,0.08);
  --red:       #666666;
  --red-dim:   rgba(255,255,255,0.06);
  --blue:      #cccccc;
  --blue-dim:  rgba(255,255,255,0.08);

  /* Typography */
  --sg: 'Space Grotesk', -apple-system, sans-serif;
  --jb: 'JetBrains Mono', 'Courier New', monospace;
  --in: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Reset ─────────────────────────────────────────────────────────── */
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sg);
  font-size: 14px;
  line-height: 1.6;
  overflow-x: hidden;
}

a { color: var(--text); text-decoration: none; }
button { font-family: var(--sg); cursor: pointer; }

/* ── Scrollbar ─────────────────────────────────────────────────────── */
::-webkit-scrollbar       { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }

/* ── Accent bar (white stripe) ────────────────────────────────────── */
.grad-bar { height: 3px; background: var(--white); }

/* ── Accent text (white, no gradient) ─────────────────────────────── */
.grad-text {
  color: var(--white);
}

/* ── Nav ────────────────────────────────────────────────────────────── */
.br-nav {
  position: fixed; top: 3px; left: 0; right: 0; z-index: 100; padding: 0 24px;
}
.br-nav-inner {
  max-width: 1000px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px;
  background: rgba(0,0,0,.9); backdrop-filter: blur(16px);
  border: 1px solid var(--border); border-radius: 10px;
}
.br-nav-logo {
  font-weight: 700; font-size: 16px; color: var(--white);
  display: flex; align-items: center; gap: 10px; text-decoration: none;
}
.br-nav-logo-bar { width: 20px; height: 3px; border-radius: 2px; background: var(--white); }
.br-nav-links { display: flex; gap: 24px; }
.br-nav-links a { font-size: 12px; font-weight: 500; color: var(--sub); transition: color .15s; text-decoration: none; }
.br-nav-links a:hover { color: var(--white); }

/* ── Buttons ───────────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 12px;
  border: none; transition: all .15s; font-family: var(--sg); cursor: pointer;
}
.btn-white  { background: var(--white); color: #000; }
.btn-white:hover { background: #e5e5e5; }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
.btn-outline:hover { border-color: #444; }
.btn-lg { padding: 13px 32px; font-size: 14px; border-radius: 8px; }

/* ── Section layout ────────────────────────────────────────────────── */
.br-section { padding: 72px 0; }
.br-container { max-width: 1000px; width: 100%; margin: 0 auto; padding: 0 24px; }
.br-section-num   { font-family: var(--jb); font-size: 10px; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 8px; }
.br-section-title { font-weight: 700; font-size: 28px; color: var(--white); margin-bottom: 8px; }
.br-section-desc  { font-size: 14px; color: var(--sub); max-width: 460px; line-height: 1.7; }
.br-divider { height: 1px; background: var(--border); }

/* ── Cards ──────────────────────────────────────────────────────────── */
.br-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 8px; padding: 28px 24px; transition: border-color .15s;
}
.br-card:hover { border-color: #333; }

/* ── Featured card (white top border) ────────────────────────────── */
.br-card-featured {
  border-color: #333; position: relative;
}
.br-card-featured::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 2px; background: var(--white); border-radius: 8px 8px 0 0;
}

/* ── Pill / agent tag ──────────────────────────────────────────────── */
.br-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; background: var(--card);
  border: 1px solid var(--border); border-radius: 5px; transition: border-color .15s;
}
.br-pill:hover { border-color: #333; }

/* ── Window chrome (macOS dots — grayscale) ────────────────────────── */
.br-window { background: var(--card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.br-window-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px; background: var(--elevated);
  border-bottom: 1px solid var(--border);
}
.br-dot      { width: 8px; height: 8px; border-radius: 50%; }
.br-dot-red  { background: #666666; }
.br-dot-yel  { background: #999999; }
.br-dot-grn  { background: #cccccc; }
.br-window-title { margin-left: 8px; font-family: var(--jb); font-size: 10px; color: var(--muted); }

</style>
<style>
  :root {
    --sidebar-w: 260px;
    --detail-w: 380px;
    --topbar-h: 48px;
    --font-ui: 'Space Grotesk', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  body {
    font-family: var(--font-ui);
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ═══════════════════════════════════════
     GLOBAL TOP BAR
  ═══════════════════════════════════════ */
  .topbar {
    height: var(--topbar-h);
    background: var(--s2);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex-shrink: 0;
    z-index: 100;
  }
  .topbar-brand {
    display: flex; align-items: center; gap: 8px;
    font-size: 15px; font-weight: 700; color: var(--white);
    min-width: 140px;
  }
  .topbar-brand-mark {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--white); color: #000;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900;
  }
  .topbar-search {
    flex: 1; max-width: 480px;
    height: 32px; border-radius: 8px;
    background: var(--s3); border: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
    padding: 0 12px; margin: 0 auto;
  }
  .topbar-search input {
    flex: 1; background: none; border: none; outline: none;
    color: var(--text); font-size: 13px; font-family: var(--font-ui);
  }
  .topbar-search input::placeholder { color: var(--muted); }
  .topbar-search-key {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--muted); background: var(--s4);
    padding: 2px 6px; border-radius: 4px;
  }
  .topbar-actions {
    display: flex; align-items: center; gap: 6px;
  }
  .topbar-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--s3); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); font-size: 14px; cursor: pointer;
    transition: all .12s; position: relative;
  }
  .topbar-icon:hover { background: var(--s4); color: var(--white); }
  .topbar-badge {
    position: absolute; top: -3px; right: -3px;
    min-width: 14px; height: 14px; border-radius: 7px;
    background: var(--white); color: #000;
    font-size: 8px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    padding: 0 3px;
  }
  .topbar-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--s5); color: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; cursor: pointer;
  }

  /* ═══════════════════════════════════════
     SHELL (sidebar + main + detail)
  ═══════════════════════════════════════ */
  .shell {
    flex: 1; display: flex; min-height: 0;
  }

  /* ═══════════════════════════════════════
     SIDEBAR
  ═══════════════════════════════════════ */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--s1);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow: hidden; flex-shrink: 0;
  }
  .sidebar-section {
    padding: 12px 12px 4px;
  }
  .sidebar-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: var(--muted); padding: 0 8px;
    margin-bottom: 6px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .sidebar-label-action {
    font-size: 14px; cursor: pointer; color: var(--muted);
    transition: color .12s;
  }
  .sidebar-label-action:hover { color: var(--white); }
  .sidebar-scroll {
    flex: 1; overflow-y: auto; padding: 0 12px 12px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 8px;
    cursor: pointer; font-size: 13px;
    color: var(--sub); transition: all .1s;
  }
  .nav-item:hover { background: var(--s3); color: var(--text); }
  .nav-item.active { background: var(--s3); color: var(--white); font-weight: 600; }
  .nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-count {
    margin-left: auto; font-family: var(--font-mono);
    font-size: 10px; color: var(--muted);
    background: var(--s4); padding: 1px 6px; border-radius: 4px;
  }
  .space-item {
    margin-bottom: 2px;
  }
  .space-header {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 8px;
    cursor: pointer; font-size: 13px; font-weight: 600;
    color: var(--text); transition: all .1s;
  }
  .space-header:hover { background: var(--s3); }
  .space-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
  }
  .space-arrow {
    margin-left: auto; font-size: 10px; color: var(--muted);
    transition: transform .15s;
  }
  .space-children {
    padding-left: 20px;
  }
  .folder-item {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 10px; border-radius: 6px;
    cursor: pointer; font-size: 12px;
    color: var(--sub); transition: all .1s;
  }
  .folder-item:hover { background: var(--s3); color: var(--text); }
  .folder-item.active { color: var(--white); font-weight: 600; }
  .folder-icon { font-size: 12px; width: 16px; text-align: center; }
  .folder-count {
    margin-left: auto; font-family: var(--font-mono);
    font-size: 9px; color: var(--muted);
  }

  /* Create button */
  .sidebar-create {
    padding: 12px;
    border-top: 1px solid var(--border);
  }
  .create-btn {
    width: 100%; padding: 8px 14px; border-radius: 8px;
    background: var(--white); color: #000;
    font-size: 13px; font-weight: 700; font-family: var(--font-ui);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: background .12s;
  }
  .create-btn:hover { background: #e5e5e5; }

  /* ═══════════════════════════════════════
     MAIN CONTENT
  ═══════════════════════════════════════ */
  .main {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    background: var(--bg);
  }

  /* View header */
  .view-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .view-title {
    font-size: 18px; font-weight: 700; color: var(--white);
  }
  .view-count {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--muted); background: var(--s3);
    padding: 2px 8px; border-radius: 4px;
  }
  .view-tabs {
    display: flex; gap: 2px; margin-left: 16px;
  }
  .view-tab {
    padding: 6px 14px; border-radius: 6px;
    font-size: 12px; font-weight: 600;
    color: var(--sub); cursor: pointer;
    transition: all .1s;
  }
  .view-tab:hover { background: var(--s3); color: var(--text); }
  .view-tab.active { background: var(--s3); color: var(--white); }
  .view-spacer { flex: 1; }
  .view-actions {
    display: flex; gap: 6px;
  }
  .view-action-btn {
    padding: 6px 12px; border-radius: 6px;
    font-size: 11px; font-weight: 600; font-family: var(--font-ui);
    background: var(--s3); border: 1px solid var(--border);
    color: var(--sub); cursor: pointer;
    display: flex; align-items: center; gap: 5px;
    transition: all .12s;
  }
  .view-action-btn:hover { border-color: var(--s5); color: var(--text); }

  /* Subtask bar */
  .subtask-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 20px;
    border-bottom: 1px solid var(--border);
    font-size: 11px; color: var(--muted);
    flex-shrink: 0;
  }
  .subtask-bar-group {
    display: flex; align-items: center; gap: 4px;
  }
  .progress-bar {
    width: 120px; height: 4px; border-radius: 2px;
    background: var(--s4); overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: var(--white); border-radius: 2px;
  }

  /* ═══════════════════════════════════════
     LIST VIEW
  ═══════════════════════════════════════ */
  .list-view {
    flex: 1; overflow-y: auto;
    padding: 0;
  }

  /* Group header */
  .group-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: var(--s1);
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    position: sticky; top: 0; z-index: 10;
  }
  .group-dot {
    width: 10px; height: 10px; border-radius: 3px;
    flex-shrink: 0;
  }
  .group-name {
    font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .06em;
    color: var(--text);
  }
  .group-count {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--muted);
  }
  .group-arrow {
    margin-left: auto; font-size: 10px; color: var(--muted);
  }
  .group-add {
    font-size: 14px; color: var(--muted); cursor: pointer;
    margin-left: 4px;
  }
  .group-add:hover { color: var(--white); }

  /* Task row */
  .task-row {
    display: flex; align-items: center; gap: 0;
    padding: 0 20px;
    height: 44px;
    border-bottom: 1px solid rgba(255,255,255,.03);
    cursor: pointer;
    transition: background .08s;
  }
  .task-row:hover { background: var(--s1); }
  .task-row.selected { background: var(--s2); }
  .task-checkbox {
    width: 18px; height: 18px; border-radius: 4px;
    border: 2px solid var(--s5); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    margin-right: 10px; cursor: pointer;
    transition: all .1s; font-size: 10px; color: transparent;
  }
  .task-checkbox:hover { border-color: var(--white); }
  .task-checkbox.done { border-color: var(--white); color: var(--white); background: var(--white); color: #000; }
  .task-name {
    flex: 1; min-width: 0;
    font-size: 13px; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .task-name.done { text-decoration: line-through; color: var(--muted); }
  .task-tags {
    display: flex; gap: 4px; margin-right: 12px;
  }
  .task-tag {
    font-size: 9px; font-weight: 700;
    letter-spacing: .04em; text-transform: uppercase;
    font-family: var(--font-mono);
    padding: 2px 6px; border-radius: 3px;
    background: var(--s4); color: var(--sub);
  }
  .task-priority {
    width: 20px; text-align: center;
    font-size: 11px; margin-right: 8px;
  }
  .task-assignee {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--s4); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: var(--sub);
    margin-right: 8px;
  }
  .task-due {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--muted); min-width: 60px; text-align: right;
    margin-right: 8px;
  }
  .task-due.overdue { color: var(--white); font-weight: 700; }
  .task-estimate {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--muted); min-width: 32px; text-align: right;
  }

  /* ═══════════════════════════════════════
     DETAIL PANEL
  ═══════════════════════════════════════ */
  .detail {
    width: var(--detail-w);
    background: var(--s1);
    border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow: hidden; flex-shrink: 0;
  }
  .detail-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .detail-title {
    font-size: 16px; font-weight: 700; color: var(--white);
    line-height: 1.3; flex: 1;
  }
  .detail-close {
    font-size: 18px; color: var(--muted); cursor: pointer;
    padding: 2px 6px; border-radius: 4px;
  }
  .detail-close:hover { color: var(--white); background: var(--s3); }
  .detail-scroll {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .detail-section {
    display: flex; flex-direction: column; gap: 8px;
  }
  .detail-section-title {
    font-size: 10px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: var(--muted);
  }
  .detail-field {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
  }
  .detail-field-label { color: var(--sub); font-size: 12px; }
  .detail-field-value { color: var(--text); font-weight: 500; font-size: 12px; }
  .detail-field-value.mono { font-family: var(--font-mono); font-size: 11px; }
  .detail-status-pill {
    padding: 3px 10px; border-radius: 4px;
    font-size: 11px; font-weight: 700;
    background: var(--white); color: #000;
    text-transform: uppercase; letter-spacing: .04em;
  }
  .detail-status-pill.progress { background: var(--s5); color: var(--white); }
  .detail-status-pill.review { background: var(--s6); color: var(--white); }

  /* Description */
  .detail-desc {
    font-size: 13px; color: var(--sub);
    line-height: 1.7; padding: 10px 12px;
    background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px;
  }

  /* Subtasks in detail */
  .detail-subtask {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 0; font-size: 12px; color: var(--text);
  }
  .detail-subtask-check {
    width: 14px; height: 14px; border-radius: 3px;
    border: 1.5px solid var(--s5); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; cursor: pointer;
  }
  .detail-subtask-check.done { border-color: var(--white); background: var(--white); color: #000; }
  .detail-subtask-text.done { text-decoration: line-through; color: var(--muted); }

  /* Activity */
  .activity-item {
    display: flex; gap: 10px; padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,.03);
  }
  .activity-avatar {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--s4); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: var(--sub);
  }
  .activity-body { flex: 1; }
  .activity-author { font-size: 12px; font-weight: 600; color: var(--white); }
  .activity-text { font-size: 12px; color: var(--sub); line-height: 1.5; margin-top: 2px; }
  .activity-time { font-size: 10px; color: var(--muted); font-family: var(--font-mono); margin-top: 3px; }

  /* Comment box */
  .comment-box {
    border-top: 1px solid var(--border);
    padding: 12px 20px;
  }
  .comment-input {
    width: 100%; padding: 10px 12px;
    background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    font-size: 13px; font-family: var(--font-ui);
    outline: none; resize: none; min-height: 60px;
  }
  .comment-input::placeholder { color: var(--muted); }
  .comment-input:focus { border-color: var(--s5); }
  .comment-actions {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 8px;
  }
  .comment-tools {
    display: flex; gap: 6px;
  }
  .comment-tool {
    font-size: 14px; color: var(--muted); cursor: pointer;
    padding: 4px; border-radius: 4px;
  }
  .comment-tool:hover { color: var(--white); background: var(--s3); }
  .comment-send {
    padding: 6px 14px; border-radius: 6px;
    background: var(--white); color: #000;
    font-size: 12px; font-weight: 700; font-family: var(--font-ui);
    border: none; cursor: pointer;
  }
  .comment-send:hover { background: #e5e5e5; }
</style>
</head>
<body>

<!-- ═══════════ TOP BAR ═══════════ -->
<div class="topbar">
  <div class="topbar-brand">
    <div class="topbar-brand-mark">RC</div>
    RoadClick
  </div>

  <div class="topbar-search">
    <span style="color:var(--muted);font-size:14px">&#x2315;</span>
    <input type="text" placeholder="Search tasks, docs, people..." />
    <span class="topbar-search-key">&#8984;K</span>
  </div>

  <div class="topbar-actions">
    <div class="topbar-icon">&#9881;<div class="topbar-badge">3</div></div>
    <div class="topbar-icon">&#128276;</div>
    <div class="topbar-icon">&#9733;</div>
    <div class="topbar-avatar">AA</div>
  </div>
</div>

<!-- ═══════════ SHELL ═══════════ -->
<div class="shell">

  <!-- ═══════════ SIDEBAR ═══════════ -->
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label">Favorites <span class="sidebar-label-action">+</span></div>
      <div class="nav-item"><span class="nav-icon">&#9733;</span> Sprint 23 Board</div>
      <div class="nav-item"><span class="nav-icon">&#9733;</span> Q2 Roadmap</div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Views</div>
      <div class="nav-item active"><span class="nav-icon">&#9776;</span> Everything <span class="nav-count">142</span></div>
      <div class="nav-item"><span class="nav-icon">&#9632;</span> Board</div>
      <div class="nav-item"><span class="nav-icon">&#128197;</span> Calendar</div>
      <div class="nav-item"><span class="nav-icon">&#128200;</span> Gantt</div>
      <div class="nav-item"><span class="nav-icon">&#128205;</span> Timeline</div>
      <div class="nav-item"><span class="nav-icon">&#128221;</span> Docs <span class="nav-count">18</span></div>
    </div>

    <div class="sidebar-scroll">
      <div class="sidebar-label">Spaces <span class="sidebar-label-action">+</span></div>

      <div class="space-item">
        <div class="space-header">
          <div class="space-dot" style="background:var(--white)"></div>
          BlackRoad OS
          <span class="space-arrow">&#9662;</span>
        </div>
        <div class="space-children">
          <div class="folder-item active"><span class="folder-icon">&#128193;</span> Core Platform <span class="folder-count">24</span></div>
          <div class="folder-item"><span class="folder-icon">&#128193;</span> Auth & Identity <span class="folder-count">8</span></div>
          <div class="folder-item"><span class="folder-icon">&#128193;</span> Agent Runtime <span class="folder-count">12</span></div>
          <div class="folder-item"><span class="folder-icon">&#128196;</span> API Contracts <span class="folder-count">6</span></div>
        </div>
      </div>

      <div class="space-item">
        <div class="space-header">
          <div class="space-dot" style="background:var(--s6)"></div>
          RoadTrip
          <span class="space-arrow">&#9656;</span>
        </div>
      </div>

      <div class="space-item">
        <div class="space-header">
          <div class="space-dot" style="background:var(--s5)"></div>
          RoadCode
          <span class="space-arrow">&#9656;</span>
        </div>
      </div>

      <div class="space-item">
        <div class="space-header">
          <div class="space-dot" style="background:var(--s5)"></div>
          BackRoad
          <span class="space-arrow">&#9656;</span>
        </div>
      </div>

      <div class="space-item">
        <div class="space-header">
          <div class="space-dot" style="background:var(--s5)"></div>
          CarKeys
          <span class="space-arrow">&#9656;</span>
        </div>
      </div>

      <div class="space-item">
        <div class="space-header">
          <div class="space-dot" style="background:var(--s5)"></div>
          Design System
          <span class="space-arrow">&#9656;</span>
        </div>
      </div>

      <div class="sidebar-label" style="margin-top:12px">People <span class="sidebar-label-action">+</span></div>
      <div class="nav-item"><span class="nav-icon" style="font-size:12px">&#9679;</span> Alexa A. <span class="nav-count">online</span></div>
      <div class="nav-item"><span class="nav-icon" style="font-size:12px;opacity:.4">&#9679;</span> Roadie <span class="nav-count">idle</span></div>
      <div class="nav-item"><span class="nav-icon" style="font-size:12px;opacity:.4">&#9679;</span> Silas <span class="nav-count">away</span></div>
      <div class="nav-item"><span class="nav-icon" style="font-size:12px;opacity:.4">&#9679;</span> Octavia <span class="nav-count">away</span></div>
    </div>

    <div class="sidebar-create">
      <button class="create-btn">+ New Task</button>
    </div>
  </aside>

  <!-- ═══════════ MAIN ═══════════ -->
  <section class="main">
    <div class="view-header">
      <div class="view-title">Core Platform</div>
      <div class="view-count">24 tasks</div>
      <div class="view-tabs">
        <div class="view-tab active">List</div>
        <div class="view-tab">Board</div>
        <div class="view-tab">Calendar</div>
        <div class="view-tab">Gantt</div>
      </div>
      <div class="view-spacer"></div>
      <div class="view-actions">
        <div class="view-action-btn">&#9698; Filter</div>
        <div class="view-action-btn">&#8693; Sort</div>
        <div class="view-action-btn">&#9783; Group</div>
        <div class="view-action-btn">&#8943; Me</div>
      </div>
    </div>

    <div class="subtask-bar">
      <div class="subtask-bar-group">
        <span>Sprint 23</span>
        <span style="color:var(--white);font-weight:700">67%</span>
        <div class="progress-bar"><div class="progress-fill" style="width:67%"></div></div>
      </div>
      <span style="margin-left:auto">16 of 24 done</span>
      <span>&#183;</span>
      <span>3 overdue</span>
      <span>&#183;</span>
      <span>5 in progress</span>
    </div>

    <div class="list-view">

      <!-- IN PROGRESS -->
      <div class="group-header">
        <div class="group-dot" style="background:var(--white)"></div>
        <div class="group-name">In Progress</div>
        <div class="group-count">5 tasks</div>
        <div class="group-add">+</div>
        <div class="group-arrow">&#9662;</div>
      </div>

      <div class="task-row selected">
        <div class="task-checkbox"></div>
        <div class="task-priority" title="Urgent">!!</div>
        <div class="task-name">Deploy RoadCode CI/CD pipeline to production</div>
        <div class="task-tags"><span class="task-tag">ship</span><span class="task-tag">infra</span></div>
        <div class="task-assignee" title="Alexa">AA</div>
        <div class="task-due overdue">Apr 18</div>
        <div class="task-estimate">4h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority" title="High">!</div>
        <div class="task-name">Agent marketplace — API contract + auth flow</div>
        <div class="task-tags"><span class="task-tag">feature</span></div>
        <div class="task-assignee" title="Silas">SI</div>
        <div class="task-due">Apr 22</div>
        <div class="task-estimate">8h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority" title="High">!</div>
        <div class="task-name">SSO integration — OAuth2 + SAML for CarKeys</div>
        <div class="task-tags"><span class="task-tag">auth</span></div>
        <div class="task-assignee" title="Octavia">OC</div>
        <div class="task-due">Apr 24</div>
        <div class="task-estimate">6h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority"></div>
        <div class="task-name">Analytics dashboard v2 wireframes</div>
        <div class="task-tags"><span class="task-tag">design</span></div>
        <div class="task-assignee" title="Roadie">RD</div>
        <div class="task-due">Apr 25</div>
        <div class="task-estimate">3h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority"></div>
        <div class="task-name">WebSocket hub for real-time notifications</div>
        <div class="task-tags"><span class="task-tag">infra</span></div>
        <div class="task-assignee" title="Silas">SI</div>
        <div class="task-due">Apr 26</div>
        <div class="task-estimate">5h</div>
      </div>

      <!-- REVIEW -->
      <div class="group-header">
        <div class="group-dot" style="background:var(--s6)"></div>
        <div class="group-name">Review</div>
        <div class="group-count">3 tasks</div>
        <div class="group-add">+</div>
        <div class="group-arrow">&#9662;</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority"></div>
        <div class="task-name">Auth token refresh — edge case fix for expired sessions</div>
        <div class="task-tags"><span class="task-tag">bug</span></div>
        <div class="task-assignee">AA</div>
        <div class="task-due overdue">Apr 17</div>
        <div class="task-estimate">2h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority"></div>
        <div class="task-name">RoadTrip agent presence API — heartbeat protocol</div>
        <div class="task-tags"><span class="task-tag">api</span></div>
        <div class="task-assignee">RD</div>
        <div class="task-due">Apr 20</div>
        <div class="task-estimate">4h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox"></div>
        <div class="task-priority"></div>
        <div class="task-name">Mockup CSS audit — enforce mockup-base.css tokens</div>
        <div class="task-tags"><span class="task-tag">design</span></div>
        <div class="task-assignee">AA</div>
        <div class="task-due">Apr 19</div>
        <div class="task-estimate">1h</div>
      </div>

      <!-- DONE -->
      <div class="group-header">
        <div class="group-dot" style="background:var(--s4)"></div>
        <div class="group-name">Done</div>
        <div class="group-count">16 tasks</div>
        <div class="group-add">+</div>
        <div class="group-arrow">&#9656;</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox done">&#10003;</div>
        <div class="task-priority"></div>
        <div class="task-name done">RoadBoard v0.1 alpha — infinite canvas MVP</div>
        <div class="task-tags"><span class="task-tag">ship</span></div>
        <div class="task-assignee">AA</div>
        <div class="task-due">Apr 12</div>
        <div class="task-estimate">12h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox done">&#10003;</div>
        <div class="task-priority"></div>
        <div class="task-name done">Fleet host audit — 27 agents verified</div>
        <div class="task-tags"><span class="task-tag">ops</span></div>
        <div class="task-assignee">OC</div>
        <div class="task-due">Apr 10</div>
        <div class="task-estimate">3h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox done">&#10003;</div>
        <div class="task-priority"></div>
        <div class="task-name done">Memory system v2 — HMAC signing + journal chain</div>
        <div class="task-tags"><span class="task-tag">infra</span></div>
        <div class="task-assignee">SI</div>
        <div class="task-due">Apr 8</div>
        <div class="task-estimate">6h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox done">&#10003;</div>
        <div class="task-priority"></div>
        <div class="task-name done">Product registry — 206 products seeded</div>
        <div class="task-tags"><span class="task-tag">data</span></div>
        <div class="task-assignee">RD</div>
        <div class="task-due">Apr 6</div>
        <div class="task-estimate">2h</div>
      </div>

      <div class="task-row">
        <div class="task-checkbox done">&#10003;</div>
        <div class="task-priority"></div>
        <div class="task-name done">Mockup gallery — 70 templates consolidated</div>
        <div class="task-tags"><span class="task-tag">design</span></div>
        <div class="task-assignee">AA</div>
        <div class="task-due">Apr 5</div>
        <div class="task-estimate">4h</div>
      </div>

    </div>
  </section>

  <!-- ═══════════ DETAIL PANEL ═══════════ -->
  <aside class="detail">
    <div class="detail-header">
      <div class="detail-title">Deploy RoadCode CI/CD pipeline to production</div>
      <div class="detail-close">&#10005;</div>
    </div>

    <div class="detail-scroll">
      <div class="detail-section">
        <div class="detail-section-title">Properties</div>
        <div class="detail-field">
          <span class="detail-field-label">Status</span>
          <span class="detail-status-pill progress">In Progress</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Priority</span>
          <span class="detail-field-value">!! Urgent</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Assignee</span>
          <span class="detail-field-value">Alexa Amundson</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Due date</span>
          <span class="detail-field-value" style="color:var(--white);font-weight:700">Apr 18 (overdue)</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Estimate</span>
          <span class="detail-field-value mono">4h</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Sprint</span>
          <span class="detail-field-value">Sprint 23</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Tags</span>
          <span class="detail-field-value"><span class="task-tag">ship</span> <span class="task-tag">infra</span></span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">Created</span>
          <span class="detail-field-value mono">Apr 2, 2026</span>
        </div>
        <div class="detail-field">
          <span class="detail-field-label">ID</span>
          <span class="detail-field-value mono">BR-1042</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">Description</div>
        <div class="detail-desc">
          Set up the full CI/CD pipeline for RoadCode: GitHub Actions workflow, build step (esbuild), lint (shellcheck + eslint), test, deploy to Cloudflare Workers. Include staging environment with preview URLs. The pipeline should handle both the editor frontend and the language server backend.
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">Subtasks</div>
        <div class="detail-subtask">
          <div class="detail-subtask-check done">&#10003;</div>
          <span class="detail-subtask-text done">Create GitHub Actions workflow file</span>
        </div>
        <div class="detail-subtask">
          <div class="detail-subtask-check done">&#10003;</div>
          <span class="detail-subtask-text done">Configure esbuild for production bundle</span>
        </div>
        <div class="detail-subtask">
          <div class="detail-subtask-check done">&#10003;</div>
          <span class="detail-subtask-text done">Add eslint + shellcheck to CI</span>
        </div>
        <div class="detail-subtask">
          <div class="detail-subtask-check"></div>
          <span class="detail-subtask-text">Set up staging preview URLs</span>
        </div>
        <div class="detail-subtask">
          <div class="detail-subtask-check"></div>
          <span class="detail-subtask-text">Deploy to Cloudflare Workers (prod)</span>
        </div>
        <div class="detail-subtask">
          <div class="detail-subtask-check"></div>
          <span class="detail-subtask-text">Smoke test + rollback strategy</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">Activity</div>

        <div class="activity-item">
          <div class="activity-avatar">AA</div>
          <div class="activity-body">
            <div class="activity-author">Alexa Amundson</div>
            <div class="activity-text">Pushed CI workflow to roadcode repo. Build passing, lint clean. Still need staging preview URLs before prod deploy.</div>
            <div class="activity-time">2 hours ago</div>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-avatar">SI</div>
          <div class="activity-body">
            <div class="activity-author">Silas</div>
            <div class="activity-text">Reviewed the esbuild config. Looks solid. One suggestion: add source maps for staging but strip them in prod.</div>
            <div class="activity-time">5 hours ago</div>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-avatar">OC</div>
          <div class="activity-body">
            <div class="activity-author">Octavia</div>
            <div class="activity-text">Moved to In Progress. Sprint 23 deadline is tight — flagging this as the blocker for the RoadCode launch.</div>
            <div class="activity-time">1 day ago</div>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-avatar">AA</div>
          <div class="activity-body">
            <div class="activity-author">Alexa Amundson</div>
            <div class="activity-text">Created task. This blocks the entire RoadCode v2 launch — marking urgent.</div>
            <div class="activity-time">Apr 2</div>
          </div>
        </div>
      </div>
    </div>

    <div class="comment-box">
      <textarea class="comment-input" placeholder="Write a comment or @ mention someone..."></textarea>
      <div class="comment-actions">
        <div class="comment-tools">
          <span class="comment-tool">B</span>
          <span class="comment-tool">@</span>
          <span class="comment-tool">&#128206;</span>
          <span class="comment-tool">&#128247;</span>
        </div>
        <button class="comment-send">Send</button>
      </div>
    </div>
  </aside>

</div>

</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/init') {
      for (const sql of SCHEMA) await env.DB.exec(sql);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/tasks' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100').all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/tasks' && request.method === 'POST') {
      try {
        const { title, description, priority, assignee, tags, status } = await request.json();
        await env.DB.prepare('INSERT INTO tasks (title, description, priority, assignee, tags, status) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(title, description || '', priority || 'medium', assignee || '', JSON.stringify(tags || []), status || 'todo').run();
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return secHeaders(new Response(ROOT_HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } }));
  }
};
