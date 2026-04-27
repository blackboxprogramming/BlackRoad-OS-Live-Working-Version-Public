// PIXEL FOUNDRY — COSMIC (with axes)
// planet, star, comet, spaceship, asteroid, alien, nebula, moon, blackhole, satellite

const COSMIC = {
  AXES: {
    planet:    { kind: ['rocky','gas','ice','desert','lava','ocean'], ring: ['no','yes'] },
    star:      { size: ['s','m','l'], color: ['white','amber','blue','pink','violet'] },
    spaceship: { kind: ['shuttle','saucer','freighter'], color: ['pink','amber','violet','blue','white'] },
    alien:     { color: ['violet','blue','pink','amber','white'], size: ['s','m','l'] },
    nebula:    { color: ['pink','amber','violet','blue'] },
    moon:      { phase: ['new','crescent','half','gibbous','full'] }
  },

  _planet: {
    rocky:  { main: '#a85a26', dark: '#7a3a18', light: '#daa86a', accent: '#5a2a14' },
    gas:    { main: '#F5A623', dark: '#c4851c', light: '#ffc46b', accent: '#FF1D6C' },
    ice:    { main: '#bcd2dc', dark: '#7a9aa8', light: '#dceaf2', accent: '#5a9fff' },
    desert: { main: '#daa86a', dark: '#a67c3d', light: '#f0c890', accent: '#7a5028' },
    lava:   { main: '#3a1a08', dark: '#1a0a04', light: '#5a2a14', accent: '#FF1D6C' },
    ocean:  { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff', accent: '#3a7a3a' }
  },

  // PLANET (60x60)
  planet(ctx, x, y, opts = {}, time = 0) {
    const p = this._planet[opts.kind || 'rocky'];
    const ring = opts.ring === 'yes';
    const cx = x + 30, cy = y + 30, r = 22;
    // Back of ring
    if (ring) {
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy, 32, 8, 0, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = p.light;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, 32, 8, 0, Math.PI, Math.PI * 2); ctx.stroke();
    }
    // Globe
    ctx.fillStyle = p.dark;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.main;
    ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.fill();
    // Surface details by kind
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.clip();
    if (opts.kind === 'gas') {
      // Bands
      ctx.fillStyle = p.dark;
      [-12, -4, 6, 14].forEach(dy => ctx.fillRect(cx - r, cy + dy, r * 2, 3));
      ctx.fillStyle = p.accent;
      ctx.beginPath(); ctx.arc(cx + 6, cy - 2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = p.light;
      [-8, 2, 10].forEach(dy => ctx.fillRect(cx - r, cy + dy, r * 2, 1));
    } else if (opts.kind === 'rocky') {
      // Craters
      [[-6, -8, 4], [4, -2, 5], [-10, 6, 3], [8, 8, 4], [-2, 12, 3]].forEach(([dx, dy, sz]) => {
        ctx.fillStyle = p.dark;
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, sz, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.accent;
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, sz - 1, 0, Math.PI * 2); ctx.fill();
      });
    } else if (opts.kind === 'ice') {
      ctx.fillStyle = p.light;
      ctx.beginPath(); ctx.ellipse(cx, cy - 18, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy + 18, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = p.accent;
      [[6, -2], [-8, 4], [2, 10]].forEach(([dx, dy]) => {
        ctx.fillRect(cx + dx, cy + dy, 4, 1);
      });
    } else if (opts.kind === 'desert') {
      ctx.fillStyle = p.dark;
      [-12, -2, 8].forEach(dy => {
        for (let dx = -r; dx < r; dx += 6) {
          ctx.fillRect(cx + dx + ((dy + r) % 4), cy + dy, 3, 1);
        }
      });
    } else if (opts.kind === 'lava') {
      // Cracks
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 1;
      [[-12, -4, 8, 6], [4, -10, 14, 8], [-8, 8, 4, 14]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(cx + x1, cy + y1);
        ctx.quadraticCurveTo(cx + (x1 + x2) / 2 + 2, cy + (y1 + y2) / 2 - 2, cx + x2, cy + y2);
        ctx.stroke();
      });
      ctx.fillStyle = '#F5A623';
      [[2, -2], [-4, 6]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2); ctx.fill();
      });
    } else if (opts.kind === 'ocean') {
      ctx.fillStyle = p.accent;
      [[-8, -6, 8, 4], [4, 4, 6, 5], [-2, 10, 5, 3]].forEach(([dx, dy, w, h]) => {
        ctx.beginPath(); ctx.ellipse(cx + dx, cy + dy, w, h, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#fff';
      [-12, -2, 10].forEach(dy => {
        ctx.fillRect(cx - r, cy + dy, r * 2, 1);
      });
    }
    // Day/night terminator
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(cx + 5, cy, r - 1, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(cx + 5, cy + r);
    ctx.lineTo(cx + r, cy + r);
    ctx.lineTo(cx + r, cy - r);
    ctx.closePath(); ctx.fill();
    // Specular
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(cx - 8, cy - 8, 4, 6, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Front of ring
    if (ring) {
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy, 32, 8, 0, 0, Math.PI); ctx.stroke();
      ctx.strokeStyle = p.light;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, 32, 8, 0, 0, Math.PI); ctx.stroke();
    }
  },

  // STAR (32x32)
  star(ctx, x, y, opts = {}, time = 0) {
    const sz = { s: 0.6, m: 1, l: 1.4 }[opts.size || 'm'];
    const c = { white: '#ffffff', amber: '#F5A623', blue: '#5a9fff', pink: '#FF1D6C', violet: '#c34dd6' }[opts.color || 'white'];
    const halo = { white: 'rgba(255,255,255,0.4)', amber: 'rgba(245,166,35,0.4)', blue: 'rgba(90,159,255,0.4)', pink: 'rgba(255,29,108,0.4)', violet: 'rgba(195,77,214,0.4)' }[opts.color || 'white'];
    const cx = x + 16, cy = y + 16;
    const pulse = 0.7 + Math.sin(time / 8) * 0.2;
    // Halo
    ctx.fillStyle = halo;
    ctx.globalAlpha = pulse;
    ctx.beginPath(); ctx.arc(cx, cy, 12 * sz, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Cross rays
    ctx.fillStyle = c;
    ctx.fillRect(cx - 14 * sz, cy, 28 * sz, 1);
    ctx.fillRect(cx, cy - 14 * sz, 1, 28 * sz);
    // Diagonal rays
    ctx.globalAlpha = 0.6;
    for (let i = -10; i < 10; i++) {
      ctx.fillRect(cx + i * sz, cy + i * sz, 1, 1);
      ctx.fillRect(cx + i * sz, cy - i * sz, 1, 1);
    }
    ctx.globalAlpha = 1;
    // Core
    ctx.beginPath(); ctx.arc(cx, cy, 4 * sz, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, 2 * sz, 0, Math.PI * 2); ctx.fill();
  },

  // COMET (60x32)
  comet(ctx, x, y, time = 0) {
    const drift = Math.sin(time / 30) * 1;
    const cx = x + 12, cy = y + 12 + drift;
    // Tail
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const tx = cx + i + Math.sin(time / 15 + i / 4) * 1.5;
      const ty = cy + i * 0.4;
      const sz = (1 - t) * 4;
      ctx.fillStyle = `rgba(245,166,35,${(1 - t) * 0.6})`;
      ctx.fillRect(tx, ty, sz, sz);
      if (i % 3 === 0) {
        ctx.fillStyle = `rgba(255,255,255,${(1 - t) * 0.8})`;
        ctx.fillRect(tx, ty - 1, 1, 1);
      }
    }
    // Head
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
  },

  // SPACESHIP (60x40)
  spaceship(ctx, x, y, opts = {}, time = 0) {
    const kind = opts.kind || 'shuttle';
    const c = { pink: '#FF1D6C', amber: '#F5A623', violet: '#9C27B0', blue: '#2979FF', white: '#f0f0f0' }[opts.color || 'amber'];
    const cd = { pink: '#c41758', amber: '#c4851c', violet: '#7b1f8c', blue: '#1f5fcc', white: '#c0c0c0' }[opts.color || 'amber'];
    const cl = { pink: '#ff5a90', amber: '#ffc46b', violet: '#c34dd6', blue: '#5a9fff', white: '#ffffff' }[opts.color || 'amber'];
    const hover = Math.sin(time / 12) * 1;
    if (kind === 'saucer') {
      // Bottom dome
      ctx.fillStyle = cd;
      ctx.beginPath(); ctx.ellipse(x + 30, y + 24 + hover, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
      // Body
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(x + 30, y + 22 + hover, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cl;
      ctx.beginPath(); ctx.ellipse(x + 30, y + 20 + hover, 24, 4, 0, 0, Math.PI * 2); ctx.fill();
      // Cockpit
      ctx.fillStyle = '#bcd2dc';
      ctx.beginPath(); ctx.ellipse(x + 30, y + 16 + hover, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a9fff';
      ctx.beginPath(); ctx.ellipse(x + 30, y + 16 + hover, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + 28, y + 14 + hover, 2, 0, Math.PI * 2); ctx.fill();
      // Lights
      [10, 22, 30, 38, 50].forEach((lx, i) => {
        ctx.fillStyle = Math.floor((time + i * 8) / 8) % 2 ? '#FF1D6C' : '#3a0a14';
        ctx.fillRect(x + lx, y + 24 + hover, 2, 2);
      });
    } else if (kind === 'freighter') {
      // Long blocky hull
      ctx.fillStyle = cd;
      ctx.fillRect(x + 4, y + 16 + hover, 52, 14);
      ctx.fillStyle = c;
      ctx.fillRect(x + 6, y + 18 + hover, 48, 10);
      ctx.fillStyle = cl;
      ctx.fillRect(x + 6, y + 18 + hover, 48, 1);
      // Cargo blocks
      [10, 22, 34].forEach(bx => {
        ctx.fillStyle = cd;
        ctx.fillRect(x + bx, y + 12 + hover, 8, 6);
        ctx.fillStyle = cl;
        ctx.fillRect(x + bx + 1, y + 13 + hover, 6, 1);
      });
      // Cockpit
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 46, y + 14 + hover, 10, 6);
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 47, y + 15 + hover, 8, 4);
      // Engines
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x, y + 20 + hover, 6, 6);
      ctx.fillStyle = '#2979FF';
      ctx.fillRect(x - 4, y + 22 + hover, 4, 2);
    } else { // shuttle — pointed
      ctx.fillStyle = cd;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 30 + hover);
      ctx.lineTo(x + 50, y + 30 + hover);
      ctx.lineTo(x + 56, y + 22 + hover);
      ctx.lineTo(x + 50, y + 14 + hover);
      ctx.lineTo(x + 8, y + 14 + hover);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 28 + hover);
      ctx.lineTo(x + 48, y + 28 + hover);
      ctx.lineTo(x + 54, y + 22 + hover);
      ctx.lineTo(x + 48, y + 16 + hover);
      ctx.lineTo(x + 10, y + 16 + hover);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = cl;
      ctx.fillRect(x + 10, y + 16 + hover, 38, 2);
      // Cockpit
      ctx.fillStyle = '#bcd2dc';
      ctx.fillRect(x + 40, y + 18 + hover, 12, 8);
      ctx.fillStyle = '#5a9fff';
      ctx.fillRect(x + 41, y + 19 + hover, 10, 6);
      // Engine glow
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 4, y + 18 + hover, 4, 8);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 2, y + 20 + hover, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 1, y + 21 + hover, 3, 2);
    }
  },

  // ASTEROID (28x28)
  asteroid(ctx, x, y, time = 0) {
    const tumble = Math.floor(time / 30) % 4;
    const cx = x + 14, cy = y + 14;
    // Irregular shape
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath();
    const points = [[12, 0], [14, 4], [12, 9], [10, 12], [4, 11], [0, 7], [-2, 2], [0, -4], [4, -7], [9, -8], [11, -4]];
    points.forEach(([px, py], i) => {
      const wobble = Math.sin(time / 20 + i + tumble) * 0.5;
      if (i === 0) ctx.moveTo(cx + px + wobble, cy + py);
      else ctx.lineTo(cx + px + wobble, cy + py);
    });
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(cx + px * 0.9, cy + py * 0.9);
      else ctx.lineTo(cx + px * 0.9, cy + py * 0.9);
    });
    ctx.closePath(); ctx.fill();
    // Craters
    ctx.fillStyle = '#3a3a3e';
    [[-3, -2, 2], [4, -3, 1.5], [2, 4, 2], [-5, 3, 1.5]].forEach(([dx, dy, r]) => {
      ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#1a1a1a';
    [[-3, -2, 1], [4, -3, 0.8], [2, 4, 1]].forEach(([dx, dy, r]) => {
      ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill();
    });
    // Highlight
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(cx - 7, cy - 5, 4, 1);
  },

  // ALIEN (28x40)
  alien(ctx, x, y, opts = {}, time = 0) {
    const c = { violet: '#9C27B0', blue: '#2979FF', pink: '#FF1D6C', amber: '#F5A623', white: '#f0f0f0' }[opts.color || 'violet'];
    const cd = { violet: '#7b1f8c', blue: '#1f5fcc', pink: '#c41758', amber: '#c4851c', white: '#c0c0c0' }[opts.color || 'violet'];
    const cl = { violet: '#c34dd6', blue: '#5a9fff', pink: '#ff5a90', amber: '#ffc46b', white: '#ffffff' }[opts.color || 'violet'];
    const sz = { s: 0.7, m: 1, l: 1.3 }[opts.size || 'm'];
    const sway = Math.sin(time / 20) * 1;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 38, 16, 2);
    // Antennae
    ctx.fillStyle = cd;
    ctx.fillRect(x + 10 + sway, y + 2, 1, 6);
    ctx.fillRect(x + 17 - sway, y + 2, 1, 6);
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 10 + sway, y + 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 17 - sway, y + 2, 2, 0, Math.PI * 2); ctx.fill();
    // Big head
    ctx.fillStyle = cd;
    ctx.beginPath(); ctx.ellipse(x + 14, y + 14, 12 * sz, 10 * sz, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(x + 14, y + 13, 11 * sz, 9 * sz, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cl;
    ctx.fillRect(x + 8, y + 8, 12, 2);
    // Big black eyes
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x + 10, y + 14, 3, 4, -Math.PI / 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 18, y + 14, 3, 4, Math.PI / 8, 0, Math.PI * 2); ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 12, 1, 2);
    ctx.fillRect(x + 17, y + 12, 1, 2);
    // Mouth
    ctx.fillStyle = cd;
    ctx.fillRect(x + 12, y + 19, 4, 1);
    // Body
    ctx.fillStyle = cd;
    ctx.fillRect(x + 10, y + 22, 8, 16);
    ctx.fillStyle = c;
    ctx.fillRect(x + 11, y + 22, 6, 16);
    // Arms
    ctx.fillStyle = c;
    ctx.fillRect(x + 7, y + 24, 3, 12);
    ctx.fillRect(x + 18, y + 24, 3, 12);
    // 3-fingered hands
    ctx.fillStyle = cd;
    [7, 18].forEach(hx => {
      ctx.fillRect(x + hx, y + 36, 1, 2);
      ctx.fillRect(x + hx + 1, y + 36, 1, 2);
      ctx.fillRect(x + hx + 2, y + 36, 1, 2);
    });
  },

  // NEBULA (60x40)
  nebula(ctx, x, y, opts = {}, time = 0) {
    const c = { pink: ['#FF1D6C','#c41758','#ff5a90'],
                amber:['#F5A623','#c4851c','#ffc46b'],
                violet:['#9C27B0','#7b1f8c','#c34dd6'],
                blue: ['#2979FF','#1f5fcc','#5a9fff'] }[opts.color || 'violet'];
    // Background fade
    const drift = Math.sin(time / 30) * 2;
    ctx.fillStyle = `rgba(${parseInt(c[0].slice(1, 3), 16)},${parseInt(c[0].slice(3, 5), 16)},${parseInt(c[0].slice(5, 7), 16)},0.15)`;
    ctx.fillRect(x, y, 60, 40);
    // Cloud blobs
    [[12, 12, 16], [40, 14, 18], [28, 24, 14], [50, 28, 12], [10, 28, 10]].forEach(([cx, cy, r], i) => {
      const cl = c[i % 3];
      ctx.fillStyle = cl + '40';
      ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cl + '80';
      ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cl;
      ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r * 0.4, 0, Math.PI * 2); ctx.fill();
    });
    // Stars sprinkled
    for (let i = 0; i < 25; i++) {
      const sx = (i * 7) % 60;
      const sy = (i * 11) % 40;
      const twinkle = (time + i * 30) % 60 < 8;
      ctx.fillStyle = twinkle ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + sx, y + sy, 1, 1);
    }
  },

  // MOON (32x32)
  moon(ctx, x, y, opts = {}, time = 0) {
    const phase = opts.phase || 'full';
    const cx = x + 16, cy = y + 16, r = 13;
    // Halo
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.fill();
    // Disc
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    // Lit portion based on phase
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#e0e0e8';
    if (phase === 'full') {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    } else if (phase === 'gibbous') {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3a3e';
      ctx.beginPath(); ctx.ellipse(cx - 8, cy, 8, r, 0, 0, Math.PI * 2); ctx.fill();
    } else if (phase === 'half') {
      ctx.fillRect(cx, cy - r, r, r * 2);
    } else if (phase === 'crescent') {
      ctx.beginPath(); ctx.arc(cx + 4, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3a3e';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    // Craters on lit side
    if (phase !== 'new') {
      ctx.fillStyle = '#a0a0a8';
      [[2, -4, 2], [-3, 3, 2.5], [6, 5, 2], [3, -7, 1.5]].forEach(([dx, dy, sz]) => {
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, sz, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();
  },

  // BLACKHOLE (40x40)
  blackhole(ctx, x, y, time = 0) {
    const cx = x + 20, cy = y + 20;
    const spin = time / 8;
    // Accretion disk
    for (let r = 18; r > 6; r -= 2) {
      const a = (spin + r) % (Math.PI * 2);
      const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
      ctx.fillStyle = colors[(r / 2) % 4] + '88';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.4, a / 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Event horizon
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    // Ring
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
  },

  // SATELLITE (36x32)
  satellite(ctx, x, y, time = 0) {
    const blink = Math.floor(time / 12) % 2;
    // Solar panels
    ctx.fillStyle = '#1f5fcc';
    ctx.fillRect(x, y + 12, 12, 8);
    ctx.fillRect(x + 24, y + 12, 12, 8);
    ctx.fillStyle = '#5a9fff';
    [2, 5, 8].forEach(dx => {
      ctx.fillRect(x + dx, y + 13, 1, 6);
      ctx.fillRect(x + 24 + dx, y + 13, 1, 6);
    });
    // Mount arms
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 12, y + 15, 2, 2);
    ctx.fillRect(x + 22, y + 15, 2, 2);
    // Body
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 14, y + 10, 8, 12);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 14, y + 10, 8, 2);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 15, y + 14, 6, 4);
    // Antenna dish
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 17, y + 4, 2, 6);
    ctx.beginPath(); ctx.arc(x + 18, y + 4, 4, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#5a5a60';
    ctx.beginPath(); ctx.arc(x + 18, y + 4, 3, 0, Math.PI); ctx.fill();
    // LEDs
    ctx.fillStyle = blink ? '#FF1D6C' : '#3a0a14';
    ctx.fillRect(x + 16, y + 20, 2, 1);
    ctx.fillStyle = blink ? '#3acc3a' : '#0a3a14';
    ctx.fillRect(x + 19, y + 20, 1, 1);
  }
};

if (typeof module !== 'undefined') module.exports = COSMIC;
