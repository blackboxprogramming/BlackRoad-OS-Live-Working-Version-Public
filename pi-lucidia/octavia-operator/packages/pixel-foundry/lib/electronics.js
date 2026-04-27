// BLACKROAD OS - ELECTRONICS
// Tv, monitor, laptop, phone, console, speaker, router

const ELECTRONICS = {
  palette: {
    case:   { dark: '#1a1a1a', mid: '#2a2a2a', light: '#3a3a3a', edge: '#0a0a0a' },
    screen: { off: '#0a0a14', glow: '#1a1a3a' },
    led:    { pink: '#FF1D6C', blue: '#2979FF', amber: '#F5A623', violet: '#9C27B0', green: '#3acc3a', red: '#ff3030' }
  },

  // TV (96x64)
  tv: function(ctx, x, y, time) {
    const p = this.palette.case;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 60, 92, 5);
    // Bezel
    ctx.fillStyle = p.edge;
    ctx.fillRect(x, y, 96, 56);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 2, y + 2, 92, 52);
    // Screen
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 6, y + 6, 84, 44);
    // Animated content (changing bands)
    const phase = Math.floor(time / 12) % 4;
    const colors = [
      ['#FF1D6C', '#9C27B0', '#2979FF'],
      ['#2979FF', '#F5A623', '#FF1D6C'],
      ['#F5A623', '#9C27B0', '#2979FF'],
      ['#9C27B0', '#FF1D6C', '#F5A623']
    ];
    colors[phase].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + 8, y + 8 + i * 14, 80, 12);
    });
    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < 44; i += 2) ctx.fillRect(x + 6, y + 6 + i, 84, 1);
    // Stand
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 40, y + 56, 16, 6);
    ctx.fillRect(x + 32, y + 60, 32, 4);
    // Brand dot
    ctx.fillStyle = this.palette.led.pink;
    ctx.fillRect(x + 46, y + 53, 4, 1);
  },

  // Monitor (64x52)
  monitor: function(ctx, x, y, time) {
    const p = this.palette.case;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 60, 4);
    ctx.fillStyle = p.edge;
    ctx.fillRect(x, y, 64, 44);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 2, y + 2, 60, 40);
    // Screen — terminal
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 4, y + 4, 56, 36);
    ctx.fillStyle = this.palette.led.green;
    ctx.fillRect(x + 6, y + 6, 2, 2);
    // Code lines
    const lines = [40, 24, 32, 16, 36, 22, 28];
    lines.forEach((w, i) => {
      ctx.fillStyle = i === Math.floor(time / 6) % lines.length ? this.palette.led.pink : 'rgba(127,127,255,0.7)';
      ctx.fillRect(x + 10, y + 10 + i * 4, w, 2);
    });
    // Cursor
    if (Math.floor(time / 8) % 2) {
      ctx.fillStyle = this.palette.led.amber;
      ctx.fillRect(x + 10 + lines[lines.length - 1] + 2, y + 10 + (lines.length - 1) * 4, 2, 2);
    }
    // Stand
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 28, y + 44, 8, 6);
    ctx.fillRect(x + 22, y + 48, 20, 4);
    // Power LED
    ctx.fillStyle = this.palette.led.blue;
    ctx.fillRect(x + 30, y + 41, 2, 1);
  },

  // Laptop (52x40)
  laptop: function(ctx, x, y, time) {
    const p = this.palette.case;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 38, 48, 4);
    // Screen
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 4, y, 44, 28);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 5, y + 1, 42, 26);
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 7, y + 3, 38, 22);
    // Screen content
    ctx.fillStyle = this.palette.led.pink;
    ctx.fillRect(x + 9, y + 5, 14, 2);
    ctx.fillStyle = 'rgba(127,127,255,0.6)';
    [0, 4, 8, 12, 16].forEach((dy, i) => {
      ctx.fillRect(x + 9, y + 9 + dy, 24 + (i % 2) * 8, 1);
    });
    // Cursor blink
    if (Math.floor(time / 8) % 2) {
      ctx.fillStyle = this.palette.led.amber;
      ctx.fillRect(x + 35, y + 21, 2, 2);
    }
    // Hinge
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 2, y + 28, 48, 2);
    // Base / keyboard
    ctx.fillStyle = p.dark;
    ctx.fillRect(x, y + 30, 52, 8);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 1, y + 31, 50, 6);
    // Keys hint
    ctx.fillStyle = p.edge;
    for (let kx = 0; kx < 48; kx += 4) {
      ctx.fillRect(x + 3 + kx, y + 32, 2, 1);
      ctx.fillRect(x + 3 + kx, y + 35, 2, 1);
    }
    // Trackpad
    ctx.fillStyle = p.light;
    ctx.fillRect(x + 18, y + 36, 16, 1);
  },

  // Phone (16x32)
  phone: function(ctx, x, y, time) {
    const p = this.palette.case;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 1, y + 30, 14, 3);
    ctx.fillStyle = p.edge;
    ctx.fillRect(x, y, 16, 30);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 1, y + 1, 14, 28);
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 2, y + 4, 12, 22);
    // Notch
    ctx.fillStyle = p.edge;
    ctx.fillRect(x + 6, y + 4, 4, 1);
    // Screen apps
    const colors = ['#FF1D6C', '#2979FF', '#F5A623', '#9C27B0'];
    colors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + 3 + (i % 2) * 6, y + 7 + Math.floor(i / 2) * 6, 4, 4);
    });
    // Notification dot
    if (Math.floor(time / 15) % 2) {
      ctx.fillStyle = this.palette.led.red;
      ctx.fillRect(x + 12, y + 7, 2, 2);
    }
    // Home indicator
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(x + 4, y + 27, 8, 1);
  },

  // Game console (40x28)
  gameConsole: function(ctx, x, y, time) {
    const p = this.palette.case;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 26, 36, 4);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x, y, 40, 28);
    ctx.fillStyle = p.mid;
    ctx.fillRect(x + 2, y + 2, 36, 24);
    // D-pad
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 12, 8, 3);
    ctx.fillRect(x + 9, y + 9, 3, 8);
    // Buttons
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 30, y + 9, 3, 3);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 25, y + 13, 3, 3);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 30, y + 17, 3, 3);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(x + 35, y + 13, 3, 3);
    // Screen
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 16, y + 6, 8, 14);
    ctx.fillStyle = Math.floor(time / 10) % 2 ? this.palette.led.green : '#0a3a0a';
    ctx.fillRect(x + 18, y + 8, 4, 4);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 17, y + 14, 6, 1);
    ctx.fillRect(x + 17, y + 16, 6, 1);
    // Power LED
    ctx.fillStyle = this.palette.led.blue;
    ctx.fillRect(x + 19, y + 22, 2, 1);
  },

  // Speaker (28x52)
  speaker: function(ctx, x, y, time) {
    const p = this.palette.case;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 24, 4);
    ctx.fillStyle = p.edge;
    ctx.fillRect(x, y, 28, 52);
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 1, y + 1, 26, 50);
    // Tweeter
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.arc(x + 14, y + 12, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(x + 14, y + 12, 4, 0, Math.PI * 2); ctx.fill();
    // Woofer
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.arc(x + 14, y + 32, 10, 0, Math.PI * 2); ctx.fill();
    const pulse = Math.sin(time / 4) * 1;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 14, y + 32, 7 + pulse * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(x + 14, y + 32, 3, 0, Math.PI * 2); ctx.fill();
    // LED
    ctx.fillStyle = Math.floor(time / 8) % 4 === 0 ? this.palette.led.pink : this.palette.led.violet;
    ctx.fillRect(x + 13, y + 46, 2, 2);
  }
};

if (typeof module !== 'undefined') module.exports = ELECTRONICS;
