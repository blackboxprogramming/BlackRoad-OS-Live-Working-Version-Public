// PIXEL FOUNDRY — KITCHEN EXTRA
// blender, kettle, dishwasher, mixer, knifeBlock, cuttingBoard, pot, pan, cookbook, spiceRack

const KITCHEN_EXTRA = {
  AXES: {
    blender:    { color: ['pink','amber','violet','blue','black','white'], state: ['off','blending'] },
    kettle:     { color: ['pink','amber','violet','blue','black','white'], state: ['idle','boiling'] },
    pot:        { color: ['pink','amber','violet','blue','black','stone'], lid: ['on','off'] },
    pan:        { kind: ['frying','wok','saute'], color: ['black','stone'] },
    spiceRack:  { color: ['white','black','wood'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    stone:  { main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8' }
  },

  // BLENDER (32x52)
  blender(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const blending = opts.state === 'blending';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 28, 2);
    // Base
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 36, 28, 14);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 37, 26, 12);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 37, 26, 1);
    // Buttons
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 43, 4, 4);
    ctx.fillRect(x + 12, y + 43, 4, 4);
    ctx.fillRect(x + 18, y + 43, 4, 4);
    ctx.fillStyle = blending ? '#3acc3a' : '#0a3a14';
    ctx.fillRect(x + 24, y + 43, 4, 4);
    // Jug
    ctx.fillStyle = 'rgba(220,234,242,0.3)';
    ctx.fillRect(x + 6, y + 8, 20, 28);
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 8, 20, 28);
    // Tick marks
    ctx.fillStyle = '#5a5a60';
    [14, 20, 26].forEach(yy => ctx.fillRect(x + 7, y + yy, 3, 1));
    // Contents
    if (blending) {
      const swirl = (time / 4) % (Math.PI * 2);
      ctx.save();
      ctx.beginPath(); ctx.rect(x + 7, y + 12, 18, 23); ctx.clip();
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 7, y + 12, 18, 23);
      ctx.fillStyle = '#ff5a90';
      [0, 1, 2, 3].forEach(i => {
        const a = swirl + (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(x + 16 + Math.cos(a) * 6, y + 22 + Math.sin(a) * 4, 4, 2, a, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#fff';
      [16, 20, 12].forEach((dx, i) => {
        ctx.fillRect(x + dx, y + 14 + (i * 4 + (time / 4) % 8), 1, 1);
      });
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(255,29,108,0.4)';
      ctx.fillRect(x + 7, y + 24, 18, 11);
    }
    // Handle
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 26, y + 14, 4, 16);
    // Lid
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 4, 24, 4);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 5, 22, 2);
    // Knob
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 14, y, 4, 4);
  },

  // KETTLE (40x44)
  kettle(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const boiling = opts.state === 'boiling';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 42, 32, 2);
    // Base
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 4, y + 38, 32, 4);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 4, y + 38, 32, 1);
    // Body
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 38); ctx.lineTo(x + 6, y + 16);
    ctx.quadraticCurveTo(x + 6, y + 8, x + 14, y + 8);
    ctx.lineTo(x + 26, y + 8);
    ctx.quadraticCurveTo(x + 34, y + 8, x + 34, y + 16);
    ctx.lineTo(x + 34, y + 38);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 38); ctx.lineTo(x + 8, y + 16);
    ctx.quadraticCurveTo(x + 8, y + 10, x + 14, y + 10);
    ctx.lineTo(x + 26, y + 10);
    ctx.quadraticCurveTo(x + 32, y + 10, x + 32, y + 16);
    ctx.lineTo(x + 32, y + 38);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 8, y + 12, 4, 12);
    // Handle
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x + 20, y + 4, 8, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    // Spout
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 14); ctx.lineTo(x + 38, y + 8);
    ctx.lineTo(x + 36, y + 6); ctx.lineTo(x + 30, y + 12);
    ctx.closePath(); ctx.fill();
    // Light
    ctx.fillStyle = boiling ? (Math.floor(time / 10) % 2 ? '#FF1D6C' : '#3a0a14') : '#3a3a3e';
    ctx.fillRect(x + 18, y + 32, 4, 2);
    // Steam
    if (boiling && Math.floor(time / 6) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 36, y + 4 - (time % 4), 2, 2);
      ctx.fillRect(x + 38, y + 2 - (time % 6), 2, 2);
      ctx.fillRect(x + 40, y - (time % 8), 2, 2);
    }
  },

  // DISHWASHER (52x60)
  dishwasher(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 58, 48, 2);
    // Body
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y, 52, 60);
    ctx.fillStyle = '#c0c0c4';
    ctx.fillRect(x + 1, y + 1, 50, 58);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 1, y + 1, 50, 4);
    // Door
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 4, y + 8, 44, 48);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 5, y + 9, 42, 46);
    // Window
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 8, y + 12, 36, 30);
    ctx.fillStyle = 'rgba(122,200,234,0.3)';
    ctx.fillRect(x + 9, y + 13, 34, 28);
    // Plates inside
    ctx.fillStyle = '#fff';
    [14, 22, 30, 38].forEach(px => ctx.fillRect(x + px, y + 22, 4, 18));
    ctx.fillStyle = '#e8e8e8';
    [14, 22, 30, 38].forEach(px => ctx.fillRect(x + px, y + 38, 4, 1));
    // Handle
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 14, y + 46, 24, 4);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 14, y + 46, 24, 1);
    // Display
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 4, y, 44, 6);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 8, y + 2, 8, 2);
    ctx.fillStyle = Math.floor(time / 20) % 2 ? '#FF1D6C' : '#3a0a14';
    ctx.fillRect(x + 40, y + 2, 4, 2);
  },

  // STAND MIXER (40x52)
  mixer(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 36, 2);
    // Base
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 2, y + 38, 36, 12);
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 3, y + 39, 34, 10);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 3, y + 47, 34, 2);
    // Bowl
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 38); ctx.lineTo(x + 8, y + 28);
    ctx.quadraticCurveTo(x + 20, y + 22, x + 32, y + 28);
    ctx.lineTo(x + 32, y + 38);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 9, y + 28, 22, 1);
    // Body upper
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 10, y + 12, 28, 18);
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 11, y + 13, 26, 16);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 11, y + 27, 26, 2);
    // Pivot
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 6, y + 14, 8, 8);
    // Whisk attachment (spinning)
    ctx.strokeStyle = '#a0a0a8';
    ctx.lineWidth = 1;
    const spin = time / 3;
    for (let i = 0; i < 5; i++) {
      const a = spin + (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 30);
      ctx.bezierCurveTo(x + 20 + Math.cos(a) * 4, y + 32, x + 20 + Math.cos(a) * 6, y + 36, x + 20 + Math.cos(a) * 4, y + 38);
      ctx.stroke();
    }
    // Logo
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 22, y + 18, 4, 4);
    // Knob
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 35, y + 20, 2, 0, Math.PI * 2); ctx.fill();
  },

  // KNIFE BLOCK (32x40)
  knifeBlock(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 28, 2);
    // Block
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 4, y + 8, 24, 30);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 5, y + 9, 22, 28);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 5, y + 9, 22, 2);
    // Slots
    ctx.fillStyle = '#1a0e08';
    [8, 12, 16, 20, 24].forEach(px => ctx.fillRect(x + px, y + 10, 2, 4));
    // Knives
    const knives = [
      { x: 8, len: 14, w: 4 },
      { x: 12, len: 12, w: 3 },
      { x: 16, len: 10, w: 3 },
      { x: 20, len: 8, w: 2 },
      { x: 24, len: 6, w: 2 }
    ];
    knives.forEach(k => {
      // Handle
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + k.x, y + 8 - k.len, k.w, 6);
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + k.x, y + 8 - k.len, k.w, 1);
      // Blade
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + k.x, y + 8 - k.len + 6, k.w, k.len - 6);
      ctx.fillStyle = '#d0d0d4';
      ctx.fillRect(x + k.x, y + 8 - k.len + 6, 1, k.len - 6);
    });
  },

  // CUTTING BOARD (52x32)
  cuttingBoard(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 44, 2);
    // Board
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 2, y + 4, 48, 26);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 2, y + 4, 48, 24);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 2, y + 4, 48, 1);
    // Wood grain
    ctx.fillStyle = '#a67c3d';
    [8, 16, 24, 32, 40].forEach(yy => ctx.fillRect(x + 4, y + yy, 44, 1));
    // Handle hole
    ctx.fillStyle = '#1a0e08';
    ctx.beginPath(); ctx.arc(x + 46, y + 16, 2, 0, Math.PI * 2); ctx.fill();
    // Vegetables on board
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 16, y + 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 14, y + 10, 4, 4);
    // Slices
    ctx.fillStyle = '#FF5A90';
    [22, 26, 30].forEach(px => ctx.beginPath());
    [22, 26, 30].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 18, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#fff';
    [22, 26, 30].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 18, 1, 0, Math.PI * 2); ctx.fill();
    });
    // Knife
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 36, y + 12, 12, 3);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 36, y + 13, 12, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 33, y + 11, 4, 5);
  },

  // POT (44x36)
  pot(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'stone'];
    const lid = (opts.lid || 'on') === 'on';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 34, 36, 2);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 14, 36, 20);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 15, 34, 18);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 5, y + 15, 34, 2);
    // Handles
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 18, 4, 4);
    ctx.fillRect(x + 40, y + 18, 4, 4);
    // Lid
    if (lid) {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, y + 10, 40, 6);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 3, y + 11, 38, 4);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 3, y + 11, 38, 1);
      // Knob
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 20, y + 6, 4, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 21, y + 7, 2, 2);
      // Steam
      if (Math.floor(time / 8) % 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 16, y + 2 - (time % 4), 2, 2);
        ctx.fillRect(x + 22, y - (time % 6), 2, 2);
        ctx.fillRect(x + 28, y + 2 - (time % 5), 2, 2);
      }
    } else {
      // Open — show contents
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.ellipse(x + 22, y + 16, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.ellipse(x + 22, y + 14, 14, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a90';
      [12, 18, 24, 30].forEach(px => {
        ctx.beginPath(); ctx.arc(x + px, y + 14, 1.5, 0, Math.PI * 2); ctx.fill();
      });
      // Steam
      if (Math.floor(time / 6) % 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 14, y + 8 - (time % 4), 2, 2);
        ctx.fillRect(x + 24, y + 6 - (time % 5), 2, 2);
        ctx.fillRect(x + 30, y + 4 - (time % 6), 2, 2);
      }
    }
  },

  // PAN (52x36)
  pan(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    const kind = opts.kind || 'frying';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 34, 32, 2);
    if (kind === 'frying') {
      // Round pan
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 18, y + 22, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 18, y + 20, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 18, 24, 1);
      // Egg cooking
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 16, y + 20, 2, 0, Math.PI * 2); ctx.fill();
      // Handle
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 32, y + 18, 20, 4);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 32, y + 19, 20, 2);
    } else if (kind === 'wok') {
      // Deep curved pan
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.ellipse(x + 18, y + 24, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.ellipse(x + 18, y + 22, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 18, 24, 1);
      // Stir-fry contents
      ctx.fillStyle = '#3acc3a';
      [[12, 22], [20, 22], [16, 24]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 2, 2));
      ctx.fillStyle = '#FF1D6C';
      [[14, 24], [22, 24]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 2, 2));
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 18, y + 22, 2, 2);
      // Handle
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 32, y + 22, 20, 3);
      ctx.fillRect(x + 0, y + 22, 4, 3);
    } else if (kind === 'saute') {
      // Tall sided pan
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 14, 28, 14);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 15, 26, 12);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 5, y + 15, 26, 2);
      // Contents
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 6, y + 22, 24, 4);
      // Handle
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 32, y + 18, 20, 4);
    }
  },

  // COOKBOOK (40x32)
  cookbook(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Cover
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 2, y + 4, 36, 26);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 3, y + 5, 34, 24);
    // Spine binding
    ctx.fillStyle = '#7a0a28';
    ctx.fillRect(x, y + 4, 4, 26);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 1, y + 5, 2, 24);
    // Title
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 8, y + 8, 24, 4);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 10, y + 9, 4, 2);
    ctx.fillRect(x + 16, y + 9, 4, 2);
    ctx.fillRect(x + 22, y + 9, 4, 2);
    // Illustration
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 14, 24, 12);
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 20, y + 20, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 20, y + 20, 3, 0, Math.PI * 2); ctx.fill();
    // Bookmark
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 30, y + 4, 3, 14);
    // Pages edge
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 38, y + 5, 2, 24);
    ctx.fillStyle = '#e8e8e8';
    [8, 14, 20, 26].forEach(yy => ctx.fillRect(x + 38, y + yy, 2, 1));
  },

  // SPICE RACK (52x40)
  spiceRack(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 48, 2);
    // Frame
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 52, 40);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 1, 50, 38);
    // Shelves
    ctx.fillStyle = c.dark;
    [12, 26].forEach(yy => ctx.fillRect(x + 1, y + yy, 50, 2));
    // Jars row 1
    ['#FF1D6C', '#F5A623', '#9C27B0', '#3acc3a', '#5a3a1a'].forEach((col, i) => {
      const jx = x + 4 + i * 10;
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(jx, y + 4, 6, 8);
      ctx.fillStyle = 'rgba(220,234,242,0.6)';
      ctx.fillRect(jx + 1, y + 5, 4, 6);
      ctx.fillStyle = col;
      ctx.fillRect(jx + 1, y + 6, 4, 5);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(jx + 1, y + 4, 4, 1);
    });
    // Jars row 2
    ['#F5A623', '#FF1D6C', '#3acc3a', '#9C27B0', '#fff'].forEach((col, i) => {
      const jx = x + 4 + i * 10;
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(jx, y + 16, 6, 8);
      ctx.fillStyle = 'rgba(220,234,242,0.6)';
      ctx.fillRect(jx + 1, y + 17, 4, 6);
      ctx.fillStyle = col;
      ctx.fillRect(jx + 1, y + 18, 4, 5);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(jx + 1, y + 16, 4, 1);
    });
    // Jars row 3
    ['#9C27B0', '#3acc3a', '#FF1D6C', '#5a3a1a', '#F5A623'].forEach((col, i) => {
      const jx = x + 4 + i * 10;
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(jx, y + 30, 6, 8);
      ctx.fillStyle = 'rgba(220,234,242,0.6)';
      ctx.fillRect(jx + 1, y + 31, 4, 6);
      ctx.fillStyle = col;
      ctx.fillRect(jx + 1, y + 32, 4, 5);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(jx + 1, y + 30, 4, 1);
    });
  }
};

if (typeof module !== 'undefined') module.exports = KITCHEN_EXTRA;
