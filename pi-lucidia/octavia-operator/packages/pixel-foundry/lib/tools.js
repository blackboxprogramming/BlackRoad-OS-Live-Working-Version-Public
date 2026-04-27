// PIXEL FOUNDRY — TOOLS (with axes)
// hammer, screwdriver, wrench, drill, saw, paintbrush, scissors, ruler, pencil, microscope, beaker, telescope

const TOOLS = {
  AXES: {
    hammer:      { color: ['pink','amber','violet','blue','black','wood'] },
    screwdriver: { color: ['pink','amber','violet','blue','white','black'], head: ['flat','phillips'] },
    wrench:      { color: ['amber','blue','black','stone'], size: ['s','m','l'] },
    drill:       { color: ['pink','amber','violet','blue','black'] },
    paintbrush:  { color: ['pink','amber','violet','blue','white','black'], paint: ['none','pink','amber','violet','blue'] },
    scissors:    { color: ['pink','amber','violet','blue','black'] },
    pencil:      { color: ['amber','pink','blue','green','black'] },
    beaker:      { liquid: ['pink','amber','violet','blue','green'], state: ['still','bubbling'] }
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
    green:  { main: '#3acc3a', dark: '#2a8a2a', light: '#7acc7a' }
  },

  // HAMMER (32x36)
  hammer(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    // Handle
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 13, y + 12, 6, 22);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 14, y + 12, 4, 22);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 13, y + 32, 6, 4);
    // Head
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 4, 24, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 5, 22, 10);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 5, y + 5, 22, 2);
    // Claw
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 6, 4, 8);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 8, 3, 4);
  },

  // SCREWDRIVER (32x32)
  screwdriver(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    // Handle
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 4, 14, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 5, 12, 10);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 5, y + 5, 12, 2);
    // Grip lines
    ctx.fillStyle = c.dark;
    [7, 9, 11, 13].forEach(yy => ctx.fillRect(x + 5, y + yy, 12, 1));
    // Shaft
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 17, y + 8, 10, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 17, y + 9, 10, 2);
    // Tip
    ctx.fillStyle = '#3a3a3e';
    if (opts.head === 'phillips') {
      ctx.fillRect(x + 27, y + 7, 4, 6);
      ctx.fillStyle = '#7a7a80';
      ctx.fillRect(x + 28, y + 9, 2, 2);
      ctx.fillRect(x + 27, y + 9, 4, 1);
      ctx.fillRect(x + 28, y + 7, 2, 6);
    } else {
      ctx.fillRect(x + 27, y + 7, 5, 6);
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + 27, y + 8, 5, 1);
    }
  },

  // WRENCH (40x16)
  wrench(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'stone'];
    const sz = { s: 0.8, m: 1, l: 1.2 }[opts.size || 'm'];
    const w = 36 * sz;
    // Handle
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 8, y + 6, w - 16, 4);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 8, y + 7, w - 16, 2);
    // Heads
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 2, 10, 12);
    ctx.fillRect(x + w - 12, y + 2, 10, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 3, 8, 10);
    ctx.fillRect(x + w - 11, y + 3, 8, 10);
    // Jaw cutouts
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 5, y + 4, 4, 4);
    ctx.fillRect(x + w - 9, y + 8, 4, 4);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 3, y + 3, 8, 1);
    ctx.fillRect(x + w - 11, y + 3, 8, 1);
  },

  // DRILL (40x32)
  drill(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 4, 22, 16);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 5, 20, 14);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 5, y + 5, 20, 2);
    // Handle (down)
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 10, y + 18, 10, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 11, y + 19, 8, 11);
    // Trigger
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 13, y + 18, 4, 4);
    // Battery pack
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 9, y + 28, 12, 4);
    // Chuck
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 26, y + 8, 6, 8);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 26, y + 9, 6, 1);
    // Bit
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 32, y + 10, 6, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 32, y + 11, 6, 1);
    // LED
    ctx.fillStyle = Math.floor(time / 10) % 2 ? '#3acc3a' : '#0a3a14';
    ctx.fillRect(x + 22, y + 16, 2, 1);
  },

  // SAW (40x32)
  saw(ctx, x, y, time = 0) {
    // Handle
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x, y + 12, 12, 16);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 1, y + 13, 10, 14);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 4, y + 16, 4, 8);
    // Blade
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 12, y + 14, 28, 8);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 12, y + 14, 28, 2);
    // Teeth
    ctx.fillStyle = '#5a5a60';
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 12 + i * 2, y + 22);
      ctx.lineTo(x + 13 + i * 2, y + 25);
      ctx.lineTo(x + 14 + i * 2, y + 22);
      ctx.closePath();
      ctx.fill();
    }
  },

  // PAINTBRUSH (32x36)
  paintbrush(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const paint = opts.paint && opts.paint !== 'none' ? this._palette[opts.paint] : null;
    // Handle
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 12, y + 12, 8, 22);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 13, y + 13, 6, 21);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 13, y + 13, 6, 2);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 12, y + 32, 8, 2);
    // Ferrule (metal band)
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 11, y + 8, 10, 4);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 11, y + 8, 10, 1);
    // Bristles
    ctx.fillStyle = paint ? paint.dark : '#5a3a1a';
    ctx.fillRect(x + 10, y, 12, 8);
    ctx.fillStyle = paint ? paint.main : '#7a5028';
    ctx.fillRect(x + 11, y + 1, 10, 7);
    // Bristle lines
    ctx.fillStyle = paint ? paint.dark : '#5a3a1a';
    [12, 14, 16, 18, 20].forEach(px => ctx.fillRect(x + px, y, 1, 8));
    // Paint drip
    if (paint) {
      ctx.fillStyle = paint.main;
      ctx.fillRect(x + 14, y + 8, 4, 2);
      ctx.fillRect(x + 15, y + 10, 2, 4);
    }
  },

  // SCISSORS (28x36)
  scissors(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    // Blades
    ctx.strokeStyle = '#a0a0a8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 18); ctx.lineTo(x + 4, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 18); ctx.lineTo(x + 24, y);
    ctx.stroke();
    ctx.strokeStyle = '#d0d0d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 18); ctx.lineTo(x + 4, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 18); ctx.lineTo(x + 24, y);
    ctx.stroke();
    // Pivot
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 14, y + 18, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 14, y + 18, 1, 0, Math.PI * 2); ctx.fill();
    // Handles (loops)
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x + 8, y + 28, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 20, y + 28, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = c.main;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 8, y + 28, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 20, y + 28, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
  },

  // PENCIL (40x12)
  pencil(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 8, y + 2, 26, 8);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 8, y + 3, 26, 6);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 8, y + 3, 26, 1);
    // Wood end
    ctx.fillStyle = '#daa86a';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 2); ctx.lineTo(x, y + 6); ctx.lineTo(x + 8, y + 10);
    ctx.closePath(); ctx.fill();
    // Lead tip
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4); ctx.lineTo(x, y + 6); ctx.lineTo(x + 4, y + 8);
    ctx.closePath(); ctx.fill();
    // Eraser end
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 34, y + 2, 2, 8);
    ctx.fillStyle = '#FF5A90';
    ctx.fillRect(x + 36, y + 2, 4, 8);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 36, y + 8, 4, 2);
  },

  // RULER (60x12)
  ruler(ctx, x, y, time = 0) {
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x, y + 2, 60, 8);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x, y + 8, 60, 2);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x, y + 2, 60, 1);
    // Tick marks
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i <= 60; i += 6) {
      const h = i % 12 === 0 ? 4 : 2;
      ctx.fillRect(x + i, y + 2, 1, h);
    }
    // Numbers
    ctx.fillStyle = '#3a2510';
    [0, 12, 24, 36, 48].forEach((px, i) => {
      ctx.fillRect(x + px + 2, y + 7, 2, 2);
    });
  },

  // MICROSCOPE (40x52)
  microscope(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 50, 32, 2);
    // Base
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 4, y + 42, 32, 8);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 5, y + 43, 30, 6);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 5, y + 43, 30, 1);
    // Stage
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 8, y + 36, 24, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 14, y + 37, 12, 4);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 18, y + 38, 4, 2);
    // Arm
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 10, y + 12, 8, 30);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 11, y + 12, 6, 30);
    // Body tube
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 18, y + 4, 14, 24);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 19, y + 5, 12, 22);
    // Eyepiece
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 20, y, 10, 6);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 21, y + 1, 8, 4);
    // Objective lens turret
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 25, y + 30, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 25, y + 30, 4, 0, Math.PI * 2); ctx.fill();
    // Focus knob
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 8, y + 24, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 6, y + 24, 4, 1);
  },

  // BEAKER (28x40)
  beaker(ctx, x, y, opts = {}, time = 0) {
    const liq = this._palette[opts.liquid || 'green'];
    const bubbling = opts.state === 'bubbling';
    const wob = bubbling ? Math.sin(time / 8) * 0.5 : 0;
    // Glass outline
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.fillRect(x + 4, y + 4, 20, 32);
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, 20, 32);
    // Spout
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4); ctx.lineTo(x, y + 2);
    ctx.lineTo(x, y + 6); ctx.lineTo(x + 6, y + 6);
    ctx.closePath(); ctx.fill();
    // Liquid
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 5, y + 5, 18, 30); ctx.clip();
    ctx.fillStyle = liq.main;
    ctx.fillRect(x + 5, y + 14 + wob, 18, 22);
    ctx.fillStyle = liq.light;
    ctx.fillRect(x + 5, y + 14 + wob, 18, 1);
    if (bubbling) {
      // Rising bubbles
      for (let i = 0; i < 4; i++) {
        const rise = (time / 4 + i * 18) % 22;
        const bx = x + 7 + ((i * 4) % 14);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(bx, y + 36 - rise, 1 + (i & 1), 0, Math.PI * 2); ctx.fill();
      }
      // Steam
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 8, y + 4 - (time % 6), 2, 2);
      ctx.fillRect(x + 16, y + 2 - (time % 8), 2, 2);
    }
    ctx.restore();
    // Tick marks
    ctx.fillStyle = '#5a5a60';
    [10, 18, 26].forEach(yy => ctx.fillRect(x + 5, y + yy, 4, 1));
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x + 6, y + 6, 1, 28);
  },

  // TELESCOPE (44x44)
  telescope(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 42, 36, 2);
    // Tripod
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 8, y + 24, 2, 18);
    ctx.fillRect(x + 22, y + 24, 2, 18);
    ctx.fillRect(x + 34, y + 24, 2, 18);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 6, y + 40, 8, 2);
    ctx.fillRect(x + 20, y + 40, 8, 2);
    ctx.fillRect(x + 32, y + 40, 8, 2);
    // Tube — tilted
    ctx.save();
    ctx.translate(x + 22, y + 22);
    ctx.rotate(-Math.PI / 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-20, -6, 38, 12);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(-19, -5, 36, 10);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(-19, -5, 36, 1);
    // Big lens
    ctx.fillStyle = '#bcd2dc';
    ctx.beginPath(); ctx.arc(-18, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a9fff';
    ctx.beginPath(); ctx.arc(-18, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-19, -2, 1, 1);
    // Eyepiece end
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(16, -4, 6, 8);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(17, -3, 4, 6);
    // Finder scope
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(-4, -10, 14, 4);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(-4, -10, 14, 1);
    ctx.restore();
    // Mount
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath(); ctx.arc(x + 22, y + 22, 4, 0, Math.PI * 2); ctx.fill();
  }
};

if (typeof module !== 'undefined') module.exports = TOOLS;
