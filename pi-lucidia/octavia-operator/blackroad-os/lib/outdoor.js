// BLACKROAD OS - OUTDOOR
// Tree, bush, mailbox, streetlight, bench, fence, fountain, trashcan

const OUTDOOR = {
  palette: {
    leaf:  { dark: '#2a5a2a', mid: '#3a7a3a', light: '#4a9a4a', glow: '#7acc7a' },
    bark:  { dark: '#3a2510', mid: '#5a3a1a', light: '#7a5028' },
    metal: { dark: '#3a3a3a', mid: '#5a5a5a', light: '#8a8a8a', shine: '#c0c0c0' },
    stone: { dark: '#5a5a60', mid: '#7a7a80', light: '#a0a0a8' }
  },

  // Tree (40x64)
  tree: function(ctx, x, y, time) {
    const sway = Math.sin(time / 30) * 1;
    const l = this.palette.leaf;
    const b = this.palette.bark;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 62, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trunk
    ctx.fillStyle = b.dark;
    ctx.fillRect(x + 16, y + 44, 8, 18);
    ctx.fillStyle = b.mid;
    ctx.fillRect(x + 17, y + 44, 5, 18);
    ctx.fillStyle = b.light;
    ctx.fillRect(x + 18, y + 46, 1, 14);
    // Canopy (3 layers)
    ctx.fillStyle = l.dark;
    ctx.fillRect(x + 4 + sway, y + 8, 32, 36);
    ctx.fillRect(x + sway, y + 16, 40, 24);
    ctx.fillStyle = l.mid;
    ctx.fillRect(x + 8 + sway, y + 6, 24, 30);
    ctx.fillRect(x + 4 + sway, y + 14, 32, 18);
    ctx.fillStyle = l.light;
    ctx.fillRect(x + 12 + sway, y + 4, 16, 22);
    ctx.fillRect(x + 10 + sway, y + 10, 8, 8);
    ctx.fillStyle = l.glow;
    ctx.fillRect(x + 16 + sway, y + 6, 6, 6);
  },

  // Bush (32x24)
  bush: function(ctx, x, y) {
    const l = this.palette.leaf;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 22, 28, 3);
    ctx.fillStyle = l.dark;
    ctx.fillRect(x, y + 8, 32, 16);
    ctx.fillRect(x + 4, y + 4, 24, 20);
    ctx.fillStyle = l.mid;
    ctx.fillRect(x + 2, y + 10, 28, 12);
    ctx.fillRect(x + 6, y + 6, 20, 16);
    ctx.fillStyle = l.light;
    ctx.fillRect(x + 8, y + 8, 14, 8);
    ctx.fillStyle = l.glow;
    ctx.fillRect(x + 10, y + 9, 4, 3);
    ctx.fillRect(x + 18, y + 11, 3, 2);
  },

  // Mailbox (24x40)
  mailbox: function(ctx, x, y, hasFlag) {
    const m = this.palette.metal;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 22, 3);
    // Post
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 10, y + 16, 4, 24);
    // Box
    ctx.fillStyle = '#1a3a6a';
    ctx.fillRect(x, y, 24, 16);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 1, y + 1, 22, 14);
    ctx.fillStyle = '#1a4a9a';
    ctx.fillRect(x + 1, y + 12, 22, 3);
    // Door arc
    ctx.fillStyle = '#1a3a6a';
    ctx.fillRect(x + 16, y + 4, 2, 10);
    ctx.fillStyle = m.shine;
    ctx.fillRect(x + 19, y + 8, 2, 2);
    // Flag
    if (hasFlag) {
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 22, y + 2, 6, 4);
    } else {
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 22, y + 8, 4, 4);
    }
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 22, y + 2, 1, 12);
  },

  // Streetlight (20x80)
  streetlight: function(ctx, x, y, time) {
    const m = this.palette.metal;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 78, 12, 3);
    // Pole
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 8, y + 12, 4, 68);
    ctx.fillStyle = m.mid;
    ctx.fillRect(x + 9, y + 12, 2, 68);
    // Base
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 4, y + 76, 12, 4);
    // Arm
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 4, y + 10, 12, 3);
    // Lamp head
    ctx.fillStyle = m.dark;
    ctx.fillRect(x, y + 4, 12, 8);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 1, y + 5, 10, 6);
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 2, y + 6, 8, 4);
    // Glow
    const glow = 0.3 + Math.sin(time / 15) * 0.05;
    ctx.fillStyle = `rgba(245,166,35,${glow})`;
    ctx.fillRect(x - 8, y - 4, 28, 24);
  },

  // Bench (60x28)
  bench: function(ctx, x, y) {
    const w = this.palette.bark;
    const m = this.palette.metal;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 26, 56, 3);
    // Legs
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 4, y + 14, 4, 14);
    ctx.fillRect(x + 52, y + 14, 4, 14);
    ctx.fillStyle = m.mid;
    ctx.fillRect(x + 5, y + 14, 2, 14);
    ctx.fillRect(x + 53, y + 14, 2, 14);
    // Seat planks
    ctx.fillStyle = w.mid;
    ctx.fillRect(x, y + 12, 60, 6);
    ctx.fillStyle = w.dark;
    ctx.fillRect(x, y + 16, 60, 1);
    ctx.fillStyle = w.light;
    ctx.fillRect(x + 1, y + 13, 58, 1);
    // Back
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 4, y, 4, 14);
    ctx.fillRect(x + 52, y, 4, 14);
    ctx.fillStyle = w.mid;
    ctx.fillRect(x, y + 2, 60, 4);
    ctx.fillRect(x, y + 8, 60, 4);
    ctx.fillStyle = w.dark;
    ctx.fillRect(x, y + 6, 60, 1);
  },

  // Fence (60x28)
  fence: function(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 26, 56, 3);
    // Rails
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x, y + 8, 60, 3);
    ctx.fillRect(x, y + 18, 60, 3);
    ctx.fillStyle = '#c8c0b0';
    ctx.fillRect(x, y + 10, 60, 1);
    ctx.fillRect(x, y + 20, 60, 1);
    // Pickets
    for (let i = 0; i < 60; i += 8) {
      ctx.fillStyle = '#f5f0e0';
      ctx.fillRect(x + i + 2, y + 2, 4, 22);
      ctx.fillStyle = '#e8e0d0';
      ctx.fillRect(x + i + 2, y + 4, 1, 20);
      ctx.fillStyle = '#f5f0e0';
      ctx.fillRect(x + i + 3, y, 2, 4);
    }
  },

  // Trash can (24x36)
  trashcan: function(ctx, x, y) {
    const m = this.palette.metal;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 22, 3);
    // Body
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 2, y + 6, 20, 28);
    ctx.fillStyle = m.mid;
    ctx.fillRect(x + 3, y + 7, 18, 26);
    // Bands
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 2, y + 14, 20, 1);
    ctx.fillRect(x + 2, y + 24, 20, 1);
    // Lid
    ctx.fillStyle = m.dark;
    ctx.fillRect(x, y + 2, 24, 6);
    ctx.fillStyle = m.light;
    ctx.fillRect(x + 1, y + 3, 22, 3);
    ctx.fillStyle = m.shine;
    ctx.fillRect(x + 10, y + 3, 4, 1);
    // Handle
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 9, y, 6, 3);
  }
};

if (typeof module !== 'undefined') module.exports = OUTDOOR;
