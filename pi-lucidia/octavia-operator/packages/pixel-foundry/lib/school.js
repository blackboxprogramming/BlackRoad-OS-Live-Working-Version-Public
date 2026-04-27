// PIXEL FOUNDRY — SCHOOL
// chalkboard, schoolDesk, locker, globe, hamsterCage, supplyCabinet,
// artEasel, periodicTable, lunchTray, schoolBackpack, schoolBus

const SCHOOL = {
  AXES: {
    locker:        { color: ['blue','red','green','amber','violet'] },
    schoolBackpack:{ color: ['pink','blue','amber','violet','red'] },
    artEasel:      { painting: ['sunset','flowers','abstract','blank'] },
    chalkboard:    { content: ['math','letters','blank'] },
  },

  // CHALKBOARD (60x36) — green slate with optional content
  chalkboard(ctx, x, y, opts = {}, time = 0) {
    const content = opts.content || 'math';
    // Wood frame
    ctx.fillStyle = '#7E5A40';
    ctx.fillRect(x, y, 60, 36);
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x, y, 60, 2);
    ctx.fillRect(x, y + 34, 60, 2);
    ctx.fillRect(x, y, 2, 36);
    ctx.fillRect(x + 58, y, 2, 36);
    // Slate
    ctx.fillStyle = '#1F4D2E';
    ctx.fillRect(x + 3, y + 3, 54, 28);
    ctx.fillStyle = '#2A6840';
    ctx.fillRect(x + 3, y + 3, 54, 1);
    // Chalk dust
    ctx.fillStyle = 'rgba(245,240,224,0.15)';
    for (let i = 0; i < 18; i++) {
      const dx = x + 4 + (i * 13) % 50;
      const dy = y + 4 + (i * 7) % 26;
      ctx.fillRect(dx, dy, 1, 1);
    }
    // Content
    ctx.fillStyle = '#F5F0E0';
    if (content === 'math') {
      // "2 + 2 = 4" stylized as bars
      ctx.fillRect(x + 8, y + 10, 4, 1); ctx.fillRect(x + 8, y + 14, 4, 1);
      ctx.fillRect(x + 16, y + 12, 4, 1); ctx.fillRect(x + 18, y + 10, 1, 5);
      ctx.fillRect(x + 22, y + 10, 4, 1); ctx.fillRect(x + 22, y + 14, 4, 1);
      ctx.fillRect(x + 30, y + 11, 4, 1); ctx.fillRect(x + 30, y + 13, 4, 1);
      ctx.fillRect(x + 38, y + 10, 1, 5); ctx.fillRect(x + 38, y + 14, 4, 1);
      ctx.fillRect(x + 41, y + 10, 1, 5);
      // Underline title
      ctx.fillRect(x + 8, y + 7, 22, 1);
    } else if (content === 'letters') {
      // ABC
      ctx.fillRect(x + 10, y + 8, 1, 8); ctx.fillRect(x + 14, y + 8, 1, 8);
      ctx.fillRect(x + 11, y + 7, 3, 1); ctx.fillRect(x + 11, y + 12, 3, 1);
      ctx.fillRect(x + 18, y + 8, 1, 8); ctx.fillRect(x + 22, y + 7, 1, 1);
      ctx.fillRect(x + 22, y + 15, 1, 1); ctx.fillRect(x + 19, y + 7, 3, 1);
      ctx.fillRect(x + 19, y + 11, 3, 1); ctx.fillRect(x + 19, y + 15, 3, 1);
      ctx.fillRect(x + 26, y + 8, 1, 7); ctx.fillRect(x + 30, y + 8, 1, 7);
      ctx.fillRect(x + 27, y + 7, 3, 1); ctx.fillRect(x + 27, y + 15, 3, 1);
    }
    // Chalk tray
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 2, y + 32, 56, 3);
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 8, y + 33, 6, 1);
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(x + 18, y + 33, 5, 1);
    ctx.fillStyle = '#7BA8C8';
    ctx.fillRect(x + 28, y + 33, 5, 1);
    // Eraser
    ctx.fillStyle = '#3D2818';
    ctx.fillRect(x + 44, y + 32, 10, 3);
    ctx.fillStyle = '#F2C58A';
    ctx.fillRect(x + 44, y + 32, 10, 1);
  },

  // SCHOOL DESK (28x32) — wood top, metal frame, attached chair
  schoolDesk(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 30, 24, 2);
    // Desk top
    ctx.fillStyle = '#C49363';
    ctx.fillRect(x, y + 6, 28, 6);
    ctx.fillStyle = '#8C5C34';
    ctx.fillRect(x, y + 11, 28, 1);
    ctx.fillStyle = '#A8754A';
    ctx.fillRect(x, y + 6, 28, 1);
    // Wood grain
    ctx.fillStyle = '#8C5C34';
    ctx.fillRect(x + 4, y + 8, 6, 1);
    ctx.fillRect(x + 14, y + 9, 8, 1);
    // Metal legs (front)
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x + 2, y + 12, 2, 18);
    ctx.fillRect(x + 24, y + 12, 2, 18);
    // Crossbar
    ctx.fillRect(x + 4, y + 22, 20, 1);
    // Book/notebook on desk
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 6, y + 4, 12, 2);
    ctx.fillStyle = '#2A6F95';
    ctx.fillRect(x + 6, y + 4, 12, 1);
    // Pencil
    ctx.fillStyle = '#F5C84A';
    ctx.fillRect(x + 18, y + 5, 7, 1);
    ctx.fillStyle = '#2A1F12';
    ctx.fillRect(x + 25, y + 5, 1, 1);
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(x + 17, y + 5, 1, 1);
  },

  // LOCKER (20x52) — tall school locker with vents
  locker(ctx, x, y, opts = {}, time = 0) {
    const colors = {
      blue:   { main: '#3D8FB6', dk: '#2A6F95', lt: '#5BA8C8' },
      red:    { main: '#C84A4A', dk: '#8E2E2E', lt: '#E0696A' },
      green:  { main: '#5BA85B', dk: '#2E7236', lt: '#7BC87B' },
      amber:  { main: '#D89B3D', dk: '#9E6E1F', lt: '#F5C84A' },
      violet: { main: '#7B5BA8', dk: '#5C4185', lt: '#9778C7' },
    };
    const c = colors[opts.color] || colors.blue;
    // Body
    ctx.fillStyle = c.dk;
    ctx.fillRect(x, y, 20, 52);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 1, 18, 50);
    // Top highlight
    ctx.fillStyle = c.lt;
    ctx.fillRect(x + 1, y + 1, 18, 1);
    // Vents (top)
    ctx.fillStyle = c.dk;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 5, y + 5 + i * 2, 10, 1);
    }
    // Number plate
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 7, y + 18, 6, 5);
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 8, y + 19, 1, 3);
    ctx.fillRect(x + 11, y + 19, 1, 3);
    // Handle
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x + 3, y + 28, 5, 2);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 3, y + 28, 5, 1);
    // Lock
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 14, y + 28, 3, 4);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 15, y + 29, 1, 1);
    // Bottom panel line
    ctx.fillStyle = c.dk;
    ctx.fillRect(x + 1, y + 38, 18, 1);
    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 1, y + 52, 18, 2);
  },

  // GLOBE (24x32) — spinning earth on stand
  globe(ctx, x, y, time = 0) {
    const cx = x + 12, cy = y + 12;
    const spin = (time / 50) % (Math.PI * 2);
    // Stand base
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 4, y + 30, 16, 2);
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 6, y + 28, 12, 4);
    ctx.fillStyle = '#8C5C34';
    ctx.fillRect(x + 6, y + 28, 12, 1);
    // Pole
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 11, y + 22, 2, 6);
    // Globe sphere
    ctx.fillStyle = '#3D8FB6';
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2A6F95';
    ctx.beginPath(); ctx.arc(cx, cy + 1, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3D8FB6';
    ctx.beginPath(); ctx.arc(cx - 1, cy - 1, 9, 0, Math.PI * 2); ctx.fill();
    // Continents (rotate)
    ctx.fillStyle = '#5BA85B';
    const cont = [
      [0, -3, 4, 3], [-2, 1, 3, 2], [3, 2, 3, 3],
      [-4, -1, 2, 2], [1, -1, 2, 1],
    ];
    for (const [dx, dy, w, h] of cont) {
      const rx = Math.cos(spin) * dx - Math.sin(spin) * 0;
      // simple lateral wrap
      const ax = cx + rx;
      const ay = cy + dy;
      // skip if behind sphere
      if (Math.cos(spin + dx * 0.3) < -0.3) continue;
      ctx.fillRect(ax, ay, w, h);
    }
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2); ctx.fill();
    // Axis ring
    ctx.strokeStyle = '#D89B3D';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 11, -0.4, Math.PI + 0.4); ctx.stroke();
  },

  // HAMSTER CAGE (40x32) — wire cage with wheel + bedding
  hamsterCage(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Base tray
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x, y + 22, 40, 8);
    ctx.fillStyle = '#2A6F95';
    ctx.fillRect(x, y + 28, 40, 2);
    // Bedding
    ctx.fillStyle = '#F2C58A';
    ctx.fillRect(x + 2, y + 22, 36, 4);
    ctx.fillStyle = '#D8AE6A';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(x + 3 + (i * 3) % 34, y + 22 + (i * 5) % 4, 1, 1);
    }
    // Wire bars (cage)
    ctx.strokeStyle = '#7E7B73';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 2 + i * 1.8, y + 4);
      ctx.lineTo(x + 2 + i * 1.8, y + 22);
      ctx.stroke();
    }
    // Cage top + bottom rim
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x, y + 2, 40, 2);
    ctx.fillRect(x, y + 21, 40, 2);
    // Handle on top
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x + 16, y, 8, 2);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 16, y, 8, 1);
    // Wheel (spinning)
    const wcx = x + 30, wcy = y + 14;
    const spin = time / 4;
    ctx.strokeStyle = '#FFB050';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(wcx, wcy, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = spin + (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wcx, wcy);
      ctx.lineTo(wcx + Math.cos(a) * 5, wcy + Math.sin(a) * 5);
      ctx.stroke();
    }
    // Hamster (left side)
    ctx.fillStyle = '#F2C58A';
    ctx.fillRect(x + 8, y + 16, 8, 5);
    ctx.fillStyle = '#D8AE6A';
    ctx.fillRect(x + 8, y + 19, 8, 2);
    ctx.fillStyle = '#F2C58A';
    ctx.fillRect(x + 14, y + 14, 4, 4);
    // Eye + nose
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 16, y + 15, 1, 1);
    ctx.fillStyle = '#F4A8C4';
    ctx.fillRect(x + 17, y + 17, 1, 1);
    // Water bottle
    ctx.fillStyle = '#7BA8C8';
    ctx.fillRect(x + 4, y + 6, 4, 8);
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 4, y + 6, 4, 1);
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x + 5, y + 14, 2, 3);
  },

  // SUPPLY CABINET (32x44) — wood cabinet with shelves of supplies
  supplyCabinet(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    // Frame
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x, y, 32, 44);
    ctx.fillStyle = '#8C5C34';
    ctx.fillRect(x + 2, y + 2, 28, 40);
    // Top trim
    ctx.fillStyle = '#A8754A';
    ctx.fillRect(x + 2, y + 2, 28, 1);
    // Shelves
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 2, y + 14, 28, 1);
    ctx.fillRect(x + 2, y + 26, 28, 1);
    ctx.fillRect(x + 2, y + 38, 28, 1);
    // Top shelf — books
    ctx.fillStyle = '#C84A4A';
    ctx.fillRect(x + 4, y + 6, 2, 8);
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 7, y + 6, 2, 8);
    ctx.fillStyle = '#5BA85B';
    ctx.fillRect(x + 10, y + 6, 2, 8);
    ctx.fillStyle = '#D89B3D';
    ctx.fillRect(x + 13, y + 6, 2, 8);
    ctx.fillStyle = '#7B5BA8';
    ctx.fillRect(x + 16, y + 6, 2, 8);
    ctx.fillStyle = '#E58B3D';
    ctx.fillRect(x + 19, y + 6, 2, 8);
    // Mid shelf — paper stack + pencil cup
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 4, y + 18, 12, 8);
    ctx.fillStyle = '#D8CFB7';
    ctx.fillRect(x + 4, y + 18, 12, 1);
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x + 20, y + 18, 8, 8);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 20, y + 18, 8, 1);
    ctx.fillStyle = '#F5C84A';
    ctx.fillRect(x + 22, y + 14, 1, 4);
    ctx.fillStyle = '#C84A4A';
    ctx.fillRect(x + 24, y + 14, 1, 4);
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 26, y + 14, 1, 4);
    // Bottom shelf — boxes
    ctx.fillStyle = '#A8754A';
    ctx.fillRect(x + 4, y + 30, 10, 8);
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 4, y + 30, 10, 1);
    ctx.fillRect(x + 9, y + 30, 1, 8);
    ctx.fillStyle = '#A8754A';
    ctx.fillRect(x + 16, y + 30, 12, 8);
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 16, y + 30, 12, 1);
    // Doors hint (vertical seam)
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 16, y + 2, 1, 40);
    // Handles
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 14, y + 22, 1, 2);
    ctx.fillRect(x + 18, y + 22, 1, 2);
  },

  // ART EASEL (28x44) — wooden easel with painting
  artEasel(ctx, x, y, opts = {}, time = 0) {
    const painting = opts.painting || 'sunset';
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 42, 24, 2);
    // Tripod legs
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 4, y + 8, 2, 36);
    ctx.fillRect(x + 22, y + 8, 2, 36);
    ctx.fillRect(x + 13, y + 6, 2, 38);
    // Crossbar
    ctx.fillRect(x + 4, y + 28, 20, 2);
    // Canvas
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 6, y + 4, 16, 22);
    ctx.fillStyle = '#D8CFB7';
    ctx.fillRect(x + 6, y + 4, 16, 1);
    ctx.fillRect(x + 6, y + 25, 16, 1);
    // Painting content
    if (painting === 'sunset') {
      ctx.fillStyle = '#FF8C42';
      ctx.fillRect(x + 7, y + 5, 14, 10);
      ctx.fillStyle = '#FFC84A';
      ctx.fillRect(x + 7, y + 5, 14, 4);
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(x + 7, y + 13, 14, 2);
      ctx.fillStyle = '#1F1D1A';
      ctx.beginPath(); ctx.arc(x + 14, y + 14, 3, 0, Math.PI, true); ctx.fill();
      ctx.fillStyle = '#3D8FB6';
      ctx.fillRect(x + 7, y + 18, 14, 7);
      ctx.fillStyle = '#5BA8E0';
      ctx.fillRect(x + 7, y + 18, 14, 1);
    } else if (painting === 'flowers') {
      ctx.fillStyle = '#A0BFA0';
      ctx.fillRect(x + 7, y + 5, 14, 20);
      // flower stems
      ctx.fillStyle = '#2E7236';
      ctx.fillRect(x + 10, y + 14, 1, 10);
      ctx.fillRect(x + 14, y + 12, 1, 12);
      ctx.fillRect(x + 18, y + 15, 1, 9);
      // blooms
      ctx.fillStyle = '#E0696A';
      ctx.fillRect(x + 9, y + 12, 3, 3);
      ctx.fillStyle = '#F5C84A';
      ctx.fillRect(x + 13, y + 10, 3, 3);
      ctx.fillStyle = '#7B5BA8';
      ctx.fillRect(x + 17, y + 13, 3, 3);
    } else if (painting === 'abstract') {
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 7, y + 5, 14, 20);
      ctx.fillStyle = '#F5A623';
      ctx.beginPath(); ctx.arc(x + 11, y + 11, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2979FF';
      ctx.fillRect(x + 14, y + 16, 6, 6);
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(x + 8, y + 18, 4, 5);
    }
    // Paint palette on bar
    ctx.fillStyle = '#A8754A';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 32, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E0696A';
    ctx.fillRect(x + 10, y + 31, 2, 1);
    ctx.fillStyle = '#F5C84A';
    ctx.fillRect(x + 13, y + 31, 2, 1);
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 16, y + 31, 2, 1);
  },

  // PERIODIC TABLE POSTER (44x28)
  periodicTable(ctx, x, y, time = 0) {
    // Frame
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x, y, 44, 28);
    // Background
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 1, y + 1, 42, 26);
    // Title bar
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 1, y + 1, 42, 4);
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 4, y + 2, 1, 2); ctx.fillRect(x + 6, y + 2, 1, 2);
    ctx.fillRect(x + 8, y + 2, 1, 2); ctx.fillRect(x + 10, y + 2, 1, 2);
    // Element grid
    const colors = ['#FFC84A','#FF8888','#5BA85B','#7BA8C8','#C8A0F0','#FFB050'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 14; col++) {
        // skip gaps to mimic periodic table shape
        if (row < 2 && col > 1 && col < 12) continue;
        if (row === 2 && col > 1 && col < 2) continue;
        ctx.fillStyle = colors[(row + col) % colors.length];
        ctx.fillRect(x + 2 + col * 3, y + 7 + row * 4, 2, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(x + 2 + col * 3, y + 9 + row * 4, 2, 1);
      }
    }
  },

  // LUNCH TRAY (32x20) — divided cafeteria tray
  lunchTray(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 18, 28, 2);
    // Tray
    ctx.fillStyle = '#7B5BA8';
    ctx.fillRect(x, y, 32, 18);
    ctx.fillStyle = '#5C4185';
    ctx.fillRect(x, y + 16, 32, 2);
    ctx.fillStyle = '#9778C7';
    ctx.fillRect(x, y, 32, 1);
    // Compartments
    ctx.fillStyle = '#5C4185';
    ctx.fillRect(x + 14, y + 2, 1, 14);
    ctx.fillRect(x + 24, y + 2, 1, 14);
    // Sandwich
    ctx.fillStyle = '#F5C84A';
    ctx.fillRect(x + 2, y + 4, 11, 8);
    ctx.fillStyle = '#FFC84A';
    ctx.fillRect(x + 2, y + 4, 11, 1);
    ctx.fillStyle = '#5BA85B';
    ctx.fillRect(x + 3, y + 7, 9, 1);
    ctx.fillStyle = '#C84A4A';
    ctx.fillRect(x + 3, y + 9, 9, 1);
    // Apple
    ctx.fillStyle = '#E0696A';
    ctx.beginPath(); ctx.arc(x + 19, y + 8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(x + 17, y + 6, 2, 2);
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 19, y + 4, 1, 2);
    ctx.fillStyle = '#5BA85B';
    ctx.fillRect(x + 20, y + 4, 2, 1);
    // Milk carton
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 26, y + 4, 5, 10);
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x + 26, y + 4, 5, 3);
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 27, y + 5, 1, 1); ctx.fillRect(x + 29, y + 5, 1, 1);
  },

  // SCHOOL BACKPACK (24x28)
  schoolBackpack(ctx, x, y, opts = {}, time = 0) {
    const colors = {
      pink:   { main: '#E0696A', dk: '#A33A3A', strap: '#7B2424' },
      blue:   { main: '#3D8FB6', dk: '#2A6F95', strap: '#1A4060' },
      amber:  { main: '#D89B3D', dk: '#9E6E1F', strap: '#6E4E15' },
      violet: { main: '#7B5BA8', dk: '#5C4185', strap: '#3F2A60' },
      red:    { main: '#C84A4A', dk: '#8E2E2E', strap: '#5C1A1A' },
    };
    const c = colors[opts.color] || colors.pink;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 26, 20, 2);
    // Body
    ctx.fillStyle = c.dk;
    ctx.fillRect(x + 2, y + 4, 20, 22);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 5, 18, 20);
    // Top handle
    ctx.fillStyle = c.dk;
    ctx.fillRect(x + 9, y, 6, 4);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 10, y + 1, 4, 2);
    // Straps
    ctx.fillStyle = c.strap;
    ctx.fillRect(x, y + 6, 3, 16);
    ctx.fillRect(x + 21, y + 6, 3, 16);
    // Front pocket
    ctx.fillStyle = c.dk;
    ctx.fillRect(x + 5, y + 14, 14, 10);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 6, y + 15, 12, 8);
    // Zipper
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 6, y + 14, 12, 1);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 11, y + 13, 2, 2);
    // Top zipper
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 4, y + 8, 16, 1);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 11, y + 7, 2, 2);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 3, y + 5, 1, 18);
  },

  // SCHOOL BUS (60x32) — classic yellow bus, side view
  schoolBus(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 30, 52, 2);
    // Body
    ctx.fillStyle = '#FFC84A';
    ctx.fillRect(x + 2, y + 8, 56, 18);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 2, y + 22, 56, 4);
    // Hood
    ctx.fillStyle = '#FFC84A';
    ctx.fillRect(x + 50, y + 14, 8, 12);
    // Black trim
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 2, y + 18, 56, 1);
    // Windows
    ctx.fillStyle = '#1A2632';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 6 + i * 8, y + 11, 6, 6);
    }
    // Window highlights
    ctx.fillStyle = '#5BA8E0';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 6 + i * 8, y + 11, 2, 2);
    }
    // Windshield
    ctx.fillStyle = '#1A2632';
    ctx.fillRect(x + 50, y + 14, 7, 6);
    ctx.fillStyle = '#5BA8E0';
    ctx.fillRect(x + 50, y + 14, 2, 2);
    // Door
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 46, y + 11, 4, 15);
    ctx.fillStyle = '#5BA8E0';
    ctx.fillRect(x + 46, y + 13, 4, 4);
    ctx.fillRect(x + 46, y + 18, 4, 4);
    // STOP sign (deployed)
    const stopOut = Math.floor(time / 60) % 3 === 0;
    if (stopOut) {
      ctx.fillStyle = '#C84A4A';
      ctx.fillRect(x + 2, y + 13, 6, 6);
      ctx.fillStyle = '#F5F0E0';
      ctx.fillRect(x + 4, y + 15, 2, 1);
      ctx.fillRect(x + 4, y + 17, 2, 1);
    }
    // SCHOOL BUS text strip
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 8, y + 20, 30, 1);
    // Wheels
    ctx.fillStyle = '#1F1D1A';
    ctx.beginPath(); ctx.arc(x + 12, y + 27, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 48, y + 27, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5A5852';
    ctx.beginPath(); ctx.arc(x + 12, y + 27, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 48, y + 27, 2, 0, Math.PI * 2); ctx.fill();
    // Bumper
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x, y + 24, 4, 3);
    ctx.fillRect(x + 56, y + 24, 4, 3);
    // Headlight
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(x + 56, y + 17, 2, 2);
    // Flashing roof lights (alternate)
    const flash = Math.floor(time / 20) % 2;
    ctx.fillStyle = flash ? '#FF1D6C' : '#5C2030';
    ctx.fillRect(x + 8, y + 6, 4, 2);
    ctx.fillStyle = flash ? '#3F2A60' : '#FFC84A';
    ctx.fillRect(x + 48, y + 6, 4, 2);
  },
};
