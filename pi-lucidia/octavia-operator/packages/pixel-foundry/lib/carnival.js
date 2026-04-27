// PIXEL FOUNDRY — CARNIVAL
// ferrisWheel, carouselHorse, balloonBunch, ticket, popcornBox, cottonCandyStick,
// ringTossBottle, prizeTeddy, festivalFlags, gondola

const CARNIVAL = {
  AXES: {
    balloonBunch: { color: ['rainbow','pink','amber','blue','violet'] },
    ticket:       { color: ['amber','pink','violet','blue'] },
    prizeTeddy:   { color: ['brown','pink','blue','white'] },
    cottonCandyStick: { color: ['pink','blue','violet','rainbow'] },
    festivalFlags: { palette: ['classic','warm','cool','rainbow'] }
  },

  // FERRIS WHEEL mini (60x60)
  ferrisWheel(ctx, x, y, time = 0) {
    const cx = x + 30, cy = y + 28;
    const r = 22;
    const spin = time / 30;
    // Base + supports
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 14, y + 56, 32, 3);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 16, y + 50, 28, 8);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 16, y + 50, 28, 2);
    // X struts
    ctx.strokeStyle = '#a0a0a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 50); ctx.lineTo(cx - 2, cy);
    ctx.moveTo(x + 42, y + 50); ctx.lineTo(cx + 2, cy);
    ctx.stroke();
    ctx.lineWidth = 1;
    // Outer ring
    ctx.strokeStyle = '#d0d0d4';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Spokes
    for (let i = 0; i < 8; i++) {
      const a = spin + (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    // Cabins (always upright)
    const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF', '#3acc3a', '#FF1D6C', '#F5A623', '#9C27B0'];
    for (let i = 0; i < 8; i++) {
      const a = spin + (i / 8) * Math.PI * 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      // Connector
      ctx.fillStyle = '#5a5a60';
      ctx.fillRect(px, py, 1, 3);
      // Cabin
      ctx.fillStyle = colors[i];
      ctx.fillRect(px - 3, py + 3, 6, 5);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(px - 4, py + 2, 8, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(px - 2, py + 4, 4, 2);
    }
    // Hub
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fill();
    // Twinkling rim lights
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const lx = cx + Math.cos(a) * r;
      const ly = cy + Math.sin(a) * r;
      const lit = (Math.floor(time / 8) + i) % 3 !== 0;
      ctx.fillStyle = lit ? '#fff8c0' : '#5a5a3a';
      ctx.fillRect(lx, ly, 1, 1);
    }
    // Top flag
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx, cy - r - 6, 1, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(cx + 1, cy - r - 6, 4, 3);
  },

  // CAROUSEL HORSE (32x40)
  carouselHorse(ctx, x, y, time = 0) {
    const bob = Math.sin(time / 8) * 1;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 38, 24, 2);
    // Pole
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 15, y + 4, 2, 32);
    // Spiral on pole
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + 15, y + 6 + i * 5, 2, 1);
    }
    // Body
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 16 + bob, 18, 10);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 6, y + 22 + bob, 18, 4);
    // Saddle
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 10, y + 14 + bob, 10, 4);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 12, y + 14 + bob, 2, 4);
    ctx.fillRect(x + 16, y + 14 + bob, 2, 4);
    // Legs
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 26 + bob, 3, 8);
    ctx.fillRect(x + 11, y + 26 + bob, 3, 8);
    ctx.fillRect(x + 17, y + 26 + bob, 3, 8);
    ctx.fillRect(x + 22, y + 26 + bob, 3, 8);
    ctx.fillStyle = '#1a1a1a';
    [6, 11, 17, 22].forEach(lx => ctx.fillRect(x + lx, y + 33 + bob, 3, 1));
    // Head
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 22, y + 12 + bob, 8, 8);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 22, y + 18 + bob, 8, 2);
    // Mane
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 18, y + 12 + bob, 6, 4);
    ctx.fillRect(x + 16, y + 14 + bob, 4, 4);
    // Eye
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 26, y + 15 + bob, 1, 1);
    // Tail
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 14 + bob, 4, 6);
    ctx.fillRect(x + 2, y + 16 + bob, 3, 6);
  },

  // BALLOON BUNCH (28x44)
  balloonBunch(ctx, x, y, opts = {}, time = 0) {
    const sway = Math.sin(time / 18) * 1;
    const isRainbow = (opts.color || 'rainbow') === 'rainbow';
    const single = { pink: '#FF1D6C', amber: '#F5A623', blue: '#2979FF', violet: '#9C27B0' }[opts.color];
    const balloons = [
      { dx: 4 + sway, dy: 12, c: isRainbow ? '#FF1D6C' : single },
      { dx: 14 + sway, dy: 8, c: isRainbow ? '#F5A623' : single },
      { dx: 22 + sway, dy: 14, c: isRainbow ? '#2979FF' : single },
      { dx: 8 + sway, dy: 18, c: isRainbow ? '#9C27B0' : single },
      { dx: 18 + sway, dy: 18, c: isRainbow ? '#3acc3a' : single }
    ];
    // Strings to handle
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    balloons.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(x + b.dx, y + b.dy + 5);
      ctx.lineTo(x + 14, y + 36);
      ctx.stroke();
    });
    // Balloons
    balloons.forEach(b => {
      ctx.fillStyle = b.c;
      ctx.beginPath(); ctx.ellipse(x + b.dx, y + b.dy, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + b.dx - 2, y + b.dy - 3, 1, 2);
      // Knot
      ctx.fillStyle = b.c;
      ctx.fillRect(x + b.dx, y + b.dy + 4, 1, 2);
    });
    // Hand / handle ribbon
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 12, y + 36, 4, 6);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 12, y + 36, 4, 1);
  },

  // TICKET (40x20)
  ticket(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'pink' ? '#FF1D6C' : opts.color === 'violet' ? '#9C27B0' : opts.color === 'blue' ? '#2979FF' : '#F5A623';
    const cd = opts.color === 'pink' ? '#c41758' : opts.color === 'violet' ? '#7b1f8c' : opts.color === 'blue' ? '#1f5fcc' : '#c4851c';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 18, 36, 2);
    // Body
    ctx.fillStyle = cd;
    ctx.fillRect(x + 1, y + 1, 38, 16);
    ctx.fillStyle = c;
    ctx.fillRect(x + 2, y + 2, 36, 14);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 2, y + 2, 36, 2);
    // Perforation
    ctx.fillStyle = cd;
    ctx.fillRect(x + 26, y + 2, 1, 14);
    for (let i = 3; i < 16; i += 3) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 26, y + i, 1, 1);
    }
    // Stub label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 28, y + 6, 8, 6);
    ctx.fillStyle = cd;
    ctx.fillRect(x + 30, y + 7, 4, 1);
    ctx.fillRect(x + 30, y + 9, 4, 1);
    ctx.fillRect(x + 30, y + 11, 4, 1);
    // Main text bars
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 6, 18, 2);
    ctx.fillRect(x + 5, y + 10, 14, 2);
    // Star
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 22, y + 7, 1, 4);
    ctx.fillRect(x + 20, y + 8, 5, 2);
  },

  // POPCORN BOX (28x36)
  popcornBox(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 24, 2);
    // Box
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 2, y + 14, 24, 22);
    ctx.fillStyle = '#FF1D6C';
    for (let i = 0; i < 24; i += 4) {
      ctx.fillRect(x + 2 + i, y + 14, 2, 22);
    }
    ctx.fillStyle = '#fff';
    for (let i = 2; i < 24; i += 4) {
      ctx.fillRect(x + 2 + i, y + 14, 2, 22);
    }
    // Box top rim
    ctx.fillStyle = '#7a0a28';
    ctx.fillRect(x + 2, y + 14, 24, 2);
    // Popcorn pile
    const pieces = [
      [4, 8, '#fff'], [8, 4, '#fff'], [12, 6, '#ffe080'], [16, 4, '#fff'], [20, 8, '#ffe080'], [24, 6, '#fff'],
      [6, 12, '#ffe080'], [10, 10, '#fff'], [14, 12, '#fff'], [18, 10, '#ffe080'], [22, 12, '#fff'],
      [4, 16, '#fff'], [8, 14, '#ffe080'], [12, 16, '#fff'], [16, 14, '#fff'], [20, 16, '#ffe080'], [24, 14, '#fff']
    ];
    pieces.forEach(([dx, dy, col]) => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col === '#fff' ? '#e8e8e8' : '#c4851c';
      ctx.beginPath(); ctx.arc(x + dx + 1, y + dy + 1, 1, 0, Math.PI * 2); ctx.fill();
    });
  },

  // COTTON CANDY ON STICK (24x44)
  cottonCandyStick(ctx, x, y, opts = {}, time = 0) {
    const color = opts.color || 'pink';
    const c = color === 'pink' ? '#ff5a90' : color === 'blue' ? '#5a9fff' : color === 'violet' ? '#c34dd6' : 'rainbow';
    const cd = color === 'pink' ? '#FF1D6C' : color === 'blue' ? '#2979FF' : color === 'violet' ? '#9C27B0' : null;
    // Stick
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 11, y + 22, 2, 22);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 12, y + 22, 1, 22);
    // Cloud
    if (c === 'rainbow') {
      const layers = [
        ['#FF1D6C', 4, 8, 16],
        ['#F5A623', 6, 6, 14],
        ['#9C27B0', 5, 10, 12],
        ['#2979FF', 4, 14, 10]
      ];
      layers.forEach(([col, dx, dy, sz]) => {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x + dx + sz/2, y + dy, sz/2, 0, Math.PI * 2); ctx.fill();
      });
      // Big fluffy puffs
      ctx.fillStyle = '#FF5A90';
      ctx.beginPath(); ctx.arc(x + 6, y + 12, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 14, y + 8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c34dd6';
      ctx.beginPath(); ctx.arc(x + 18, y + 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a9fff';
      ctx.beginPath(); ctx.arc(x + 10, y + 18, 4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = cd;
      [[6, 12, 5], [14, 10, 5], [10, 6, 4], [18, 14, 5], [6, 18, 5], [16, 18, 4]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = c;
      [[6, 12, 4], [14, 10, 4], [10, 6, 3], [18, 14, 4], [6, 18, 4]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 8, y + 8, 2, 1);
      ctx.fillRect(x + 16, y + 6, 2, 1);
    }
  },

  // RING TOSS BOTTLE (16x32)
  ringTossBottle(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 12, 2);
    // Bottle
    ctx.fillStyle = '#1f5fcc';
    ctx.fillRect(x + 4, y + 8, 8, 22);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 5, y + 9, 6, 20);
    ctx.fillStyle = '#5a9fff';
    ctx.fillRect(x + 5, y + 9, 1, 20);
    // Neck
    ctx.fillStyle = '#1f5fcc';
    ctx.fillRect(x + 6, y + 4, 4, 6);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 7, y + 4, 2, 6);
    // Cap
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 5, y + 2, 6, 3);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 5, y + 2, 6, 1);
    // Label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 16, 6, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6, y + 17, 4, 1);
    ctx.fillRect(x + 6, y + 19, 4, 1);
    ctx.fillRect(x + 6, y + 21, 4, 1);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 5, y + 10, 1, 8);
    // Ring around it
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x + 8, y + 28, 6, 2, 0, 0, Math.PI * 2); ctx.stroke();
  },

  // PRIZE TEDDY BEAR (32x40)
  prizeTeddy(ctx, x, y, opts = {}, time = 0) {
    const color = opts.color || 'brown';
    const c = color === 'pink' ? '#FF5A90' : color === 'blue' ? '#5a9fff' : color === 'white' ? '#f0f0f0' : '#a85f2a';
    const cd = color === 'pink' ? '#FF1D6C' : color === 'blue' ? '#2979FF' : color === 'white' ? '#c0c0c0' : '#7a3818';
    const cl = color === 'pink' ? '#ff8ab0' : color === 'blue' ? '#7aafff' : color === 'white' ? '#fff' : '#c47a3a';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 38, 24, 2);
    // Body
    ctx.fillStyle = cd;
    ctx.fillRect(x + 6, y + 18, 20, 18);
    ctx.fillStyle = c;
    ctx.fillRect(x + 7, y + 19, 18, 16);
    // Belly patch
    ctx.fillStyle = cl;
    ctx.fillRect(x + 11, y + 23, 10, 10);
    // Arms
    ctx.fillStyle = cd;
    ctx.fillRect(x + 2, y + 20, 5, 12);
    ctx.fillRect(x + 25, y + 20, 5, 12);
    ctx.fillStyle = c;
    ctx.fillRect(x + 3, y + 20, 3, 12);
    ctx.fillRect(x + 26, y + 20, 3, 12);
    // Legs
    ctx.fillStyle = cd;
    ctx.fillRect(x + 8, y + 32, 6, 6);
    ctx.fillRect(x + 18, y + 32, 6, 6);
    ctx.fillStyle = c;
    ctx.fillRect(x + 9, y + 32, 4, 6);
    ctx.fillRect(x + 19, y + 32, 4, 6);
    // Foot pads
    ctx.fillStyle = cl;
    ctx.fillRect(x + 9, y + 36, 4, 2);
    ctx.fillRect(x + 19, y + 36, 4, 2);
    // Head
    ctx.fillStyle = cd;
    ctx.fillRect(x + 8, y + 4, 16, 14);
    ctx.fillStyle = c;
    ctx.fillRect(x + 9, y + 5, 14, 13);
    // Ears
    ctx.fillStyle = cd;
    ctx.fillRect(x + 6, y + 4, 4, 5);
    ctx.fillRect(x + 22, y + 4, 4, 5);
    ctx.fillStyle = cl;
    ctx.fillRect(x + 7, y + 5, 2, 3);
    ctx.fillRect(x + 23, y + 5, 2, 3);
    // Snout
    ctx.fillStyle = cl;
    ctx.fillRect(x + 12, y + 12, 8, 5);
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 11, y + 9, 2, 2);
    ctx.fillRect(x + 19, y + 9, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 11, y + 9, 1, 1);
    ctx.fillRect(x + 19, y + 9, 1, 1);
    // Nose
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 14, y + 13, 4, 2);
    // Mouth
    ctx.fillRect(x + 15, y + 16, 2, 1);
    // Bow tie
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 10, y + 17, 4, 3);
    ctx.fillRect(x + 18, y + 17, 4, 3);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 14, y + 17, 4, 3);
  },

  // FESTIVAL FLAGS (60x32) — string of pennants
  festivalFlags(ctx, x, y, opts = {}, time = 0) {
    const palette = opts.palette || 'classic';
    const colors = palette === 'warm'   ? ['#FF1D6C', '#F5A623', '#ff5a90', '#ffc46b']
                 : palette === 'cool'   ? ['#2979FF', '#9C27B0', '#5a9fff', '#c34dd6']
                 : palette === 'rainbow'? ['#FF1D6C', '#F5A623', '#3acc3a', '#2979FF', '#9C27B0']
                                        : ['#FF1D6C', '#fff', '#2979FF', '#fff'];
    // Hanging string
    ctx.strokeStyle = '#3a3a3e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    for (let i = 0; i <= 60; i += 4) {
      const sag = Math.sin((i + time / 4) / 8) * 1 + 4;
      ctx.lineTo(x + i, y + sag);
    }
    ctx.stroke();
    // Pennants
    const numFlags = 12;
    for (let i = 0; i < numFlags; i++) {
      const px = x + 2 + i * 5;
      const sag = Math.sin((px - x + time / 4) / 8) * 1 + 4;
      const c = colors[i % colors.length];
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(px, y + sag);
      ctx.lineTo(px + 4, y + sag);
      ctx.lineTo(px + 2, y + sag + 8);
      ctx.closePath();
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(px + 1, y + sag + 1, 1, 4);
    }
    // Posts on ends
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x - 1, y + 4, 2, 16);
    ctx.fillRect(x + 58, y + 4, 2, 16);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x, y + 4, 1, 16);
    ctx.fillRect(x + 59, y + 4, 1, 16);
  },

  // GONDOLA / SWING (32x40) — single carnival ride seat
  gondola(ctx, x, y, time = 0) {
    const swing = Math.sin(time / 16) * 4;
    // Top mount
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 12, y, 8, 2);
    ctx.fillRect(x + 14, y + 2, 4, 2);
    // Chains
    ctx.strokeStyle = '#a0a0a8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 4); ctx.lineTo(x + 8 + swing, y + 22);
    ctx.moveTo(x + 18, y + 4); ctx.lineTo(x + 24 + swing, y + 22);
    ctx.stroke();
    // Chain segments
    ctx.fillStyle = '#3a3a3e';
    [6, 10, 14, 18].forEach(yy => {
      ctx.fillRect(x + 13 + yy * swing / 22, y + yy, 2, 1);
      ctx.fillRect(x + 19 + yy * swing / 22, y + yy, 2, 1);
    });
    // Seat
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6 + swing, y + 22, 20, 8);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 6 + swing, y + 28, 20, 2);
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 6 + swing, y + 22, 20, 2);
    // Backrest
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6 + swing, y + 16, 2, 8);
    ctx.fillRect(x + 24 + swing, y + 16, 2, 8);
    // Rider silhouette
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 12 + swing, y + 16, 8, 8);
    ctx.fillStyle = '#daa86a';
    ctx.beginPath(); ctx.arc(x + 16 + swing, y + 14, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 14 + swing, y + 11, 4, 3);
    // Footrest bar
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 4 + swing, y + 30, 24, 2);
  }
};

if (typeof module !== 'undefined') module.exports = CARNIVAL;
