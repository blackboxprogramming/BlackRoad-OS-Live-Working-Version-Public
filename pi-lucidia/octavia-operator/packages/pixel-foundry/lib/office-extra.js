// PIXEL FOUNDRY — OFFICE EXTRA
// printer, stapler, calculator, stickyNote, paperclip, notebook, penHolder, mousepad, foldingFile, hourglass

const OFFICE_EXTRA = {
  AXES: {
    stapler:    { color: ['pink','amber','violet','blue','black','red'] },
    stickyNote: { color: ['pink','amber','violet','blue','green','white'] },
    notebook:   { color: ['pink','amber','violet','blue','black','wood'] },
    penHolder:  { color: ['pink','amber','violet','blue','black','white'] },
    mousepad:   { pattern: ['plain','grid','gradient','checker'], color: ['pink','amber','violet','blue','black','white'] },
    hourglass:  { sand: ['pink','amber','violet','blue','white'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' },
    red:    { main: '#c41758', dark: '#7a0a28', light: '#FF1D6C' },
    green:  { main: '#3acc3a', dark: '#2a8a2a', light: '#7acc7a' }
  },

  // PRINTER (48x36)
  printer(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 44, 2);
    // Body
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 2, y + 8, 44, 26);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 3, y + 9, 42, 24);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 3, y + 9, 42, 2);
    // Top
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 4, 48, 6);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 1, y + 5, 46, 4);
    // Display
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 6, y + 12, 14, 8);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 8, y + 14, 4, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 14, y + 14, 4, 2);
    ctx.fillRect(x + 14, y + 17, 4, 1);
    // Buttons
    ['#FF1D6C', '#3acc3a', '#F5A623'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x + 26 + i * 6, y + 16, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 25 + i * 6, y + 15, 1, 1);
    });
    // Paper output slot
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 26, 36, 4);
    // Paper sticking out
    if (Math.floor(time / 30) % 2) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 8, y + 28, 32, 6);
      ctx.fillStyle = '#1a1a1a';
      [10, 14, 22, 28, 36].forEach(px => ctx.fillRect(x + px, y + 30, 4, 1));
      ctx.fillRect(x + 12, y + 32, 24, 1);
    }
    // Paper tray top
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 14, y, 20, 6);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 15, y + 1, 18, 4);
  },

  // STAPLER (44x16)
  stapler(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'red'];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 14, 36, 2);
    // Base
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 10, 40, 4);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 11, 38, 2);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 11, 38, 1);
    // Top arm — angled
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 10); ctx.lineTo(x + 40, y + 10);
    ctx.lineTo(x + 38, y + 4); ctx.lineTo(x + 6, y + 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 9); ctx.lineTo(x + 39, y + 9);
    ctx.lineTo(x + 37, y + 5); ctx.lineTo(x + 7, y + 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 8, y + 6, 30, 1);
    // Hinge
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 38, y + 8, 4, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 39, y + 9, 2, 2);
    // Front anvil
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 10, 4, 4);
  },

  // CALCULATOR (32x44)
  calculator(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    // Body
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x, y, 32, 44);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 1, y + 1, 30, 42);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 1, y + 1, 30, 2);
    // Display
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 3, y + 4, 26, 10);
    ctx.fillStyle = '#3acc3a';
    // Digit display
    [4, 8, 12, 16, 20].forEach(dx => ctx.fillRect(x + 4 + dx, y + 6, 4, 6));
    // Solar strip
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 22, y + 6, 6, 6);
    ctx.fillStyle = '#5a9fff';
    ctx.fillRect(x + 23, y + 7, 4, 4);
    // Buttons (5 rows × 4 cols)
    const buttons = [
      ['#FF1D6C', '#F5A623', '#F5A623', '#F5A623'],
      ['#5a5a60', '#5a5a60', '#5a5a60', '#F5A623'],
      ['#5a5a60', '#5a5a60', '#5a5a60', '#F5A623'],
      ['#5a5a60', '#5a5a60', '#5a5a60', '#F5A623'],
      ['#5a5a60', '#5a5a60', '#5a5a60', '#3acc3a']
    ];
    buttons.forEach((row, ri) => {
      row.forEach((c, ci) => {
        ctx.fillStyle = c;
        ctx.fillRect(x + 3 + ci * 7, y + 16 + ri * 5, 5, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 3 + ci * 7, y + 19 + ri * 5, 5, 1);
      });
    });
  },

  // STICKY NOTE (32x32)
  stickyNote(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 26, 2);
    // Note
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 2, 28, 28);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 3, 26, 26);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 3, 26, 2);
    // Curl corner
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 24); ctx.lineTo(x + 30, y + 30);
    ctx.lineTo(x + 24, y + 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 24); ctx.lineTo(x + 30, y + 28);
    ctx.lineTo(x + 26, y + 30); ctx.lineTo(x + 24, y + 30);
    ctx.closePath(); ctx.fill();
    // Handwritten lines
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 6, y + 9, 18, 1);
    ctx.fillRect(x + 6, y + 13, 14, 1);
    ctx.fillRect(x + 6, y + 17, 16, 1);
    ctx.fillRect(x + 6, y + 21, 12, 1);
    // Pin
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 16, y + 4, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 15, y + 3, 1, 1);
  },

  // PAPERCLIP (24x32)
  paperclip(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 4, y + 30, 16, 2);
    // Outer loop
    ctx.strokeStyle = '#a0a0a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 28);
    ctx.lineTo(x + 4, y + 6);
    ctx.quadraticCurveTo(x + 4, y, x + 12, y);
    ctx.quadraticCurveTo(x + 20, y, x + 20, y + 6);
    ctx.lineTo(x + 20, y + 24);
    ctx.quadraticCurveTo(x + 20, y + 28, x + 16, y + 28);
    ctx.lineTo(x + 16, y + 8);
    ctx.quadraticCurveTo(x + 16, y + 4, x + 12, y + 4);
    ctx.quadraticCurveTo(x + 8, y + 4, x + 8, y + 8);
    ctx.lineTo(x + 8, y + 28);
    ctx.stroke();
    ctx.strokeStyle = '#d0d0d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 28);
    ctx.lineTo(x + 4, y + 6);
    ctx.quadraticCurveTo(x + 4, y, x + 12, y);
    ctx.quadraticCurveTo(x + 20, y, x + 20, y + 6);
    ctx.stroke();
  },

  // NOTEBOOK (32x44)
  notebook(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    // Cover
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y, 28, 42);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 1, 26, 40);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 1, 26, 2);
    // Spiral binding
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y, 4, 42);
    [3, 8, 13, 18, 23, 28, 33, 38].forEach(yy => {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(x + 2, y + yy, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a7a80';
      ctx.beginPath(); ctx.arc(x + 2, y + yy, 1, 0, Math.PI * 2); ctx.fill();
    });
    // Label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7, y + 8, 18, 10);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 9, y + 11, 14, 1);
    ctx.fillRect(x + 9, y + 14, 10, 1);
    // Logo/decoration
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 12, y + 24, 8, 8);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 26, 4, 4);
    // Bookmark
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 22, y, 3, 12);
  },

  // PEN HOLDER (32x36)
  penHolder(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 28, 2);
    // Cup
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 12, 24, 22);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 13, 22, 20);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 5, y + 13, 22, 2);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 5, y + 30, 22, 1);
    // Pens sticking up
    const pens = [
      { x: 7, color: '#FF1D6C', h: 14 },
      { x: 11, color: '#F5A623', h: 16 },
      { x: 15, color: '#9C27B0', h: 12 },
      { x: 19, color: '#2979FF', h: 18 },
      { x: 23, color: '#3acc3a', h: 14 }
    ];
    pens.forEach(p => {
      // Pen body
      ctx.fillStyle = p.color;
      ctx.fillRect(x + p.x, y + 12 - p.h, 2, p.h);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + p.x + 1, y + 12 - p.h, 1, p.h);
      // Tip
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + p.x, y + 12 - p.h, 2, 1);
    });
    // Pencil among them
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 25, y - 4, 2, 16);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 25, y - 6, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 25, y - 7, 2, 1);
  },

  // MOUSEPAD (52x32)
  mousepad(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    const pattern = opts.pattern || 'plain';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 48, 2);
    // Pad
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 2, 52, 28);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 3, 50, 26);
    if (pattern === 'grid') {
      ctx.fillStyle = c.dark;
      for (let xx = 5; xx < 52; xx += 5) ctx.fillRect(x + xx, y + 3, 1, 26);
      for (let yy = 8; yy < 30; yy += 5) ctx.fillRect(x + 1, y + yy, 50, 1);
    } else if (pattern === 'gradient') {
      const grd = ctx.createLinearGradient(x, y, x + 52, y);
      grd.addColorStop(0, '#FF1D6C');
      grd.addColorStop(0.5, '#9C27B0');
      grd.addColorStop(1, '#2979FF');
      ctx.fillStyle = grd;
      ctx.fillRect(x + 1, y + 3, 50, 26);
    } else if (pattern === 'checker') {
      for (let xx = 0; xx < 50; xx += 5) for (let yy = 0; yy < 26; yy += 5) {
        ctx.fillStyle = ((xx + yy) / 5) & 1 ? c.dark : c.main;
        ctx.fillRect(x + 1 + xx, y + 3 + yy, 5, 5);
      }
    }
    // Logo
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 38, y + 22, 8, 4);
    // Mouse on pad
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 16, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 11, y + 16, 10, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 16, y + 12, 1, 6);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 14, y + 18, 4, 1);
  },

  // FOLDING FILE (40x36)
  foldingFile(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Main body
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 2, y + 8, 36, 26);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 3, y + 9, 34, 24);
    // Tabs
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6, y + 4, 8, 6);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 16, y + 4, 8, 6);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(x + 26, y + 4, 8, 6);
    // Tab labels
    ctx.fillStyle = '#fff';
    [9, 19, 29].forEach(px => ctx.fillRect(x + px, y + 6, 2, 2));
    // Papers peeking
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 12, 28, 4);
    ctx.fillRect(x + 6, y + 18, 28, 4);
    ctx.fillRect(x + 6, y + 24, 28, 4);
    ctx.fillStyle = '#1a1a1a';
    [13, 19, 25].forEach(yy => {
      ctx.fillRect(x + 8, y + yy, 12, 1);
      ctx.fillRect(x + 22, y + yy, 8, 1);
    });
    // Front fold line
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 2, y + 30, 36, 1);
  },

  // HOURGLASS (32x44)
  hourglass(ctx, x, y, opts = {}, time = 0) {
    const c = { pink:'#FF1D6C', amber:'#F5A623', violet:'#9C27B0', blue:'#2979FF', white:'#f0f0f0' }[opts.sand || 'amber'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    // Frame top
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 2, y, 28, 4);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 3, y + 1, 26, 2);
    // Frame bottom
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 2, y + 38, 28, 4);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 3, y + 39, 26, 2);
    // Glass top half
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 4); ctx.lineTo(x + 26, y + 4);
    ctx.lineTo(x + 18, y + 21); ctx.lineTo(x + 14, y + 21);
    ctx.closePath(); ctx.fill();
    // Glass bottom half
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 38); ctx.lineTo(x + 26, y + 38);
    ctx.lineTo(x + 18, y + 21); ctx.lineTo(x + 14, y + 21);
    ctx.closePath(); ctx.fill();
    // Outline
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 4); ctx.lineTo(x + 26, y + 4);
    ctx.lineTo(x + 18, y + 21); ctx.lineTo(x + 14, y + 21);
    ctx.closePath();
    ctx.moveTo(x + 6, y + 38); ctx.lineTo(x + 26, y + 38);
    ctx.lineTo(x + 18, y + 21); ctx.lineTo(x + 14, y + 21);
    ctx.closePath();
    ctx.stroke();
    // Sand top (decreases over time)
    const drain = (time / 4) % 80;
    const topHeight = Math.max(0, 14 - drain * 0.15);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 6 + (14 - topHeight) * 0.7, y + 4 + (14 - topHeight));
    ctx.lineTo(x + 26 - (14 - topHeight) * 0.7, y + 4 + (14 - topHeight));
    ctx.lineTo(x + 18, y + 21); ctx.lineTo(x + 14, y + 21);
    ctx.closePath(); ctx.fill();
    // Sand falling
    if (topHeight > 0) {
      ctx.fillStyle = c;
      ctx.fillRect(x + 15, y + 21, 2, 16);
    }
    // Sand bottom (grows)
    const bottomHeight = Math.min(14, drain * 0.15);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 21); ctx.lineTo(x + 18, y + 21);
    ctx.lineTo(x + 18 + bottomHeight * 0.7, y + 38 - bottomHeight + 17);
    ctx.lineTo(x + 14 - bottomHeight * 0.7, y + 38 - bottomHeight + 17);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 38); ctx.lineTo(x + 26, y + 38);
    ctx.lineTo(x + 26 - bottomHeight * 0.7, y + 38 - bottomHeight);
    ctx.lineTo(x + 6 + bottomHeight * 0.7, y + 38 - bottomHeight);
    ctx.closePath(); ctx.fill();
    // Frame pillars
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 4, y + 4, 2, 34);
    ctx.fillRect(x + 26, y + 4, 2, 34);
  }
};

if (typeof module !== 'undefined') module.exports = OFFICE_EXTRA;
