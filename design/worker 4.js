// PROPRIETARY AND CONFIDENTIAL. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.
// RoadCoin — The Token Economy | roadcoin.blackroad.io

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Anonymous',
    balance REAL DEFAULT 100.0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_address TEXT,
    to_address TEXT,
    amount REAL NOT NULL,
    type TEXT DEFAULT 'transfer',
    memo TEXT DEFAULT '',
    block_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
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
<title>RoadCoin</title>
<style>
  :root {
    --s1: #080808;
    --s2: #0a0a0a;
    --s3: #111111;
    --s4: #1a1a1a;
    --s5: #222222;
    --s6: #2a2a2a;
    --s7: #333333;
    --white90: rgba(255,255,255,0.9);
    --border: rgba(255,255,255,0.1);
    --green: #ffffff;
    --green-dim: rgba(255,255,255,0.10);
    --amber: #999999;
    --amber-dim: rgba(255,255,255,0.08);
    --red: #666666;
    --red-dim: rgba(255,255,255,0.06);
    --blue: #cccccc;
    --blue-dim: rgba(255,255,255,0.08);
    --font: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    --mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    --nav-h: 56px;
    --sidebar-w: 220px;
  }
  
  body {
    background: var(--bg);
    color: var(--white);
    font-family: var(--font);
    font-size: 14px;
    min-height: 100vh;
  }

  /* ── TOP NAV ── */
  .topnav {
    background: var(--s2);
    border-bottom: 1px solid var(--border);
    height: var(--nav-h);
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;
    text-decoration: none;
  }
  .nav-logo-mark {
    width: 28px; height: 28px;
    background: var(--white);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .nav-logo-text { font-size: 17px; font-weight: 800; letter-spacing: -0.5px; }
  .nav-logo-divider { color: var(--white20); font-size: 18px; margin: 0 4px; }
  .nav-logo-sub { font-size: 15px; font-weight: 700; color: var(--white60); letter-spacing: -0.3px; }

  .nav-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .nav-icon-btn {
    width: 34px; height: 34px;
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--white60);
    font-size: 18px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s;
    position: relative;
  }
  .nav-icon-btn:hover { background: var(--white10); color: var(--white); }
  .nav-notif-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: var(--white);
    border-radius: 50%;
    border: 2px solid var(--s2);
  }
  .nav-user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px 5px 5px;
    background: var(--s4);
    border: 1px solid var(--border);
    border-radius: 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--white80);
    transition: background 0.15s;
  }
  .nav-user-btn:hover { background: var(--s5); }
  .nav-user-av {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    color: var(--bg);
    flex-shrink: 0;
  }

  /* ── SHELL ── */
  .shell {
    display: flex;
    min-height: calc(100vh - var(--nav-h));
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--s1);
    border-right: 1px solid var(--border);
    padding: 20px 12px;
    flex-shrink: 0;
    position: sticky;
    top: var(--nav-h);
    height: calc(100vh - var(--nav-h));
    overflow-y: auto;
  }
  .sidebar
  .sidebar
  .sidebar

  .sb-company {
    padding: 10px 12px 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }
  .sb-company-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .sb-company-meta { font-size: 12px; color: var(--white40); }
  .sb-company-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--green);
    background: var(--green-dim);
    padding: 3px 8px;
    border-radius: 16px;
  }

  .sb-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--white60);
    font-size: 14px;
    font-weight: 500;
    transition: background 0.1s, color 0.1s;
    margin-bottom: 1px;
  }
  .sb-nav-item:hover { background: var(--white10); color: var(--white80); }
  .sb-nav-item.active { background: var(--white15, rgba(255,255,255,0.15)); color: var(--white); font-weight: 600; }
  .sb-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .sb-badge {
    margin-left: auto;
    background: var(--s6);
    color: var(--white60);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
  }
  .sb-badge.new {
    background: var(--white);
    color: var(--bg);
  }
  .sb-section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--white40);
    padding: 14px 12px 4px;
  }

  /* ── MAIN CONTENT ── */
  .main {
    flex: 1;
    padding: 32px 40px;
    max-width: 960px;
  }

  /* Page title */
  .page-title {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .page-sub {
    font-size: 15px;
    color: var(--white60);
    margin-bottom: 32px;
  }

  /* Status cards row */
  .status-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .status-card {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.15s;
    cursor: default;
  }
  .status-card:hover { border-color: var(--white20); }
  .sc-icon-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sc-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: var(--s4);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .sc-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 16px;
  }
  .sc-status.done { background: var(--green-dim); color: var(--green); }
  .sc-status.pending { background: var(--amber-dim); color: var(--amber); }
  .sc-status.locked { background: var(--s4); color: var(--white40); }
  .sc-title { font-size: 15px; font-weight: 700; }
  .sc-value { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .sc-sub { font-size: 12px; color: var(--white60); }

  /* Section wrapper */
  .section { margin-bottom: 36px; }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .section-title { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
  .section-action {
    font-size: 13px;
    font-weight: 600;
    color: var(--white60);
    cursor: pointer;
    transition: color 0.15s;
  }
  .section-action:hover { color: var(--white); text-decoration: underline; }

  /* Checklist / progress */
  .checklist {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .checklist-progress-bar {
    height: 4px;
    background: var(--s4);
  }
  .checklist-fill {
    height: 100%;
    background: var(--green);
    border-radius: 0;
    transition: width 0.6s ease;
  }
  .checklist-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .checklist-title { font-size: 15px; font-weight: 700; }
  .checklist-count { font-size: 13px; color: var(--white60); }

  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    transition: background 0.1s;
    cursor: pointer;
  }
  .check-item:last-child { border-bottom: none; }
  .check-item:hover { background: var(--white05); }

  .ci-check {
    width: 22px; height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    margin-top: 1px;
  }
  .ci-check.done { background: var(--green); color: var(--bg); font-weight: 800; }
  .ci-check.pending { border: 2px solid var(--amber); color: var(--amber); }
  .ci-check.todo { border: 2px solid var(--s6); color: var(--white40); }

  .ci-body { flex: 1; min-width: 0; }
  .ci-title { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
  .ci-desc { font-size: 13px; color: var(--white60); line-height: 1.5; }
  .ci-date { font-size: 12px; color: var(--white40); margin-top: 4px; }
  .check-item.done-item .ci-title { color: var(--white80); }

  .ci-action {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--s4);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--white80);
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .ci-action:hover { background: var(--s6); }
  .ci-action.primary {
    background: var(--white);
    color: var(--bg);
    border-color: var(--white);
  }
  .ci-action.primary:hover { background: rgba(255,255,255,0.88); }

  /* Company details card */
  .detail-card {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .detail-card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .dc-icon {
    width: 36px; height: 36px;
    background: var(--white);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    color: var(--bg);
  }
  .dc-title { font-size: 16px; font-weight: 700; }
  .dc-sub { font-size: 12px; color: var(--white60); margin-top: 1px; }
  .dc-badge {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 16px;
  }
  .dc-badge.active { background: var(--green-dim); color: var(--green); }
  .dc-badge.pending { background: var(--amber-dim); color: var(--amber); }
  .dc-badge.connected { background: var(--blue-dim); color: var(--blue); }

  .detail-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .df-item {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }
  .df-item:nth-child(even) { border-right: none; }
  .df-item:nth-last-child(-n+2) { border-bottom: none; }
  .df-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: var(--white40);
    margin-bottom: 6px;
  }
  .df-value {
    font-size: 15px;
    font-weight: 600;
    color: var(--white);
  }
  .df-value.mono {
    font-family: var(--mono);
    font-size: 14px;
    background: var(--s4);
    border-radius: 4px;
    padding: 4px 8px;
    display: inline-block;
    letter-spacing: 0.5px;
    color: var(--white80);
  }
  .df-value.muted { color: var(--white60); }
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--white40);
    cursor: pointer;
    margin-left: 8px;
    transition: color 0.15s;
  }
  .copy-btn:hover { color: var(--white80); }

  /* Two column layout */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 36px;
  }

  /* Documents list */
  .doc-list { display: flex; flex-direction: column; gap: 10px; }
  .doc-item {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .doc-item:hover { border-color: var(--white20); background: var(--s3); }
  .doc-icon {
    width: 36px; height: 36px;
    background: var(--s4);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .doc-info { flex: 1; min-width: 0; }
  .doc-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
  .doc-meta { font-size: 12px; color: var(--white60); }
  .doc-download {
    font-size: 13px;
    color: var(--white60);
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .doc-download:hover { background: var(--white10); color: var(--white); }

  /* Perks grid */
  .perks-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .perk-card {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
    position: relative;
    overflow: hidden;
  }
  .perk-card:hover { border-color: var(--white20); transform: translateY(-2px); }
  .perk-logo {
    width: 40px; height: 40px;
    background: var(--s4);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-bottom: 12px;
  }
  .perk-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .perk-value {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .perk-desc { font-size: 12px; color: var(--white60); line-height: 1.5; }
  .perk-claimed {
    position: absolute;
    top: 14px; right: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: var(--green);
    background: var(--green-dim);
    padding: 3px 8px;
    border-radius: 16px;
  }
  .perk-cta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--white80);
    background: var(--s4);
    border: 1px solid var(--border);
    padding: 5px 10px;
    border-radius: 6px;
    transition: background 0.15s;
  }
  .perk-cta:hover { background: var(--s6); }

  /* Timeline */
  .timeline { display: flex; flex-direction: column; gap: 0; }
  .tl-item {
    display: flex;
    gap: 16px;
    position: relative;
    padding-bottom: 20px;
  }
  .tl-item:last-child { padding-bottom: 0; }
  .tl-line-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 20px;
  }
  .tl-dot {
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
  }
  .tl-dot.done { background: var(--green); color: var(--bg); font-weight: 800; }
  .tl-dot.current { background: var(--white); color: var(--bg); font-weight: 800; animation: pulse 2s ease-in-out infinite; }
  .tl-dot.future { background: var(--s5); border: 2px solid var(--s6); color: var(--white40); }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
    50% { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
  }
  .tl-connector {
    flex: 1;
    width: 2px;
    background: var(--s5);
    margin: 4px 0;
    min-height: 16px;
  }
  .tl-connector.done { background: var(--green); }
  .tl-body { flex: 1; padding-top: 1px; }
  .tl-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .tl-desc { font-size: 12px; color: var(--white60); line-height: 1.5; }
  .tl-date { font-size: 11px; color: var(--white40); margin-top: 3px; }

  /* Founders */
  .founders-list { display: flex; flex-direction: column; gap: 10px; }
  .founder-item {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .founder-item:hover { border-color: var(--white20); }
  .founder-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    color: var(--bg);
    flex-shrink: 0;
  }
  .founder-info { flex: 1; }
  .founder-name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
  .founder-role { font-size: 13px; color: var(--white60); }
  .founder-equity {
    text-align: right;
    flex-shrink: 0;
  }
  .fe-pct { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .fe-label { font-size: 11px; color: var(--white40); margin-top: 1px; }

  /* Equity bar */
  .equity-bar {
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    margin-bottom: 12px;
  }
  .eq-seg {
    height: 100%;
    transition: flex 0.3s;
  }
  .eq-legend { display: flex; gap: 20px; flex-wrap: wrap; }
  .eq-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--white60);
  }
  .eq-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* Stripe account panel */
  .stripe-panel {
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .sp-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sp-logo {
    width: 32px; height: 32px;
    background: var(--white);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .sp-title { font-size: 16px; font-weight: 700; }
  .sp-sub { font-size: 12px; color: var(--white60); }
  .sp-body { padding: 20px; }
  .sp-metric-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .sp-metric {
    background: var(--s3);
    border-radius: 8px;
    padding: 14px;
    border: 1px solid var(--border);
  }
  .sp-metric-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--white40); margin-bottom: 6px; }
  .sp-metric-value { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .sp-metric-change { font-size: 12px; color: var(--green); margin-top: 3px; }
  .sp-quick-links { display: flex; gap: 10px; flex-wrap: wrap; }
  .sp-link {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--s4);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--white80);
    cursor: pointer;
    transition: background 0.15s;
  }
  .sp-link:hover { background: var(--s6); color: var(--white); }
</style>
</head>
<body>

<!-- ── TOP NAV ── -->
<nav class="topnav">
  <div class="nav-logo">
    <div class="nav-logo-mark">🛣</div>
    <span class="nav-logo-text">RoadAtlas</span>
    <span class="nav-logo-divider">/</span>
    <span class="nav-logo-sub">by BlackRoad OS</span>
  </div>
  <div class="nav-right">
    <button class="nav-icon-btn">💬</button>
    <button class="nav-icon-btn">
      🔔
      <span class="nav-notif-dot"></span>
    </button>
    <div class="nav-user-btn">
      <div class="nav-user-av">🛣</div>
      alexa_road
      <span style="color:var(--white40);font-size:11px;">▾</span>
    </div>
  </div>
</nav>

<div class="shell">

  <!-- ── SIDEBAR ── -->
  <div class="sidebar">
    <div class="sb-company">
      <div class="sb-company-name">BlackRoad OS Inc.</div>
      <div class="sb-company-meta">Delaware C-Corp · acct_road2024inc</div>
      <div class="sb-company-status">✓ Incorporated</div>
    </div>

    <div class="sb-nav-item active">
      <span class="sb-icon">🏠</span> Overview
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">✅</span> Checklist
      <span class="sb-badge">2</span>
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">📄</span> Documents
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">👥</span> Founders & Equity
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">💳</span> Stripe Account
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">🏦</span> Bank Account
    </div>

    <div class="sb-section-label">Grow</div>
    <div class="sb-nav-item">
      <span class="sb-icon">🎁</span> Perks
      <span class="sb-badge new">5</span>
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">⚖️</span> Legal Resources
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">🧾</span> Tax & Accounting
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">📈</span> Fundraising Tools
    </div>

    <div class="sb-section-label">Settings</div>
    <div class="sb-nav-item">
      <span class="sb-icon">⚙️</span> Company Settings
    </div>
    <div class="sb-nav-item">
      <span class="sb-icon">🔒</span> Security
    </div>
  </div>

  <!-- ── MAIN ── -->
  <div class="main">

    <div class="page-title">BlackRoad OS Inc.</div>
    <div class="page-sub">Delaware C-Corp · Incorporated March 14, 2024 · Minneapolis, MN</div>

    <!-- Status cards -->
    <div class="status-cards">
      <div class="status-card">
        <div class="sc-icon-row">
          <div class="sc-icon">🏛</div>
          <span class="sc-status done">✓ Done</span>
        </div>
        <div class="sc-title">Incorporation</div>
        <div class="sc-value">Delaware</div>
        <div class="sc-sub">C-Corp · Filed Mar 14, 2024</div>
      </div>
      <div class="status-card">
        <div class="sc-icon-row">
          <div class="sc-icon">🪪</div>
          <span class="sc-status done">✓ Done</span>
        </div>
        <div class="sc-title">EIN</div>
        <div class="sc-value" style="font-family:var(--mono); font-size:16px; letter-spacing:1px;">88-••••317</div>
        <div class="sc-sub">IRS · Obtained Mar 19, 2024</div>
      </div>
      <div class="status-card">
        <div class="sc-icon-row">
          <div class="sc-icon">💳</div>
          <span class="sc-status done">✓ Done</span>
        </div>
        <div class="sc-title">Stripe Account</div>
        <div class="sc-value">Connected</div>
        <div class="sc-sub">acct_road2024inc · Live mode</div>
      </div>
      <div class="status-card">
        <div class="sc-icon-row">
          <div class="sc-icon">🏦</div>
          <span class="sc-status done">✓ Done</span>
        </div>
        <div class="sc-title">Bank Account</div>
        <div class="sc-value">$184,220</div>
        <div class="sc-sub">Mercury · ••••4892 · Checking</div>
      </div>
    </div>

    <!-- Checklist -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Setup Checklist</div>
        <span class="section-action">View all →</span>
      </div>
      <div class="checklist">
        <div class="checklist-progress-bar"><div class="checklist-fill" style="width:80%;"></div></div>
        <div class="checklist-header">
          <span class="checklist-title">8 of 10 steps complete</span>
          <span class="checklist-count" style="color:var(--green);">80% complete</span>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Incorporate in Delaware</div>
            <div class="ci-desc">BlackRoad OS Inc. was incorporated as a Delaware C-Corp via RoadAtlas</div>
            <div class="ci-date">Completed March 14, 2024</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Obtain Employer Identification Number (EIN)</div>
            <div class="ci-desc">EIN filed with the IRS — required for bank accounts, taxes, and hiring</div>
            <div class="ci-date">Completed March 19, 2024</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Sign founder agreements & issue stock</div>
            <div class="ci-desc">Founder stock agreements, 83(b) elections, and IP assignment completed</div>
            <div class="ci-date">Completed March 22, 2024</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Open a business bank account</div>
            <div class="ci-desc">Mercury business checking opened — FDIC insured, API-accessible</div>
            <div class="ci-date">Completed March 25, 2024</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Activate your Stripe account</div>
            <div class="ci-desc">Stripe account verified and in live mode — ready to accept payments</div>
            <div class="ci-date">Completed March 27, 2024</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Set up a registered agent</div>
            <div class="ci-desc">Stripe Atlas Registered Agent LLC appointed for Delaware service of process</div>
            <div class="ci-date">Completed March 14, 2024</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">File Statement of Information</div>
            <div class="ci-desc">Delaware annual report and franchise tax return filed</div>
            <div class="ci-date">Completed January 31, 2026</div>
          </div>
        </div>

        <div class="check-item done-item">
          <div class="ci-check done">✓</div>
          <div class="ci-body">
            <div class="ci-title">Elect S-Corp tax treatment or maintain C-Corp</div>
            <div class="ci-desc">Elected to remain a C-Corp — optimal for VC funding and equity compensation</div>
            <div class="ci-date">Completed April 1, 2024</div>
          </div>
        </div>

        <div class="check-item">
          <div class="ci-check pending">!</div>
          <div class="ci-body">
            <div class="ci-title">Set up a cap table management tool</div>
            <div class="ci-desc">Track equity, model dilution, and manage your option pool. We recommend Carta or Pulley.</div>
          </div>
          <div class="ci-action primary">Start →</div>
        </div>

        <div class="check-item">
          <div class="ci-check todo"></div>
          <div class="ci-body">
            <div class="ci-title">Draft employee IP & confidentiality agreements</div>
            <div class="ci-desc">Required before hiring employees. Use our template library to generate agreements instantly.</div>
          </div>
          <div class="ci-action">View templates</div>
        </div>

      </div>
    </div>

    <!-- Company details + Incorporation timeline -->
    <div class="two-col">

      <!-- Company details -->
      <div>
        <div class="section-header">
          <div class="section-title">Company Details</div>
          <span class="section-action">Edit →</span>
        </div>
        <div class="detail-card">
          <div class="detail-card-header">
            <div class="dc-icon">🏢</div>
            <div>
              <div class="dc-title">BlackRoad OS Inc.</div>
              <div class="dc-sub">Legal entity · Delaware</div>
            </div>
            <span class="dc-badge active">✓ Active</span>
          </div>
          <div class="detail-fields">
            <div class="df-item">
              <div class="df-label">Entity Type</div>
              <div class="df-value">C-Corporation</div>
            </div>
            <div class="df-item">
              <div class="df-label">State</div>
              <div class="df-value">Delaware</div>
            </div>
            <div class="df-item">
              <div class="df-label">EIN</div>
              <div class="df-value mono">88-••••317 <span class="copy-btn">⊞ Copy</span></div>
            </div>
            <div class="df-item">
              <div class="df-label">File Number</div>
              <div class="df-value mono">7421098</div>
            </div>
            <div class="df-item">
              <div class="df-label">Incorporation Date</div>
              <div class="df-value">Mar 14, 2024</div>
            </div>
            <div class="df-item">
              <div class="df-label">Fiscal Year End</div>
              <div class="df-value">December 31</div>
            </div>
            <div class="df-item">
              <div class="df-label">Principal Office</div>
              <div class="df-value muted">Minneapolis, MN 55401</div>
            </div>
            <div class="df-item">
              <div class="df-label">Registered Agent</div>
              <div class="df-value muted">Atlas Agent LLC, DE</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Incorporation timeline -->
      <div>
        <div class="section-header">
          <div class="section-title">Incorporation Timeline</div>
        </div>
        <div class="timeline">
          <div class="tl-item">
            <div class="tl-line-col">
              <div class="tl-dot done">✓</div>
              <div class="tl-connector done"></div>
            </div>
            <div class="tl-body">
              <div class="tl-title">Application submitted</div>
              <div class="tl-desc">Founder details, company name, and structure confirmed via RoadAtlas</div>
              <div class="tl-date">March 12, 2024 · 9:42 AM</div>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-line-col">
              <div class="tl-dot done">✓</div>
              <div class="tl-connector done"></div>
            </div>
            <div class="tl-body">
              <div class="tl-title">Filed with Delaware Secretary of State</div>
              <div class="tl-desc">Certificate of Incorporation submitted — same-day expedited filing</div>
              <div class="tl-date">March 13, 2024 · 11:15 AM</div>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-line-col">
              <div class="tl-dot done">✓</div>
              <div class="tl-connector done"></div>
            </div>
            <div class="tl-body">
              <div class="tl-title">Incorporation approved ✓</div>
              <div class="tl-desc">Certificate of Incorporation issued · File #7421098 · BlackRoad OS Inc.</div>
              <div class="tl-date">March 14, 2024 · 2:08 PM</div>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-line-col">
              <div class="tl-dot done">✓</div>
              <div class="tl-connector done"></div>
            </div>
            <div class="tl-body">
              <div class="tl-title">EIN obtained from IRS</div>
              <div class="tl-desc">Employer Identification Number issued — 88-••••317</div>
              <div class="tl-date">March 19, 2024 · 10:00 AM</div>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-line-col">
              <div class="tl-dot done">✓</div>
              <div class="tl-connector done"></div>
            </div>
            <div class="tl-body">
              <div class="tl-title">Bank account opened · Mercury</div>
              <div class="tl-desc">Business checking ••••4892 funded and active</div>
              <div class="tl-date">March 25, 2024 · 3:30 PM</div>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-line-col">
              <div class="tl-dot done">✓</div>
              <div class="tl-connector"></div>
            </div>
            <div class="tl-body">
              <div class="tl-title">Stripe account activated · Live mode</div>
              <div class="tl-desc">acct_road2024inc verified — accepting live payments</div>
              <div class="tl-date">March 27, 2024 · 11:22 AM</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Stripe account -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Stripe Account</div>
        <span class="section-action">Open Dashboard →</span>
      </div>
      <div class="stripe-panel">
        <div class="sp-header">
          <div class="sp-logo">💳</div>
          <div>
            <div class="sp-title">acct_road2024inc</div>
            <div class="sp-sub">Live mode · BlackRoad OS Inc. · Stripe API v2026-03-25.dahlia</div>
          </div>
          <span class="dc-badge active" style="margin-left:auto;">✓ Live</span>
        </div>
        <div class="sp-body">
          <div class="sp-metric-row">
            <div class="sp-metric">
              <div class="sp-metric-label">Balance</div>
              <div class="sp-metric-value">$22,841</div>
              <div class="sp-metric-change">↑ +$4,120 this week</div>
            </div>
            <div class="sp-metric">
              <div class="sp-metric-label">MRR</div>
              <div class="sp-metric-value">$38,400</div>
              <div class="sp-metric-change">↑ +18% vs last month</div>
            </div>
            <div class="sp-metric">
              <div class="sp-metric-label">Active Subs</div>
              <div class="sp-metric-value">847</div>
              <div class="sp-metric-change">↑ +63 this week</div>
            </div>
          </div>
          <div class="sp-quick-links">
            <div class="sp-link">📊 View Dashboard</div>
            <div class="sp-link">⚡ API Keys</div>
            <div class="sp-link">🪝 Webhooks</div>
            <div class="sp-link">🧾 Invoices</div>
            <div class="sp-link">💰 Payouts</div>
            <div class="sp-link">🔒 Radar (Fraud)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Founders & Equity -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Founders & Equity</div>
        <span class="section-action">Manage on Carta →</span>
      </div>
      <div style="margin-bottom:16px;">
        <div class="equity-bar">
          <div class="eq-seg" style="flex:60; background:#ffffff;"></div>
          <div class="eq-seg" style="flex:20; background:#525252;"></div>
          <div class="eq-seg" style="flex:10; background:#737373;"></div>
          <div class="eq-seg" style="flex:10; background:#333;"></div>
        </div>
        <div class="eq-legend">
          <div class="eq-legend-item"><div class="eq-dot" style="background:#ffffff;"></div>alexa_road — 60%</div>
          <div class="eq-legend-item"><div class="eq-dot" style="background:#525252;"></div>pixel_forge — 20%</div>
          <div class="eq-legend-item"><div class="eq-dot" style="background:#737373;"></div>Option Pool — 10%</div>
          <div class="eq-legend-item"><div class="eq-dot" style="background:#333;"></div>Reserved — 10%</div>
        </div>
      </div>
      <div class="founders-list">
        <div class="founder-item">
          <div class="founder-avatar">🛣</div>
          <div class="founder-info">
            <div class="founder-name">Alexa Amundson <span style="font-size:12px; color:var(--white40); font-weight:400;">(alexa_road)</span></div>
            <div class="founder-role">CEO & Co-Founder · Common Stock Class A · 4-yr vest, 1-yr cliff · 83(b) filed ✓</div>
          </div>
          <div class="founder-equity">
            <div class="fe-pct">60%</div>
            <div class="fe-label">6,000,000 shares</div>
          </div>
        </div>
        <div class="founder-item">
          <div class="founder-avatar" style="background:var(--s5); color:var(--white);">🔮</div>
          <div class="founder-info">
            <div class="founder-name">pixel_forge <span style="font-size:12px; color:var(--white40); font-weight:400;">CTO</span></div>
            <div class="founder-role">CTO & Co-Founder · Common Stock Class A · 4-yr vest, 1-yr cliff · 83(b) filed ✓</div>
          </div>
          <div class="founder-equity">
            <div class="fe-pct">20%</div>
            <div class="fe-label">2,000,000 shares</div>
          </div>
        </div>
        <div class="founder-item" style="background:var(--s3); border-style:dashed;">
          <div class="founder-avatar" style="background:var(--s5); color:var(--white60); font-size:24px;">＋</div>
          <div class="founder-info">
            <div class="founder-name" style="color:var(--white60);">Option Pool</div>
            <div class="founder-role">1,000,000 shares reserved for employees, advisors, and future grants</div>
          </div>
          <div class="founder-equity">
            <div class="fe-pct" style="color:var(--white60);">10%</div>
            <div class="fe-label">0 issued · 1M available</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Documents -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Legal Documents</div>
        <span class="section-action">View all →</span>
      </div>
      <div class="doc-list">
        <div class="doc-item">
          <div class="doc-icon">🏛</div>
          <div class="doc-info">
            <div class="doc-name">Certificate of Incorporation</div>
            <div class="doc-meta">Delaware Secretary of State · Filed March 14, 2024 · PDF · 4 pages</div>
          </div>
          <div class="doc-download">⬇ Download</div>
        </div>
        <div class="doc-item">
          <div class="doc-icon">📋</div>
          <div class="doc-info">
            <div class="doc-name">Bylaws</div>
            <div class="doc-meta">BlackRoad OS Inc. Corporate Bylaws · Adopted March 22, 2024 · PDF · 18 pages</div>
          </div>
          <div class="doc-download">⬇ Download</div>
        </div>
        <div class="doc-item">
          <div class="doc-icon">📝</div>
          <div class="doc-info">
            <div class="doc-name">Founder Stock Purchase Agreement — alexa_road</div>
            <div class="doc-meta">6,000,000 shares Class A Common · $0.0001 par value · Signed March 22, 2024</div>
          </div>
          <div class="doc-download">⬇ Download</div>
        </div>
        <div class="doc-item">
          <div class="doc-icon">📝</div>
          <div class="doc-info">
            <div class="doc-name">Founder Stock Purchase Agreement — pixel_forge</div>
            <div class="doc-meta">2,000,000 shares Class A Common · $0.0001 par value · Signed March 22, 2024</div>
          </div>
          <div class="doc-download">⬇ Download</div>
        </div>
        <div class="doc-item">
          <div class="doc-icon">📄</div>
          <div class="doc-info">
            <div class="doc-name">IP Assignment Agreement</div>
            <div class="doc-meta">All prior IP assigned to BlackRoad OS Inc. · Both founders · Signed March 22, 2024</div>
          </div>
          <div class="doc-download">⬇ Download</div>
        </div>
        <div class="doc-item">
          <div class="doc-icon">🪪</div>
          <div class="doc-info">
            <div class="doc-name">IRS EIN Confirmation Letter</div>
            <div class="doc-meta">Form SS-4 · EIN 88-••••317 · Issued March 19, 2024 · PDF · 1 page</div>
          </div>
          <div class="doc-download">⬇ Download</div>
        </div>
      </div>
    </div>

    <!-- Perks -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Founder Perks</div>
        <span class="section-action">View all 47 perks →</span>
      </div>
      <div class="perks-grid">
        <div class="perk-card">
          <span class="perk-claimed">✓ Claimed</span>
          <div class="perk-logo">☁️</div>
          <div class="perk-name">AWS Activate</div>
          <div class="perk-value">$100,000</div>
          <div class="perk-desc">AWS credits for startups — compute, storage, AI/ML services</div>
        </div>
        <div class="perk-card">
          <span class="perk-claimed">✓ Claimed</span>
          <div class="perk-logo">🌐</div>
          <div class="perk-name">Cloudflare for Startups</div>
          <div class="perk-value">$250/mo</div>
          <div class="perk-desc">Pro plan free for 1 year — Workers, Pages, D1, R2 included</div>
        </div>
        <div class="perk-card">
          <span class="perk-claimed">✓ Claimed</span>
          <div class="perk-logo">📊</div>
          <div class="perk-name">Notion for Startups</div>
          <div class="perk-value">6 months free</div>
          <div class="perk-desc">Plus plan for up to 10 seats — docs, wikis, databases</div>
        </div>
        <div class="perk-card">
          <div class="perk-logo">🏦</div>
          <div class="perk-name">Mercury Banking</div>
          <div class="perk-value">$500 bonus</div>
          <div class="perk-desc">$500 after $10k in deposits. Free FDIC-insured business banking with API access.</div>
          <div class="perk-cta">Claim →</div>
        </div>
        <div class="perk-card">
          <div class="perk-logo">🤖</div>
          <div class="perk-name">OpenAI for Startups</div>
          <div class="perk-value">$2,500</div>
          <div class="perk-desc">API credits for GPT-4o, Whisper, DALL·E, and Embeddings</div>
          <div class="perk-cta">Claim →</div>
        </div>
        <div class="perk-card">
          <div class="perk-logo">⚖️</div>
          <div class="perk-name">Clerky Legal</div>
          <div class="perk-value">$200 off</div>
          <div class="perk-desc">SAFE notes, NDAs, offer letters, and board consents at startup pricing</div>
          <div class="perk-cta">Claim →</div>
        </div>
      </div>
    </div>

  </div><!-- /main -->
</div><!-- /shell -->

</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/robots.txt') return new Response('User-agent: *\nAllow: /\nSitemap: https://roadcoin.blackroad.io/sitemap.xml', {headers:{'Content-Type':'text/plain'}});
    if (url.pathname === '/blackroad-os-indexnow-2026.txt') return new Response('blackroad-os-indexnow-2026', {headers:{'Content-Type':'text/plain'}});
    if (url.pathname === '/sitemap.xml') return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://roadcoin.blackroad.io/</loc><priority>1.0</priority></url></urlset>', {headers:{'Content-Type':'application/xml'}});
    if (url.pathname === '/api/init') {
      for (const sql of SCHEMA) await env.DB.exec(sql);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/balance') {
      const addr = url.searchParams.get('address');
      if (!addr) return new Response(JSON.stringify({ error: 'address required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      try {
        const row = await env.DB.prepare('SELECT * FROM wallets WHERE address = ?').bind(addr).first();
        return new Response(JSON.stringify(row || { balance: 0 }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch {
        return new Response(JSON.stringify({ balance: 0 }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/transactions') {
      const addr = url.searchParams.get('address');
      try {
        const { results } = await env.DB.prepare('SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY created_at DESC LIMIT 50')
          .bind(addr || '', addr || '').all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    return secHeaders(new Response(ROOT_HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } }));
  }
};
