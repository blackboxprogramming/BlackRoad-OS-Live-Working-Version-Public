// PIXEL FOUNDRY — UI / ICONS (with axes)
// button, frame, badge, arrow, star, heart-icon, checkmark, cross, cursor, avatar-frame

const UI = {
  AXES: {
    button:      { color: ['pink','amber','violet','blue','white','black'], state: ['default','hover','pressed','disabled'], shape: ['rect','round','pill'] },
    frame:       { color: ['pink','amber','violet','blue','white','black'], style: ['flat','beveled','double','dotted'] },
    badge:       { color: ['pink','amber','violet','blue','white','black'], shape: ['round','shield','star','banner'] },
    arrow:       { color: ['pink','amber','violet','blue','white','black'], direction: ['up','down','left','right'] },
    star:        { color: ['pink','amber','violet','blue','white'], style: ['filled','outline','sparkle'] },
    heart:       { color: ['pink','amber','violet','blue','white'], state: ['filled','outline','broken'] },
    cursor:      { color: ['pink','amber','violet','blue','white','black'], style: ['arrow','hand','crosshair'] },
    avatarFrame: { color: ['pink','amber','violet','blue','white','black'], style: ['plain','star','crown','laurel'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' }
  },

  // BUTTON (60x24)
  button(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const state = opts.state || 'default';
    const shape = opts.shape || 'rect';
    const offset = state === 'pressed' ? 1 : 0;
    if (state === 'disabled') {
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 2, y + 2 + offset, 56, 20);
      ctx.fillStyle = '#5a5a60';
      ctx.fillRect(x + 3, y + 3 + offset, 54, 18);
    } else {
      ctx.fillStyle = c.dark;
      if (shape === 'rect') {
        ctx.fillRect(x + 2, y + 2 + offset, 56, 20);
      } else if (shape === 'round') {
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + 2 + radius, y + 2 + offset);
        ctx.lineTo(x + 58 - radius, y + 2 + offset);
        ctx.quadraticCurveTo(x + 58, y + 2 + offset, x + 58, y + 6 + offset);
        ctx.lineTo(x + 58, y + 18 + offset);
        ctx.quadraticCurveTo(x + 58, y + 22 + offset, x + 54, y + 22 + offset);
        ctx.lineTo(x + 6, y + 22 + offset);
        ctx.quadraticCurveTo(x + 2, y + 22 + offset, x + 2, y + 18 + offset);
        ctx.closePath(); ctx.fill();
      } else { // pill
        ctx.beginPath();
        ctx.arc(x + 12, y + 12 + offset, 10, Math.PI / 2, Math.PI * 1.5);
        ctx.lineTo(x + 48, y + 2 + offset);
        ctx.arc(x + 48, y + 12 + offset, 10, Math.PI * 1.5, Math.PI / 2);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = state === 'hover' ? c.light : c.main;
      if (shape === 'rect') {
        ctx.fillRect(x + 3, y + 3 + offset, 54, 17);
      } else if (shape === 'round') {
        ctx.beginPath();
        ctx.moveTo(x + 3 + 3, y + 3 + offset);
        ctx.lineTo(x + 57 - 3, y + 3 + offset);
        ctx.quadraticCurveTo(x + 57, y + 3 + offset, x + 57, y + 6 + offset);
        ctx.lineTo(x + 57, y + 17 + offset);
        ctx.quadraticCurveTo(x + 57, y + 21 + offset, x + 54, y + 21 + offset);
        ctx.lineTo(x + 6, y + 21 + offset);
        ctx.quadraticCurveTo(x + 3, y + 21 + offset, x + 3, y + 18 + offset);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(x + 12, y + 12 + offset, 9, Math.PI / 2, Math.PI * 1.5);
        ctx.lineTo(x + 48, y + 3 + offset);
        ctx.arc(x + 48, y + 12 + offset, 9, Math.PI * 1.5, Math.PI / 2);
        ctx.closePath(); ctx.fill();
      }
      // Highlight
      if (state !== 'pressed') {
        ctx.fillStyle = c.light;
        ctx.fillRect(x + 4, y + 4 + offset, 52, 2);
      }
    }
    // Label dots
    ctx.fillStyle = state === 'disabled' ? '#7a7a80' : '#fff';
    [22, 27, 32, 37, 42].forEach(px => ctx.fillRect(x + px, y + 12 + offset, 3, 3));
  },

  // FRAME (52x52)
  frame(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const style = opts.style || 'flat';
    if (style === 'flat') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 52, 52);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x + 4, y + 4, 44, 44);
      ctx.fillStyle = c.main;
      ctx.fillRect(x, y, 52, 4);
      ctx.fillRect(x, y + 48, 52, 4);
      ctx.fillRect(x, y, 4, 52);
      ctx.fillRect(x + 48, y, 4, 52);
    } else if (style === 'beveled') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 52, 52);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 2, y + 2, 48, 48);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 2, y + 2, 48, 2);
      ctx.fillRect(x + 2, y + 2, 2, 48);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 48, 48, 2);
      ctx.fillRect(x + 48, y + 2, 2, 48);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x + 6, y + 6, 40, 40);
      // Corners
      ctx.fillStyle = c.light;
      [0, 48].forEach(dx => {
        [0, 48].forEach(dy => {
          ctx.fillRect(x + dx, y + dy, 4, 4);
        });
      });
    } else if (style === 'double') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 52, 4);
      ctx.fillRect(x, y + 48, 52, 4);
      ctx.fillRect(x, y, 4, 52);
      ctx.fillRect(x + 48, y, 4, 52);
      // Inner frame
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 6, y + 6, 40, 2);
      ctx.fillRect(x + 6, y + 44, 40, 2);
      ctx.fillRect(x + 6, y + 6, 2, 40);
      ctx.fillRect(x + 44, y + 6, 2, 40);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x + 8, y + 8, 36, 36);
    } else if (style === 'dotted') {
      ctx.fillStyle = c.main;
      for (let i = 0; i < 52; i += 4) {
        ctx.fillRect(x + i, y, 2, 2);
        ctx.fillRect(x + i, y + 50, 2, 2);
      }
      for (let i = 0; i < 52; i += 4) {
        ctx.fillRect(x, y + i, 2, 2);
        ctx.fillRect(x + 50, y + i, 2, 2);
      }
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x + 4, y + 4, 44, 44);
    }
  },

  // BADGE (32x36)
  badge(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const shape = opts.shape || 'shield';
    if (shape === 'round') {
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.arc(x + 16, y + 18, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.arc(x + 16, y + 18, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 9, y + 11, 4, 2);
      // Stars decoration
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const sx = x + 16 + Math.cos(a) * 10;
        const sy = y + 18 + Math.sin(a) * 10;
        ctx.fillRect(sx - 1, sy, 2, 1);
        ctx.fillRect(sx, sy - 1, 1, 2);
      }
      // Center number
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 14, y + 14, 4, 8);
    } else if (shape === 'shield') {
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + 28, y + 4);
      ctx.lineTo(x + 28, y + 22);
      ctx.quadraticCurveTo(x + 16, y + 36, x + 4, y + 22);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + 26, y + 6);
      ctx.lineTo(x + 26, y + 21);
      ctx.quadraticCurveTo(x + 16, y + 32, x + 6, y + 21);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 8, y + 8, 16, 2);
      // Star
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 14, y + 14, 4, 8);
      ctx.fillRect(x + 12, y + 17, 8, 3);
    } else if (shape === 'star') {
      ctx.fillStyle = c.dark;
      const points = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        const r = i & 1 ? 6 : 14;
        points.push([x + 16 + Math.cos(a) * r, y + 18 + Math.sin(a) * r]);
      }
      ctx.beginPath();
      points.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      points.forEach(([px, py], i) => {
        const npx = (px - (x + 16)) * 0.85 + (x + 16);
        const npy = (py - (y + 18)) * 0.85 + (y + 18);
        if (i === 0) ctx.moveTo(npx, npy); else ctx.lineTo(npx, npy);
      });
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 14, y + 12, 4, 2);
    } else if (shape === 'banner') {
      // Hanging banner / scroll
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 4, 28, 24);
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 28); ctx.lineTo(x + 16, y + 36); ctx.lineTo(x + 30, y + 28);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 6, 24, 22);
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 28); ctx.lineTo(x + 16, y + 34); ctx.lineTo(x + 28, y + 28);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 4, y + 6, 24, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 8, y + 12, 16, 2);
      ctx.fillRect(x + 8, y + 18, 16, 2);
      // Top mounts
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 4, 6);
      ctx.fillRect(x + 28, y, 4, 6);
    }
  },

  // ARROW (32x32)
  arrow(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const dir = opts.direction || 'right';
    const cx = x + 16, cy = y + 16;
    const path = (rotation) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(-12, -4); ctx.lineTo(2, -4); ctx.lineTo(2, -10);
      ctx.lineTo(14, 0); ctx.lineTo(2, 10); ctx.lineTo(2, 4);
      ctx.lineTo(-12, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(-11, -3); ctx.lineTo(2, -3); ctx.lineTo(2, -8);
      ctx.lineTo(12, 0); ctx.lineTo(2, 8); ctx.lineTo(2, 3);
      ctx.lineTo(-11, 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(-10, -2, 11, 1);
      ctx.restore();
    };
    const rotations = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    path(rotations[dir]);
  },

  // STAR (28x28)
  star(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const style = opts.style || 'filled';
    const cx = x + 14, cy = y + 14;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
      const r = i & 1 ? 5 : 12;
      points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    if (style === 'outline') {
      ctx.strokeStyle = c.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
      ctx.closePath(); ctx.stroke();
      ctx.lineWidth = 1;
    } else if (style === 'sparkle') {
      const pulse = 0.7 + Math.sin(time / 8) * 0.3;
      // Halo
      ctx.fillStyle = `rgba(${parseInt(c.main.slice(1, 3), 16)},${parseInt(c.main.slice(3, 5), 16)},${parseInt(c.main.slice(5, 7), 16)},${0.3 * pulse})`;
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      points.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(cx - 2, cy - 8, 4, 4);
    } else { // filled
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      points.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      points.forEach(([px, py], i) => {
        const npx = (px - cx) * 0.85 + cx;
        const npy = (py - cy) * 0.85 + cy;
        if (i === 0) ctx.moveTo(npx, npy); else ctx.lineTo(npx, npy);
      });
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(cx - 2, cy - 6, 3, 3);
    }
  },

  // HEART (24x24)
  heart(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const state = opts.state || 'filled';
    const cx = x + 12, cy = y + 10;
    if (state === 'broken') {
      // Left half
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy + 2); ctx.lineTo(cx - 1, cy + 2);
      ctx.lineTo(cx, cy + 4); ctx.lineTo(cx - 2, cy + 8);
      ctx.lineTo(cx - 1, cy + 12); ctx.lineTo(cx - 4, cy + 10);
      ctx.closePath(); ctx.fill();
      // Right half
      ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy + 2); ctx.lineTo(cx + 9, cy + 2);
      ctx.lineTo(cx + 4, cy + 10); ctx.lineTo(cx + 1, cy + 12);
      ctx.lineTo(cx, cy + 8); ctx.lineTo(cx + 2, cy + 4);
      ctx.closePath(); ctx.fill();
    } else {
      const drawHeart = (style2) => {
        if (style2 === 'fill') ctx.fill();
        else ctx.stroke();
      };
      ctx[state === 'outline' ? 'strokeStyle' : 'fillStyle'] = c.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 2, 5, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy - 2, 5, 0, Math.PI * 2);
      ctx.moveTo(cx - 9, cy + 2);
      ctx.lineTo(cx + 9, cy + 2);
      ctx.lineTo(cx, cy + 12);
      ctx.closePath();
      drawHeart(state === 'filled' ? 'fill' : 'stroke');
      ctx.lineWidth = 1;
      if (state === 'filled') {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(cx - 6, cy - 4, 2, 2);
      }
    }
  },

  // CHECK (24x24)
  check(ctx, x, y, time = 0) {
    ctx.fillStyle = '#3acc3a';
    ctx.beginPath(); ctx.arc(x + 12, y + 12, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7acc7a';
    ctx.beginPath(); ctx.arc(x + 12, y + 12, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 13); ctx.lineTo(x + 11, y + 17); ctx.lineTo(x + 18, y + 8);
    ctx.stroke();
    ctx.lineWidth = 1;
  },

  // CROSS (24x24)
  cross(ctx, x, y, time = 0) {
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.arc(x + 12, y + 12, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 12, y + 12, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 7); ctx.lineTo(x + 17, y + 17);
    ctx.moveTo(x + 17, y + 7); ctx.lineTo(x + 7, y + 17);
    ctx.stroke();
    ctx.lineWidth = 1;
  },

  // CURSOR (24x28)
  cursor(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const style = opts.style || 'arrow';
    if (style === 'arrow') {
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + 4, y + 22);
      ctx.lineTo(x + 9, y + 17); ctx.lineTo(x + 14, y + 26);
      ctx.lineTo(x + 17, y + 25); ctx.lineTo(x + 12, y + 16);
      ctx.lineTo(x + 18, y + 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 4); ctx.lineTo(x + 5, y + 20);
      ctx.lineTo(x + 9, y + 16); ctx.lineTo(x + 13, y + 24);
      ctx.lineTo(x + 15, y + 23); ctx.lineTo(x + 11, y + 15);
      ctx.lineTo(x + 16, y + 13); ctx.closePath(); ctx.fill();
    } else if (style === 'hand') {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(x + 8, y + 4, 4, 8);
      ctx.fillRect(x + 4, y + 12, 16, 12);
      ctx.fillRect(x + 4, y + 12, 4, 4);
      ctx.fillRect(x + 12, y + 8, 4, 4);
      ctx.fillRect(x + 16, y + 12, 4, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 5, 2, 7);
      ctx.fillRect(x + 5, y + 13, 14, 10);
      ctx.fillRect(x + 5, y + 13, 2, 2);
      ctx.fillRect(x + 13, y + 9, 2, 2);
    } else if (style === 'crosshair') {
      ctx.strokeStyle = c.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 2); ctx.lineTo(x + 12, y + 9);
      ctx.moveTo(x + 12, y + 19); ctx.lineTo(x + 12, y + 26);
      ctx.moveTo(x + 2, y + 14); ctx.lineTo(x + 9, y + 14);
      ctx.moveTo(x + 19, y + 14); ctx.lineTo(x + 26, y + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 12, y + 14, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 11, y + 13, 2, 2);
    }
  },

  // AVATAR FRAME (52x52)
  avatarFrame(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const style = opts.style || 'plain';
    // Frame
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.arc(x + 26, y + 26, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.arc(x + 26, y + 26, 22, 0, Math.PI * 2); ctx.fill();
    // Avatar bg
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(x + 26, y + 26, 19, 0, Math.PI * 2); ctx.fill();
    // Generic avatar silhouette
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath(); ctx.arc(x + 26, y + 22, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 26, y + 38, 11, 8, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Style decoration
    if (style === 'star') {
      ctx.fillStyle = '#F5A623';
      ctx.beginPath();
      const cx = x + 26, cy = y + 4;
      const points = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        const r = i & 1 ? 3 : 7;
        points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      points.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
      ctx.closePath(); ctx.fill();
    } else if (style === 'crown') {
      ctx.fillStyle = '#F5A623';
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 4); ctx.lineTo(x + 18, y - 4);
      ctx.lineTo(x + 22, y + 2); ctx.lineTo(x + 26, y - 6);
      ctx.lineTo(x + 30, y + 2); ctx.lineTo(x + 34, y - 4);
      ctx.lineTo(x + 38, y + 4); ctx.lineTo(x + 38, y + 8);
      ctx.lineTo(x + 14, y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FF1D6C';
      [18, 26, 34].forEach(px => {
        ctx.beginPath(); ctx.arc(x + px, y + 5, 1.5, 0, Math.PI * 2); ctx.fill();
      });
    } else if (style === 'laurel') {
      ctx.fillStyle = '#3a7a3a';
      // Left laurel
      for (let i = 0; i < 6; i++) {
        const a = Math.PI + (i / 6) * Math.PI * 0.8;
        const lx = x + 26 + Math.cos(a) * 26;
        const ly = y + 26 + Math.sin(a) * 26;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 4, 2, a, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 8 - (i / 6) * Math.PI * 0.8;
        const lx = x + 26 + Math.cos(a) * 26;
        const ly = y + 26 + Math.sin(a) * 26;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 4, 2, a, 0, Math.PI * 2);
        ctx.fill();
      }
      // Tie
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 23, y + 48, 6, 4);
    }
  }
};

if (typeof module !== 'undefined') module.exports = UI;
