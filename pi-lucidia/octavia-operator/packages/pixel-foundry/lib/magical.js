// PIXEL FOUNDRY — MAGICAL (with axes)
// crystal, potion, rune, portal, spellbook, wand, scroll, candle, cauldron, pentagram

const MAGICAL = {
  AXES: {
    crystal:   { color: ['pink','amber','violet','blue','white','black'], size: ['s','m','l'] },
    potion:    { color: ['pink','amber','violet','blue','white'], shape: ['round','tall','squat'] },
    rune:      { symbol: ['fehu','uruz','thurisaz','ansuz','raidho','kenaz','gebo','wunjo'], glow: ['off','on'] },
    portal:    { color: ['pink','amber','violet','blue','white'], state: ['idle','active'] },
    spellbook: { color: ['pink','amber','violet','blue','black'] },
    wand:      { color: ['pink','amber','violet','blue','white'] },
    candle:    { color: ['pink','amber','violet','blue','white'], lit: ['lit','unlit'] },
    cauldron:  { contents: ['empty','brewing','glowing'] }
  },

  _glow: {
    pink:   { core: '#FF1D6C', halo: 'rgba(255,29,108,0.4)',  dark: '#7a0a28' },
    amber:  { core: '#F5A623', halo: 'rgba(245,166,35,0.4)',  dark: '#5a3a0a' },
    violet: { core: '#9C27B0', halo: 'rgba(156,39,176,0.4)',  dark: '#3a0a4a' },
    blue:   { core: '#2979FF', halo: 'rgba(41,121,255,0.4)',  dark: '#0a1f5a' },
    white:  { core: '#ffffff', halo: 'rgba(255,255,255,0.4)', dark: '#888' },
    black:  { core: '#1a1a1a', halo: 'rgba(60,60,60,0.4)',    dark: '#000' }
  },

  // CRYSTAL (24x40)
  crystal(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'violet'];
    const sz = { s: 0.7, m: 1, l: 1.3 }[opts.size || 'm'];
    const cx = x + 12, by = y + 36;
    const w = 8 * sz, h = 28 * sz;
    const pulse = 0.7 + Math.sin(time / 10) * 0.2;
    // Halo
    ctx.fillStyle = c.halo;
    ctx.globalAlpha = pulse;
    ctx.beginPath(); ctx.arc(cx, by - h / 2, w + 6, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Crystal — pointy hex
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(cx, by - h);
    ctx.lineTo(cx + w, by - h * 0.7);
    ctx.lineTo(cx + w, by);
    ctx.lineTo(cx - w, by);
    ctx.lineTo(cx - w, by - h * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.core;
    ctx.beginPath();
    ctx.moveTo(cx, by - h + 2);
    ctx.lineTo(cx + w - 1, by - h * 0.7 + 1);
    ctx.lineTo(cx + w - 1, by - 1);
    ctx.lineTo(cx - w + 1, by - 1);
    ctx.lineTo(cx - w + 1, by - h * 0.7 + 1);
    ctx.closePath(); ctx.fill();
    // Facets
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(cx, by - h + 2);
    ctx.lineTo(cx, by);
    ctx.lineTo(cx - w + 1, by - h * 0.6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(cx - 1, by - h + 4, 2, 4);
    // Sparkle
    if (Math.floor(time / 12) % 4 === 0) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx + w - 2, by - h * 0.5, 1, 3);
      ctx.fillRect(cx + w - 3, by - h * 0.5 + 1, 3, 1);
    }
  },

  // POTION (24x36)
  potion(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'pink'];
    const shape = opts.shape || 'round';
    const wob = Math.sin(time / 12) * 0.5;
    // Cork
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 9, y, 6, 4);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 10, y, 4, 3);
    // Neck
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.fillRect(x + 9, y + 4, 6, 6);
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 9, y + 4, 6, 6);
    // Body
    if (shape === 'round') {
      ctx.fillStyle = 'rgba(220,234,242,0.4)';
      ctx.beginPath(); ctx.arc(x + 12, y + 22, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a5a60';
      ctx.beginPath(); ctx.arc(x + 12, y + 22, 10, 0, Math.PI * 2); ctx.stroke();
      // Liquid
      ctx.save();
      ctx.beginPath(); ctx.arc(x + 12, y + 22, 9, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = c.core;
      ctx.fillRect(x + 2, y + 16 + wob, 20, 16);
      ctx.fillStyle = c.halo;
      ctx.fillRect(x + 2, y + 16 + wob, 20, 2);
      ctx.restore();
    } else if (shape === 'tall') {
      ctx.fillStyle = 'rgba(220,234,242,0.4)';
      ctx.fillRect(x + 7, y + 10, 10, 22);
      ctx.strokeRect(x + 7, y + 10, 10, 22);
      ctx.save();
      ctx.beginPath(); ctx.rect(x + 8, y + 11, 8, 20); ctx.clip();
      ctx.fillStyle = c.core;
      ctx.fillRect(x + 8, y + 14 + wob, 8, 18);
      ctx.fillStyle = c.halo;
      ctx.fillRect(x + 8, y + 14 + wob, 8, 1);
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(220,234,242,0.4)';
      ctx.fillRect(x + 4, y + 18, 16, 14);
      ctx.strokeRect(x + 4, y + 18, 16, 14);
      ctx.save();
      ctx.beginPath(); ctx.rect(x + 5, y + 19, 14, 12); ctx.clip();
      ctx.fillStyle = c.core;
      ctx.fillRect(x + 5, y + 22 + wob, 14, 12);
      ctx.fillStyle = c.halo;
      ctx.fillRect(x + 5, y + 22 + wob, 14, 1);
      ctx.restore();
    }
    ctx.lineWidth = 1;
    // Bubbles
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    [10, 14, 12].forEach((bx, i) => {
      ctx.fillRect(x + bx, y + 24 - ((time / 4 + i * 8) % 12), 1, 1);
    });
  },

  // RUNE (28x32)
  rune(ctx, x, y, opts = {}, time = 0) {
    const sym = opts.symbol || 'fehu';
    const on = (opts.glow || 'on') === 'on';
    const flicker = on ? 0.7 + Math.sin(time / 8) * 0.2 : 0.4;
    // Stone
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 2, y + 2, 24, 28);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 3, y + 3, 22, 26);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 4, y + 4, 20, 1);
    // Glyph
    ctx.fillStyle = on ? '#F5A623' : '#1a1a1a';
    ctx.globalAlpha = flicker;
    const cx = x + 14;
    if (sym === 'fehu') {
      ctx.fillRect(cx - 4, y + 8, 2, 16);
      ctx.fillRect(cx - 4, y + 8, 7, 2);
      ctx.fillRect(cx - 4, y + 14, 6, 2);
    } else if (sym === 'uruz') {
      ctx.fillRect(cx - 4, y + 8, 2, 16);
      ctx.fillRect(cx + 2, y + 10, 2, 14);
      ctx.fillRect(cx - 4, y + 8, 8, 2);
    } else if (sym === 'thurisaz') {
      ctx.fillRect(cx - 1, y + 8, 2, 16);
      ctx.fillRect(cx + 1, y + 10, 4, 2);
      ctx.fillRect(cx + 3, y + 12, 2, 4);
      ctx.fillRect(cx + 1, y + 16, 4, 2);
    } else if (sym === 'ansuz') {
      ctx.fillRect(cx - 4, y + 8, 2, 16);
      ctx.fillRect(cx - 2, y + 10, 6, 2);
      ctx.fillRect(cx - 2, y + 14, 4, 2);
    } else if (sym === 'raidho') {
      ctx.fillRect(cx - 4, y + 8, 2, 16);
      ctx.fillRect(cx - 2, y + 8, 4, 2);
      ctx.fillRect(cx + 2, y + 10, 2, 4);
      ctx.fillRect(cx - 2, y + 14, 4, 2);
      ctx.fillRect(cx, y + 16, 2, 2);
      ctx.fillRect(cx + 2, y + 18, 2, 6);
    } else if (sym === 'kenaz') {
      ctx.fillRect(cx + 2, y + 8, 2, 8);
      ctx.fillRect(cx, y + 12, 2, 2);
      ctx.fillRect(cx - 2, y + 14, 2, 2);
      ctx.fillRect(cx - 4, y + 16, 2, 8);
    } else if (sym === 'gebo') {
      for (let i = 0; i < 16; i++) {
        ctx.fillRect(cx - 4 + i / 2, y + 8 + i, 1, 1);
        ctx.fillRect(cx + 4 - i / 2, y + 8 + i, 1, 1);
      }
    } else { // wunjo
      ctx.fillRect(cx - 4, y + 8, 2, 16);
      ctx.fillRect(cx - 2, y + 8, 4, 2);
      ctx.fillRect(cx + 2, y + 10, 2, 4);
      ctx.fillRect(cx - 2, y + 14, 4, 2);
    }
    ctx.globalAlpha = 1;
    // Glow
    if (on) {
      ctx.fillStyle = `rgba(245,166,35,${0.2 * flicker})`;
      ctx.fillRect(x, y, 28, 32);
    }
  },

  // PORTAL (44x52)
  portal(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'violet'];
    const active = (opts.state || 'active') === 'active';
    const pulse = 0.7 + Math.sin(time / 6) * 0.3;
    // Frame stones
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 26, 22, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 26, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner void / energy
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 26, 18, 22, 0, 0, Math.PI * 2);
    ctx.clip();
    if (active) {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 44, 52);
      // Swirling rings
      for (let r = 18; r > 4; r -= 3) {
        const off = (time / 8 + r) % (Math.PI * 2);
        ctx.fillStyle = `rgba(${parseInt(c.core.slice(1, 3), 16)},${parseInt(c.core.slice(3, 5), 16)},${parseInt(c.core.slice(5, 7), 16)},${0.3 + (r / 22) * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(x + 22 + Math.cos(off) * (18 - r), y + 26 + Math.sin(off) * (22 - r) * 0.3, r, r * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Core
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = pulse;
      ctx.beginPath(); ctx.arc(x + 22, y + 26, 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(x, y, 44, 52);
      ctx.fillStyle = '#1a1a1d';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 12 + i * 4, y + 18 + (i % 2) * 8, 2, 2);
      }
    }
    ctx.restore();
    // Outer halo
    if (active) {
      ctx.fillStyle = c.halo;
      ctx.globalAlpha = 0.5 * pulse;
      ctx.beginPath(); ctx.ellipse(x + 22, y + 26, 28, 32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // SPELLBOOK (40x32)
  spellbook(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'violet'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Pages
    ctx.fillStyle = '#e8e0c8';
    ctx.fillRect(x + 4, y + 6, 32, 24);
    ctx.fillStyle = '#d8c898';
    ctx.fillRect(x + 4, y + 28, 32, 2);
    // Cover
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 4, 4, 26);
    ctx.fillRect(x + 36, y + 4, 4, 26);
    ctx.fillStyle = c.core;
    ctx.fillRect(x + 1, y + 5, 2, 24);
    ctx.fillRect(x + 37, y + 5, 2, 24);
    // Spine
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 4, 40, 4);
    ctx.fillRect(x, y + 28, 40, 4);
    ctx.fillStyle = c.core;
    ctx.fillRect(x + 4, y + 5, 32, 2);
    // Open pages with text lines
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 19, y + 6, 2, 24);
    [10, 13, 16, 19, 22, 25].forEach(yy => {
      ctx.fillRect(x + 6, y + yy, 12, 1);
      ctx.fillRect(x + 22, y + yy, 12, 1);
    });
    // Glowing rune mid-page
    const flicker = 0.7 + Math.sin(time / 8) * 0.3;
    ctx.fillStyle = `rgba(245,166,35,${flicker})`;
    ctx.fillRect(x + 11, y + 16, 2, 6);
    ctx.fillRect(x + 9, y + 18, 6, 2);
    ctx.fillStyle = `rgba(255,29,108,${flicker})`;
    ctx.fillRect(x + 26, y + 14, 8, 2);
    ctx.fillRect(x + 28, y + 16, 4, 6);
    // Bookmark
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 30, y + 4, 3, 14);
  },

  // WAND (36x36) — diagonal
  wand(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'pink'];
    // Shaft
    ctx.strokeStyle = '#3a2510';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 2, y + 32); ctx.lineTo(x + 26, y + 8); ctx.stroke();
    ctx.strokeStyle = '#7a5028';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 2, y + 32); ctx.lineTo(x + 26, y + 8); ctx.stroke();
    // Grip
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 28, 6, 6);
    // Tip orb
    const pulse = 0.7 + Math.sin(time / 8) * 0.3;
    ctx.fillStyle = c.halo;
    ctx.globalAlpha = pulse;
    ctx.beginPath(); ctx.arc(x + 28, y + 6, 8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.core;
    ctx.beginPath(); ctx.arc(x + 28, y + 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 28, y + 6, 2, 0, Math.PI * 2); ctx.fill();
    // Sparks
    for (let i = 0; i < 4; i++) {
      const a = (time / 8 + i * Math.PI / 2) % (Math.PI * 2);
      const r = 8 + Math.sin(time / 12 + i) * 2;
      const sx = x + 28 + Math.cos(a) * r;
      const sy = y + 6 + Math.sin(a) * r;
      ctx.fillStyle = c.core;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
  },

  // SCROLL (40x32)
  scroll(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Body
    ctx.fillStyle = '#d8c898';
    ctx.fillRect(x + 4, y + 8, 32, 18);
    ctx.fillStyle = '#e8d8a8';
    ctx.fillRect(x + 4, y + 8, 32, 16);
    // Top/bottom edge
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 4, y + 22, 32, 2);
    // Rolled ends
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x, y + 4, 6, 26);
    ctx.fillRect(x + 34, y + 4, 6, 26);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 1, y + 4, 4, 26);
    ctx.fillRect(x + 35, y + 4, 4, 26);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x, y + 4, 6, 1);
    ctx.fillRect(x, y + 29, 6, 1);
    ctx.fillRect(x + 34, y + 4, 6, 1);
    ctx.fillRect(x + 34, y + 29, 6, 1);
    // Text
    ctx.fillStyle = '#3a2510';
    [11, 14, 17, 20].forEach(yy => ctx.fillRect(x + 8, y + yy, 24, 1));
    ctx.fillRect(x + 8, y + 12, 16, 1);
    // Wax seal
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.arc(x + 20, y + 20, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a0a28';
    ctx.fillRect(x + 18, y + 19, 4, 1);
    ctx.fillRect(x + 19, y + 18, 2, 4);
    // Ribbon
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 26, 12, 4);
  },

  // CANDLE (16x32)
  candle(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'amber'];
    const lit = (opts.lit || 'lit') === 'lit';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 12, 2);
    // Holder
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 2, y + 26, 12, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 3, y + 27, 10, 2);
    // Candle
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 6, y + 12, 4, 14);
    ctx.fillStyle = c.core;
    ctx.fillRect(x + 7, y + 12, 2, 14);
    // Drip
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 5, y + 18, 1, 4);
    // Wick
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 7, y + 10, 2, 3);
    if (lit) {
      const flicker = Math.sin(time / 4) * 0.5;
      // Flame
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 6, y + 4 + flicker, 4, 6);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 7, y + 5 + flicker, 2, 5);
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(x + 7, y + 7 + flicker, 2, 3);
      // Halo
      ctx.fillStyle = 'rgba(245,166,35,0.3)';
      ctx.fillRect(x - 2, y + 2, 20, 14);
    }
  },

  // CAULDRON (40x36)
  cauldron(ctx, x, y, opts = {}, time = 0) {
    const contents = opts.contents || 'brewing';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Legs
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 30, 4, 6);
    ctx.fillRect(x + 30, y + 30, 4, 6);
    // Body
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1d';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 4, y + 22, 32, 1);
    // Rim
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1d';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Liquid + bubbles
    if (contents === 'brewing') {
      ctx.fillStyle = '#3a7a3a';
      ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 13, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a9a4a';
      [12, 18, 26].forEach((bx, i) => {
        const t = (time + i * 30) % 60;
        ctx.beginPath(); ctx.arc(x + bx, y + 14 - t / 12, 1 + (i & 1), 0, Math.PI * 2); ctx.fill();
      });
      // Steam
      if (Math.floor(time / 8) % 2) {
        ctx.fillStyle = 'rgba(180,180,180,0.5)';
        ctx.fillRect(x + 14, y + 6 - (time % 8), 3, 3);
        ctx.fillRect(x + 22, y + 4 - (time % 6), 3, 3);
      }
    } else if (contents === 'glowing') {
      const pulse = 0.7 + Math.sin(time / 6) * 0.3;
      ctx.fillStyle = '#9C27B0';
      ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 13, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,29,108,${pulse})`;
      ctx.beginPath(); ctx.ellipse(x + 20, y + 13, 10, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(245,166,35,${pulse})`;
      ctx.beginPath(); ctx.arc(x + 20, y + 12, 3, 0, Math.PI * 2); ctx.fill();
      // Halo
      ctx.fillStyle = `rgba(156,39,176,${0.4 * pulse})`;
      ctx.fillRect(x + 4, y, 32, 18);
    }
  },

  // PENTAGRAM (40x40)
  pentagram(ctx, x, y, opts = {}, time = 0) {
    const c = this._glow[opts.color || 'pink'];
    const cx = x + 20, cy = y + 20;
    const pulse = 0.7 + Math.sin(time / 10) * 0.3;
    // Halo
    ctx.fillStyle = c.halo;
    ctx.globalAlpha = pulse * 0.5;
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Outer circle
    ctx.strokeStyle = c.core;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();
    // Star (5-point)
    const points = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      points.push([cx + Math.cos(a) * 16, cy + Math.sin(a) * 16]);
    }
    ctx.strokeStyle = c.core;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    [0, 2, 4, 1, 3, 0].forEach(i => {
      const [px, py] = points[i];
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    // Vertex points
    points.forEach(([px, py]) => {
      ctx.fillStyle = c.core;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.lineWidth = 1;
  }
};

if (typeof module !== 'undefined') module.exports = MAGICAL;
