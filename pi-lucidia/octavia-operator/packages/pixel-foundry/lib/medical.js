// PIXEL FOUNDRY — MEDICAL
// bandaid, pillBottle, syringe, thermometer, ivBag, firstAidKit, stethoscope, crutches, mask, heartMonitor

const MEDICAL = {
  AXES: {
    bandaid:    { color: ['amber','pink','white'] },
    pillBottle: { color: ['amber','pink','blue','white'] },
    pill:       { color: ['pink','amber','blue','white','red'], shape: ['round','capsule','oval'] },
    ivBag:      { fluid: ['clear','red','amber','blue'] },
    mask:       { color: ['white','blue','pink','black'] }
  },

  // BANDAID (32x16)
  bandaid(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'pink' ? '#FF5A90' : opts.color === 'white' ? '#f0f0f0' : '#daa86a';
    const cd = opts.color === 'pink' ? '#FF1D6C' : opts.color === 'white' ? '#c0c0c0' : '#a67c3d';
    // Bandage strip
    ctx.fillStyle = cd;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 6); ctx.lineTo(x + 8, y + 4);
    ctx.lineTo(x + 24, y + 4); ctx.lineTo(x + 30, y + 6);
    ctx.lineTo(x + 30, y + 10); ctx.lineTo(x + 24, y + 12);
    ctx.lineTo(x + 8, y + 12); ctx.lineTo(x + 2, y + 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 7); ctx.lineTo(x + 9, y + 5);
    ctx.lineTo(x + 23, y + 5); ctx.lineTo(x + 29, y + 7);
    ctx.lineTo(x + 29, y + 9); ctx.lineTo(x + 23, y + 11);
    ctx.lineTo(x + 9, y + 11); ctx.lineTo(x + 3, y + 9);
    ctx.closePath(); ctx.fill();
    // Pad
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 12, y + 6, 8, 4);
    ctx.fillStyle = '#e8e8e8';
    [13, 15, 17].forEach(dx => ctx.fillRect(x + dx, y + 7, 1, 2));
    // Adhesive dots
    ctx.fillStyle = cd;
    [[5, 6], [7, 9], [25, 6], [27, 9]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
  },

  // PILL BOTTLE (28x40)
  pillBottle(ctx, x, y, opts = {}, time = 0) {
    const c = { amber: ['#F5A623','#c4851c','#ffc46b'], pink:['#FF1D6C','#c41758','#ff5a90'], blue:['#2979FF','#1f5fcc','#5a9fff'], white:['#f0f0f0','#c0c0c0','#ffffff'] }[opts.color || 'amber'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 38, 24, 2);
    // Cap
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 2, y, 24, 8);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 3, y + 1, 22, 6);
    // Cap ridges
    ctx.fillStyle = '#c0c0c0';
    [4, 7, 10, 13, 16, 19, 22].forEach(dx => ctx.fillRect(x + dx, y + 1, 1, 6));
    // Body
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 2, y + 8, 24, 32);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 3, y + 8, 22, 31);
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 3, y + 8, 22, 1);
    // Label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 14, 20, 18);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6, y + 16, 16, 2);
    ctx.fillStyle = '#1a1a1a';
    [20, 23, 26, 29].forEach(dy => ctx.fillRect(x + 6, y + dy, 16, 1));
    // Cross icon
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 12, y + 20, 4, 8);
    ctx.fillRect(x + 10, y + 22, 8, 4);
  },

  // PILL (24x16)
  pill(ctx, x, y, opts = {}, time = 0) {
    const c = { pink:['#FF5A90','#FF1D6C'], amber:['#ffc46b','#F5A623'], blue:['#5a9fff','#2979FF'], white:['#fff','#e8e8e8'], red:['#FF1D6C','#c41758'] }[opts.color || 'pink'];
    const shape = opts.shape || 'round';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 14, 20, 2);
    if (shape === 'round') {
      ctx.fillStyle = c[1];
      ctx.beginPath(); ctx.arc(x + 12, y + 8, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c[0];
      ctx.beginPath(); ctx.arc(x + 12, y + 8, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 9, y + 6, 2, 1);
    } else if (shape === 'capsule') {
      ctx.fillStyle = c[1];
      ctx.beginPath();
      ctx.arc(x + 6, y + 8, 4, Math.PI / 2, Math.PI * 1.5); ctx.lineTo(x + 18, y + 4);
      ctx.arc(x + 18, y + 8, 4, Math.PI * 1.5, Math.PI / 2); ctx.lineTo(x + 6, y + 12);
      ctx.closePath(); ctx.fill();
      // Two halves
      ctx.fillStyle = c[0];
      ctx.beginPath();
      ctx.arc(x + 6, y + 8, 4, Math.PI / 2, Math.PI * 1.5); ctx.lineTo(x + 12, y + 4);
      ctx.lineTo(x + 12, y + 12); ctx.lineTo(x + 6, y + 12);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + 18, y + 8, 4, Math.PI * 1.5, Math.PI / 2); ctx.lineTo(x + 12, y + 12);
      ctx.lineTo(x + 12, y + 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 4, y + 6, 1, 2);
      ctx.fillRect(x + 14, y + 6, 1, 2);
    } else if (shape === 'oval') {
      ctx.fillStyle = c[1];
      ctx.beginPath(); ctx.ellipse(x + 12, y + 8, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c[0];
      ctx.beginPath(); ctx.ellipse(x + 12, y + 8, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 11, y + 7, 2, 1);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 7, y + 6, 1, 1);
    }
  },

  // SYRINGE (52x16)
  syringe(ctx, x, y, time = 0) {
    // Plunger tip
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 5, 4, 6);
    // Plunger rod
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 4, y + 7, 8, 2);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 4, y + 7, 8, 1);
    // Barrel end cap
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 12, y + 4, 2, 8);
    // Barrel (clear)
    ctx.fillStyle = 'rgba(220,234,242,0.5)';
    ctx.fillRect(x + 14, y + 5, 24, 6);
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 14, y + 5, 24, 6);
    // Liquid
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 6, 18, 4);
    // Tick marks
    ctx.fillStyle = '#1a1a1a';
    [16, 20, 24, 28, 32].forEach(dx => ctx.fillRect(x + dx, y + 5, 1, 2));
    // Tip taper
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath();
    ctx.moveTo(x + 38, y + 5); ctx.lineTo(x + 42, y + 7);
    ctx.lineTo(x + 42, y + 9); ctx.lineTo(x + 38, y + 11);
    ctx.closePath(); ctx.fill();
    // Needle
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 42, y + 7, 10, 2);
    // Drop
    if (Math.floor(time / 10) % 2) {
      ctx.fillStyle = '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 52, y + 8, 1, 0, Math.PI * 2); ctx.fill();
    }
  },

  // THERMOMETER (32x40)
  thermometer(ctx, x, y, time = 0) {
    // Mercury bulb
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 16, y + 34, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.arc(x + 16, y + 34, 3, 0, Math.PI * 2); ctx.fill();
    // Stem
    ctx.fillStyle = 'rgba(220,234,242,0.6)';
    ctx.fillRect(x + 13, y + 4, 6, 28);
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 13, y + 4, 6, 28);
    // Mercury column
    const temp = 0.6 + Math.sin(time / 30) * 0.1;
    const colH = 24 * temp;
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 32 - colH, 4, colH);
    // Tick marks
    ctx.fillStyle = '#1a1a1a';
    [8, 14, 20, 26].forEach(dy => {
      ctx.fillRect(x + 19, y + dy, 3, 1);
      ctx.fillRect(x + 10, y + dy, 3, 1);
    });
    // Top cap
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 12, y, 8, 4);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 13, y + 1, 6, 2);
  },

  // IV BAG (32x52)
  ivBag(ctx, x, y, opts = {}, time = 0) {
    const fluidColor = { clear: '#bcd2dc', red: '#FF1D6C', amber: '#F5A623', blue: '#2979FF' }[opts.fluid || 'clear'];
    const fluidLight = { clear: '#dceaf2', red: '#ff5a90', amber: '#ffc46b', blue: '#5a9fff' }[opts.fluid || 'clear'];
    // Hanger
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x + 16, y, 3, Math.PI, 0); ctx.stroke();
    ctx.lineWidth = 1;
    // Top tab
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 14, y + 2, 4, 4);
    // Bag
    ctx.fillStyle = 'rgba(220,234,242,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + 26, y + 8);
    ctx.lineTo(x + 24, y + 38); ctx.lineTo(x + 8, y + 38);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a5a60';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + 26, y + 8);
    ctx.lineTo(x + 24, y + 38); ctx.lineTo(x + 8, y + 38);
    ctx.closePath(); ctx.stroke();
    // Fluid
    const wob = Math.sin(time / 16) * 0.5;
    ctx.fillStyle = fluidColor;
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 14 + wob); ctx.lineTo(x + 25, y + 14 + wob);
    ctx.lineTo(x + 24, y + 37); ctx.lineTo(x + 8, y + 37);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = fluidLight;
    ctx.fillRect(x + 8, y + 14 + wob, 16, 2);
    // Label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 20, 12, 8);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 22, 4, 2);
    ctx.fillRect(x + 12, y + 24, 8, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 11, y + 26, 10, 1);
    // Drip chamber
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 14, y + 38, 4, 4);
    ctx.fillStyle = 'rgba(220,234,242,0.6)';
    ctx.fillRect(x + 15, y + 39, 2, 2);
    // Drop
    if (Math.floor(time / 12) % 4 === 0) {
      ctx.fillStyle = fluidColor;
      ctx.beginPath(); ctx.arc(x + 16, y + 41, 1, 0, Math.PI * 2); ctx.fill();
    }
    // Tubing
    ctx.strokeStyle = '#5a5a60';
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 42);
    ctx.bezierCurveTo(x + 14, y + 46, x + 18, y + 48, x + 16, y + 52);
    ctx.stroke();
  },

  // FIRST AID KIT (40x32)
  firstAidKit(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Box
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x, y + 4, 40, 26);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 1, y + 5, 38, 24);
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 1, y + 5, 38, 3);
    // Lid line
    ctx.fillStyle = '#7a0a28';
    ctx.fillRect(x + 1, y + 12, 38, 1);
    // Latch
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 18, y + 10, 4, 4);
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x + 19, y + 11, 2, 2);
    // White cross
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 17, y + 16, 6, 12);
    ctx.fillRect(x + 13, y + 20, 14, 4);
    // Handle
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 20, y, 6, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
  },

  // STETHOSCOPE (44x44)
  stethoscope(ctx, x, y, time = 0) {
    // Earpieces (top)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 4, 4, 4);
    ctx.fillRect(x + 32, y + 4, 4, 4);
    // Tubes connecting earpieces
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 8);
    ctx.bezierCurveTo(x + 8, y + 16, x + 18, y + 24, x + 22, y + 26);
    ctx.bezierCurveTo(x + 26, y + 24, x + 36, y + 16, x + 34, y + 8);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3a3a3e';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 8);
    ctx.bezierCurveTo(x + 8, y + 16, x + 18, y + 24, x + 22, y + 26);
    ctx.bezierCurveTo(x + 26, y + 24, x + 36, y + 16, x + 34, y + 8);
    ctx.stroke();
    ctx.lineWidth = 1;
    // Down to chest piece
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 26); ctx.lineTo(x + 22, y + 36);
    ctx.stroke();
    // Chest piece (diaphragm)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 22, y + 38, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 22, y + 38, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath(); ctx.arc(x + 22, y + 38, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 19, y + 36, 2, 1);
    ctx.lineWidth = 1;
  },

  // CRUTCHES (32x60)
  crutches(ctx, x, y, time = 0) {
    // Two crutches side by side
    [4, 22].forEach(cx => {
      // Top pad
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + cx, y, 8, 4);
      ctx.fillStyle = '#7a5028';
      ctx.fillRect(x + cx + 1, y + 1, 6, 2);
      // Y-frame
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + cx, y + 4, 2, 18);
      ctx.fillRect(x + cx + 6, y + 4, 2, 18);
      // Handle
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + cx, y + 22, 8, 3);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + cx + 1, y + 22, 6, 1);
      // Lower shaft
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + cx + 3, y + 25, 2, 30);
      ctx.fillStyle = '#d0d0d4';
      ctx.fillRect(x + cx + 3, y + 25, 1, 30);
      // Foot tip
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + cx + 2, y + 55, 4, 4);
    });
  },

  // MASK (32x24)
  mask(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'pink' ? '#ff5a90' : opts.color === 'blue' ? '#5a9fff' : opts.color === 'black' ? '#3a3a3e' : '#fff';
    const cd = opts.color === 'pink' ? '#FF1D6C' : opts.color === 'blue' ? '#2979FF' : opts.color === 'black' ? '#1a1a1a' : '#c0c0c0';
    // Mask body
    ctx.fillStyle = cd;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 6); ctx.lineTo(x + 28, y + 6);
    ctx.quadraticCurveTo(x + 30, y + 12, x + 28, y + 18);
    ctx.lineTo(x + 4, y + 18);
    ctx.quadraticCurveTo(x + 2, y + 12, x + 4, y + 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 7); ctx.lineTo(x + 27, y + 7);
    ctx.quadraticCurveTo(x + 29, y + 12, x + 27, y + 17);
    ctx.lineTo(x + 5, y + 17);
    ctx.quadraticCurveTo(x + 3, y + 12, x + 5, y + 7);
    ctx.closePath(); ctx.fill();
    // Pleats
    ctx.fillStyle = cd;
    [10, 13, 16].forEach(dy => ctx.fillRect(x + 5, y + dy, 22, 1));
    // Nose strip
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 14, y + 7, 4, 1);
    // Ear loops
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 4, y + 12, 4, Math.PI / 2, Math.PI * 1.5, true); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 28, y + 12, 4, Math.PI * 1.5, Math.PI / 2, true); ctx.stroke();
    ctx.lineWidth = 1;
  },

  // HEART MONITOR (60x44)
  heartMonitor(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 56, 2);
    // Body
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x, y + 4, 60, 38);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 1, y + 5, 58, 36);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 1, y + 5, 58, 2);
    // Screen
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 4, y + 8, 52, 24);
    // Heartbeat line
    ctx.strokeStyle = '#3acc3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const offset = (time / 2) % 52;
    ctx.moveTo(x + 4, y + 20);
    for (let i = 0; i < 52; i += 1) {
      const px = x + 4 + i;
      const phase = ((i + offset) % 52) / 52;
      let py = 20;
      if (phase > 0.4 && phase < 0.45) py = 14;
      else if (phase > 0.45 && phase < 0.5) py = 28;
      else if (phase > 0.5 && phase < 0.55) py = 12;
      else if (phase > 0.55 && phase < 0.6) py = 26;
      ctx.lineTo(px, y + py);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    // BPM display
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6, y + 10, 8, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 7, y + 12, 6, 2);
    // Buttons
    ['#FF1D6C', '#3acc3a', '#F5A623', '#2979FF'].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(x + 6 + i * 12, y + 36, 8, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 6 + i * 12, y + 38, 8, 2);
    });
  }
};

if (typeof module !== 'undefined') module.exports = MEDICAL;
