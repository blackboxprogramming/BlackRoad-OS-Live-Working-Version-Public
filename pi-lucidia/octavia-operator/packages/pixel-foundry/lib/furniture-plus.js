// PIXEL FOUNDRY — FURNITURE PLUS (with axes)
// armchair, dining-chair, stool, round-table, console, shelf, wardrobe, ottoman, tv-stand, side-table

const FURNITURE_PLUS = {
  AXES: {
    armchair:    { style: ['lounge','wing','club','recliner'], color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    diningChair: { style: ['modern','classic','rattan','folding'], color: ['pink','amber','violet','blue','white','black','wood'] },
    stool:       { style: ['bar','round','foot'], color: ['pink','amber','violet','blue','white','black','wood'] },
    roundTable:  { material: ['wood','marble','glass','metal'], size: ['s','m','l'] },
    console:     { material: ['wood','marble','metal'], color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    shelf:       { style: ['ladder','cube','floating','bookcase'], color: ['white','black','wood','stone','pink','amber','violet','blue'] },
    wardrobe:    { style: ['single','double','sliding'], color: ['white','black','wood','pink','amber','violet','blue','stone'] },
    ottoman:     { shape: ['round','square','storage'], color: ['pink','amber','violet','blue','white','black','wood','stone'] },
    tvStand:     { material: ['wood','metal','glass'], color: ['white','black','wood','pink','amber','violet','blue','stone'] },
    sideTable:   { style: ['round','square','tray','nesting'], color: ['pink','amber','violet','blue','white','black','wood','stone'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    stone:  { main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8' },
    marble: { main: '#e8e8ec', dark: '#a0a0a8', light: '#ffffff' },
    glass:  { main: '#bcd2dc', dark: '#7a9aa8', light: '#dceaf2' },
    metal:  { main: '#a0a0a8', dark: '#5a5a60', light: '#d0d0d4' }
  },

  // ARMCHAIR (52x52)
  armchair(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'violet'];
    const s = opts.style || 'lounge';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 48, 3);
    if (s === 'wing') {
      // Tall back with wings
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y, 44, 36);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 6, y + 2, 40, 32);
      // Wings (sides)
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 8, 6, 28);
      ctx.fillRect(x + 44, y + 8, 6, 28);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 2, 40, 2);
      // Cushion
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 30, 44, 14);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 6, y + 32, 40, 10);
      // Legs
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 6, y + 44, 4, 6);
      ctx.fillRect(x + 42, y + 44, 4, 6);
    } else if (s === 'club') {
      // Low back, rounded
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 50); ctx.lineTo(x + 2, y + 18);
      ctx.quadraticCurveTo(x + 2, y + 8, x + 12, y + 8);
      ctx.lineTo(x + 40, y + 8);
      ctx.quadraticCurveTo(x + 50, y + 8, x + 50, y + 18);
      ctx.lineTo(x + 50, y + 50); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 18, 44, 30);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 4, y + 18, 44, 2);
      // Arms
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 18, 8, 30);
      ctx.fillRect(x + 42, y + 18, 8, 30);
      // Cushion
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 12, y + 28, 28, 12);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 12, y + 38, 28, 1);
    } else if (s === 'recliner') {
      // Reclined seat
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 4, 40, 30);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 8, y + 6, 36, 26);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 8, y + 6, 36, 2);
      // Armrest controls
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 4, y + 20, 4, 16);
      ctx.fillRect(x + 44, y + 20, 4, 16);
      // Footrest extended
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 36, 36, 14);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 37, 34, 12);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 9, y + 41, 34, 1);
      // Side lever
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 48, y + 28, 2, 6);
    } else { // lounge
      // Mid-century
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 4, 44, 32);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 6, y + 6, 40, 28);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 6, 40, 3);
      // Seam
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 22, 40, 1);
      // Arms thin
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 14, 4, 24);
      ctx.fillRect(x + 46, y + 14, 4, 24);
      // Splayed legs
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 4, y + 38, 3, 12);
      ctx.fillRect(x + 45, y + 38, 3, 12);
      ctx.fillRect(x + 14, y + 38, 3, 12);
      ctx.fillRect(x + 35, y + 38, 3, 12);
    }
  },

  // DINING CHAIR (32x44)
  diningChair(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const s = opts.style || 'modern';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    if (s === 'modern') {
      // Curved minimal back
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y, 24, 22);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 1, 22, 20);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 5, y + 1, 22, 1);
      // Seat
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 22, 28, 6);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 23, 26, 5);
      // Legs
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 28, 3, 14);
      ctx.fillRect(x + 25, y + 28, 3, 14);
    } else if (s === 'classic') {
      // Spindle back
      ctx.fillStyle = c.dark;
      [8, 13, 18, 23].forEach(px => ctx.fillRect(x + px, y, 2, 22));
      ctx.fillStyle = c.main;
      [8, 13, 18, 23].forEach(px => ctx.fillRect(x + px, y, 1, 22));
      // Top rail
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y, 24, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 1, 22, 2);
      // Seat
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 22, 32, 8);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 23, 30, 6);
      // Legs (turned)
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 30, 3, 12);
      ctx.fillRect(x + 25, y + 30, 3, 12);
      // Stretcher
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 7, y + 38, 18, 1);
    } else if (s === 'rattan') {
      // Woven back
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y, 24, 22);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 6, y + 2, 20, 18);
      // Weave
      ctx.fillStyle = c.dark;
      for (let yy = 4; yy < 18; yy += 2) ctx.fillRect(x + 6, y + yy, 20, 1);
      for (let xx = 7; xx < 26; xx += 3) ctx.fillRect(x + xx, y + 2, 1, 18);
      // Seat
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 22, 28, 8);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 24, 24, 5);
      // Weave on seat
      ctx.fillStyle = c.dark;
      for (let xx = 5; xx < 28; xx += 3) ctx.fillRect(x + xx, y + 24, 1, 5);
      // Legs
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 30, 3, 12);
      ctx.fillRect(x + 25, y + 30, 3, 12);
    } else if (s === 'folding') {
      // X frame
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 4, 4, 38);
      ctx.fillRect(x + 26, y + 4, 4, 38);
      // Diagonal cross
      ctx.strokeStyle = c.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 30); ctx.lineTo(x + 28, y + 4); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + 28, y + 30); ctx.stroke();
      ctx.lineWidth = 1;
      // Seat fabric
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 4, y + 18, 24, 6);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 23, 24, 1);
      // Back fabric
      ctx.fillRect(x + 4, y + 4, 24, 4);
    }
  },

  // STOOL (24x40)
  stool(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const s = opts.style || 'bar';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 38, 20, 2);
    if (s === 'bar') {
      // Tall stool with footrest
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y, 16, 6);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 1, 14, 4);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 5, y + 1, 14, 1);
      // Pole
      ctx.fillStyle = '#5a5a5e';
      ctx.fillRect(x + 11, y + 6, 2, 30);
      // Footrest ring
      ctx.fillStyle = '#7a7a80';
      ctx.fillRect(x + 5, y + 22, 14, 2);
      // Base
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 4, y + 36, 16, 2);
      ctx.fillStyle = '#5a5a60';
      ctx.beginPath(); ctx.ellipse(x + 12, y + 36, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    } else if (s === 'round') {
      // Round seat
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 12, y + 8, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 12, y + 7, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 7, y + 5, 8, 1);
      // Apron
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 10, 16, 4);
      // Legs
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 5, y + 14, 3, 24);
      ctx.fillRect(x + 16, y + 14, 3, 24);
      // Stretcher
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 8, y + 28, 8, 1);
    } else { // foot stool
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 16, 24, 16);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 17, 22, 14);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 17, 22, 2);
      // Tufting
      ctx.fillStyle = c.dark;
      [6, 12, 18].forEach(dx => ctx.fillRect(x + dx, y + 22, 1, 1));
      [6, 12, 18].forEach(dx => ctx.fillRect(x + dx, y + 26, 1, 1));
      // Legs
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 2, y + 32, 3, 6);
      ctx.fillRect(x + 19, y + 32, 3, 6);
    }
  },

  // ROUND TABLE (52x48)
  roundTable(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.material || 'wood'];
    const sz = { s: 0.75, m: 1, l: 1.2 }[opts.size || 'm'];
    const w = 44 * sz, h = 12;
    const cx = x + 26, ty = y + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(cx, y + 46, w / 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Top edge
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(cx, ty + h, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(cx, ty + h - 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2); ctx.fill();
    // Top
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(cx, ty, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.ellipse(cx, ty - 1, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
    if (opts.material === 'marble') {
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 0.5;
      [-8, 0, 6].forEach(off => {
        ctx.beginPath();
        ctx.moveTo(cx - 14, ty + off);
        ctx.bezierCurveTo(cx - 4, ty - 2 + off, cx + 4, ty + 1 + off, cx + 14, ty + off);
        ctx.stroke();
      });
      ctx.lineWidth = 1;
    } else if (opts.material === 'wood') {
      ctx.strokeStyle = c.dark;
      [0, 2 * Math.PI / 3, 4 * Math.PI / 3].forEach(a => {
        ctx.beginPath();
        ctx.ellipse(cx, ty - 1, (w / 2 - 4), (h / 2 - 2), a, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (opts.material === 'glass') {
      ctx.fillStyle = 'rgba(220,234,242,0.5)';
      ctx.beginPath(); ctx.ellipse(cx, ty - 1, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(cx - 12, ty - 4, 8, 2);
    }
    // Pedestal
    ctx.fillStyle = c.dark;
    ctx.fillRect(cx - 4, ty + h, 8, 28);
    ctx.fillStyle = c.main;
    ctx.fillRect(cx - 3, ty + h, 6, 28);
    // Base
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(cx, y + 44, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(cx, y + 43, 13, 3, 0, 0, Math.PI * 2); ctx.fill();
  },

  // CONSOLE TABLE (88x44)
  console(ctx, x, y, opts = {}, time = 0) {
    const m = this._palette[opts.material || 'wood'];
    const c = this._palette[opts.color || 'black'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 84, 2);
    // Top
    ctx.fillStyle = m.dark;
    ctx.fillRect(x, y + 2, 88, 8);
    ctx.fillStyle = m.main;
    ctx.fillRect(x + 1, y + 3, 86, 6);
    ctx.fillStyle = m.light;
    ctx.fillRect(x + 1, y + 3, 86, 2);
    if (opts.material === 'marble') {
      ctx.strokeStyle = m.dark;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 6); ctx.bezierCurveTo(x + 30, y + 4, x + 50, y + 8, x + 80, y + 5);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    // Apron
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 10, 80, 6);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 11, 78, 4);
    // Legs
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 6, y + 16, 4, 26);
    ctx.fillRect(x + 78, y + 16, 4, 26);
    // Lower shelf
    ctx.fillStyle = m.dark;
    ctx.fillRect(x + 6, y + 32, 76, 4);
    ctx.fillStyle = m.main;
    ctx.fillRect(x + 7, y + 33, 74, 2);
    // Decor on top
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 12, y - 6, 4, 8);
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 11, y - 4, 6, 2);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 50, y - 4, 16, 6);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 52, y - 2, 2, 4);
  },

  // SHELF (52x80)
  shelf(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const s = opts.style || 'bookcase';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 78, 48, 2);
    if (s === 'bookcase') {
      // Frame
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 52, 80);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 2, y + 2, 48, 76);
      // Shelves
      ctx.fillStyle = c.dark;
      [18, 38, 58].forEach(yy => ctx.fillRect(x + 2, y + yy, 48, 2));
      // Books on each shelf
      const bookColors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF', '#3acc3a', '#c41758', '#1a1a1a', '#fff'];
      [4, 22, 42, 62].forEach((yy) => {
        let bx = 4;
        while (bx < 46) {
          const w = 3 + ((bx * yy) % 3);
          const h = 12 + ((bx + yy) % 4);
          ctx.fillStyle = bookColors[(bx + yy) % 8];
          ctx.fillRect(x + bx, y + yy + 16 - h + (yy === 4 ? 14 : 0), w, h);
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(x + bx + w - 1, y + yy + 16 - h + (yy === 4 ? 14 : 0), 1, h);
          bx += w + 1;
        }
      });
    } else if (s === 'cube') {
      // Grid of cubes
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y, 52, 80);
      ctx.fillStyle = c.main;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          ctx.fillStyle = c.dark;
          ctx.fillRect(x + 2 + col * 24, y + 2 + row * 19, 22, 17);
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(x + 3 + col * 24, y + 3 + row * 19, 20, 15);
        }
      }
      // Items in cubes
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 5, y + 5, 6, 12);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 14, y + 8, 6, 9);
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(x + 30, y + 5, 8, 12);
      ctx.fillStyle = '#2979FF';
      ctx.fillRect(x + 5, y + 24, 4, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 30, y + 24, 12, 14);
    } else if (s === 'floating') {
      // 3 floating planks
      [0, 28, 56].forEach(yy => {
        ctx.fillStyle = c.dark;
        ctx.fillRect(x, y + yy, 52, 6);
        ctx.fillStyle = c.main;
        ctx.fillRect(x, y + yy, 52, 4);
        ctx.fillStyle = c.light;
        ctx.fillRect(x, y + yy, 52, 1);
        // Wall mounts
        ctx.fillStyle = c.dark;
        ctx.fillRect(x + 6, y + yy + 4, 2, 2);
        ctx.fillRect(x + 44, y + yy + 4, 2, 2);
      });
      // Items on shelves
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(x + 8, y - 8, 8, 8);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 10, y - 4, 4, 4);
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 30, y - 6, 4, 6);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 12, y + 22, 8, 6);
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(x + 26, y + 18, 4, 10);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 40, y + 50, 6, 6);
    } else if (s === 'ladder') {
      // Tilted ladder shelves
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y, 4, 80);
      ctx.fillRect(x + 46, y, 4, 80);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 1, 2, 78);
      ctx.fillRect(x + 47, y + 1, 2, 78);
      // 4 platforms — narrowing
      [60, 42, 24, 6].forEach((yy, i) => {
        const w = 38 + i * 4;
        const xOff = (52 - w) / 2;
        ctx.fillStyle = c.dark;
        ctx.fillRect(x + xOff, y + yy, w, 4);
        ctx.fillStyle = c.main;
        ctx.fillRect(x + xOff, y + yy, w, 2);
      });
      // Items
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 12, y + 56, 4, 4);
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(x + 30, y + 38, 6, 4);
    }
  },

  // WARDROBE (60x96)
  wardrobe(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const s = opts.style || 'double';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 94, 56, 2);
    // Frame
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 60, 96);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 2, 56, 92);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 2, y + 2, 56, 2);
    if (s === 'single') {
      // One door
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 4, 52, 88);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 5, 50, 86);
      // Panels
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 10, 44, 36);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 11, 42, 34);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 50, 44, 36);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 51, 42, 34);
      // Handle
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 50, y + 44, 2, 8);
    } else if (s === 'double') {
      // Two doors
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 4, 25, 88);
      ctx.fillRect(x + 31, y + 4, 25, 88);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 5, 23, 86);
      ctx.fillRect(x + 32, y + 5, 23, 86);
      // Panels
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 10, 17, 76);
      ctx.fillRect(x + 35, y + 10, 17, 76);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 9, y + 11, 15, 74);
      ctx.fillRect(x + 36, y + 11, 15, 74);
      // Handles
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 25, y + 46, 2, 6);
      ctx.fillRect(x + 33, y + 46, 2, 6);
    } else if (s === 'sliding') {
      // Two overlapping panels with grooves
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 4, 28, 88);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 5, 26, 86);
      // Mirror panel right
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 28, y + 4, 28, 88);
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 30, y + 6, 24, 84);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 32, y + 8, 4, 30);
      // Track top/bottom
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 4, 52, 2);
      ctx.fillRect(x + 4, y + 90, 52, 2);
      // Recessed pulls
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 26, y + 46, 4, 4);
    }
  },

  // OTTOMAN (40x32)
  ottoman(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const s = opts.shape || 'round';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    if (s === 'round') {
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 20, y + 20, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 20, y + 18, 17, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.beginPath(); ctx.ellipse(x + 20, y + 16, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
      // Tufts
      ctx.fillStyle = c.dark;
      [[14, 16], [20, 14], [26, 16], [16, 20], [24, 20]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx, y + dy, 1, 1);
      });
      // Legs
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 6, y + 26, 3, 6);
      ctx.fillRect(x + 30, y + 26, 3, 6);
      ctx.fillRect(x + 12, y + 28, 3, 4);
      ctx.fillRect(x + 24, y + 28, 3, 4);
    } else if (s === 'square') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 8, 36, 22);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 9, 34, 20);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 9, 34, 3);
      // Tufts grid
      ctx.fillStyle = c.dark;
      [10, 20, 30].forEach(dx => {
        [16, 22].forEach(dy => ctx.fillRect(x + dx, y + dy, 1, 1));
      });
      // Legs
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 4, y + 28, 3, 4);
      ctx.fillRect(x + 33, y + 28, 3, 4);
    } else if (s === 'storage') {
      // Box
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 4, 36, 26);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 5, 34, 24);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 5, 34, 3);
      // Lid line
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 3, y + 12, 34, 1);
      // Quilting
      ctx.fillStyle = c.dark;
      [12, 20, 28].forEach(dx => ctx.fillRect(x + dx, y + 16, 1, 12));
      // Legs
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 4, y + 28, 3, 4);
      ctx.fillRect(x + 33, y + 28, 3, 4);
    }
  },

  // TV STAND (88x40)
  tvStand(ctx, x, y, opts = {}, time = 0) {
    const m = this._palette[opts.material || 'wood'];
    const c = this._palette[opts.color || 'black'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 84, 2);
    // Top
    ctx.fillStyle = m.dark;
    ctx.fillRect(x, y, 88, 6);
    ctx.fillStyle = m.main;
    ctx.fillRect(x + 1, y + 1, 86, 4);
    ctx.fillStyle = m.light;
    ctx.fillRect(x + 1, y + 1, 86, 1);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 6, 84, 32);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 7, 82, 30);
    // Drawers
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 10, 26, 12);
    ctx.fillRect(x + 4, y + 24, 26, 12);
    ctx.fillRect(x + 60, y + 10, 24, 12);
    ctx.fillRect(x + 60, y + 24, 24, 12);
    // Center cabinet (open with media)
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 32, y + 10, 26, 26);
    if (opts.material === 'glass') {
      ctx.fillStyle = 'rgba(220,234,242,0.3)';
      ctx.fillRect(x + 4, y + 10, 26, 26);
      ctx.fillRect(x + 60, y + 10, 24, 26);
    }
    // Drawer handles
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 14, y + 15, 6, 1);
    ctx.fillRect(x + 14, y + 29, 6, 1);
    ctx.fillRect(x + 68, y + 15, 6, 1);
    ctx.fillRect(x + 68, y + 29, 6, 1);
    // Media stack inside
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 34, y + 14, 22, 4);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 35, y + 16, 1, 1);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 34, y + 22, 22, 4);
    // Cable management
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 44, y + 28, 2, 8);
    // Legs
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 36, 4, 2);
    ctx.fillRect(x + 80, y + 36, 4, 2);
  },

  // SIDE TABLE (32x44)
  sideTable(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const s = opts.style || 'square';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    if (s === 'round') {
      // Round top
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 8, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 7, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 7, y + 4, 8, 1);
      // Single pedestal
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 14, y + 12, 4, 28);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 15, y + 12, 2, 28);
      // Tripod base
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 6, y + 38, 20, 4);
      ctx.fillRect(x + 4, y + 40, 24, 2);
    } else if (s === 'square') {
      // Square top
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 2, 32, 8);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 3, 30, 6);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 3, 30, 2);
      // Drawer
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 12, 28, 8);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 13, 26, 6);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 14, y + 16, 4, 2);
      // Legs
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 20, 3, 22);
      ctx.fillRect(x + 25, y + 20, 3, 22);
    } else if (s === 'tray') {
      // Tray with raised lip
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 4, 32, 8);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 2, y + 6, 28, 4);
      // Handles
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 4, 2, 8);
      ctx.fillRect(x + 30, y + 4, 2, 8);
      // X-frame legs
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 12); ctx.lineTo(x + 28, y + 42); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 12); ctx.lineTo(x + 4, y + 42); ctx.stroke();
      ctx.lineWidth = 1;
    } else if (s === 'nesting') {
      // Two visible nesting tables
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 14, 22, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 14, 20, 3);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 18, 2, 14);
      ctx.fillRect(x + 18, y + 18, 2, 14);
      // Smaller in front
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 12, y + 22, 20, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 13, y + 22, 18, 3);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 14, y + 26, 2, 16);
      ctx.fillRect(x + 28, y + 26, 2, 16);
    }
  }
};

if (typeof module !== 'undefined') module.exports = FURNITURE_PLUS;
