// PIXEL FOUNDRY — LAMPS (with axes)
// pendant, floorLamp, sconce, chandelier, deskLamp — each takes options object

const LAMPS = {
  AXES: {
    pendant:    { color: ['amber','pink','violet','blue','white'], state: ['on','off'] },
    floorLamp:  { color: ['amber','pink','violet','blue','white'], style: ['cone','globe','rod'], state: ['on','off'] },
    sconce:     { color: ['amber','pink','violet','blue','white'], state: ['on','off'] },
    chandelier: { color: ['amber','pink','violet','white'], size: ['s','m','l'] },
    deskLamp:   { color: ['amber','pink','violet','blue','black','white'], state: ['on','off'] }
  },

  _glow: {
    amber:  { core: '#F5A623', halo: 'rgba(245,166,35,0.35)', body: '#c4851c' },
    pink:   { core: '#FF1D6C', halo: 'rgba(255,29,108,0.35)', body: '#c41758' },
    violet: { core: '#9C27B0', halo: 'rgba(156,39,176,0.35)', body: '#7b1f8c' },
    blue:   { core: '#2979FF', halo: 'rgba(41,121,255,0.35)', body: '#1f5fcc' },
    white:  { core: '#ffffff', halo: 'rgba(255,255,255,0.30)', body: '#c0c0c0' },
    black:  { core: '#3a3a3a', halo: 'rgba(60,60,60,0.20)',   body: '#1a1a1a' }
  },

  // PENDANT (40x60)
  pendant(ctx, x, y, opts = {}, time = 0) {
    const g = this._glow[opts.color || 'amber'];
    const on = (opts.state || 'on') === 'on';
    // Cord
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 19, y, 2, 24);
    // Cap
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 14, y + 24, 12, 4);
    // Shade
    ctx.fillStyle = g.body;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 28); ctx.lineTo(x + 34, y + 28);
    ctx.lineTo(x + 28, y + 50); ctx.lineTo(x + 12, y + 50);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = on ? g.core : '#1a1a1a';
    ctx.fillRect(x + 12, y + 50, 16, 4);
    // Glow
    if (on) {
      const flicker = 0.85 + Math.sin(time / 12) * 0.1;
      ctx.fillStyle = g.halo;
      ctx.globalAlpha = flicker;
      ctx.fillRect(x - 2, y + 40, 44, 20);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 16, y + 52, 8, 1);
      ctx.globalAlpha = 1;
    }
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 8, y + 30, 2, 18);
  },

  // FLOOR LAMP (32x88)
  floorLamp(ctx, x, y, opts = {}, time = 0) {
    const g = this._glow[opts.color || 'amber'];
    const on = (opts.state || 'on') === 'on';
    const style = opts.style || 'cone';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 86, 20, 3);
    // Base
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 8, y + 80, 16, 6);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + 10, y + 82, 12, 2);
    // Pole
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 14, y + 24, 4, 56);
    // Shade
    if (style === 'cone') {
      ctx.fillStyle = g.body;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 28, y + 8);
      ctx.lineTo(x + 24, y + 26); ctx.lineTo(x + 8, y + 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = on ? g.core : '#1a1a1a';
      ctx.fillRect(x + 8, y + 26, 16, 2);
    } else if (style === 'globe') {
      ctx.fillStyle = g.body;
      ctx.beginPath(); ctx.arc(x + 16, y + 14, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = on ? g.core : '#2a2a2a';
      ctx.beginPath(); ctx.arc(x + 16, y + 14, 9, 0, Math.PI * 2); ctx.fill();
    } else if (style === 'rod') {
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x + 8, y, 16, 4);
      ctx.fillStyle = on ? g.core : '#2a2a2a';
      ctx.fillRect(x + 8, y + 4, 16, 18);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x + 8, y + 22, 16, 4);
    }
    // Glow
    if (on) {
      const flicker = 0.8 + Math.sin(time / 10) * 0.15;
      ctx.fillStyle = g.halo;
      ctx.globalAlpha = flicker;
      ctx.fillRect(x - 8, y, 48, 36);
      ctx.globalAlpha = 1;
    }
  },

  // SCONCE (28x36) — wall-mounted
  sconce(ctx, x, y, opts = {}, time = 0) {
    const g = this._glow[opts.color || 'amber'];
    const on = (opts.state || 'on') === 'on';
    // Backplate
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 10, y + 12, 8, 16);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + 11, y + 13, 6, 2);
    ctx.fillRect(x + 11, y + 25, 6, 2);
    // Arm
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 14, y + 18, 8, 3);
    // Shade — half cone pointing up
    ctx.fillStyle = g.body;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 16); ctx.lineTo(x + 24, y + 16);
    ctx.lineTo(x + 18, y + 4); ctx.lineTo(x + 10, y + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = on ? g.core : '#1a1a1a';
    ctx.fillRect(x + 10, y + 4, 8, 2);
    if (on) {
      const flicker = 0.85 + Math.sin(time / 8) * 0.1;
      ctx.fillStyle = g.halo;
      ctx.globalAlpha = flicker;
      ctx.fillRect(x - 4, y - 4, 36, 16);
      ctx.globalAlpha = 1;
    }
  },

  // CHANDELIER (60x52)
  chandelier(ctx, x, y, opts = {}, time = 0) {
    const g = this._glow[opts.color || 'amber'];
    const sizeMul = { s: 0.7, m: 1, l: 1.3 }[opts.size || 'm'];
    const cx = x + 30;
    // Cord
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx - 1, y, 2, 8);
    // Center hub
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(cx - 4, y + 8, 8, 6);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(cx - 3, y + 9, 6, 4);
    // Arms — 6 candles
    const armLen = 16 * sizeMul;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const ax = cx + Math.cos(angle) * armLen;
      const ay = y + 14 + Math.sin(angle) * armLen * 0.5;
      // Arm
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 14);
      ctx.quadraticCurveTo(cx + (ax - cx) * 0.5, y + 14 - 4, ax, ay);
      ctx.stroke();
      // Candle
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(ax - 1, ay - 4, 2, 6);
      // Flame
      const flicker = Math.sin(time / 4 + i) * 1;
      ctx.fillStyle = g.core;
      ctx.fillRect(ax - 1, ay - 8 + flicker / 2, 2, 4);
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(ax, ay - 7 + flicker / 2, 1, 2);
    }
    ctx.lineWidth = 1;
    // Halo
    const flicker = 0.6 + Math.sin(time / 10) * 0.1;
    ctx.fillStyle = g.halo;
    ctx.globalAlpha = flicker;
    ctx.fillRect(x, y, 60, 52);
    ctx.globalAlpha = 1;
  },

  // DESK LAMP (24x36)
  deskLamp(ctx, x, y, opts = {}, time = 0) {
    const g = this._glow[opts.color || 'amber'];
    const on = (opts.state || 'on') === 'on';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 20, 3);
    // Base
    ctx.fillStyle = g.body;
    ctx.fillRect(x + 4, y + 30, 16, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 28, 12, 2);
    // Arm 1
    ctx.fillStyle = g.body;
    ctx.fillRect(x + 11, y + 16, 2, 14);
    // Joint
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 10, y + 14, 4, 4);
    // Arm 2
    ctx.fillStyle = g.body;
    ctx.fillRect(x + 8, y + 8, 8, 8);
    // Head / shade
    ctx.fillStyle = g.body;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + 18, y + 4);
    ctx.lineTo(x + 16, y + 12); ctx.lineTo(x + 6, y + 12);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = on ? g.core : '#1a1a1a';
    ctx.fillRect(x + 6, y + 12, 10, 2);
    if (on) {
      ctx.fillStyle = g.halo;
      ctx.fillRect(x - 4, y + 8, 32, 12);
    }
  }
};

if (typeof module !== 'undefined') module.exports = LAMPS;
