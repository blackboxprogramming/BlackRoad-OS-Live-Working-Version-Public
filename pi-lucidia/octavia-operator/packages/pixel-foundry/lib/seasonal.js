// PIXEL FOUNDRY — SEASONAL & HOLIDAY (with axes)
// pumpkin, jackOLantern, christmasTree, gift, ornament, snowman, easterEgg, valentine, menorah, party

const SEASONAL = {
  AXES: {
    pumpkin:      { color: ['amber','pink','white','green'], face: ['none','classic','spooky','happy'] },
    christmasTree:{ size: ['s','m','l'], lights: ['off','on','rainbow'] },
    gift:         { color: ['pink','amber','violet','blue','white','black'], ribbon: ['white','pink','amber','violet','blue','black'] },
    ornament:     { color: ['pink','amber','violet','blue','white','black'], pattern: ['plain','striped','dotted','glitter'] },
    easterEgg:    { color: ['pink','amber','violet','blue','white'], pattern: ['plain','striped','dotted','zigzag'] },
    valentine:    { style: ['heart','rose','candy','card'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f5f5f5', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    green:  { main: '#3a7a3a', dark: '#2a5a2a', light: '#4a9a4a' }
  },

  // PUMPKIN (40x36)
  pumpkin(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const face = opts.face || 'none';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 34, 32, 2);
    // Stem
    ctx.fillStyle = '#3a5a1a';
    ctx.fillRect(x + 18, y, 4, 6);
    ctx.fillStyle = '#4a7a2a';
    ctx.fillRect(x + 19, y + 1, 2, 5);
    // Body — segmented
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(x + 20, y + 20, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(x + 20, y + 18, 17, 13, 0, 0, Math.PI * 2); ctx.fill();
    // Segments
    ctx.fillStyle = c.dark;
    [-12, -5, 5, 12].forEach(off => {
      ctx.beginPath();
      ctx.ellipse(x + 20 + off, y + 18, 2, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Highlight
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.ellipse(x + 14, y + 12, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Face
    if (face === 'classic') {
      ctx.fillStyle = '#0a0a0c';
      // Triangle eyes
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 16); ctx.lineTo(x + 17, y + 14); ctx.lineTo(x + 17, y + 18);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 16); ctx.lineTo(x + 23, y + 14); ctx.lineTo(x + 23, y + 18);
      ctx.closePath(); ctx.fill();
      // Triangle nose
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 20); ctx.lineTo(x + 17, y + 24); ctx.lineTo(x + 23, y + 24);
      ctx.closePath(); ctx.fill();
      // Jagged mouth
      ctx.fillRect(x + 12, y + 26, 16, 2);
      ctx.fillRect(x + 14, y + 24, 2, 2);
      ctx.fillRect(x + 18, y + 24, 2, 2);
      ctx.fillRect(x + 22, y + 24, 2, 2);
      ctx.fillRect(x + 26, y + 24, 2, 2);
    } else if (face === 'spooky') {
      ctx.fillStyle = '#0a0a0c';
      // Curved evil eyes
      ctx.beginPath(); ctx.ellipse(x + 14, y + 16, 3, 2, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 26, y + 16, 3, 2, Math.PI / 6, 0, Math.PI * 2); ctx.fill();
      // Long mouth with fangs
      ctx.fillRect(x + 10, y + 24, 20, 3);
      ctx.fillRect(x + 12, y + 27, 2, 3);
      ctx.fillRect(x + 18, y + 27, 2, 3);
      ctx.fillRect(x + 26, y + 27, 2, 3);
      // Inner glow if jack-o-lantern
      ctx.fillStyle = 'rgba(245,166,35,0.3)';
      ctx.fillRect(x + 4, y + 12, 32, 18);
    } else if (face === 'happy') {
      ctx.fillStyle = '#0a0a0c';
      // Round eyes
      ctx.beginPath(); ctx.arc(x + 14, y + 16, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 26, y + 16, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 13, y + 15, 1, 1);
      ctx.fillRect(x + 25, y + 15, 1, 1);
      // Smile
      ctx.strokeStyle = '#0a0a0c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 20, y + 22, 5, 0, Math.PI);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  },

  // CHRISTMAS TREE (44x68)
  christmasTree(ctx, x, y, opts = {}, time = 0) {
    const sz = { s: 0.8, m: 1, l: 1.15 }[opts.size || 'm'];
    const lights = opts.lights || 'on';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 66, 32, 2);
    // Trunk
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 18, y + 56, 8, 12);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 19, y + 56, 6, 12);
    // Tree layers
    const layers = [
      [22, 4, 18],
      [22, 16, 22],
      [22, 30, 26],
      [22, 46, 30]
    ];
    layers.forEach(([cx, ty, w]) => {
      ctx.fillStyle = '#2a5a2a';
      ctx.beginPath();
      ctx.moveTo(x + cx, y + ty);
      ctx.lineTo(x + cx + w * sz / 2, y + ty + 18);
      ctx.lineTo(x + cx - w * sz / 2, y + ty + 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a7a3a';
      ctx.beginPath();
      ctx.moveTo(x + cx, y + ty + 2);
      ctx.lineTo(x + cx + w * sz / 2 - 2, y + ty + 17);
      ctx.lineTo(x + cx - w * sz / 2 + 2, y + ty + 17);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4a9a4a';
      [-w/3, w/3].forEach(off => {
        ctx.beginPath();
        ctx.arc(x + cx + off, y + ty + 12, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    // Star on top
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 21, y, 2, 6);
    ctx.fillRect(x + 19, y + 2, 6, 2);
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 21, y, 2, 4);
    // Lights
    if (lights !== 'off') {
      const on = Math.floor(time / 12) % 2;
      const colors = lights === 'rainbow' ? ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'] : ['#F5A623'];
      const positions = [[16, 14], [28, 18], [12, 28], [32, 32], [18, 38], [26, 42], [10, 50], [34, 54], [20, 58]];
      positions.forEach((pos, i) => {
        const [px, py] = pos;
        const on2 = (Math.floor(time / 8) + i) % 2;
        ctx.fillStyle = on2 ? colors[i % colors.length] : '#1a1a1a';
        ctx.fillRect(x + px, y + py, 2, 2);
      });
    }
    // Ornaments
    ctx.fillStyle = '#FF1D6C';
    [[14, 22], [30, 26], [16, 36], [28, 40], [12, 50]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(x + px, y + py, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + px - 1, y + py - 1, 1, 1);
      ctx.fillStyle = '#FF1D6C';
    });
  },

  // GIFT BOX (32x32)
  gift(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const r = this._palette[opts.ribbon || 'amber'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 28, 2);
    // Box
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 8, 28, 22);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 9, 26, 20);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 9, 26, 2);
    // Lid
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 4, 32, 6);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 5, 30, 4);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 1, y + 5, 30, 1);
    // Vertical ribbon
    ctx.fillStyle = r.dark;
    ctx.fillRect(x + 14, y, 4, 30);
    ctx.fillStyle = r.main;
    ctx.fillRect(x + 15, y, 2, 30);
    // Horizontal ribbon
    ctx.fillStyle = r.dark;
    ctx.fillRect(x, y + 18, 32, 4);
    ctx.fillStyle = r.main;
    ctx.fillRect(x, y + 19, 32, 2);
    // Bow
    ctx.fillStyle = r.dark;
    ctx.beginPath(); ctx.ellipse(x + 11, y + 4, 5, 3, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 21, y + 4, 5, 3, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = r.main;
    ctx.beginPath(); ctx.ellipse(x + 11, y + 4, 4, 2, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 21, y + 4, 4, 2, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = r.dark;
    ctx.fillRect(x + 14, y + 2, 4, 4);
  },

  // ORNAMENT (24x32)
  ornament(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const pattern = opts.pattern || 'plain';
    // Cap
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 9, y, 6, 4);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 9, y, 6, 1);
    ctx.fillRect(x + 9, y + 3, 6, 1);
    // Hook
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 12, y - 2, 2, 0, Math.PI);
    ctx.stroke();
    // Ball
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.arc(x + 12, y + 16, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.arc(x + 12, y + 16, 10, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.ellipse(x + 8, y + 12, 3, 4, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    // Pattern
    ctx.save();
    ctx.beginPath(); ctx.arc(x + 12, y + 16, 10, 0, Math.PI * 2); ctx.clip();
    if (pattern === 'striped') {
      ctx.fillStyle = '#fff';
      [10, 14, 18, 22].forEach(yy => ctx.fillRect(x + 1, y + yy, 22, 1));
    } else if (pattern === 'dotted') {
      ctx.fillStyle = '#fff';
      [[8, 12], [14, 14], [10, 18], [16, 20], [6, 16]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx, y + dy, 2, 2);
      });
    } else if (pattern === 'glitter') {
      const sparkle = Math.floor(time / 8) % 4;
      ctx.fillStyle = '#fff';
      const dots = [[7, 12], [15, 11], [10, 14], [17, 17], [8, 19], [14, 21], [11, 17]];
      dots.forEach(([dx, dy], i) => {
        if ((i + sparkle) % 2 === 0) ctx.fillRect(x + dx, y + dy, 1, 1);
      });
    }
    ctx.restore();
  },

  // SNOWMAN (32x52)
  snowman(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 50, 24, 2);
    // Bottom snowball
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath(); ctx.arc(x + 16, y + 38, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath(); ctx.arc(x + 16, y + 36, 11, 0, Math.PI * 2); ctx.fill();
    // Middle
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath(); ctx.arc(x + 16, y + 22, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath(); ctx.arc(x + 16, y + 20, 8, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath(); ctx.arc(x + 16, y + 10, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath(); ctx.arc(x + 16, y + 8, 6, 0, Math.PI * 2); ctx.fill();
    // Buttons
    ctx.fillStyle = '#1a1a1a';
    [18, 22, 26].forEach(yy => {
      ctx.beginPath(); ctx.arc(x + 16, y + yy, 1, 0, Math.PI * 2); ctx.fill();
    });
    [32, 38, 44].forEach(yy => {
      ctx.beginPath(); ctx.arc(x + 16, y + yy, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 13, y + 7, 1, 1);
    ctx.fillRect(x + 18, y + 7, 1, 1);
    // Carrot nose
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 16, y + 9, 4, 2);
    // Mouth
    ctx.fillStyle = '#1a1a1a';
    [13, 15, 17, 19].forEach(px => ctx.fillRect(x + px, y + 12, 1, 1));
    // Top hat
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y, 16, 4);
    ctx.fillRect(x + 11, y - 6, 10, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 11, y, 10, 1);
    // Stick arms
    ctx.strokeStyle = '#3a2510';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 22); ctx.lineTo(x, y + 18); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 22); ctx.lineTo(x + 32, y + 18); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 18); ctx.lineTo(x - 2, y + 14); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 18); ctx.lineTo(x + 4, y + 13); ctx.stroke();
    ctx.lineWidth = 1;
    // Scarf
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 9, y + 14, 14, 3);
    ctx.fillRect(x + 8, y + 17, 5, 5);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 9, y + 16, 14, 1);
  },

  // EASTER EGG (24x32)
  easterEgg(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const pattern = opts.pattern || 'plain';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 16, 2);
    // Egg shape
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(x + 12, y + 16, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(x + 12, y + 16, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 6, y + 8, 2, 6);
    // Pattern
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x + 12, y + 16, 8, 12, 0, 0, Math.PI * 2); ctx.clip();
    if (pattern === 'striped') {
      ctx.fillStyle = '#fff';
      [8, 14, 20].forEach(yy => ctx.fillRect(x + 2, y + yy, 20, 2));
      ctx.fillStyle = '#F5A623';
      [11, 17, 23].forEach(yy => ctx.fillRect(x + 2, y + yy, 20, 1));
    } else if (pattern === 'dotted') {
      ctx.fillStyle = '#fff';
      [[8, 8], [14, 12], [10, 16], [16, 18], [9, 22], [15, 24]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 1.5, 0, Math.PI * 2); ctx.fill();
      });
    } else if (pattern === 'zigzag') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      [10, 16, 22].forEach(yy => {
        ctx.beginPath();
        for (let xx = 2; xx < 22; xx += 2) {
          const py = yy + ((xx / 2) & 1 ? -1 : 1);
          if (xx === 2) ctx.moveTo(x + xx, y + py);
          else ctx.lineTo(x + xx, y + py);
        }
        ctx.stroke();
      });
    }
    ctx.restore();
  },

  // VALENTINE (36x36)
  valentine(ctx, x, y, opts = {}, time = 0) {
    const s = opts.style || 'heart';
    const pulse = 1 + Math.sin(time / 8) * 0.05;
    if (s === 'heart') {
      const cx = x + 18, cy = y + 16;
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(cx - 6 * pulse, cy - 4 * pulse, 8 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 6 * pulse, cy - 4 * pulse, 8 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 14 * pulse, cy);
      ctx.lineTo(cx + 14 * pulse, cy);
      ctx.lineTo(cx, cy + 16 * pulse);
      ctx.closePath(); ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(cx - 8, cy - 6, 3, 4);
      // Floaters
      ctx.fillStyle = 'rgba(255,29,108,0.6)';
      for (let i = 0; i < 3; i++) {
        const t = (time / 4 + i * 30) % 32;
        ctx.fillRect(x + 6 + i * 10, y + 36 - t, 1, 1);
      }
    } else if (s === 'rose') {
      // Stem
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(x + 17, y + 18, 2, 18);
      // Leaves
      ctx.fillStyle = '#4a9a4a';
      ctx.fillRect(x + 14, y + 24, 4, 2);
      ctx.fillRect(x + 19, y + 28, 4, 2);
      // Bloom
      ctx.fillStyle = '#7a0a28';
      ctx.beginPath(); ctx.arc(x + 18, y + 14, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c41758';
      ctx.beginPath(); ctx.arc(x + 18, y + 14, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 18, y + 14, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a90';
      ctx.beginPath(); ctx.arc(x + 18, y + 14, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a0a28';
      ctx.beginPath(); ctx.arc(x + 18, y + 14, 2, 0, Math.PI * 2); ctx.fill();
      // Spiral
      ctx.strokeStyle = '#7a0a28';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.3) {
        const r = a * 1.2;
        const px = x + 18 + Math.cos(a) * r;
        const py = y + 14 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else if (s === 'candy') {
      // Heart-shaped candy box
      ctx.fillStyle = '#c41758';
      ctx.beginPath(); ctx.arc(x + 12, y + 14, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 24, y + 14, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 18); ctx.lineTo(x + 32, y + 18);
      ctx.lineTo(x + 18, y + 34); ctx.closePath(); ctx.fill();
      // Lid edge
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 12, y + 12, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 24, y + 12, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 16); ctx.lineTo(x + 30, y + 16);
      ctx.lineTo(x + 18, y + 30); ctx.closePath(); ctx.fill();
      // Ribbon
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 16, y + 4, 4, 26);
      ctx.fillStyle = '#ffc46b';
      ctx.fillRect(x + 17, y + 4, 2, 26);
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 14, y + 4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 22, y + 4, 4, 0, Math.PI * 2); ctx.fill();
    } else if (s === 'card') {
      // Envelope
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 4, y + 6, 28, 22);
      ctx.fillStyle = '#ff5a90';
      ctx.fillRect(x + 5, y + 7, 26, 20);
      // Flap
      ctx.fillStyle = '#c41758';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 6); ctx.lineTo(x + 32, y + 6);
      ctx.lineTo(x + 18, y + 18); ctx.closePath(); ctx.fill();
      // Heart seal
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + 16, y + 16, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 20, y + 16, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 13, y + 18); ctx.lineTo(x + 23, y + 18);
      ctx.lineTo(x + 18, y + 24); ctx.closePath(); ctx.fill();
    }
  },

  // MENORAH (52x40)
  menorah(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 38, 44, 2);
    // Base
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 12, y + 30, 28, 8);
    ctx.fillStyle = '#ffc46b';
    ctx.fillRect(x + 14, y + 31, 24, 6);
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x + 12, y + 36, 28, 2);
    // Center stem
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 24, y + 14, 4, 18);
    // Arms
    for (let i = 0; i < 4; i++) {
      const reach = 6 + i * 4;
      const armY = y + 22 - i * 2;
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 26, armY);
      ctx.lineTo(x + 26 - reach, armY);
      ctx.lineTo(x + 26 - reach, y + 14 - i * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 26, armY);
      ctx.lineTo(x + 26 + reach, armY);
      ctx.lineTo(x + 26 + reach, y + 14 - i * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    // Candles + flames
    const candlePositions = [[26, 14], [22, 14], [18, 12], [14, 10], [10, 8], [30, 14], [34, 12], [38, 10], [42, 8]];
    candlePositions.forEach(([px, py], i) => {
      // Candle
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + px - 1, y + py - 4, 2, 4);
      // Flame
      const flicker = Math.sin(time / 4 + i) * 0.5;
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + px - 1, y + py - 8 + flicker, 2, 4);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + px - 1, y + py - 7 + flicker, 2, 3);
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(x + px - 1, y + py - 6 + flicker, 1, 2);
    });
    // Glow
    ctx.fillStyle = 'rgba(245,166,35,0.18)';
    ctx.fillRect(x, y, 52, 24);
  }
};

if (typeof module !== 'undefined') module.exports = SEASONAL;
