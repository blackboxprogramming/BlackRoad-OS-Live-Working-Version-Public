// BLACKROAD OS - BEDROOM
// Bed, dresser, nightstand, lamp, mirror

const BEDROOM = {
  palette: {
    wood:    { light: '#daa86a', mid: '#c4935a', dark: '#a67c3d', edge: '#7a5a28' },
    sheet:   { white: '#f5f5f5', pink: '#ff5a90', blue: '#5a9fff', amber: '#ffc46b', violet: '#c34dd6' },
    metal:   { light: '#c0c0c0', mid: '#a0a0a0', dark: '#707070' }
  },

  // Bed (72x52) — top-down-ish
  bed: function(ctx, x, y, sheetColor) {
    const w = this.palette.wood;
    const s = this.palette.sheet[sheetColor] || this.palette.sheet.white;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 50, 70, 4);
    // Frame
    ctx.fillStyle = w.dark;
    ctx.fillRect(x, y + 4, 72, 48);
    ctx.fillStyle = w.mid;
    ctx.fillRect(x + 2, y + 6, 68, 44);
    // Headboard
    ctx.fillStyle = w.light;
    ctx.fillRect(x, y, 72, 8);
    ctx.fillStyle = w.dark;
    ctx.fillRect(x + 4, y + 2, 64, 4);
    // Mattress / sheet
    ctx.fillStyle = s;
    ctx.fillRect(x + 4, y + 10, 64, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 6, y + 12, 60, 3);
    // Pillows
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 12, 22, 10);
    ctx.fillRect(x + 42, y + 12, 22, 10);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(x + 10, y + 14, 18, 6);
    ctx.fillRect(x + 44, y + 14, 18, 6);
    // Blanket fold
    ctx.fillStyle = w.edge;
    ctx.fillRect(x + 4, y + 38, 64, 2);
    ctx.fillStyle = s;
    ctx.fillRect(x + 4, y + 40, 64, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 4, y + 40, 64, 1);
  },

  // Dresser (52x44)
  dresser: function(ctx, x, y) {
    const w = this.palette.wood;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 42, 50, 4);
    ctx.fillStyle = w.dark;
    ctx.fillRect(x, y, 52, 44);
    ctx.fillStyle = w.mid;
    ctx.fillRect(x + 2, y + 2, 48, 40);
    // Drawers
    [0, 14, 28].forEach(dy => {
      ctx.fillStyle = w.edge;
      ctx.fillRect(x + 4, y + 4 + dy, 44, 12);
      ctx.fillStyle = w.light;
      ctx.fillRect(x + 5, y + 5 + dy, 42, 10);
      ctx.fillStyle = w.mid;
      ctx.fillRect(x + 6, y + 6 + dy, 40, 8);
      // Knobs
      ctx.fillStyle = this.palette.metal.dark;
      ctx.fillRect(x + 14, y + 9 + dy, 3, 2);
      ctx.fillRect(x + 36, y + 9 + dy, 3, 2);
    });
    // Top
    ctx.fillStyle = w.light;
    ctx.fillRect(x, y, 52, 2);
  },

  // Nightstand (28x32)
  nightstand: function(ctx, x, y) {
    const w = this.palette.wood;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 26, 4);
    ctx.fillStyle = w.dark;
    ctx.fillRect(x, y, 28, 32);
    ctx.fillStyle = w.mid;
    ctx.fillRect(x + 2, y + 2, 24, 28);
    ctx.fillStyle = w.light;
    ctx.fillRect(x, y, 28, 2);
    // Drawer
    ctx.fillStyle = w.edge;
    ctx.fillRect(x + 4, y + 6, 20, 8);
    ctx.fillStyle = w.light;
    ctx.fillRect(x + 5, y + 7, 18, 6);
    ctx.fillStyle = this.palette.metal.dark;
    ctx.fillRect(x + 13, y + 9, 3, 2);
    // Cabinet
    ctx.fillStyle = w.edge;
    ctx.fillRect(x + 4, y + 16, 20, 12);
    ctx.fillStyle = w.light;
    ctx.fillRect(x + 5, y + 17, 18, 10);
  },

  // Table lamp (20x36)
  tableLamp: function(ctx, x, y, time) {
    // Base
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 34, 16, 4);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 4, y + 28, 12, 8);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + 6, y + 30, 8, 4);
    // Pole
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 9, y + 14, 2, 14);
    // Shade (warm glow)
    const flicker = Math.sin(time / 8) * 0.1 + 0.9;
    ctx.fillStyle = `rgba(245,166,35,${0.3 * flicker})`;
    ctx.fillRect(x - 2, y + 4, 24, 14);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x, y + 2, 20, 12);
    ctx.fillStyle = '#ffc46b';
    ctx.fillRect(x + 2, y + 4, 16, 8);
    ctx.fillStyle = `rgba(255,255,255,${0.5 * flicker})`;
    ctx.fillRect(x + 6, y + 6, 8, 4);
  },

  // Mirror (28x40)
  mirror: function(ctx, x, y) {
    const w = this.palette.wood;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 38, 26, 4);
    // Frame
    ctx.fillStyle = w.dark;
    ctx.fillRect(x, y, 28, 40);
    ctx.fillStyle = w.light;
    ctx.fillRect(x + 1, y + 1, 26, 38);
    // Glass
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 4, y + 4, 20, 32);
    ctx.fillStyle = '#dceaf2';
    ctx.fillRect(x + 5, y + 5, 18, 30);
    // Reflection streaks
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x + 7, y + 8, 2, 12);
    ctx.fillRect(x + 9, y + 9, 1, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 17, y + 20, 1, 10);
  },

  // Rug (64x40)
  rug: function(ctx, x, y, color) {
    const c = this.palette.sheet[color] || this.palette.sheet.violet;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + 2, y + 2, 60, 36);
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 64, 40);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 2, 60, 36);
    ctx.fillStyle = c;
    ctx.fillRect(x + 4, y + 4, 56, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 6; i < 60; i += 8) ctx.fillRect(x + i, y + 8, 4, 1);
    for (let i = 6; i < 60; i += 8) ctx.fillRect(x + i + 4, y + 32, 4, 1);
    // Tassels
    ctx.fillStyle = '#3a2a1a';
    for (let i = 2; i < 64; i += 4) {
      ctx.fillRect(x + i, y - 2, 1, 2);
      ctx.fillRect(x + i, y + 40, 1, 2);
    }
  }
};

if (typeof module !== 'undefined') module.exports = BEDROOM;
