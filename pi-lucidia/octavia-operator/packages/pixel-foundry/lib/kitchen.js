// BLACKROAD OS - KITCHEN APPLIANCES
// Fridge, stove, sink, microwave, coffeeMaker

const KITCHEN = {
  palette: {
    steel:   { light: '#d0d4d8', mid: '#a8acb0', dark: '#787c80', edge: '#48494c' },
    white:   { light: '#f5f5f5', mid: '#e0e0e0', dark: '#b8b8b8', edge: '#888' },
    black:   { light: '#3a3a3a', mid: '#2a2a2a', dark: '#1a1a1a', edge: '#0a0a0a' },
    glow:    { red: '#ff3333', orange: '#ff9933', amber: '#F5A623' }
  },

  // Fridge (40x80)
  fridge: function(ctx, x, y, finish) {
    const p = this.palette[finish || 'steel'];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 3, y + 78, 38, 4);
    // Body
    ctx.fillStyle = p.dark;
    ctx.fillRect(x, y, 40, 80);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 2, y + 2, 36, 76);
    ctx.fillStyle = p.light;
    ctx.fillRect(x + 4, y + 4, 32, 4);
    // Freezer door split
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 2, y + 26, 36, 2);
    // Handles
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 32, y + 8, 3, 14);
    ctx.fillRect(x + 32, y + 32, 3, 38);
    // Display
    ctx.fillStyle = '#0a1f2a';
    ctx.fillRect(x + 6, y + 8, 14, 6);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 8, y + 10, 2, 2);
    ctx.fillRect(x + 12, y + 10, 6, 2);
  },

  // Stove (44x44)
  stove: function(ctx, x, y, time) {
    const p = this.palette.black;
    const s = this.palette.steel;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 42, 42, 4);
    // Body
    ctx.fillStyle = p.dark;
    ctx.fillRect(x, y, 44, 44);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 2, y + 2, 40, 40);
    // Burners
    const burnerY = y + 8;
    [[8, 0], [26, 0], [8, 16], [26, 16]].forEach(([bx, by], i) => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(x + bx, burnerY + by, 10, 10);
      ctx.fillStyle = i === 0 && Math.floor(time / 8) % 2 ? this.palette.glow.red : '#1a1a1a';
      ctx.fillRect(x + bx + 1, burnerY + by + 1, 8, 8);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(x + bx + 4, burnerY + by + 4, 2, 2);
    });
    // Knobs
    ctx.fillStyle = s.mid;
    [4, 14, 24, 34].forEach(kx => {
      ctx.fillRect(x + kx, y + 38, 4, 4);
      ctx.fillStyle = s.dark;
      ctx.fillRect(x + kx + 1, y + 39, 2, 2);
      ctx.fillStyle = s.mid;
    });
  },

  // Microwave (52x32)
  microwave: function(ctx, x, y, time) {
    const p = this.palette.steel;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 30, 50, 4);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x, y, 52, 32);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 2, y + 2, 48, 28);
    // Window
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 4, y + 4, 32, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(x + 6, y + 6, 28, 20);
    // Plate (rotating dot)
    const rot = Math.floor(time / 4) % 4;
    const dotX = [16, 24, 22, 12][rot];
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + dotX, y + 18, 4, 2);
    // Panel
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 38, y + 4, 12, 24);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 39, y + 6, 10, 6);
    ctx.fillStyle = Math.floor(time / 30) % 2 ? '#FF1D6C' : '#2a2a2a';
    ctx.fillRect(x + 41, y + 8, 2, 2);
    ctx.fillRect(x + 45, y + 8, 2, 2);
  },

  // Sink (56x36)
  sink: function(ctx, x, y) {
    const p = this.palette.steel;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 54, 4);
    // Counter
    ctx.fillStyle = '#e8e4dc';
    ctx.fillRect(x, y + 12, 56, 24);
    ctx.fillStyle = '#c8c4bc';
    ctx.fillRect(x, y + 32, 56, 4);
    // Basin
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 6, y + 16, 44, 18);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 8, y + 18, 40, 14);
    ctx.fillStyle = p.light;
    ctx.fillRect(x + 10, y + 19, 8, 2);
    // Drain
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 26, y + 24, 4, 4);
    // Faucet
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 26, y + 2, 4, 12);
    ctx.fillRect(x + 22, y + 2, 12, 3);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 27, y + 4, 2, 8);
  },

  // Coffee maker (28x44)
  coffeeMaker: function(ctx, x, y, time) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 42, 26, 4);
    // Body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, 28, 44);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 2, y + 2, 24, 40);
    // Pot
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 4, y + 24, 20, 16);
    ctx.fillStyle = '#3a1a08';
    ctx.fillRect(x + 6, y + 28, 16, 10);
    // Steam
    if (Math.floor(time / 6) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 10, y + 18 - (time % 8), 2, 2);
      ctx.fillRect(x + 16, y + 16 - (time % 6), 2, 2);
    }
    // Indicator
    ctx.fillStyle = Math.floor(time / 30) % 2 ? '#FF1D6C' : '#3a0a14';
    ctx.fillRect(x + 22, y + 8, 2, 2);
  },

  // Toaster (32x20)
  toaster: function(ctx, x, y, time) {
    const p = this.palette.steel;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 18, 30, 4);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x, y + 4, 32, 16);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 2, y + 6, 28, 12);
    ctx.fillStyle = p.light;
    ctx.fillRect(x + 4, y + 7, 24, 1);
    // Slots
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + 6, y + 10, 8, 4);
    ctx.fillRect(x + 18, y + 10, 8, 4);
    ctx.fillStyle = Math.floor(time / 6) % 2 ? this.palette.glow.orange : '#3a1a0a';
    ctx.fillRect(x + 7, y + 12, 6, 1);
    ctx.fillRect(x + 19, y + 12, 6, 1);
    // Lever
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 28, y + 8, 2, 6);
  }
};

if (typeof module !== 'undefined') module.exports = KITCHEN;
