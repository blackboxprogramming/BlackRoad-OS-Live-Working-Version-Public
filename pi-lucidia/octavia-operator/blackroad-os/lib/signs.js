// BLACKROAD OS - SIGNS & SIGNAGE
// Neon, billboard, exit, road sign, banner

const SIGNS = {
  palette: {
    neon: { pink: '#FF1D6C', blue: '#2979FF', amber: '#F5A623', violet: '#9C27B0' },
    metal: { dark: '#3a3a3a', mid: '#5a5a5a', light: '#8a8a8a' }
  },

  // Neon "OPEN" sign (56x28)
  neonOpen: function(ctx, x, y, time) {
    const flicker = Math.sin(time / 4) * 0.1 + 0.9;
    const buzz = Math.floor(time / 60) % 30 < 2 ? 0.4 : 1;
    const a = flicker * buzz;
    // Glow halo
    ctx.fillStyle = `rgba(255,29,108,${0.3 * a})`;
    ctx.fillRect(x - 4, y - 4, 64, 36);
    // Frame
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x, y, 56, 28);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 1, y + 1, 54, 26);
    // Text "OPEN" in pink neon
    ctx.fillStyle = `rgba(255,29,108,${a})`;
    // O
    ctx.fillRect(x + 5, y + 8, 8, 12);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 7, y + 10, 4, 8);
    // P
    ctx.fillStyle = `rgba(255,29,108,${a})`;
    ctx.fillRect(x + 16, y + 8, 7, 12);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 18, y + 10, 3, 4);
    // E
    ctx.fillStyle = `rgba(255,29,108,${a})`;
    ctx.fillRect(x + 26, y + 8, 7, 12);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 28, y + 10, 5, 2);
    ctx.fillRect(x + 28, y + 16, 5, 2);
    // N
    ctx.fillStyle = `rgba(255,29,108,${a})`;
    ctx.fillRect(x + 36, y + 8, 2, 12);
    ctx.fillRect(x + 43, y + 8, 2, 12);
    ctx.fillRect(x + 38, y + 10, 2, 4);
    ctx.fillRect(x + 41, y + 14, 2, 4);
    // Highlight glow
    ctx.fillStyle = `rgba(255,255,255,${0.3 * a})`;
    ctx.fillRect(x + 6, y + 9, 1, 1);
    ctx.fillRect(x + 17, y + 9, 1, 1);
    ctx.fillRect(x + 27, y + 9, 1, 1);
    ctx.fillRect(x + 37, y + 9, 1, 1);
  },

  // BlackRoad logo billboard (88x52)
  billboard: function(ctx, x, y, time) {
    // Posts
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 8, y + 40, 4, 12);
    ctx.fillRect(x + 76, y + 40, 4, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 50, 78, 3);
    // Frame
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, 88, 42);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 2, y + 2, 84, 38);
    // Pink stripe
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 4, 80, 6);
    // Title text "BLACKROAD" white block
    ctx.fillStyle = '#fff';
    [4, 9, 14, 19, 26, 31, 36, 41, 46].forEach((cx, i) => {
      ctx.fillRect(x + 6 + i * 9, y + 14, 6, 14);
    });
    ctx.fillStyle = '#000';
    [4, 9, 14, 19, 26, 31, 36, 41, 46].forEach((cx, i) => {
      ctx.fillRect(x + 7 + i * 9, y + 16, 4, 10);
    });
    // Tagline shimmer
    const shimmer = Math.floor(time / 8) % 3;
    ctx.fillStyle = ['#FF1D6C', '#F5A623', '#2979FF'][shimmer];
    ctx.fillRect(x + 4, y + 32, 80, 4);
    // Lights along top
    for (let i = 4; i < 84; i += 8) {
      ctx.fillStyle = Math.floor((time + i) / 4) % 2 ? '#F5A623' : '#3a2510';
      ctx.fillRect(x + i, y - 2, 4, 4);
    }
  },

  // Exit sign (44x24)
  exit: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 22, 40, 3);
    // Frame
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, 44, 24);
    // Sign face
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 2, y + 2, 40, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 2, y + 2, 40, 4);
    // EXIT letters
    ctx.fillStyle = '#fff';
    // E
    ctx.fillRect(x + 5, y + 8, 6, 10);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 7, y + 10, 4, 2);
    ctx.fillRect(x + 7, y + 14, 4, 2);
    // X
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 13, y + 8, 2, 2);
    ctx.fillRect(x + 19, y + 8, 2, 2);
    ctx.fillRect(x + 15, y + 10, 2, 2);
    ctx.fillRect(x + 17, y + 10, 2, 2);
    ctx.fillRect(x + 16, y + 12, 2, 2);
    ctx.fillRect(x + 15, y + 14, 2, 2);
    ctx.fillRect(x + 17, y + 14, 2, 2);
    ctx.fillRect(x + 13, y + 16, 2, 2);
    ctx.fillRect(x + 19, y + 16, 2, 2);
    // I
    ctx.fillRect(x + 24, y + 8, 4, 10);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 24, y + 10, 4, 1);
    ctx.fillRect(x + 24, y + 15, 4, 1);
    // T
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 30, y + 8, 8, 2);
    ctx.fillRect(x + 33, y + 10, 2, 8);
    // Arrow pointer
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 38, y + 12, 4, 2);
    ctx.fillRect(x + 36, y + 11, 2, 4);
  },

  // Road sign (40x44)
  roadSign: function(ctx, x, y) {
    // Post
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 18, y + 28, 4, 16);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 16, y + 42, 8, 3);
    // Sign — diamond
    ctx.save();
    ctx.translate(x + 20, y + 16);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-14, -14, 28, 28);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(-13, -13, 26, 26);
    ctx.restore();
    // Arrow
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 18, y + 8, 4, 14);
    ctx.fillRect(x + 14, y + 10, 12, 4);
    // Triangle tip
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 12);
    ctx.lineTo(x + 18, y + 6);
    ctx.lineTo(x + 18, y + 18);
    ctx.closePath();
    ctx.fill();
  },

  // Banner / pennant string (88x32)
  banner: function(ctx, x, y, time) {
    // String
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    for (let i = 0; i <= 88; i += 4) {
      const sag = Math.sin((i + time / 4) / 6) * 1.5 + 4;
      ctx.lineTo(x + i, y + sag);
    }
    ctx.stroke();
    // Pennants
    const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF', '#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
    colors.forEach((c, i) => {
      const px = x + 4 + i * 11;
      const sag = Math.sin((px - x + time / 4) / 6) * 1.5 + 4;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(px, y + sag);
      ctx.lineTo(px + 8, y + sag);
      ctx.lineTo(px + 4, y + sag + 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(px + 1, y + sag + 1, 2, 8);
    });
  }
};

if (typeof module !== 'undefined') module.exports = SIGNS;
