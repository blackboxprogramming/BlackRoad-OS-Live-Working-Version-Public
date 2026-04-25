// PROPRIETARY AND CONFIDENTIAL. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.
// RoadView — Video/Stream Platform | roadview.blackroad.io

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
  'Access-Control-Max-Age': '86400',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

const SEARCH_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
  <title>RoadView</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sg);
      font-size: 13px;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    
    
    

    /* ══════════════════════════════
       TOP NAV
    ══════════════════════════════ */
    .topnav {
      height: 50px; flex-shrink: 0;
      background: var(--s1);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
      padding: 0 16px; gap: 10px;
      z-index: 100;
    }

    .nav-logo {
      display: flex; align-items: center; gap: 7px;
      cursor: pointer; flex-shrink: 0; margin-right: 4px;
    }
    .nav-logo-icon {
      width: 30px; height: 30px; border-radius: 6px;
      background: var(--white);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 900; color: #000;
    }
    .nav-logo-text {
      font-size: 17px; font-weight: 800; color: var(--white);
      letter-spacing: -0.3px;
    }

    .nav-link {
      padding: 6px 10px; border-radius: 4px;
      font-size: 14px; font-weight: 600; color: var(--muted);
      cursor: pointer; white-space: nowrap;
      transition: background 0.1s, color 0.1s;
    }
    .nav-link:hover { background: var(--s3); color: var(--text); }
    .nav-link.active { color: var(--white); }

    .nav-search {
      flex: 1; max-width: 560px;
      display: flex; align-items: center;
      background: var(--s3); border: 1px solid var(--border);
      border-radius: 4px; overflow: hidden;
    }
    .nav-search:focus-within { border-color: var(--white); }
    .nav-search input {
      flex: 1; background: none; border: none; outline: none;
      color: var(--text); font-size: 13px; padding: 8px 12px;
    }
    .nav-search input::placeholder { color: var(--dim); }
    .nav-search-btn {
      width: 38px; height: 100%; background: var(--s4);
      border-left: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; color: var(--muted); cursor: pointer;
    }
    .nav-search-btn:hover { background: var(--s5); color: var(--text); }

    .nav-spacer { flex: 1; }

    .nav-actions { display: flex; align-items: center; gap: 6px; }

    .nav-icon-btn {
      width: 34px; height: 34px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; color: var(--muted); cursor: pointer;
      position: relative; transition: background 0.1s, color 0.1s;
    }
    .nav-icon-btn:hover { background: var(--s3); color: var(--text); }
    .nav-notif-dot {
      position: absolute; top: 4px; right: 4px;
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--white); border: 2px solid var(--s1);
    }

    .nav-btn {
      padding: 6px 14px; border-radius: 4px;
      font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .nav-btn.outline {
      border: 1px solid var(--muted); color: var(--muted); background: none;
    }
    .nav-btn.outline:hover { border-color: var(--text); color: var(--text); }
    .nav-btn.solid { background: var(--white); color: #000; border: none; }
    .nav-btn.solid:hover { background: #e5e5e5; }

    .nav-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--s4); border: 2px solid transparent;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--muted); cursor: pointer;
    }
    .nav-avatar:hover { border-color: var(--white); }

    /* ══════════════════════════════
       MAIN BODY (left nav + content + chat)
    ══════════════════════════════ */
    .body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ══════════════════════════════
       LEFT NAV — Following sidebar
    ══════════════════════════════ */
    .leftnav {
      width: 240px; flex-shrink: 0;
      background: var(--s1);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      overflow-y: auto;
    }

    .ln-section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 10px 6px;
    }
    .ln-section-title {
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--muted);
    }
    .ln-section-action {
      font-size: 11px; color: var(--muted); cursor: pointer;
    }
    .ln-section-action:hover { color: var(--text); }

    .ln-channel {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 10px; border-radius: 4px;
      cursor: pointer; margin: 1px 4px;
      transition: background 0.1s;
    }
    .ln-channel:hover { background: var(--s3); }
    .ln-channel.active { background: var(--s3); }

    .ln-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--s4); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--muted);
      position: relative;
    }
    .ln-live-dot {
      position: absolute; bottom: -1px; right: -1px;
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--white); border: 2px solid var(--s1);
    }
    .ln-channel-info { flex: 1; min-width: 0; }
    .ln-channel-name {
      font-size: 13px; font-weight: 600; color: var(--text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ln-channel-game {
      font-size: 12px; color: var(--muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ln-viewers {
      font-size: 11px; color: var(--muted); flex-shrink: 0;
    }
    .ln-viewers.live { color: var(--white); font-weight: 700; }

    .ln-show-more {
      padding: 6px 14px; font-size: 12px; color: var(--muted);
      cursor: pointer; margin: 2px 4px;
    }
    .ln-show-more:hover { color: var(--text); }

    .ln-divider { height: 1px; background: var(--border); margin: 8px 0; }

    /* ══════════════════════════════
       MAIN CONTENT AREA
    ══════════════════════════════ */
    .main {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column;
      overflow-y: auto;
    }

    /* ── Player / Stream ── */
    .player-wrap {
      background: #000;
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      max-height: 60vh;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .player-bg {
      position: absolute; inset: 0;
      background: repeating-linear-gradient(
        -45deg, #0a0a0a 0, #0a0a0a 20px, #111 20px, #111 40px
      );
    }
    .player-content {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px;
    }
    .player-icon { font-size: 72px; opacity: 0.15; }
    .player-live-badge {
      background: var(--white); color: #000;
      font-size: 11px; font-weight: 800;
      padding: 3px 8px; border-radius: 3px;
      letter-spacing: 0.05em;
    }

    /* player controls overlay */
    .player-controls {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
      background: linear-gradient(transparent, rgba(0,0,0,0.85));
      padding: 28px 16px 10px;
      display: flex; align-items: center; gap: 8px;
    }
    .pc-btn {
      width: 32px; height: 32px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; color: var(--white); cursor: pointer;
    }
    .pc-btn:hover { background: rgba(255,255,255,0.15); }
    .pc-progress {
      flex: 1; height: 4px; background: rgba(255,255,255,0.2);
      border-radius: 2px; cursor: pointer; position: relative;
    }
    .pc-filled { width: 65%; height: 100%; background: var(--white); border-radius: 2px; }
    .pc-time { font-size: 12px; color: var(--white); white-space: nowrap; }
    .pc-spacer { flex: 1; }
    .pc-viewers {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; color: var(--white); font-weight: 700;
    }
    .pc-live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--white); }

    /* ── Stream info bar ── */
    .stream-info {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    .si-top {
      display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;
    }
    .si-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--s4); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: var(--muted);
      position: relative; cursor: pointer;
    }
    .si-avatar-live {
      position: absolute; bottom: -2px;
      left: 50%; transform: translateX(-50%);
      background: var(--white); color: #000;
      font-size: 9px; font-weight: 800;
      padding: 1px 5px; border-radius: 2px;
    }
    .si-info { flex: 1; min-width: 0; }
    .si-title {
      font-size: 16px; font-weight: 700; color: var(--white);
      line-height: 1.3; margin-bottom: 3px; cursor: pointer;
    }
    .si-title:hover { text-decoration: underline; }
    .si-channel {
      font-size: 14px; font-weight: 600; color: var(--text);
      cursor: pointer; margin-bottom: 3px;
    }
    .si-channel:hover { text-decoration: underline; }
    .si-game {
      font-size: 13px; color: var(--muted); cursor: pointer;
    }
    .si-game:hover { color: var(--text); text-decoration: underline; }
    .si-actions {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .si-follow-btn {
      padding: 7px 16px; border-radius: 4px;
      background: var(--white); color: #000;
      font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .si-follow-btn:hover { background: #e5e5e5; }
    .si-sub-btn {
      padding: 7px 16px; border-radius: 4px;
      background: var(--s4); color: var(--text);
      border: 1px solid var(--border);
      font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .si-sub-btn:hover { background: var(--s5); }
    .si-more-btn {
      width: 34px; height: 34px; border-radius: 4px;
      background: var(--s3); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: var(--muted); cursor: pointer;
    }
    .si-more-btn:hover { background: var(--s4); color: var(--text); }

    .si-tags {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }
    .si-tag {
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 10px; background: var(--s4); color: var(--muted);
      cursor: pointer; border: 1px solid var(--border);
    }
    .si-tag:hover { color: var(--text); border-color: var(--s5); }
    .si-viewers-count {
      font-size: 13px; color: var(--muted);
      display: flex; align-items: center; gap: 5px;
    }
    .si-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--white); }

    /* ── Recommended / Below player ── */
    .below-player { padding: 16px; }
    .bp-heading {
      font-size: 14px; font-weight: 700; color: var(--white);
      margin-bottom: 12px;
    }
    .channel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .channel-card { cursor: pointer; }
    .channel-card:hover .cc-thumb-icon { opacity: 0.3; }
    .cc-thumb {
      aspect-ratio: 16/9; background: var(--s3);
      border-radius: 4px; margin-bottom: 8px;
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .cc-thumb-pattern {
      position: absolute; inset: 0;
      background: repeating-linear-gradient(
        -45deg, var(--s3) 0, var(--s3) 8px, var(--s4) 8px, var(--s4) 16px
      );
    }
    .cc-thumb-icon { position: relative; z-index: 1; font-size: 32px; opacity: 0.15; }
    .cc-live-badge {
      position: absolute; top: 6px; left: 6px; z-index: 2;
      background: var(--white); color: #000;
      font-size: 10px; font-weight: 800; padding: 2px 5px; border-radius: 2px;
    }
    .cc-viewers-badge {
      position: absolute; bottom: 6px; left: 6px; z-index: 2;
      background: rgba(0,0,0,0.7); color: var(--text);
      font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 2px;
      display: flex; align-items: center; gap: 3px;
    }
    .cc-info { display: flex; gap: 8px; }
    .cc-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--s4); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: var(--muted);
    }
    .cc-meta { flex: 1; min-width: 0; }
    .cc-title {
      font-size: 13px; font-weight: 600; color: var(--text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .cc-streamer { font-size: 12px; color: var(--muted); }
    .cc-game { font-size: 12px; color: var(--muted); }

    /* ══════════════════════════════
       CHAT PANEL
    ══════════════════════════════ */
    .chat {
      width: 340px; flex-shrink: 0;
      background: var(--s1);
      border-left: 1px solid var(--border);
      display: flex; flex-direction: column;
      height: 100%;
    }

    .chat-header {
      height: 50px; flex-shrink: 0;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
      padding: 0 12px; gap: 4px;
    }
    .chat-tab {
      padding: 6px 10px; border-radius: 4px;
      font-size: 13px; font-weight: 700; color: var(--muted);
      cursor: pointer;
    }
    .chat-tab.active { color: var(--white); background: var(--s3); }
    .chat-tab:hover:not(.active) { background: var(--s2); color: var(--text); }
    .chat-header-spacer { flex: 1; }
    .chat-settings {
      width: 30px; height: 30px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; color: var(--muted); cursor: pointer;
    }
    .chat-settings:hover { background: var(--s3); color: var(--text); }

    /* messages */
    .chat-messages {
      flex: 1; overflow-y: auto;
      padding: 8px 8px 4px;
      display: flex; flex-direction: column; gap: 2px;
    }

    .chat-msg {
      padding: 2px 4px; border-radius: 2px;
      line-height: 1.4; word-break: break-word;
      font-size: 13px;
    }
    .chat-msg:hover { background: var(--s2); }
    .chat-ts { font-size: 11px; color: var(--dim); margin-right: 4px; }
    .chat-badges { display: inline-flex; gap: 2px; margin-right: 3px; vertical-align: middle; }
    .chat-badge { font-size: 11px; }
    .chat-user { font-weight: 700; cursor: pointer; margin-right: 4px; }
    .chat-user:hover { text-decoration: underline; }
    .chat-user.mod { color: var(--white); }
    .chat-user.sub { color: #e5e5e5; }
    .chat-user.bits { color: #e5e5e5; }
    .chat-text { color: var(--text); }
    .chat-emote { font-size: 16px; }
    .chat-highlight {
      background: rgba(255,255,255,0.06);
      border-left: 3px solid var(--white);
      padding: 4px 6px; margin: 2px 0; border-radius: 0 2px 2px 0;
    }

    /* subscription notification */
    .chat-sub-notif {
      background: var(--s3); border: 1px solid var(--border);
      border-radius: 4px; padding: 8px 10px; margin: 4px 0;
      font-size: 12px; color: var(--text);
    }
    .chat-sub-notif strong { color: var(--white); }

    /* chat input */
    .chat-input-area {
      padding: 8px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .chat-input-box {
      background: var(--s3); border: 1px solid var(--border);
      border-radius: 4px; padding: 8px 10px;
      font-size: 13px; color: var(--muted);
      margin-bottom: 6px; min-height: 38px;
      display: flex; align-items: center;
      cursor: text;
    }
    .chat-input-box:focus-within { border-color: var(--white); }
    .chat-input-actions {
      display: flex; align-items: center; gap: 4px;
    }
    .cia-btn {
      width: 30px; height: 30px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: var(--muted); cursor: pointer;
    }
    .cia-btn:hover { background: var(--s3); color: var(--text); }
    .cia-spacer { flex: 1; }
    .chat-send-btn {
      padding: 6px 12px; border-radius: 4px;
      background: var(--white); color: #000;
      font-size: 12px; font-weight: 700; cursor: pointer;
    }
    .chat-send-btn:hover { background: #e5e5e5; }

    .chat-rules {
      font-size: 11px; color: var(--dim); text-align: center;
      padding: 4px 0 2px;
    }
  
.grad-bar { height: 3px; background: var(--g); flex-shrink: 0; }
</style>
</head>
<body>
  <div class="grad-bar"></div>

  <!-- ══════════════════════ TOP NAV ══════════════════════ -->
  <div class="topnav">

    <div class="nav-logo">
      <div class="nav-logo-icon">▶</div>
      <div class="nav-logo-text">RoadStream</div>
    </div>

    <div class="nav-link active">Live</div>
    <div class="nav-link">Operators</div>
    <div class="nav-link">Agents</div>
    <div class="nav-link">More ▾</div>

    <div class="nav-search">
      <input type="text" placeholder="Search live sessions" />
      <div class="nav-search-btn">🔍</div>
    </div>

    <div class="nav-spacer"></div>

    <div class="nav-actions">
      <div class="nav-icon-btn">🔔<div class="nav-notif-dot"></div></div>
      <div class="nav-icon-btn">💬</div>
      <div class="nav-icon-btn">🎁</div>
      <div class="nav-btn outline">Open desk</div>
      <div class="nav-btn solid">Join room</div>
    </div>

  </div>

  <!-- ══════════════════════ BODY ══════════════════════ -->
  <div class="body">

    <!-- ══════════════════════ LEFT NAV ══════════════════════ -->
    <div class="leftnav">

      <div class="ln-section-header">
        <span class="ln-section-title">Live now</span>
      </div>

      <div class="ln-channel active">
        <div class="ln-avatar">
          AR
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">alexa_road</div>
          <div class="ln-channel-game">Game Dev · Rust</div>
        </div>
        <div class="ln-viewers live">28K</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          PF
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">pixel_forge</div>
          <div class="ln-channel-game">Cities: Skylines II</div>
        </div>
        <div class="ln-viewers live">14.2K</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          NL
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">officeroad_live</div>
          <div class="ln-channel-game">Operator briefing</div>
        </div>
        <div class="ln-viewers live">9.8K</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">SC</div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">sarahchen</div>
          <div class="ln-channel-game">Offline</div>
        </div>
        <div class="ln-viewers">—</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          TT
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">roadcode_live</div>
          <div class="ln-channel-game">Code systems</div>
        </div>
        <div class="ln-viewers live">6.1K</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          MK
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">roadcanvas_live</div>
          <div class="ln-channel-game">Brand systems</div>
        </div>
        <div class="ln-viewers live">3.4K</div>
      </div>

      <div class="ln-show-more">+ 14 more</div>

      <div class="ln-divider"></div>

      <div class="ln-section-header">
        <span class="ln-section-title">Recommended rooms</span>
        <span class="ln-section-action">Refresh</span>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          JK
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">jordank_live</div>
          <div class="ln-channel-game">Launch room</div>
        </div>
        <div class="ln-viewers live">41.7K</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          LG
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">lofigirl_music</div>
          <div class="ln-channel-game">Audio room</div>
        </div>
        <div class="ln-viewers live">88.3K</div>
      </div>

      <div class="ln-channel">
        <div class="ln-avatar">
          VF
          <div class="ln-live-dot"></div>
        </div>
        <div class="ln-channel-info">
          <div class="ln-channel-name">roadtube_live</div>
          <div class="ln-channel-game">Broadcast studio</div>
        </div>
        <div class="ln-viewers live">2.2K</div>
      </div>

      <div class="ln-show-more">+ Show more</div>

    </div>

    <!-- ══════════════════════ MAIN ══════════════════════ -->
    <div class="main">

      <!-- Video Player -->
      <div class="player-wrap">
        <div class="player-bg"></div>
        <div class="player-content">
          <div class="player-icon">🎮</div>
          <div class="player-live-badge">● LIVE</div>
        </div>
        <div class="player-controls">
          <div class="pc-btn">⏸</div>
          <div class="pc-btn">🔊</div>
          <div class="pc-progress"><div class="pc-filled"></div></div>
          <div class="pc-spacer"></div>
          <div class="pc-viewers"><div class="pc-live-dot"></div> 28,441 viewers</div>
          <div class="pc-btn" style="margin-left:8px;">⚙️</div>
          <div class="pc-btn">⛶</div>
          <div class="pc-btn">⤢</div>
        </div>
      </div>

      <!-- Stream Info -->
      <div class="stream-info">
        <div class="si-top">
          <div class="si-avatar">
            AR
            <div class="si-avatar-live">LIVE</div>
          </div>
          <div class="si-info">
            <div class="si-title">OfficeRoad live operator review — runtime systems, launches, and product coordination</div>
            <div class="si-channel">alexa_road</div>
            <div class="si-game">Software and Game Development</div>
          </div>
          <div class="si-actions">
            <div class="si-follow-btn">♡ Follow</div>
            <div class="si-sub-btn">★ Follow room</div>
            <div class="si-more-btn">⋯</div>
          </div>
        </div>
        <div class="si-tags">
          <div class="si-viewers-count"><div class="si-dot"></div> 28,441 viewers</div>
          <div class="si-tag">Rust</div>
          <div class="si-tag">GameDev</div>
          <div class="si-tag">Programming</div>
          <div class="si-tag">IndieGame</div>
          <div class="si-tag">English</div>
        </div>
      </div>

      <!-- Recommended streams below -->
      <div class="below-player">
        <div class="bp-heading">More streams you might like</div>
        <div class="channel-grid">

          <div class="channel-card">
            <div class="cc-thumb">
              <div class="cc-thumb-pattern"></div>
              <div class="cc-thumb-icon">🏙️</div>
              <div class="cc-live-badge">LIVE</div>
              <div class="cc-viewers-badge">● 14,211</div>
            </div>
            <div class="cc-info">
              <div class="cc-avatar">PF</div>
              <div class="cc-meta">
                <div class="cc-title">City Builder — New map procedural gen showcase</div>
                <div class="cc-streamer">pixel_forge</div>
                <div class="cc-game">Cities: Skylines II</div>
              </div>
            </div>
          </div>

          <div class="channel-card">
            <div class="cc-thumb">
              <div class="cc-thumb-pattern"></div>
              <div class="cc-thumb-icon">🎵</div>
              <div class="cc-live-badge">LIVE</div>
              <div class="cc-viewers-badge">● 88,330</div>
            </div>
            <div class="cc-info">
              <div class="cc-avatar">LG</div>
              <div class="cc-meta">
                <div class="cc-title">lofi hip hop radio — beats to code / relax to</div>
                <div class="cc-streamer">lofigirl_music</div>
                <div class="cc-game">Audio room</div>
              </div>
            </div>
          </div>

          <div class="channel-card">
            <div class="cc-thumb">
              <div class="cc-thumb-pattern"></div>
              <div class="cc-thumb-icon">💬</div>
              <div class="cc-live-badge">LIVE</div>
              <div class="cc-viewers-badge">● 9,812</div>
            </div>
            <div class="cc-info">
              <div class="cc-avatar">NL</div>
              <div class="cc-meta">
                <div class="cc-title">AMA: shipped 3 products in 2026, ask me anything</div>
                <div class="cc-streamer">officeroad_live</div>
                <div class="cc-game">Operator briefing</div>
              </div>
            </div>
          </div>

          <div class="channel-card">
            <div class="cc-thumb">
              <div class="cc-thumb-pattern"></div>
              <div class="cc-thumb-icon">🔫</div>
              <div class="cc-live-badge">LIVE</div>
              <div class="cc-viewers-badge">● 41,720</div>
            </div>
            <div class="cc-info">
              <div class="cc-avatar">JK</div>
              <div class="cc-meta">
                <div class="cc-title">RANKED GRIND — road to Champion | !discord</div>
                <div class="cc-streamer">jordank_live</div>
                <div class="cc-game">Launch room</div>
              </div>
            </div>
          </div>

          <div class="channel-card">
            <div class="cc-thumb">
              <div class="cc-thumb-pattern"></div>
              <div class="cc-thumb-icon">🎨</div>
              <div class="cc-live-badge">LIVE</div>
              <div class="cc-viewers-badge">● 3,441</div>
            </div>
            <div class="cc-info">
              <div class="cc-avatar">MK</div>
              <div class="cc-meta">
                <div class="cc-title">Designing the BlackRoad visual language live</div>
                <div class="cc-streamer">roadcanvas_live</div>
                <div class="cc-game">Brand systems</div>
              </div>
            </div>
          </div>

          <div class="channel-card">
            <div class="cc-thumb">
              <div class="cc-thumb-pattern"></div>
              <div class="cc-thumb-icon">🔬</div>
              <div class="cc-live-badge">LIVE</div>
              <div class="cc-viewers-badge">● 6,128</div>
            </div>
            <div class="cc-info">
              <div class="cc-avatar">TT</div>
              <div class="cc-meta">
                <div class="cc-title">RoadCode runtime deep-dive — live systems review</div>
                <div class="cc-streamer">roadcode_live</div>
                <div class="cc-game">Code systems</div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- ══════════════════════ CHAT ══════════════════════ -->
    <div class="chat">

      <div class="chat-header">
        <div class="chat-tab active">Live Chat</div>
        <div class="chat-tab">Ops Feed</div>
        <div class="chat-header-spacer"></div>
        <div class="chat-settings">⚙️</div>
      </div>

      <div class="chat-messages">

        <div class="chat-sub-notif">
          🌟 <strong>jordank_</strong> just subscribed for 6 months! <strong>PogChamp</strong>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:04</span>
          <span class="chat-badges"><span class="chat-badge">🛡️</span><span class="chat-badge">⭐</span></span>
          <span class="chat-user mod">nolan_dev:</span>
          <span class="chat-text">the operator surface is looking much tighter today</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:04</span>
          <span class="chat-user sub">cassie_codes:</span>
          <span class="chat-text">wait how is the renderer already this fast PogChamp</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:04</span>
          <span class="chat-user">pixel_forge:</span>
          <span class="chat-text">alexa can you explain the ECS architecture again? I missed the beginning</span>
        </div>

        <div class="chat-msg chat-highlight">
          <span class="chat-ts">18:05</span>
          <span class="chat-badges"><span class="chat-badge">🌟</span></span>
          <span class="chat-user bits">mk_design:</span>
          <span class="chat-text">just cheered 500 bits! this stream is teaching me more than any course I've paid for <span class="chat-emote">💎</span></span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:05</span>
          <span class="chat-user">dev_lurker:</span>
          <span class="chat-text">KEKW the collision detection bug is still there from last week</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:05</span>
          <span class="chat-user sub">road_fan99:</span>
          <span class="chat-text">LUL</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:05</span>
          <span class="chat-user">syntax_error:</span>
          <span class="chat-text">holy moly 28K viewers??? when did this blow up</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:05</span>
          <span class="chat-user">lofi_listener:</span>
          <span class="chat-text">the music in the bg is perfect coding vibes</span>
        </div>

        <div class="chat-sub-notif">
          💜 <strong>sarahchen</strong> just gifted 5 subs to the community!
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:06</span>
          <span class="chat-user sub">gifted_by_sarah_1:</span>
          <span class="chat-text">wait I just got a gift sub?? PogChamp thank you @sarahchen!!</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:06</span>
          <span class="chat-user">render_watcher:</span>
          <span class="chat-text">the frame time graph is looking smooth af</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:06</span>
          <span class="chat-badges"><span class="chat-badge">🛡️</span></span>
          <span class="chat-user mod">road_mod:</span>
          <span class="chat-text">📌 Reminder: keep chat on topic! No self-promotion links.</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:06</span>
          <span class="chat-user">npc_vibes:</span>
          <span class="chat-text">can you show the scene graph structure? <span class="chat-emote">👀</span></span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:07</span>
          <span class="chat-user sub">buildgang:</span>
          <span class="chat-text">this is literally the best game dev stream on the platform rn</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:07</span>
          <span class="chat-user">cursor_bro:</span>
          <span class="chat-text">wait wait wait — did she just write a custom allocator on stream?</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:07</span>
          <span class="chat-user">voxfilm:</span>
          <span class="chat-text">watching this while editing my next video, ultimate multitask</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:07</span>
          <span class="chat-user sub">cassie_codes:</span>
          <span class="chat-text">Clap Clap Clap that refactor was clean</span>
        </div>

        <div class="chat-msg">
          <span class="chat-ts">18:08</span>
          <span class="chat-user">late_to_stream:</span>
          <span class="chat-text">just tuned in, what did I miss??</span>
        </div>

        <div class="chat-sub-notif">
          ⭐ <strong>cursor_bro</strong> is now subscribed! Welcome to the Road!
        </div>

      </div>

      <!-- Chat Input -->
      <div class="chat-input-area">
        <div class="chat-input-box">Chat as guest...</div>
        <div class="chat-input-actions">
          <div class="cia-btn">😊</div>
          <div class="cia-btn">💎</div>
          <div class="cia-btn">🎁</div>
          <div class="cia-spacer"></div>
          <div class="chat-send-btn">Chat</div>
        </div>
        <div class="chat-rules">Chat rules · Report</div>
      </div>

    </div>

  </div>

</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { ...CORS_HEADERS, ...SECURITY_HEADERS };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\nSitemap: https://roadview.blackroad.io/sitemap.xml', { headers: { 'Content-Type': 'text/plain' } });
    }

    if (url.pathname === '/sitemap.xml') {
      const d = new Date().toISOString().split('T')[0];
      return new Response(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://roadview.blackroad.io/</loc><lastmod>${d}</lastmod><priority>1.0</priority></url></urlset>`, { headers: { 'Content-Type': 'application/xml' } });
    }

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'roadview', version: '2.0.0' });
    }

    return new Response(SEARCH_HTML, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Content-Security-Policy': "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io", ...headers },
    });
  }
};
