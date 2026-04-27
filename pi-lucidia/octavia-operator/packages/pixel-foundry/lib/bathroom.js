// PIXEL FOUNDRY — BATHROOM
// Toilet, sink, tub, shower, towel rack, mirror

const BATHROOM = {
  palette: {
    porcelain: '#f5f5f0', porcelainShade: '#d8d8d0',
    chrome: '#c0c0c4', chromeDark: '#787880',
    tile: '#bcd2dc', tileDark: '#7a9aa8',
    wood: '#c4935a', woodDark: '#a67c3d',
    water: '#7accea', waterLight: '#a8e0f5'
  },

  // Toilet (32x44)
  toilet(ctx, x, y) {
    const p = this.palette;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 42, 28, 4);
    // Tank
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x + 6, y, 20, 18);
    ctx.fillStyle = p.porcelain;
    ctx.fillRect(x + 7, y + 1, 18, 16);
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x + 7, y + 16, 18, 1);
    // Flush button
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 14, y + 4, 4, 2);
    // Bowl
    ctx.fillStyle = p.porcelainShade;
    ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.porcelain;
    ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
    // Water
    ctx.fillStyle = p.water;
    ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.waterLight;
    ctx.fillRect(x + 12, y + 28, 4, 1);
    // Seat
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x + 4, y + 18, 24, 4);
    ctx.fillStyle = p.porcelain;
    ctx.fillRect(x + 5, y + 18, 22, 2);
    // Base
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x + 10, y + 38, 12, 4);
  },

  // Sink (52x36) — pedestal
  sink(ctx, x, y) {
    const p = this.palette;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 48, 4);
    // Basin
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x, y + 4, 52, 14);
    ctx.fillStyle = p.porcelain;
    ctx.fillRect(x + 2, y + 5, 48, 12);
    // Bowl
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x + 8, y + 8, 36, 10);
    ctx.fillStyle = p.water;
    ctx.fillRect(x + 10, y + 10, 32, 6);
    ctx.fillStyle = p.waterLight;
    ctx.fillRect(x + 12, y + 11, 8, 1);
    // Drain
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x + 24, y + 13, 4, 2);
    // Faucet
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x + 24, y, 4, 8);
    ctx.fillRect(x + 22, y, 8, 2);
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 25, y + 1, 2, 6);
    // Knobs
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 18, y + 2, 3, 3);
    ctx.fillRect(x + 31, y + 2, 3, 3);
    // Pedestal
    ctx.fillStyle = p.porcelainShade;
    ctx.fillRect(x + 18, y + 18, 16, 16);
    ctx.fillStyle = p.porcelain;
    ctx.fillRect(x + 20, y + 18, 12, 16);
  },

  // Bathtub (96x40)
  tub(ctx, x, y) {
    const p = this.palette;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 92, 4);
    // Outer
    ctx.fillStyle = p.porcelainShade;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 38); ctx.lineTo(x + 4, y + 12);
    ctx.quadraticCurveTo(x + 4, y + 4, x + 12, y + 4);
    ctx.lineTo(x + 84, y + 4);
    ctx.quadraticCurveTo(x + 92, y + 4, x + 92, y + 12);
    ctx.lineTo(x + 92, y + 38); ctx.closePath();
    ctx.fill();
    // Inner
    ctx.fillStyle = p.porcelain;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 36); ctx.lineTo(x + 8, y + 14);
    ctx.quadraticCurveTo(x + 8, y + 8, x + 14, y + 8);
    ctx.lineTo(x + 82, y + 8);
    ctx.quadraticCurveTo(x + 88, y + 8, x + 88, y + 14);
    ctx.lineTo(x + 88, y + 36); ctx.closePath();
    ctx.fill();
    // Water
    ctx.fillStyle = p.water;
    ctx.fillRect(x + 10, y + 14, 76, 22);
    ctx.fillStyle = p.waterLight;
    ctx.fillRect(x + 12, y + 14, 72, 2);
    // Bubbles
    ctx.fillStyle = '#ffffff';
    [16, 28, 44, 60, 72].forEach((bx, i) => {
      ctx.fillRect(x + bx, y + 18 + (i % 2) * 8, 3, 2);
    });
    // Faucet
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x + 84, y + 6, 6, 4);
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 86, y + 7, 3, 1);
  },

  // Shower (52x84)
  shower(ctx, x, y, time) {
    const p = this.palette;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 82, 48, 4);
    // Stall
    ctx.fillStyle = p.tileDark;
    ctx.fillRect(x, y, 52, 84);
    ctx.fillStyle = p.tile;
    ctx.fillRect(x + 2, y + 2, 48, 80);
    // Tile grid
    ctx.fillStyle = p.tileDark;
    for (let i = 8; i < 52; i += 8) ctx.fillRect(x + i, y + 2, 1, 80);
    for (let i = 8; i < 84; i += 8) ctx.fillRect(x + 2, y + i, 48, 1);
    // Glass
    ctx.fillStyle = 'rgba(220,234,242,0.3)';
    ctx.fillRect(x + 4, y + 4, 44, 76);
    // Showerhead
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x + 22, y + 4, 8, 4);
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 24, y + 5, 4, 2);
    // Water spray
    if (Math.floor(time / 4) % 2) {
      ctx.fillStyle = 'rgba(122,204,234,0.5)';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(x + 22 + i * 2 - 4, y + 8 + ((time + i * 7) % 60), 1, 4);
      }
    }
    // Drain
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x + 24, y + 78, 4, 2);
  },

  // Towel rack (44x20)
  towelRack(ctx, x, y, color) {
    const p = this.palette;
    const towel = color === 'pink' ? '#FF1D6C' : color === 'amber' ? '#F5A623' : color === 'blue' ? '#2979FF' : '#f0f0f0';
    const towelDark = color === 'pink' ? '#c41758' : color === 'amber' ? '#c4851c' : color === 'blue' ? '#1f5fcc' : '#c0c0c0';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 18, 40, 3);
    // Brackets
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x, y + 2, 3, 4);
    ctx.fillRect(x + 41, y + 2, 3, 4);
    // Bar
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 3, y + 2, 38, 2);
    // Folded towel
    ctx.fillStyle = towelDark;
    ctx.fillRect(x + 4, y + 4, 36, 14);
    ctx.fillStyle = towel;
    ctx.fillRect(x + 5, y + 5, 34, 12);
    ctx.fillStyle = towelDark;
    ctx.fillRect(x + 5, y + 10, 34, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 6, y + 6, 32, 1);
  },

  // Toilet paper (16x20)
  toiletPaper(ctx, x, y) {
    const p = this.palette;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 1, y + 18, 14, 2);
    // Holder
    ctx.fillStyle = p.chromeDark;
    ctx.fillRect(x, y + 2, 2, 6);
    ctx.fillRect(x + 14, y + 2, 2, 6);
    ctx.fillStyle = p.chrome;
    ctx.fillRect(x + 1, y + 4, 14, 2);
    // Roll
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.arc(x + 8, y + 12, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x + 7, y + 11, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a7a7a';
    ctx.beginPath(); ctx.arc(x + 8, y + 12, 2, 0, Math.PI * 2); ctx.fill();
    // Hanging sheet
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x + 12, y + 12, 4, 6);
  }
};

if (typeof module !== 'undefined') module.exports = BATHROOM;
