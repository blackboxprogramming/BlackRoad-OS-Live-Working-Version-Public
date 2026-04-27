// PIXEL FOUNDRY — TRANSPORT (boats, planes, trains, helicopter, hot air balloon, submarine)

const TRANSPORT = {
  AXES: {
    boat:        { kind: ['rowboat','sailboat','motorboat'], color: ['pink','amber','violet','blue','white','wood'] },
    plane:       { kind: ['jet','biplane','airliner'], color: ['pink','amber','violet','blue','white','black'] },
    train:       { kind: ['steam','passenger','bullet'], color: ['pink','amber','violet','blue','black'] },
    balloon:     { color: ['pink','amber','violet','blue','white','rainbow'] },
    helicopter:  { color: ['pink','amber','violet','blue','black','white'] },
    submarine:   { color: ['amber','violet','blue','black'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' },
    wood:   { main: '#c4935a', dark: '#a67c3d', light: '#daa86a' }
  },

  // BOAT (60x40)
  boat(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    const kind = opts.kind || 'rowboat';
    const bob = Math.sin(time / 16) * 1;
    // Water
    ctx.fillStyle = '#5a9fff';
    ctx.beginPath();
    ctx.moveTo(x, y + 32 + bob);
    for (let xx = 0; xx <= 60; xx += 4) {
      ctx.lineTo(x + xx, y + 32 + bob + Math.sin((xx + time / 4) / 6) * 1);
    }
    ctx.lineTo(x + 60, y + 40); ctx.lineTo(x, y + 40);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x, y + 36 + bob, 60, 4);
    if (kind === 'rowboat') {
      // Hull
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 22 + bob); ctx.lineTo(x + 56, y + 22 + bob);
      ctx.lineTo(x + 50, y + 32 + bob); ctx.lineTo(x + 10, y + 32 + bob);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 23 + bob); ctx.lineTo(x + 55, y + 23 + bob);
      ctx.lineTo(x + 49, y + 31 + bob); ctx.lineTo(x + 11, y + 31 + bob);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 23 + bob, 48, 1);
      // Seats
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 18, y + 25 + bob, 24, 2);
      // Oars
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 14, y + 18 + bob, 2, 14);
      ctx.fillRect(x + 44, y + 18 + bob, 2, 14);
      ctx.fillStyle = '#a67c3d';
      ctx.fillRect(x + 10, y + 14 + bob, 8, 4);
      ctx.fillRect(x + 42, y + 14 + bob, 8, 4);
    } else if (kind === 'sailboat') {
      // Hull
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 28 + bob); ctx.lineTo(x + 56, y + 28 + bob);
      ctx.lineTo(x + 48, y + 34 + bob); ctx.lineTo(x + 12, y + 34 + bob);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 6, y + 28 + bob, 48, 5);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6, y + 28 + bob, 48, 1);
      // Mast
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + 29, y + 4 + bob, 2, 24);
      // Mainsail
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(x + 30, y + 4 + bob);
      ctx.lineTo(x + 30, y + 26 + bob);
      ctx.lineTo(x + 50, y + 26 + bob);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8e8e8';
      ctx.beginPath();
      ctx.moveTo(x + 31, y + 6 + bob);
      ctx.lineTo(x + 31, y + 25 + bob);
      ctx.lineTo(x + 47, y + 25 + bob);
      ctx.closePath(); ctx.fill();
      // Jib
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 8 + bob);
      ctx.lineTo(x + 28, y + 26 + bob);
      ctx.lineTo(x + 14, y + 26 + bob);
      ctx.closePath(); ctx.fill();
      // Stripe on mainsail
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 31, y + 14 + bob, 16, 2);
    } else if (kind === 'motorboat') {
      // Hull
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 24 + bob); ctx.lineTo(x + 56, y + 24 + bob);
      ctx.lineTo(x + 56, y + 30 + bob); ctx.lineTo(x + 8, y + 34 + bob);
      ctx.lineTo(x + 2, y + 30 + bob);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 25 + bob); ctx.lineTo(x + 55, y + 25 + bob);
      ctx.lineTo(x + 55, y + 29 + bob); ctx.lineTo(x + 9, y + 33 + bob);
      ctx.lineTo(x + 3, y + 29 + bob);
      ctx.closePath(); ctx.fill();
      // Cabin
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 16, y + 16 + bob, 24, 8);
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 14, y + 14 + bob, 28, 2);
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 17, y + 17 + bob, 22, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 18, y + 18 + bob, 4, 2);
      // Wake
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(x + 56, y + 28 + bob, 4, 2);
      ctx.fillRect(x + 60, y + 26 + bob, 2, 2);
    }
  },

  // PLANE (60x40)
  plane(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const kind = opts.kind || 'jet';
    if (kind === 'biplane') {
      // Lower wing
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 22, 44, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 8, y + 22, 44, 2);
      // Body
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 18, y + 14, 30, 12);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 19, y + 15, 28, 10);
      // Cockpit
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 28, y + 12, 8, 4);
      // Upper wing
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 8, y + 6, 44, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 8, y + 6, 44, 2);
      // Struts
      ctx.fillStyle = c.dark;
      [12, 24, 36, 48].forEach(px => ctx.fillRect(x + px, y + 10, 1, 12));
      // Tail
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 48, y + 8, 4, 18);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 48, y + 9, 3, 16);
      // Propeller
      const spin = Math.floor(time / 2) % 2;
      ctx.fillStyle = '#3a3a3e';
      if (spin) {
        ctx.fillRect(x + 14, y + 14, 4, 12);
      } else {
        ctx.fillRect(x + 12, y + 18, 8, 4);
      }
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 15, y + 19, 2, 2);
    } else if (kind === 'airliner') {
      // Body — long
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x, y + 18); ctx.lineTo(x + 50, y + 18);
      ctx.lineTo(x + 56, y + 22); ctx.lineTo(x + 50, y + 26);
      ctx.lineTo(x, y + 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + 19); ctx.lineTo(x + 49, y + 19);
      ctx.lineTo(x + 54, y + 22); ctx.lineTo(x + 49, y + 25);
      ctx.lineTo(x + 1, y + 25);
      ctx.closePath(); ctx.fill();
      // Stripe
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 22, 50, 1);
      // Cockpit
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 2, y + 20, 6, 4);
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 3, y + 21, 4, 2);
      // Windows
      ctx.fillStyle = '#bcd2dc';
      [12, 18, 24, 30, 36, 42].forEach(px => ctx.fillRect(x + px, y + 21, 3, 2));
      // Wings — top-down view via wide span
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 26); ctx.lineTo(x + 30, y + 26);
      ctx.lineTo(x + 16, y + 36); ctx.lineTo(x + 8, y + 36);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 8, y + 30, 14, 6);
      // Tail
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 44, y + 18); ctx.lineTo(x + 52, y + 18);
      ctx.lineTo(x + 52, y + 6); ctx.lineTo(x + 48, y + 6);
      ctx.closePath(); ctx.fill();
      // Engines under wings
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 12, y + 32, 6, 4);
      ctx.fillRect(x + 22, y + 32, 6, 4);
    } else { // jet (fighter)
      // Body
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x, y + 20); ctx.lineTo(x + 48, y + 20);
      ctx.lineTo(x + 56, y + 18); ctx.lineTo(x + 56, y + 22);
      ctx.lineTo(x + 48, y + 24); ctx.lineTo(x, y + 24);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + 21); ctx.lineTo(x + 47, y + 21);
      ctx.lineTo(x + 53, y + 21); ctx.lineTo(x + 47, y + 23);
      ctx.lineTo(x + 1, y + 23);
      ctx.closePath(); ctx.fill();
      // Cockpit
      ctx.fillStyle = '#bcd2dc';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 18); ctx.lineTo(x + 18, y + 18);
      ctx.lineTo(x + 14, y + 14); ctx.lineTo(x + 8, y + 14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 8, y + 15, 8, 3);
      // Wings — delta
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 24); ctx.lineTo(x + 36, y + 24);
      ctx.lineTo(x + 32, y + 34); ctx.lineTo(x + 12, y + 34);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 26); ctx.lineTo(x + 34, y + 26);
      ctx.lineTo(x + 30, y + 32); ctx.lineTo(x + 16, y + 32);
      ctx.closePath(); ctx.fill();
      // Tail fin
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x + 38, y + 20); ctx.lineTo(x + 50, y + 20);
      ctx.lineTo(x + 44, y + 8);
      ctx.closePath(); ctx.fill();
      // Afterburner
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 56, y + 19, 4, 4);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 58, y + 20, 2, 2);
    }
  },

  // TRAIN (88x44)
  train(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const kind = opts.kind || 'steam';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 42, 80, 2);
    if (kind === 'steam') {
      // Cab
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 12, 28, 24);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 5, y + 13, 26, 22);
      // Boiler
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 28, y + 18, 44, 18);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 28, y + 19, 44, 16);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 28, y + 19, 44, 2);
      // Boiler bands
      ctx.fillStyle = c.dark;
      [40, 52, 64].forEach(px => ctx.fillRect(x + px, y + 19, 1, 16));
      // Cab window
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 8, y + 16, 14, 10);
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 9, y + 17, 12, 8);
      // Smokestack
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 60, y + 6, 8, 14);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 61, y + 7, 6, 12);
      // Smoke
      if (Math.floor(time / 8) % 2) {
        ctx.fillStyle = 'rgba(180,180,180,0.6)';
        ctx.fillRect(x + 60, y - 2 - (time % 6), 6, 4);
        ctx.fillRect(x + 56, y - 8 - (time % 8), 4, 4);
      }
      // Front
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 72, y + 22, 4, 14);
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 76, y + 22, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe080';
      ctx.beginPath(); ctx.arc(x + 76, y + 22, 2, 0, Math.PI * 2); ctx.fill();
      // Wheels
      ctx.fillStyle = '#1a1a1a';
      [14, 38, 52, 66].forEach(px => {
        ctx.beginPath(); ctx.arc(x + px, y + 38, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3a3a3e';
        ctx.beginPath(); ctx.arc(x + px, y + 38, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a1a1a';
      });
    } else if (kind === 'passenger') {
      // Long car
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 12, 88, 26);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 13, 86, 24);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 1, y + 13, 86, 3);
      // Roof
      ctx.fillStyle = c.dark;
      ctx.fillRect(x, y + 8, 88, 4);
      ctx.fillStyle = c.main;
      ctx.fillRect(x + 1, y + 9, 86, 2);
      // Windows
      ctx.fillStyle = '#bcd2dc';
      [4, 14, 24, 34, 44, 54, 64, 74].forEach(px => ctx.fillRect(x + px, y + 18, 8, 8));
      ctx.fillStyle = '#5a9fff';
      [4, 14, 24, 34, 44, 54, 64, 74].forEach(px => ctx.fillRect(x + px + 1, y + 19, 6, 6));
      // Door
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 84, y + 14, 4, 22);
      // Wheels
      ctx.fillStyle = '#1a1a1a';
      [12, 28, 60, 76].forEach(px => {
        ctx.beginPath(); ctx.arc(x + px, y + 38, 4, 0, Math.PI * 2); ctx.fill();
      });
    } else { // bullet
      // Streamlined nose
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(x, y + 22); ctx.lineTo(x + 16, y + 12);
      ctx.lineTo(x + 84, y + 12); ctx.lineTo(x + 88, y + 16);
      ctx.lineTo(x + 88, y + 36); ctx.lineTo(x, y + 36);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + 23); ctx.lineTo(x + 17, y + 13);
      ctx.lineTo(x + 83, y + 13); ctx.lineTo(x + 87, y + 16);
      ctx.lineTo(x + 87, y + 35); ctx.lineTo(x + 1, y + 35);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 4, y + 16, 80, 2);
      // Stripe
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4, y + 22, 80, 2);
      // Cockpit window
      ctx.fillStyle = '#bcd2dc';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 26); ctx.lineTo(x + 12, y + 18);
      ctx.lineTo(x + 16, y + 18); ctx.lineTo(x + 16, y + 26);
      ctx.closePath(); ctx.fill();
      // Side windows
      ctx.fillStyle = '#bcd2dc';
      [22, 32, 42, 52, 62, 72].forEach(px => ctx.fillRect(x + px, y + 18, 6, 4));
      // Wheels
      ctx.fillStyle = '#1a1a1a';
      [16, 32, 56, 72].forEach(px => {
        ctx.beginPath(); ctx.arc(x + px, y + 38, 3, 0, Math.PI * 2); ctx.fill();
      });
    }
  },

  // HOT AIR BALLOON (44x68)
  balloon(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'rainbow' ? null : this._palette[opts.color || 'pink'];
    const sway = Math.sin(time / 30) * 1;
    // Balloon
    if (c) {
      ctx.fillStyle = c.dark;
      ctx.beginPath(); ctx.ellipse(x + 22 + sway, y + 22, 20, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.ellipse(x + 22 + sway, y + 22, 18, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.dark;
      [-12, -4, 4, 12].forEach(off => {
        ctx.beginPath(); ctx.ellipse(x + 22 + sway + off, y + 22, 1, 20, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = c.light;
      ctx.beginPath(); ctx.ellipse(x + 16 + sway, y + 12, 4, 8, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
    } else {
      const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
      colors.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x + 22 + sway, y + 4);
        ctx.arc(x + 22 + sway, y + 22, 20, -Math.PI / 2 + (i / 4) * Math.PI, -Math.PI / 2 + ((i + 1) / 4) * Math.PI);
        ctx.lineTo(x + 22 + sway, y + 22);
        ctx.closePath();
        ctx.fill();
      });
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x + 22 + sway, y + 22, 20, 22, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Ropes
    ctx.strokeStyle = '#3a2510';
    ctx.lineWidth = 1;
    [10, 18, 26, 34].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px + sway / 2, y + 42);
      ctx.lineTo(x + 14 + (px - 22) / 4, y + 56);
      ctx.stroke();
    });
    // Basket
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 12, y + 56, 20, 10);
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 13, y + 57, 18, 8);
    // Weave
    ctx.strokeStyle = '#5a3a1a';
    [13, 15, 17, 19, 21, 23, 25, 27, 29, 31].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px, y + 57);
      ctx.lineTo(x + px, y + 64);
      ctx.stroke();
    });
    [58, 61, 64].forEach(yy => {
      ctx.beginPath();
      ctx.moveTo(x + 13, y + yy);
      ctx.lineTo(x + 31, y + yy);
      ctx.stroke();
    });
    // Burner flame
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 20, y + 50, 4, 6);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 21, y + 51, 2, 4);
  },

  // HELICOPTER (60x40)
  helicopter(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const spin = Math.floor(time / 2) % 4;
    // Rotor blade
    ctx.fillStyle = '#1a1a1a';
    if (spin === 0) ctx.fillRect(x + 4, y + 6, 52, 2);
    else if (spin === 1) ctx.fillRect(x + 26, y, 8, 14);
    else if (spin === 2) ctx.fillRect(x + 4, y + 6, 52, 2);
    else ctx.fillRect(x + 26, y, 8, 14);
    // Rotor mast
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 28, y + 6, 4, 6);
    // Body
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(x + 24, y + 22, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(x + 24, y + 22, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 14, y + 18, 20, 1);
    // Cockpit window
    ctx.fillStyle = '#bcd2dc';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 22, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a9fff';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 22, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Tail boom
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 38, y + 20, 18, 4);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 38, y + 21, 18, 2);
    // Tail rotor
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 54, y + 16, 2, 12);
    // Stripe
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 12, y + 24, 20, 1);
    // Skids
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 10, y + 32, 30, 2);
    ctx.fillRect(x + 14, y + 30, 1, 4);
    ctx.fillRect(x + 34, y + 30, 1, 4);
  },

  // SUBMARINE (60x36)
  submarine(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const bob = Math.sin(time / 16) * 1;
    // Water bg
    ctx.fillStyle = 'rgba(41,121,255,0.2)';
    ctx.fillRect(x, y, 60, 36);
    // Body
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(x + 30, y + 22 + bob, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(x + 30, y + 22 + bob, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 8, y + 19 + bob, 44, 1);
    // Conning tower
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 24, y + 10 + bob, 14, 8);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 25, y + 11 + bob, 12, 7);
    // Periscope
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 30, y + 4 + bob, 2, 8);
    ctx.fillRect(x + 30, y + 4 + bob, 4, 2);
    // Portholes
    ctx.fillStyle = '#3a3a3e';
    [12, 22, 32, 42].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 22 + bob, 2.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#F5A623';
    [12, 22, 32, 42].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 22 + bob, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    // Propeller (right)
    ctx.fillStyle = '#a0a0a8';
    const propBlur = Math.floor(time / 2) % 2;
    if (propBlur) ctx.fillRect(x + 56, y + 18 + bob, 2, 8);
    else ctx.fillRect(x + 54, y + 21 + bob, 4, 2);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 53, y + 21 + bob, 2, 2);
    // Bubbles
    if (Math.floor(time / 6) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(x + 58, y + 14 - (time % 12), 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 60, y + 8 - (time % 16), 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }
};

if (typeof module !== 'undefined') module.exports = TRANSPORT;
