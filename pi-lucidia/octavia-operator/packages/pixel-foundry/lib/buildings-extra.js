// PIXEL FOUNDRY — BUILDINGS EXTRA (with axes)
// apartment, school, church, hospital, factory, library, restaurant, lighthouse, mansion, gasStation

const BUILDINGS_EXTRA = {
  AXES: {
    apartment:  { color: ['pink','amber','violet','blue','white','wood','stone'], floors: [3, 5, 7] },
    school:     { color: ['pink','amber','violet','blue','white','wood'] },
    church:     { color: ['white','wood','stone','black'], time: ['day','dusk','night'] },
    hospital:   { state: ['day','night'] },
    factory:    { state: ['idle','active'], color: ['stone','black','wood'] },
    library:    { color: ['wood','stone','blue','black'] },
    restaurant: { color: ['pink','amber','violet','wood'], time: ['day','dusk','night'] },
    mansion:    { color: ['pink','amber','violet','white','black','stone'] }
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

  // APARTMENT (60x120)
  apartment(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const floors = opts.floors || 5;
    const totalH = 16 + floors * 18 + 8;
    const startY = y + (120 - totalH);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x + 2, y + 118, 56, 2);
    // Roof / cornice
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, startY, 60, 8);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, startY + 1, 58, 6);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 1, startY + 1, 58, 1);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, startY + 8, 60, totalH - 8);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, startY + 8, 56, totalH - 16);
    // Floors with windows
    for (let f = 0; f < floors; f++) {
      const fy = startY + 12 + f * 18;
      // Window row
      for (let w = 0; w < 4; w++) {
        const wx = x + 6 + w * 13;
        ctx.fillStyle = c.dark;
        ctx.fillRect(wx, fy, 10, 12);
        ctx.fillStyle = '#bcd2dc';
        ctx.fillRect(wx + 1, fy + 1, 8, 10);
        ctx.fillStyle = c.dark;
        ctx.fillRect(wx + 5, fy + 1, 1, 10);
        ctx.fillRect(wx + 1, fy + 6, 8, 1);
        // Some windows lit
        if ((f + w) % 3 === 0) {
          ctx.fillStyle = '#F5A623';
          ctx.fillRect(wx + 1, fy + 1, 4, 5);
        }
      }
      // Floor line
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 2, fy + 16, 56, 1);
    }
    // Door at bottom
    const baseY = y + 118 - 12;
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 24, baseY, 12, 12);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 25, baseY + 1, 10, 11);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 33, baseY + 6, 1, 2);
    // Awning
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 22, baseY - 2, 16, 3);
  },

  // SCHOOL (96x80)
  school(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 78, 92, 2);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 28, 96, 50);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 28, 92, 48);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 2, y + 28, 92, 4);
    // Pediment / front
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 28); ctx.lineTo(x + 48, y + 8);
    ctx.lineTo(x + 72, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 28); ctx.lineTo(x + 48, y + 12);
    ctx.lineTo(x + 68, y + 28);
    ctx.closePath(); ctx.fill();
    // Bell tower
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 42, y, 12, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 43, y + 1, 10, 10);
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath(); ctx.arc(x + 48, y + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 48, y + 6, 2, 0, Math.PI * 2); ctx.fill();
    // Columns
    ctx.fillStyle = '#fff';
    [32, 42, 52, 62].forEach(px => ctx.fillRect(x + px, y + 28, 4, 30));
    ctx.fillStyle = '#e8e8e8';
    [32, 42, 52, 62].forEach(px => ctx.fillRect(x + px, y + 28, 1, 30));
    // Door
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 44, y + 58, 8, 18);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 45, y + 59, 6, 17);
    // Side windows
    ctx.fillStyle = '#1a1a2e';
    [4, 16, 76, 88].forEach(px => ctx.fillRect(x + px, y + 38, 8, 12));
    ctx.fillStyle = '#bcd2dc';
    [4, 16, 76, 88].forEach(px => ctx.fillRect(x + px, y + 38, 8, 12));
    ctx.fillStyle = '#1a1a2e';
    [4, 16, 76, 88].forEach(px => {
      ctx.fillRect(x + px + 4, y + 38, 1, 12);
      ctx.fillRect(x + px, y + 44, 8, 1);
    });
    // Steps
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 36, y + 76, 24, 2);
    ctx.fillRect(x + 32, y + 78, 32, 2);
    // Flag
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 2, y + 14, 1, 14);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 3, y + 14, 6, 4);
  },

  // CHURCH (60x100)
  church(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const tod = opts.time || 'day';
    const lit = tod === 'night' || tod === 'dusk';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 98, 56, 2);
    // Spire
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 26, y + 36); ctx.lineTo(x + 30, y);
    ctx.lineTo(x + 34, y + 36);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 27, y + 36); ctx.lineTo(x + 30, y + 4);
    ctx.lineTo(x + 33, y + 36);
    ctx.closePath(); ctx.fill();
    // Cross at top
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 29, y - 4, 2, 8);
    ctx.fillRect(x + 27, y - 2, 6, 2);
    // Bell tower
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 22, y + 36, 16, 22);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 23, y + 36, 14, 22);
    // Bell window (arched)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(x + 26, y + 50); ctx.lineTo(x + 26, y + 42);
    ctx.quadraticCurveTo(x + 30, y + 38, x + 34, y + 42);
    ctx.lineTo(x + 34, y + 50);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = lit ? '#F5A623' : '#bcd2dc';
    ctx.beginPath();
    ctx.moveTo(x + 27, y + 50); ctx.lineTo(x + 27, y + 42);
    ctx.quadraticCurveTo(x + 30, y + 39, x + 33, y + 42);
    ctx.lineTo(x + 33, y + 50);
    ctx.closePath(); ctx.fill();
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 58, 52, 40);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 6, y + 58, 48, 38);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 6, y + 58, 48, 2);
    // Stained glass (rose window)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 30, y + 70, 8, 0, Math.PI * 2); ctx.fill();
    const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x + 30, y + 70);
      ctx.arc(x + 30, y + 70, 7, (i / 4) * Math.PI * 2, ((i + 1) / 4) * Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    });
    // Brightening if lit
    if (lit) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(x + 30, y + 70, 7, 0, Math.PI * 2); ctx.fill();
    }
    // Side arched windows
    ctx.fillStyle = '#1a1a1a';
    [10, 46].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px, y + 90); ctx.lineTo(x + px, y + 78);
      ctx.quadraticCurveTo(x + px + 2, y + 75, x + px + 4, y + 78);
      ctx.lineTo(x + px + 4, y + 90);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = lit ? '#F5A623' : '#bcd2dc';
    [10, 46].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px + 1, y + 89); ctx.lineTo(x + px + 1, y + 79);
      ctx.quadraticCurveTo(x + px + 2, y + 76, x + px + 3, y + 79);
      ctx.lineTo(x + px + 3, y + 89);
      ctx.closePath(); ctx.fill();
    });
    // Door
    ctx.fillStyle = '#3a2510';
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 96); ctx.lineTo(x + 24, y + 84);
    ctx.quadraticCurveTo(x + 30, y + 78, x + 36, y + 84);
    ctx.lineTo(x + 36, y + 96);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 95); ctx.lineTo(x + 25, y + 85);
    ctx.quadraticCurveTo(x + 30, y + 80, x + 35, y + 85);
    ctx.lineTo(x + 35, y + 95);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 33, y + 90, 1, 2);
  },

  // HOSPITAL (88x76)
  hospital(ctx, x, y, opts = {}, time = 0) {
    const night = opts.state === 'night';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 74, 84, 2);
    // Body
    ctx.fillStyle = '#c0c0c4';
    ctx.fillRect(x, y + 12, 88, 62);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 2, y + 14, 84, 60);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 2, y + 14, 84, 4);
    // Top sign
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 28, y, 32, 12);
    ctx.fillStyle = '#FF1D6C';
    // Cross
    ctx.fillRect(x + 41, y + 2, 6, 2);
    ctx.fillRect(x + 41, y + 6, 6, 2);
    ctx.fillRect(x + 41, y + 4, 2, 6);
    ctx.fillRect(x + 45, y + 4, 2, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 41, y + 4, 6, 4);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 43, y + 3, 2, 6);
    ctx.fillRect(x + 41, y + 5, 6, 2);
    // Window grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 7; col++) {
        const wx = x + 4 + col * 12;
        const wy = y + 22 + row * 12;
        const lit = night && ((row + col + Math.floor(time / 30)) % 4 !== 0);
        ctx.fillStyle = '#3a3a3e';
        ctx.fillRect(wx, wy, 8, 8);
        ctx.fillStyle = lit ? '#F5A623' : (night ? '#0a0a14' : '#bcd2dc');
        ctx.fillRect(wx + 1, wy + 1, 6, 6);
      }
    }
    // Entrance
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 38, y + 56, 12, 18);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 39, y + 57, 10, 16);
    // Sliding doors
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 40, y + 59, 4, 14);
    ctx.fillRect(x + 44, y + 59, 4, 14);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 44, y + 59, 1, 14);
    // H sign over door
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 36, y + 50, 16, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 38, y + 51, 2, 2);
    ctx.fillRect(x + 41, y + 51, 2, 2);
    ctx.fillRect(x + 38, y + 52, 5, 1);
    ctx.fillRect(x + 46, y + 51, 2, 2);
    // Ambulance bay marker
    ctx.fillStyle = '#F5A623';
    [60, 66, 72, 78].forEach(px => ctx.fillRect(x + px, y + 70, 4, 2));
  },

  // FACTORY (96x68)
  factory(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'stone'];
    const active = opts.state === 'active';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 66, 92, 2);
    // Saw-tooth roof
    ctx.fillStyle = c.dark;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 16, y + 32); ctx.lineTo(x + i * 16, y + 16);
      ctx.lineTo(x + i * 16 + 8, y + 8); ctx.lineTo(x + i * 16 + 16, y + 32);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = c.main;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 16 + 1, y + 32); ctx.lineTo(x + i * 16 + 1, y + 18);
      ctx.lineTo(x + i * 16 + 8, y + 11); ctx.lineTo(x + i * 16 + 15, y + 32);
      ctx.closePath(); ctx.fill();
    }
    // Skylight panes
    ctx.fillStyle = active ? '#F5A623' : '#bcd2dc';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + i * 16 + 4, y + 18, 8, 12);
    }
    ctx.fillStyle = c.dark;
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + i * 16 + 7, y + 18, 1, 12);
    }
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 32, 96, 36);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 32, 94, 34);
    // Loading bay
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 44, 18, 22);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 9, y + 45, 16, 21);
    [48, 52, 56, 60].forEach(yy => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 9, y + yy, 16, 1);
    });
    // Door
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 36, y + 44, 12, 22);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 37, y + 45, 10, 21);
    // Windows
    ctx.fillStyle = '#1a1a1a';
    [56, 70, 84].forEach(px => ctx.fillRect(x + px, y + 40, 8, 8));
    ctx.fillStyle = '#bcd2dc';
    [56, 70, 84].forEach(px => ctx.fillRect(x + px + 1, y + 40, 6, 6));
    // Smokestack
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 78, y - 16, 8, 28);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 79, y - 15, 6, 27);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 78, y - 16, 8, 3);
    // Smoke when active
    if (active && Math.floor(time / 8) % 2) {
      ctx.fillStyle = 'rgba(180,180,180,0.6)';
      ctx.fillRect(x + 78, y - 22 - (time % 8), 6, 4);
      ctx.fillRect(x + 76, y - 28 - (time % 10), 6, 4);
      ctx.fillRect(x + 80, y - 34 - (time % 12), 6, 4);
    }
  },

  // LIBRARY (84x88)
  library(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'wood'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 86, 80, 2);
    // Roof
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 22); ctx.lineTo(x + 42, y + 4);
    ctx.lineTo(x + 82, y + 22);
    ctx.lineTo(x + 82, y + 28); ctx.lineTo(x + 2, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 22); ctx.lineTo(x + 42, y + 7);
    ctx.lineTo(x + 78, y + 22); ctx.closePath(); ctx.fill();
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 26, 84, 60);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 28, 80, 56);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 2, y + 28, 80, 3);
    // Columns (6 thin)
    ctx.fillStyle = '#fff';
    [10, 22, 34, 50, 62, 74].forEach(px => ctx.fillRect(x + px, y + 32, 4, 50));
    ctx.fillStyle = '#e8e8e8';
    [10, 22, 34, 50, 62, 74].forEach(px => ctx.fillRect(x + px, y + 32, 1, 50));
    // Big arch entrance
    ctx.fillStyle = '#3a2510';
    ctx.beginPath();
    ctx.moveTo(x + 36, y + 84); ctx.lineTo(x + 36, y + 60);
    ctx.quadraticCurveTo(x + 36, y + 48, x + 42, y + 48);
    ctx.lineTo(x + 46, y + 48);
    ctx.quadraticCurveTo(x + 52, y + 48, x + 52, y + 60);
    ctx.lineTo(x + 52, y + 84);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.moveTo(x + 38, y + 82); ctx.lineTo(x + 38, y + 60);
    ctx.quadraticCurveTo(x + 38, y + 50, x + 42, y + 50);
    ctx.lineTo(x + 46, y + 50);
    ctx.quadraticCurveTo(x + 50, y + 50, x + 50, y + 60);
    ctx.lineTo(x + 50, y + 82);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 43, y + 60, 1, 22);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 47, y + 70, 1, 2);
    // Side windows (arched)
    ctx.fillStyle = '#1a1a2e';
    [16, 28, 56, 68].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px, y + 70); ctx.lineTo(x + px, y + 50);
      ctx.quadraticCurveTo(x + px + 3, y + 46, x + px + 6, y + 50);
      ctx.lineTo(x + px + 6, y + 70);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = '#bcd2dc';
    [16, 28, 56, 68].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px + 1, y + 69); ctx.lineTo(x + px + 1, y + 51);
      ctx.quadraticCurveTo(x + px + 3, y + 47, x + px + 5, y + 51);
      ctx.lineTo(x + px + 5, y + 69);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = '#1a1a2e';
    [16, 28, 56, 68].forEach(px => {
      ctx.fillRect(x + px + 2, y + 51, 1, 18);
      ctx.fillRect(x + px, y + 60, 6, 1);
    });
    // Books on top — sign
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 30, y + 32, 24, 6);
    ctx.fillStyle = '#1a1a1a';
    [33, 36, 39, 42, 45, 48, 51].forEach(px => ctx.fillRect(x + px, y + 34, 2, 2));
    // Steps
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 32, y + 84, 24, 2);
    ctx.fillRect(x + 28, y + 86, 32, 2);
  },

  // RESTAURANT (76x68)
  restaurant(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const tod = opts.time || 'dusk';
    const lit = tod !== 'day';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 66, 72, 2);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 16, 76, 50);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 17, 74, 48);
    // Striped awning
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 8, 76, 4);
    for (let i = 0; i < 19; i++) {
      ctx.fillStyle = i & 1 ? '#fff' : c.main;
      ctx.beginPath();
      ctx.moveTo(x + i * 4, y + 8);
      ctx.lineTo(x + i * 4 + 4, y + 8);
      ctx.lineTo(x + i * 4 + 2, y + 16);
      ctx.closePath();
      ctx.fill();
    }
    // Sign
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 18, y, 40, 8);
    ctx.fillStyle = lit && Math.floor(time / 8) % 2 ? '#FF1D6C' : (lit ? '#c41758' : '#fff');
    ctx.fillRect(x + 22, y + 2, 32, 4);
    // Big front window
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 4, y + 22, 48, 30);
    ctx.fillStyle = lit ? '#F5A623' : '#bcd2dc';
    ctx.fillRect(x + 5, y + 23, 46, 28);
    // Window dividers
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 28, y + 22, 1, 30);
    ctx.fillRect(x + 4, y + 36, 48, 1);
    // Inside hint — table + people silhouettes if lit
    if (lit) {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 12, y + 38, 8, 8);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 10, y + 30, 4, 8);
      ctx.fillRect(x + 18, y + 30, 4, 8);
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 11, y + 28, 2, 3);
      ctx.fillRect(x + 19, y + 28, 2, 3);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 36, y + 38, 8, 8);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 34, y + 30, 4, 8);
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 35, y + 28, 2, 3);
    }
    // Door
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 56, y + 22, 16, 44);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 58, y + 24, 12, 40);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 60, y + 28, 8, 14);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 67, y + 46, 2, 4);
    // Outdoor table + chairs
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 4, y + 60, 4, 6);
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath(); ctx.ellipse(x + 6, y + 60, 4, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    // Lights string under awning
    if (lit) {
      ctx.fillStyle = '#F5A623';
      [4, 12, 20, 28, 36, 44, 52, 60, 68].forEach((px, i) => {
        const on = (i + Math.floor(time / 8)) % 3 !== 0;
        ctx.fillRect(x + px, y + 16, 2, 2);
        if (on) {
          ctx.fillStyle = `rgba(245,166,35,0.4)`;
          ctx.fillRect(x + px - 1, y + 15, 4, 4);
          ctx.fillStyle = '#F5A623';
        }
      });
    }
  },

  // LIGHTHOUSE (40x120)
  lighthouse(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x + 4, y + 118, 32, 2);
    // Base
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 4, y + 100, 32, 18);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 5, y + 101, 30, 16);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 5, y + 101, 30, 2);
    // Door
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 16, y + 108, 8, 10);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 17, y + 109, 6, 9);
    // Tower
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 100); ctx.lineTo(x + 12, y + 36);
    ctx.lineTo(x + 28, y + 36); ctx.lineTo(x + 32, y + 100);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF1D6C';
    [44, 64, 84].forEach(yy => ctx.fillRect(x + 8, y + yy, 24, 6));
    ctx.fillStyle = '#fff';
    [50, 70, 90].forEach(yy => ctx.fillRect(x + 8, y + yy, 24, 6));
    // Windows
    ctx.fillStyle = '#0a0a14';
    [54, 74, 94].forEach(yy => {
      ctx.fillRect(x + 18, y + yy, 4, 4);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 19, y + yy + 1, 2, 2);
      ctx.fillStyle = '#0a0a14';
    });
    // Gallery deck
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 6, y + 32, 28, 4);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 6, y + 32, 28, 1);
    // Light room
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 12, y + 18, 16, 14);
    ctx.fillStyle = 'rgba(245,166,35,0.4)';
    ctx.fillRect(x + 13, y + 19, 14, 12);
    // Light beam
    const beamPhase = Math.floor(time / 12) % 4;
    const beamColors = [0.6, 0.4, 0.2, 0.4];
    ctx.fillStyle = `rgba(245,166,35,${beamColors[beamPhase]})`;
    if (beamPhase === 0) ctx.fillRect(x - 20, y + 22, 28, 6);
    else if (beamPhase === 1) ctx.fillRect(x - 10, y, 16, 30);
    else if (beamPhase === 2) ctx.fillRect(x + 32, y + 22, 28, 6);
    else ctx.fillRect(x + 24, y, 16, 30);
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 20, y + 25, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 20, y + 25, 2, 0, Math.PI * 2); ctx.fill();
    // Roof / cap
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 18); ctx.lineTo(x + 20, y + 4);
    ctx.lineTo(x + 30, y + 18);
    ctx.closePath(); ctx.fill();
    // Antenna
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 19, y - 4, 2, 8);
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 20, y - 4, 1.5, 0, Math.PI * 2); ctx.fill();
  },

  // MANSION (104x88)
  mansion(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 86, 100, 2);
    // Roof
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.moveTo(x, y + 28); ctx.lineTo(x + 16, y + 12);
    ctx.lineTo(x + 88, y + 12); ctx.lineTo(x + 104, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a5028';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 26); ctx.lineTo(x + 18, y + 14);
    ctx.lineTo(x + 86, y + 14); ctx.lineTo(x + 100, y + 26);
    ctx.closePath(); ctx.fill();
    // Roof shingles
    ctx.fillStyle = '#5a3a1a';
    for (let yy = 16; yy < 26; yy += 2) {
      const off = ((yy - 16) / 2) & 1 ? 4 : 0;
      for (let xx = 4 + off; xx < 100; xx += 8) ctx.fillRect(x + xx, y + yy, 6, 1);
    }
    // Center pediment
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(x + 36, y + 28); ctx.lineTo(x + 52, y);
    ctx.lineTo(x + 68, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 40, y + 28); ctx.lineTo(x + 52, y + 4);
    ctx.lineTo(x + 64, y + 28);
    ctx.closePath(); ctx.fill();
    // Pediment window
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath(); ctx.arc(x + 52, y + 18, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(x + 52, y + 18, 3, 0, Math.PI * 2); ctx.fill();
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 28, 104, 58);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 28, 100, 56);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 2, y + 28, 100, 4);
    // Columns
    ctx.fillStyle = '#fff';
    [40, 48, 56, 64].forEach(px => ctx.fillRect(x + px, y + 28, 4, 50));
    ctx.fillStyle = '#e8e8e8';
    [40, 48, 56, 64].forEach(px => ctx.fillRect(x + px + 1, y + 28, 1, 50));
    // Side wings
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 28, 32, 58);
    ctx.fillRect(x + 72, y + 28, 32, 58);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 30, 28, 56);
    ctx.fillRect(x + 74, y + 30, 28, 56);
    // Window grid (sides)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        [4, 76].forEach(off => {
          const wx = x + off + col * 8 + 1;
          const wy = y + 36 + row * 14;
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(wx, wy, 6, 8);
          ctx.fillStyle = '#bcd2dc';
          ctx.fillRect(wx + 1, wy + 1, 4, 6);
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(wx + 3, wy + 1, 1, 6);
          ctx.fillRect(wx + 1, wy + 3, 4, 1);
        });
      }
    }
    // Center grand entrance
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 44, y + 60, 16, 26);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 45, y + 61, 14, 25);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 56, y + 72, 1, 2);
    // Steps
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 36, y + 86, 32, 2);
    // Topiary
    ctx.fillStyle = '#3a7a3a';
    ctx.beginPath(); ctx.arc(x + 16, y + 78, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 88, y + 78, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a9a4a';
    ctx.beginPath(); ctx.arc(x + 15, y + 76, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 87, y + 76, 4, 0, Math.PI * 2); ctx.fill();
  }
};

if (typeof module !== 'undefined') module.exports = BUILDINGS_EXTRA;
