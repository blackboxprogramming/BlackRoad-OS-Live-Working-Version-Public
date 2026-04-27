// PIXEL FOUNDRY — BUILDINGS / FACADES (with axes)
// House, storefront, tower, cafe, lab, cottage

const BUILDINGS = {
  AXES: {
    house:      { color: ['pink','amber','violet','blue','white','wood'], roof: ['amber','pink','violet','black','stone'] },
    storefront: { color: ['pink','amber','violet','blue','white','black'], sign: ['neon','wood','metal'] },
    tower:      { color: ['blue','violet','black','white'], windows: ['day','night'], height: ['m','tall'] },
    cafe:       { color: ['amber','pink','violet','wood'], time: ['day','dusk','night'] },
    lab:        { color: ['white','black','blue'], state: ['idle','active'] },
    cottage:    { color: ['pink','amber','violet','blue','white','wood','stone'], season: ['summer','autumn','winter'] }
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

  // HOUSE (96x88)
  house(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const rc = this._palette[opts.roof || 'amber'];
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 86, 92, 4);
    // Roof — silhouette w/ overhang, clipped shingles
    const roofPath = () => {
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 36);
      ctx.lineTo(x + 48, y + 6);
      ctx.lineTo(x + 94, y + 36);
      ctx.lineTo(x + 94, y + 40);
      ctx.lineTo(x + 2, y + 40);
      ctx.closePath();
    };
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 40, 92, 2);
    ctx.fillStyle = rc.dark;
    roofPath(); ctx.fill();
    ctx.save();
    roofPath(); ctx.clip();
    ctx.fillStyle = rc.main;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 36); ctx.lineTo(x + 48, y + 9);
    ctx.lineTo(x + 91, y + 36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rc.light;
    ctx.fillRect(x + 46, y + 8, 4, 2);
    // Shingle rows
    ctx.fillStyle = rc.dark;
    for (let yy = 10; yy < 38; yy += 4) {
      const off = ((yy - 10) / 4) & 1 ? 4 : 0;
      for (let xx = -4 + off; xx < 96; xx += 8) ctx.fillRect(x + xx, y + yy, 6, 1);
    }
    ctx.restore();
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 8, y + 36, 80, 50);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 10, y + 36, 76, 48);
    // Door
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 42, y + 56, 14, 30);
    ctx.fillStyle = '#5a3818';
    ctx.fillRect(x + 43, y + 57, 12, 28);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 52, y + 70, 2, 2);
    // Windows
    ctx.fillStyle = '#3a2510';
    [18, 68].forEach(wx => ctx.fillRect(x + wx, y + 44, 14, 14));
    ctx.fillStyle = '#bcd2dc';
    [19, 69].forEach(wx => ctx.fillRect(x + wx, y + 45, 12, 12));
    ctx.fillStyle = '#3a2510';
    [25, 75].forEach(wx => ctx.fillRect(x + wx, y + 45, 1, 12));
    [25, 75].forEach(wx => ctx.fillRect(x + wx - 6, y + 50, 12, 1));
    // Chimney
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 70, y + 6, 10, 16);
    ctx.fillStyle = '#3a2018';
    ctx.fillRect(x + 70, y + 6, 10, 3);
    // Smoke
    if (Math.floor(time / 8) % 2) {
      ctx.fillStyle = 'rgba(180,180,180,0.6)';
      ctx.fillRect(x + 73, y - 2 - (time % 8), 4, 3);
    }
    // Path
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 44, y + 84, 10, 4);
  },

  // STOREFRONT (104x80)
  storefront(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 78, 100, 4);
    // Awning
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 104, 12);
    ctx.fillStyle = c.main;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 13, y);
      ctx.lineTo(x + i * 13 + 13, y);
      ctx.lineTo(x + i * 13 + 6.5, y + 14);
      ctx.closePath();
      ctx.fill();
    }
    // Body
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x, y + 14, 104, 66);
    ctx.fillStyle = '#5a5a5e';
    ctx.fillRect(x + 2, y + 14, 100, 66);
    // Window — big glass display
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 8, y + 22, 88, 44);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 10, y + 24, 84, 40);
    // Display items hint
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 18, y + 40, 8, 18);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(x + 32, y + 36, 8, 22);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 46, y + 44, 8, 14);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 60, y + 38, 8, 20);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 74, y + 42, 8, 16);
    // Door
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 84, y + 22, 12, 44);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 86, y + 24, 8, 4);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 86, y + 30, 8, 30);
    // Sign
    const sign = opts.sign || 'neon';
    if (sign === 'neon') {
      const flicker = 0.85 + Math.sin(time / 6) * 0.1;
      ctx.fillStyle = `rgba(255,29,108,${flicker})`;
      ctx.fillRect(x + 24, y + 16, 56, 6);
      ctx.fillStyle = `rgba(255,29,108,${0.3 * flicker})`;
      ctx.fillRect(x + 20, y + 14, 64, 10);
    } else if (sign === 'wood') {
      ctx.fillStyle = '#5a3818';
      ctx.fillRect(x + 24, y + 16, 56, 6);
      ctx.fillStyle = '#daa86a';
      ctx.fillRect(x + 26, y + 17, 52, 4);
    } else {
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 24, y + 16, 56, 6);
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(x + 26, y + 17, 52, 4);
    }
    // Pavement
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x, y + 76, 104, 4);
  },

  // TOWER (60x140) — variable height
  tower(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'blue'];
    const tall = opts.height === 'tall';
    const height = tall ? 140 : 100;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x + 2, y + height - 2, 56, 4);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 60, height);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 2, 56, height - 2);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 2, y + 2, 2, height - 2);
    // Top crown
    ctx.fillStyle = c.dark;
    ctx.fillRect(x - 2, y, 64, 6);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 28, y - 8, 4, 8);
    // Windows grid — light up at night
    const night = opts.windows === 'night';
    const rows = tall ? 18 : 12;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < 5; col++) {
        const wx = x + 6 + col * 10;
        const wy = y + 12 + row * 7;
        const lit = night && ((row + col + Math.floor(time / 30)) % 3 !== 0);
        ctx.fillStyle = lit ? '#F5A623' : (night ? '#0a0a14' : '#bcd2dc');
        ctx.fillRect(wx, wy, 6, 4);
      }
    }
    // Entrance
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 24, y + height - 16, 12, 14);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 26, y + height - 14, 8, 12);
  },

  // CAFE (88x76)
  cafe(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'amber'];
    const tod = opts.time || 'day';
    const skyTop = tod === 'day' ? '#bcd2dc' : tod === 'dusk' ? '#FF5A90' : '#0a0a3a';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 74, 84, 4);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 12, 88, 64);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 14, 84, 62);
    // Roof / awning
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x, y + 8, 88, 6);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y, 88, 8);
    ctx.fillStyle = c.light;
    for (let i = 4; i < 88; i += 8) ctx.fillRect(x + i, y, 4, 8);
    // Sign
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 24, y + 2, 40, 6);
    ctx.fillStyle = tod === 'night' ? '#F5A623' : '#ffffff';
    ctx.fillRect(x + 28, y + 4, 32, 2);
    // Big window
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 8, y + 18, 48, 36);
    ctx.fillStyle = skyTop;
    ctx.fillRect(x + 10, y + 20, 44, 32);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 30, y + 20, 2, 32);
    ctx.fillRect(x + 10, y + 34, 44, 2);
    // Inside hint — table + cup
    ctx.fillStyle = '#5a3818';
    ctx.fillRect(x + 14, y + 40, 14, 8);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 18, y + 36, 4, 4);
    // Door
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 60, y + 18, 20, 56);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 62, y + 20, 16, 52);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 64, y + 24, 12, 16);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 75, y + 46, 2, 4);
    // Outdoor bistro table hint
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 10, y + 64, 4, 10);
    ctx.fillStyle = '#5a5a5e';
    ctx.fillRect(x + 6, y + 60, 12, 6);
    // Chimney smoke (active hours)
    if (tod !== 'night') {
      ctx.fillStyle = 'rgba(180,180,180,0.5)';
      ctx.fillRect(x + 72, y - 4 - (time % 6), 3, 3);
    }
  },

  // LAB (88x80)
  lab(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const active = opts.state === 'active';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 78, 84, 4);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x, y + 12, 88, 68);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 2, y + 14, 84, 66);
    // Roof — flat with vents
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x, y + 8, 88, 6);
    ctx.fillStyle = '#5a5a5e';
    ctx.fillRect(x + 12, y, 8, 8);
    ctx.fillRect(x + 36, y, 8, 8);
    ctx.fillRect(x + 60, y, 8, 8);
    ctx.fillStyle = active && Math.floor(time / 12) % 2 ? '#FF1D6C' : '#1a1a1a';
    ctx.fillRect(x + 14, y + 2, 4, 4);
    ctx.fillRect(x + 38, y + 2, 4, 4);
    ctx.fillRect(x + 62, y + 2, 4, 4);
    // Big windows
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 6, y + 18, 36, 32);
    ctx.fillStyle = active ? '#9C27B0' : '#2a2a4a';
    ctx.fillRect(x + 8, y + 20, 32, 28);
    if (active) {
      // Animated chart on screen
      const phase = Math.floor(time / 4) % 32;
      ctx.fillStyle = '#FF1D6C';
      for (let i = 0; i < 32; i++) {
        const h = 4 + Math.abs(Math.sin((i + phase) / 5)) * 16;
        ctx.fillRect(x + 8 + i, y + 48 - h, 1, h);
      }
    }
    // Door
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 50, y + 18, 18, 56);
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 52, y + 20, 14, 52);
    ctx.fillStyle = active ? '#3acc3a' : '#3a3a3e';
    ctx.fillRect(x + 60, y + 26, 4, 4);
    // Side panel — pipes
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 72, y + 18, 12, 56);
    ctx.fillStyle = '#5a5a5e';
    ctx.fillRect(x + 74, y + 22, 8, 4);
    ctx.fillRect(x + 74, y + 38, 8, 4);
    ctx.fillRect(x + 74, y + 54, 8, 4);
    ctx.fillStyle = active ? '#2979FF' : '#1a1a1a';
    ctx.fillRect(x + 76, y + 24, 4, 1);
    ctx.fillRect(x + 76, y + 40, 4, 1);
    ctx.fillRect(x + 76, y + 56, 4, 1);
  },

  // COTTAGE (72x68)
  cottage(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    const season = opts.season || 'summer';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 66, 68, 4);
    // Thatch roof — silhouette w/ eave overhang, clipped texture
    const roofC = season === 'autumn' ? '#c4851c' : season === 'winter' ? '#f0f0f0' : '#a67c3d';
    const roofPath = () => {
      ctx.beginPath();
      ctx.moveTo(x - 2, y + 30);
      ctx.lineTo(x + 36, y + 6);
      ctx.lineTo(x + 74, y + 30);
      ctx.lineTo(x + 74, y + 34);
      ctx.lineTo(x - 2, y + 34);
      ctx.closePath();
    };
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x - 2, y + 34, 76, 2);
    ctx.fillStyle = '#7a5028';
    roofPath(); ctx.fill();
    ctx.save();
    roofPath(); ctx.clip();
    ctx.fillStyle = roofC;
    ctx.beginPath();
    ctx.moveTo(x, y + 30); ctx.lineTo(x + 36, y + 9);
    ctx.lineTo(x + 72, y + 30); ctx.closePath(); ctx.fill();
    // Thatch strands
    ctx.fillStyle = '#5a3818';
    for (let yy = 8; yy < 32; yy += 2) {
      for (let xx = (yy & 1) ? -1 : -2; xx < 76; xx += 2) {
        ctx.fillRect(x + xx, y + yy, 1, 2);
      }
    }
    // Bottom thatch fringe
    ctx.fillStyle = '#3a2510';
    for (let xx = -2; xx < 76; xx += 4) ctx.fillRect(x + xx, y + 30, 1, 4);
    ctx.restore();
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 32, 64, 36);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 6, y + 32, 60, 34);
    // Half-timber
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 6, y + 32, 60, 1);
    ctx.fillRect(x + 6, y + 48, 60, 1);
    ctx.fillRect(x + 6, y + 65, 60, 1);
    [10, 24, 36, 50, 60].forEach(px => ctx.fillRect(x + px, y + 32, 1, 34));
    // Door (round arch)
    ctx.fillStyle = '#3a2510';
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 66); ctx.lineTo(x + 30, y + 50);
    ctx.quadraticCurveTo(x + 36, y + 44, x + 42, y + 50);
    ctx.lineTo(x + 42, y + 66); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3818';
    ctx.fillRect(x + 39, y + 56, 2, 2);
    // Windows
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 12, y + 38, 12, 10);
    ctx.fillRect(x + 48, y + 38, 12, 10);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 13, y + 39, 10, 8);
    ctx.fillRect(x + 49, y + 39, 10, 8);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 17, y + 39, 1, 8);
    ctx.fillRect(x + 53, y + 39, 1, 8);
    // Flowerbox or snow
    if (season === 'summer') {
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(x + 12, y + 48, 12, 3);
      ctx.fillRect(x + 48, y + 48, 12, 3);
      ctx.fillStyle = '#FF1D6C';
      [14, 18, 22, 50, 54, 58].forEach(px => ctx.fillRect(x + px, y + 47, 2, 2));
    } else if (season === 'autumn') {
      ctx.fillStyle = '#c4851c';
      ctx.fillRect(x + 12, y + 48, 12, 3);
      ctx.fillRect(x + 48, y + 48, 12, 3);
    } else if (season === 'winter') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 12, y + 47, 12, 3);
      ctx.fillRect(x + 48, y + 47, 12, 3);
      // Snow on roof
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 28); ctx.lineTo(x + 36, y + 6);
      ctx.lineTo(x + 68, y + 28); ctx.lineTo(x + 64, y + 30);
      ctx.lineTo(x + 36, y + 10); ctx.lineTo(x + 8, y + 30);
      ctx.closePath(); ctx.fill();
      // Smoke
      if (Math.floor(time / 8) % 2) {
        ctx.fillStyle = 'rgba(220,220,220,0.6)';
        ctx.fillRect(x + 50, y - 2 - (time % 6), 3, 3);
      }
    }
    // Chimney
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x + 48, y + 4, 6, 16);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 48, y + 4, 6, 2);
  }
};

if (typeof module !== 'undefined') module.exports = BUILDINGS;
