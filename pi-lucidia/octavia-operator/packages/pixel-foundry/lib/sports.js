// PIXEL FOUNDRY — SPORTS (with axes)
// ball, bat, racket, skateboard, dumbbell, bowlingPin, helmet, whistle, trophy

const SPORTS = {
  AXES: {
    ball:       { kind: ['basketball','soccer','football','baseball','tennis','volleyball','beach'] },
    racket:     { kind: ['tennis','badminton','pingpong'], color: ['pink','amber','violet','blue','black','white'] },
    skateboard: { deck: ['pink','amber','violet','blue','black','white'], graphic: ['plain','flames','stars','checker'] },
    dumbbell:   { size: ['s','m','l'], color: ['pink','amber','violet','blue','black','stone'] },
    helmet:     { kind: ['football','bike','baseball'], color: ['pink','amber','violet','blue','black','white'] },
    trophy:     { tier: ['bronze','silver','gold'], size: ['s','m','l'] }
  },

  // BALL (32x32)
  ball(ctx, x, y, opts = {}) {
    const kind = opts.kind || 'basketball';
    const cx = x + 16, cy = y + 16;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(cx, y + 30, 12, 2, 0, 0, Math.PI * 2); ctx.fill();
    if (kind === 'basketball') {
      ctx.fillStyle = '#a85a26';
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 11, cy); ctx.lineTo(cx + 11, cy); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - 8, cy, 11, -Math.PI / 4, Math.PI / 4); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 8, cy, 11, Math.PI - Math.PI / 4, Math.PI + Math.PI / 4); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'soccer') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      // Pentagons
      [[0, -8], [-8, 4], [8, 4]].forEach(([dx, dy]) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
          const px = cx + dx + Math.cos(a) * 3;
          const py = cy + dy + Math.sin(a) * 3;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      });
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.stroke();
    } else if (kind === 'football') {
      ctx.fillStyle = '#5a3a1a';
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a85a26';
      ctx.beginPath(); ctx.ellipse(cx, cy, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 5, cy - 1, 10, 2);
      ctx.fillStyle = '#5a3a1a';
      [-3, 0, 3].forEach(dx => ctx.fillRect(cx + dx, cy - 2, 1, 4));
    } else if (kind === 'baseball') {
      ctx.fillStyle = '#e8e8ec';
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#FF1D6C';
      ctx.lineWidth = 1;
      // Stitching curves
      ctx.beginPath(); ctx.arc(cx - 8, cy, 11, -Math.PI / 3, Math.PI / 3); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 8, cy, 11, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3); ctx.stroke();
      // Stitches
      ctx.fillStyle = '#FF1D6C';
      for (let i = -3; i <= 3; i++) {
        ctx.fillRect(cx - 5, cy + i * 2, 2, 1);
        ctx.fillRect(cx + 3, cy + i * 2, 2, 1);
      }
    } else if (kind === 'tennis') {
      ctx.fillStyle = '#3acc3a';
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7acc7a';
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx - 6, cy, 10, -Math.PI / 4, Math.PI / 4); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 6, cy, 10, Math.PI - Math.PI / 4, Math.PI + Math.PI / 4); ctx.stroke();
    } else if (kind === 'volleyball') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2979FF';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 5, a + Math.PI - Math.PI / 6, a + Math.PI + Math.PI / 6);
        ctx.stroke();
      }
    } else if (kind === 'beach') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
      const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 11, (i / 4) * Math.PI * 2, ((i + 0.5) / 4) * Math.PI * 2);
        ctx.closePath(); ctx.fill();
      });
    }
    ctx.lineWidth = 1;
  },

  // BAT (60x16)
  bat(ctx, x, y, time = 0) {
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 6); ctx.lineTo(x + 4, y + 10);
    ctx.lineTo(x + 50, y + 14); ctx.lineTo(x + 56, y + 12);
    ctx.lineTo(x + 56, y + 4); ctx.lineTo(x + 50, y + 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 7); ctx.lineTo(x + 5, y + 9);
    ctx.lineTo(x + 49, y + 13); ctx.lineTo(x + 55, y + 11);
    ctx.lineTo(x + 55, y + 5); ctx.lineTo(x + 49, y + 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 8, y + 7, 40, 1);
    // Grip tape
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 4, 8, 8);
    ctx.fillStyle = '#3a3a3e';
    [1, 3, 5, 7].forEach(dx => ctx.fillRect(x + dx, y + 4, 1, 8));
    // End cap
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 56, y + 4, 2, 8);
  },

  // RACKET (32x60)
  racket(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'pink' ? '#FF1D6C'
            : opts.color === 'amber' ? '#F5A623'
            : opts.color === 'violet' ? '#9C27B0'
            : opts.color === 'blue' ? '#2979FF'
            : opts.color === 'white' ? '#f0f0f0'
                                       : '#1a1a1a';
    const cd = opts.color === 'pink' ? '#c41758' : opts.color === 'amber' ? '#c4851c' : opts.color === 'violet' ? '#7b1f8c' : opts.color === 'blue' ? '#1f5fcc' : opts.color === 'white' ? '#c0c0c0' : '#0a0a0a';
    const kind = opts.kind || 'tennis';
    // Handle
    ctx.fillStyle = cd;
    ctx.fillRect(x + 13, y + 32, 6, 26);
    ctx.fillStyle = c;
    ctx.fillRect(x + 14, y + 32, 4, 26);
    // Grip
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 12, y + 50, 8, 8);
    ctx.fillStyle = '#3a3a3e';
    [51, 53, 55, 57].forEach(yy => ctx.fillRect(x + 12, y + yy, 8, 1));
    // Head
    if (kind === 'tennis') {
      ctx.fillStyle = cd;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 14, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 12, 14, 0, 0, Math.PI * 2); ctx.fill();
      // Strings
      ctx.fillStyle = '#fff';
      [6, 9, 12, 15, 18, 21, 24].forEach(yy => {
        ctx.fillRect(x + 5, y + yy, 22, 1);
      });
      [8, 11, 14, 17, 20, 23].forEach(xx => {
        ctx.fillRect(x + xx, y + 5, 1, 26);
      });
    } else if (kind === 'badminton') {
      ctx.fillStyle = cd;
      ctx.beginPath(); ctx.arc(x + 16, y + 16, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x + 16, y + 16, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      [4, 8, 12, 16, 20, 24, 28].forEach(yy => ctx.fillRect(x + 4, y + yy, 24, 1));
      [4, 8, 12, 16, 20, 24, 28].forEach(xx => ctx.fillRect(x + xx, y + 4, 1, 24));
    } else if (kind === 'pingpong') {
      ctx.fillStyle = cd;
      ctx.beginPath(); ctx.arc(x + 16, y + 18, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x + 16, y + 18, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      [[12, 12], [20, 14], [16, 22]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 1, 0, Math.PI * 2); ctx.fill();
      });
    }
  },

  // SKATEBOARD (60x20)
  skateboard(ctx, x, y, opts = {}, time = 0) {
    const deck = { pink: '#FF1D6C', amber: '#F5A623', violet: '#9C27B0', blue: '#2979FF', black: '#1a1a1a', white: '#f0f0f0' }[opts.deck || 'pink'];
    const deckD = { pink: '#c41758', amber: '#c4851c', violet: '#7b1f8c', blue: '#1f5fcc', black: '#0a0a0a', white: '#c0c0c0' }[opts.deck || 'pink'];
    const graphic = opts.graphic || 'plain';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 18, 56, 2);
    // Deck
    ctx.fillStyle = deckD;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + 56, y + 4);
    ctx.quadraticCurveTo(x + 60, y + 8, x + 56, y + 12);
    ctx.lineTo(x + 4, y + 12);
    ctx.quadraticCurveTo(x, y + 8, x + 4, y + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = deck;
    ctx.fillRect(x + 4, y + 5, 52, 6);
    // Graphic
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 4, y + 4, 52, 8); ctx.clip();
    if (graphic === 'flames') {
      ctx.fillStyle = '#F5A623';
      [10, 18, 26, 34, 42, 50].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(x + px, y + 12); ctx.lineTo(x + px - 3, y + 6);
        ctx.lineTo(x + px + 3, y + 6); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = '#FF1D6C';
      [12, 20, 28, 36, 44, 52].forEach(px => {
        ctx.fillRect(x + px, y + 8, 2, 3);
      });
    } else if (graphic === 'stars') {
      ctx.fillStyle = '#fff';
      [10, 22, 34, 46].forEach(px => {
        ctx.fillRect(x + px, y + 7, 2, 2);
        ctx.fillRect(x + px - 1, y + 8, 4, 1);
      });
    } else if (graphic === 'checker') {
      ctx.fillStyle = '#fff';
      for (let xx = 0; xx < 52; xx += 4) for (let yy = 0; yy < 8; yy += 4) {
        if (((xx + yy) / 4) & 1) ctx.fillRect(x + 4 + xx, y + 4 + yy, 4, 4);
      }
    }
    ctx.restore();
    // Trucks + wheels
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 8, y + 12, 8, 2);
    ctx.fillRect(x + 44, y + 12, 8, 2);
    // Wheels
    ctx.fillStyle = '#fff';
    [10, 14, 46, 50].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 16, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#1a1a1a';
    [10, 14, 46, 50].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 16, 1, 0, Math.PI * 2); ctx.fill();
    });
  },

  // DUMBBELL (44x16)
  dumbbell(ctx, x, y, opts = {}, time = 0) {
    const sz = { s: 0.7, m: 1, l: 1.2 }[opts.size || 'm'];
    const c = { pink: ['#FF1D6C','#c41758'], amber: ['#F5A623','#c4851c'], violet: ['#9C27B0','#7b1f8c'], blue: ['#2979FF','#1f5fcc'], black: ['#1a1a1a','#0a0a0a'], stone: ['#7a7a80','#5a5a60'] }[opts.color || 'black'];
    const w = 14 * sz;
    // Bar
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + w, y + 6, 44 - w * 2, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + w, y + 7, 44 - w * 2, 2);
    // Grip ridges
    ctx.fillStyle = '#3a3a3e';
    for (let i = 0; i < 8; i++) ctx.fillRect(x + w + i * 2 + 2, y + 6, 1, 4);
    // Weights
    ctx.fillStyle = c[1];
    ctx.fillRect(x, y + 4 - sz, w, 8 + sz * 2);
    ctx.fillRect(x + 44 - w, y + 4 - sz, w, 8 + sz * 2);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 1, y + 5 - sz, w - 2, 6 + sz * 2);
    ctx.fillRect(x + 44 - w + 1, y + 5 - sz, w - 2, 6 + sz * 2);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 2, y + 5 - sz, 2, 2);
    ctx.fillRect(x + 44 - w + 2, y + 5 - sz, 2, 2);
  },

  // BOWLING PIN (24x40)
  bowlingPin(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(x + 12, y + 38, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e8ec';
    // Pin shape
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    ctx.bezierCurveTo(x + 16, y, x + 16, y + 12, x + 13, y + 16);
    ctx.bezierCurveTo(x + 11, y + 18, x + 11, y + 22, x + 14, y + 26);
    ctx.bezierCurveTo(x + 18, y + 30, x + 20, y + 36, x + 12, y + 38);
    ctx.bezierCurveTo(x + 4, y + 36, x + 6, y + 30, x + 10, y + 26);
    ctx.bezierCurveTo(x + 13, y + 22, x + 13, y + 18, x + 11, y + 16);
    ctx.bezierCurveTo(x + 8, y + 12, x + 8, y, x + 12, y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 14, y + 28, 2, 8);
    // Red stripes
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 7, y + 4, 10, 2);
    ctx.fillRect(x + 7, y + 8, 10, 2);
  },

  // HELMET (40x32)
  helmet(ctx, x, y, opts = {}, time = 0) {
    const c = { pink: ['#FF1D6C','#c41758','#ff5a90'], amber: ['#F5A623','#c4851c','#ffc46b'], violet: ['#9C27B0','#7b1f8c','#c34dd6'], blue: ['#2979FF','#1f5fcc','#5a9fff'], black: ['#1a1a1a','#0a0a0a','#3a3a3a'], white: ['#f0f0f0','#c0c0c0','#ffffff'] }[opts.color || 'pink'];
    const kind = opts.kind || 'football';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 30, 32, 2);
    if (kind === 'football') {
      // Dome
      ctx.fillStyle = c[1];
      ctx.beginPath(); ctx.arc(x + 20, y + 18, 14, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + 6, y + 18, 28, 12);
      ctx.fillStyle = c[0];
      ctx.beginPath(); ctx.arc(x + 20, y + 18, 13, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + 7, y + 18, 26, 11);
      ctx.fillStyle = c[2];
      ctx.fillRect(x + 8, y + 6, 24, 3);
      // Face mask
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + 8, y + 22, 24, 2);
      ctx.fillRect(x + 14, y + 26, 12, 2);
      ctx.fillRect(x + 14, y + 22, 1, 6);
      ctx.fillRect(x + 25, y + 22, 1, 6);
      // Logo
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 18, y + 14, 4, 4);
    } else if (kind === 'bike') {
      ctx.fillStyle = c[1];
      ctx.beginPath(); ctx.ellipse(x + 20, y + 16, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c[0];
      ctx.beginPath(); ctx.ellipse(x + 20, y + 16, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      // Vents
      ctx.fillStyle = '#0a0a0c';
      [12, 18, 24].forEach(px => ctx.fillRect(x + px, y + 8, 4, 6));
      ctx.fillRect(x + 14, y + 18, 12, 2);
      // Strap
      ctx.fillStyle = c[2];
      ctx.fillRect(x + 4, y + 22, 32, 2);
    } else if (kind === 'baseball') {
      ctx.fillStyle = c[1];
      ctx.beginPath(); ctx.arc(x + 20, y + 18, 14, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + 6, y + 18, 28, 8);
      ctx.fillStyle = c[0];
      ctx.beginPath(); ctx.arc(x + 20, y + 18, 13, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + 7, y + 18, 26, 7);
      // Brim
      ctx.fillStyle = c[1];
      ctx.fillRect(x + 6, y + 22, 28, 4);
      ctx.fillRect(x + 16, y + 26, 16, 4);
      // Logo
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 18, y + 14, 4, 4);
    }
  },

  // WHISTLE (32x16)
  whistle(ctx, x, y, time = 0) {
    // Cord
    ctx.strokeStyle = '#FF1D6C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    for (let xx = 0; xx < 12; xx++) {
      ctx.lineTo(x + xx, y + 8 + Math.sin(xx / 2) * 1);
    }
    ctx.stroke();
    // Body
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 12, y + 4, 16, 8);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 12, y + 4, 16, 2);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 12, y + 10, 16, 2);
    // Mouthpiece
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 28, y + 6, 4, 4);
    // Hole
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 16, y + 7, 6, 2);
    // Pea
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 19, y + 8, 1, 0, Math.PI * 2); ctx.fill();
    // Loop
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath(); ctx.arc(x + 12, y + 8, 2, Math.PI / 2, Math.PI * 1.5); ctx.fill();
  },

  // TROPHY (40x52)
  trophy(ctx, x, y, opts = {}, time = 0) {
    const tier = opts.tier || 'gold';
    const sz = { s: 0.8, m: 1, l: 1.15 }[opts.size || 'm'];
    const c = tier === 'bronze' ? ['#a85a26', '#7a3a18', '#daa86a']
            : tier === 'silver' ? ['#a0a0a8', '#5a5a60', '#d0d0d4']
                                : ['#F5A623', '#c4851c', '#ffe080'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 50, 32, 2);
    // Base
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 8, y + 42, 24, 8);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 9, y + 43, 22, 6);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 9, y + 43, 22, 1);
    // Plaque
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 12, y + 45, 16, 3);
    // Stem
    ctx.fillStyle = c[1];
    ctx.fillRect(x + 18, y + 32 + (1 - sz) * 6, 4, 12 + (sz - 1) * 4);
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 19, y + 32 + (1 - sz) * 6, 2, 12 + (sz - 1) * 4);
    // Cup
    ctx.fillStyle = c[1];
    ctx.beginPath();
    ctx.moveTo(x + 8 - sz, y + 8);
    ctx.lineTo(x + 32 + sz, y + 8);
    ctx.quadraticCurveTo(x + 32 + sz, y + 32, x + 20, y + 34);
    ctx.quadraticCurveTo(x + 8 - sz, y + 32, x + 8 - sz, y + 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c[0];
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 9);
    ctx.lineTo(x + 31, y + 9);
    ctx.quadraticCurveTo(x + 31, y + 30, x + 20, y + 32);
    ctx.quadraticCurveTo(x + 9, y + 30, x + 9, y + 9);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 9, y + 9, 22, 3);
    // Handles
    ctx.strokeStyle = c[1];
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + 7, y + 18, 5, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 33, y + 18, 5, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    ctx.lineWidth = 1;
    // Star on cup
    const pulse = 0.7 + Math.sin(time / 8) * 0.3;
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.fillRect(x + 19, y + 18, 2, 6);
    ctx.fillRect(x + 16, y + 20, 8, 2);
  }
};

if (typeof module !== 'undefined') module.exports = SPORTS;
