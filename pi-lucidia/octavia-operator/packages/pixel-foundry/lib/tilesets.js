// PIXEL FOUNDRY — TILE SETS (with axes)
// Pure pattern multipliers: checker, stripe, dot, diamond, brick, wave, herringbone, hex

const TILESETS = {
  AXES: {
    checker:     { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] },
    stripe:      { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'], direction: ['horizontal','vertical','diagonal'] },
    dot:         { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] },
    diamond:     { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] },
    brick:       { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] },
    wave:        { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] },
    herringbone: { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] },
    hex:         { color: ['pink','amber','violet','blue','white','black','wood','stone'], accent: ['white','black','amber','pink'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    stone:  { main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8' }
  },
  _acc: {
    white: '#ffffff', black: '#1a1a1a', amber: '#F5A623', pink: '#FF1D6C'
  },

  // 64x64 base — all patterns

  // CHECKER
  checker(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const a = this._acc[opts.accent || 'white'];
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 64, 64);
    for (let yy = 0; yy < 64; yy += 16) for (let xx = 0; xx < 64; xx += 16) {
      const odd = ((xx + yy) / 16) & 1;
      ctx.fillStyle = odd ? a : c.main;
      ctx.fillRect(x + xx + 1, y + yy + 1, 14, 14);
      ctx.fillStyle = odd ? 'rgba(0,0,0,0.15)' : c.light;
      ctx.fillRect(x + xx + 1, y + yy + 1, 14, 1);
    }
  },

  // STRIPE
  stripe(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const a = this._acc[opts.accent || 'white'];
    const dir = opts.direction || 'horizontal';
    ctx.fillStyle = c.main;
    ctx.fillRect(x, y, 64, 64);
    if (dir === 'horizontal') {
      for (let yy = 0; yy < 64; yy += 8) {
        ctx.fillStyle = (yy / 8) & 1 ? a : c.main;
        ctx.fillRect(x, y + yy, 64, 4);
      }
    } else if (dir === 'vertical') {
      for (let xx = 0; xx < 64; xx += 8) {
        ctx.fillStyle = (xx / 8) & 1 ? a : c.main;
        ctx.fillRect(x + xx, y, 4, 64);
      }
    } else { // diagonal
      ctx.fillStyle = a;
      for (let i = -64; i < 128; i += 8) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + 4, y);
        ctx.lineTo(x + i + 4 + 64, y + 64);
        ctx.lineTo(x + i + 64, y + 64);
        ctx.closePath();
        ctx.fill();
      }
    }
  },

  // DOT
  dot(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'violet'];
    const a = this._acc[opts.accent || 'amber'];
    ctx.fillStyle = c.main;
    ctx.fillRect(x, y, 64, 64);
    ctx.fillStyle = c.dark;
    for (let yy = 8; yy < 64; yy += 16) for (let xx = 8; xx < 64; xx += 16) {
      ctx.beginPath(); ctx.arc(x + xx, y + yy, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = a;
    for (let yy = 8; yy < 64; yy += 16) for (let xx = 8; xx < 64; xx += 16) {
      ctx.beginPath(); ctx.arc(x + xx, y + yy, 3, 0, Math.PI * 2); ctx.fill();
    }
    // Smaller offset dots
    ctx.fillStyle = c.light;
    for (let yy = 0; yy < 64; yy += 16) for (let xx = 0; xx < 64; xx += 16) {
      ctx.fillRect(x + xx, y + yy, 1, 1);
    }
  },

  // DIAMOND
  diamond(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'blue'];
    const a = this._acc[opts.accent || 'white'];
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 64, 64);
    for (let yy = 0; yy < 64; yy += 16) for (let xx = 0; xx < 64; xx += 16) {
      const odd = ((xx + yy) / 16) & 1;
      ctx.fillStyle = odd ? a : c.main;
      ctx.beginPath();
      ctx.moveTo(x + xx + 8, y + yy);
      ctx.lineTo(x + xx + 16, y + yy + 8);
      ctx.lineTo(x + xx + 8, y + yy + 16);
      ctx.lineTo(x + xx, y + yy + 8);
      ctx.closePath();
      ctx.fill();
    }
    // Center dots
    ctx.fillStyle = c.light;
    for (let yy = 8; yy < 64; yy += 16) for (let xx = 8; xx < 64; xx += 16) {
      ctx.fillRect(x + xx, y + yy, 1, 1);
    }
  },

  // BRICK
  brick(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const a = this._acc[opts.accent || 'black'];
    ctx.fillStyle = a;
    ctx.fillRect(x, y, 64, 64);
    for (let yy = 0; yy < 64; yy += 8) {
      const offset = (yy / 8) & 1 ? 8 : 0;
      for (let xx = -offset; xx < 64; xx += 16) {
        ctx.fillStyle = c.main;
        ctx.fillRect(x + xx + 1, y + yy + 1, 14, 6);
        ctx.fillStyle = c.light;
        ctx.fillRect(x + xx + 1, y + yy + 1, 14, 1);
        ctx.fillStyle = c.dark;
        ctx.fillRect(x + xx + 1, y + yy + 6, 14, 1);
      }
    }
  },

  // WAVE
  wave(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'blue'];
    const a = this._acc[opts.accent || 'white'];
    ctx.fillStyle = c.main;
    ctx.fillRect(x, y, 64, 64);
    // Layered waves
    for (let layer = 0; layer < 4; layer++) {
      const yBase = 8 + layer * 16;
      ctx.fillStyle = layer % 2 ? a : c.dark;
      ctx.beginPath();
      ctx.moveTo(x, y + yBase + 8);
      for (let xx = 0; xx <= 64; xx += 4) {
        const wy = y + yBase + Math.sin(xx / 6) * 4;
        ctx.lineTo(x + xx, wy);
      }
      ctx.lineTo(x + 64, y + yBase + 8);
      ctx.closePath();
      ctx.fill();
    }
  },

  // HERRINGBONE
  herringbone(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const a = this._acc[opts.accent || 'black'];
    ctx.fillStyle = a;
    ctx.fillRect(x, y, 64, 64);
    // Rows of L-shapes
    for (let yy = 0; yy < 64; yy += 8) {
      for (let xx = ((yy / 8) & 1) ? -4 : 0; xx < 64; xx += 16) {
        // Horizontal piece
        ctx.fillStyle = c.main;
        ctx.fillRect(x + xx + 1, y + yy + 1, 7, 3);
        ctx.fillStyle = c.light;
        ctx.fillRect(x + xx + 1, y + yy + 1, 7, 1);
        ctx.fillStyle = c.dark;
        ctx.fillRect(x + xx + 1, y + yy + 3, 7, 1);
        // Vertical piece
        ctx.fillStyle = c.main;
        ctx.fillRect(x + xx + 9, y + yy + 1, 3, 7);
        ctx.fillStyle = c.light;
        ctx.fillRect(x + xx + 9, y + yy + 1, 1, 7);
        ctx.fillStyle = c.dark;
        ctx.fillRect(x + xx + 11, y + yy + 1, 1, 7);
      }
    }
  },

  // HEX
  hex(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const a = this._acc[opts.accent || 'white'];
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 64, 64);
    const drawHex = (cx, cy, r, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const hx = cx + Math.cos(ang) * r;
        const hy = cy + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
    };
    const r = 8, sx = r * Math.sqrt(3);
    for (let row = -1; row < 6; row++) {
      const yy = y + 8 + row * (r * 1.5);
      const offset = (row & 1) ? sx / 2 : 0;
      for (let col = -1; col < 6; col++) {
        const cx = x + offset + col * sx;
        const fillC = ((row + col) & 1) ? c.main : a;
        drawHex(cx, yy, r - 0.5, fillC);
        // Highlight
        ctx.fillStyle = ((row + col) & 1) ? c.light : 'rgba(0,0,0,0.15)';
        ctx.fillRect(cx - 2, yy - r + 1, 4, 1);
      }
    }
  }
};

if (typeof module !== 'undefined') module.exports = TILESETS;
