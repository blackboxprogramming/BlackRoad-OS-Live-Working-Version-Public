// BLACKROAD OS - VEHICLES
// Car, bike, scooter, motorcycle

const VEHICLES = {
  palette: {
    body: {
      pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
      blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
      amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
      violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
      black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
      white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' }
    },
    glass: '#7accea',
    glassDark: '#4a7a9a',
    tire: '#1a1a1a',
    rim: '#a0a0a0',
    chrome: '#d0d0d0'
  },

  // Car (72x32) — side view
  car: function(ctx, x, y, color) {
    const c = this.palette.body[color] || this.palette.body.pink;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 30, 64, 4);
    // Body
    ctx.fillStyle = c.main;
    ctx.fillRect(x, y + 12, 72, 16);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 22, 72, 6);
    // Roof
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 14, y + 4, 44, 10);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 14, y + 12, 44, 2);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 16, y + 4, 40, 2);
    // Windows
    ctx.fillStyle = this.palette.glassDark;
    ctx.fillRect(x + 16, y + 6, 18, 7);
    ctx.fillRect(x + 38, y + 6, 18, 7);
    ctx.fillStyle = this.palette.glass;
    ctx.fillRect(x + 17, y + 7, 16, 5);
    ctx.fillRect(x + 39, y + 7, 16, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 19, y + 8, 6, 2);
    ctx.fillRect(x + 41, y + 8, 6, 2);
    // Door line
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 36, y + 12, 1, 14);
    // Headlight / taillight
    ctx.fillStyle = '#fff8d0';
    ctx.fillRect(x + 68, y + 16, 4, 4);
    ctx.fillStyle = '#ff3030';
    ctx.fillRect(x, y + 16, 4, 4);
    // Wheels
    ctx.fillStyle = this.palette.tire;
    ctx.fillRect(x + 8, y + 22, 12, 8);
    ctx.fillRect(x + 52, y + 22, 12, 8);
    ctx.fillStyle = this.palette.rim;
    ctx.fillRect(x + 11, y + 24, 6, 4);
    ctx.fillRect(x + 55, y + 24, 6, 4);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 13, y + 25, 2, 2);
    ctx.fillRect(x + 57, y + 25, 2, 2);
  },

  // Bike (44x36)
  bike: function(ctx, x, y, color) {
    const c = this.palette.body[color] || this.palette.body.blue;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 34, 36, 3);
    // Wheels
    ctx.fillStyle = this.palette.tire;
    ctx.fillRect(x, y + 18, 14, 14);
    ctx.fillRect(x + 30, y + 18, 14, 14);
    ctx.fillStyle = this.palette.rim;
    ctx.fillRect(x + 3, y + 21, 8, 8);
    ctx.fillRect(x + 33, y + 21, 8, 8);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 6, y + 24, 2, 2);
    ctx.fillRect(x + 36, y + 24, 2, 2);
    // Spokes hint
    ctx.fillStyle = this.palette.chrome;
    ctx.fillRect(x + 6, y + 22, 2, 6);
    ctx.fillRect(x + 36, y + 22, 2, 6);
    // Frame triangle
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 7, y + 14, 28, 3);
    ctx.fillRect(x + 18, y + 8, 3, 16);
    ctx.fillRect(x + 30, y + 8, 3, 16);
    // Seat
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 14, y + 8, 8, 3);
    // Handlebars
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 32, y + 4, 8, 2);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 33, y + 6, 2, 4);
    // Pedals
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 19, y + 24, 5, 2);
  },

  // Scooter (32x36)
  scooter: function(ctx, x, y, color) {
    const c = this.palette.body[color] || this.palette.body.amber;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 28, 3);
    // Wheels
    ctx.fillStyle = this.palette.tire;
    ctx.fillRect(x, y + 28, 8, 6);
    ctx.fillRect(x + 24, y + 28, 8, 6);
    ctx.fillStyle = this.palette.rim;
    ctx.fillRect(x + 2, y + 30, 4, 2);
    ctx.fillRect(x + 26, y + 30, 4, 2);
    // Deck
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 24, 24, 4);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 4, y + 25, 24, 2);
    // Stem
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 22, y + 4, 4, 22);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 23, y + 6, 2, 18);
    // Handlebars
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 16, y + 2, 14, 2);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 18, y + 4, 2, 2);
    ctx.fillRect(x + 26, y + 4, 2, 2);
  },

  // Motorcycle (56x32)
  motorcycle: function(ctx, x, y, color, time) {
    const c = this.palette.body[color] || this.palette.body.violet;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 52, 4);
    // Wheels
    const spin = Math.floor(time / 4) % 2;
    ctx.fillStyle = this.palette.tire;
    ctx.fillRect(x, y + 16, 16, 16);
    ctx.fillRect(x + 40, y + 16, 16, 16);
    ctx.fillStyle = this.palette.rim;
    ctx.fillRect(x + 4, y + 20, 8, 8);
    ctx.fillRect(x + 44, y + 20, 8, 8);
    ctx.fillStyle = spin ? '#3a3a3a' : '#5a5a5a';
    ctx.fillRect(x + 7, y + 23, 2, 2);
    ctx.fillRect(x + 47, y + 23, 2, 2);
    // Frame / tank
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 14, y + 12, 30, 10);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 14, y + 18, 30, 4);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 16, y + 13, 26, 2);
    // Seat
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 28, y + 10, 16, 4);
    // Handlebar
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 12, y + 6, 6, 8);
    ctx.fillRect(x + 8, y + 6, 12, 2);
    // Headlight
    ctx.fillStyle = '#fff8d0';
    ctx.fillRect(x + 8, y + 12, 4, 4);
    // Exhaust
    ctx.fillStyle = this.palette.chrome;
    ctx.fillRect(x + 44, y + 22, 12, 3);
  }
};

if (typeof module !== 'undefined') module.exports = VEHICLES;
