// PIXEL FOUNDRY — TECH (smart devices, gadgets, accessories)

const TECH = {
  AXES: {
    robotVacuum:  { color: ['pink','amber','violet','blue','black','white'], state: ['idle','cleaning','charging'] },
    drone:        { color: ['pink','amber','violet','blue','black','white'] },
    smartSpeaker: { color: ['pink','amber','violet','blue','black','white'], state: ['idle','listening'] },
    router:       { color: ['black','white'], leds: ['off','on'] },
    battery:      { color: ['pink','amber','violet','blue','black','white'], charge: ['empty','low','mid','full'] },
    usb:          { color: ['pink','amber','violet','blue','black','white'] },
    cable:        { color: ['pink','amber','violet','blue','black','white'], type: ['usb-c','lightning','hdmi'] }
  },

  _palette: {
    pink:   { main: '#FF1D6C', dark: '#c41758', light: '#ff5a90' },
    amber:  { main: '#F5A623', dark: '#c4851c', light: '#ffc46b' },
    violet: { main: '#9C27B0', dark: '#7b1f8c', light: '#c34dd6' },
    blue:   { main: '#2979FF', dark: '#1f5fcc', light: '#5a9fff' },
    white:  { main: '#f0f0f0', dark: '#c0c0c0', light: '#ffffff' },
    black:  { main: '#1a1a1a', dark: '#0a0a0a', light: '#3a3a3a' }
  },

  // ROBOT VACUUM (44x16)
  robotVacuum(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const state = opts.state || 'idle';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(x + 22, y + 14, 18, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Disc body
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(x + 22, y + 8, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.ellipse(x + 22, y + 8, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.ellipse(x + 22, y + 6, 14, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Top button / camera
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 22, y + 8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = state === 'cleaning' ? (Math.floor(time / 8) % 2 ? '#3acc3a' : '#0a3a14')
                  : state === 'charging' ? (Math.floor(time / 16) % 2 ? '#F5A623' : '#3a2510')
                                         : '#3a3a3e';
    ctx.beginPath(); ctx.arc(x + 22, y + 8, 2, 0, Math.PI * 2); ctx.fill();
    // Brushes
    if (state === 'cleaning') {
      ctx.fillStyle = 'rgba(245,166,35,0.4)';
      ctx.beginPath(); ctx.arc(x + 22, y + 8, 22, 0, Math.PI * 2); ctx.fill();
      // Dust particles
      [10, 30, 38, 6].forEach((dx, i) => {
        ctx.fillStyle = `rgba(180,180,180,${(Math.sin(time / 6 + i) + 1) * 0.4})`;
        ctx.fillRect(x + dx, y + 12, 1, 1);
      });
    }
    // Wheels (sides)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y + 8, 4, 4);
    ctx.fillRect(x + 40, y + 8, 4, 4);
  },

  // DRONE (44x32)
  drone(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'black'];
    const hover = Math.sin(time / 12) * 1;
    const propSpin = Math.floor(time / 2) % 2;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 30, 36, 2);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 14, y + 12 + hover, 16, 10);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 15, y + 13 + hover, 14, 8);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 15, y + 13 + hover, 14, 1);
    // Camera
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(x + 22, y + 22 + hover, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#bcd2dc';
    ctx.beginPath(); ctx.arc(x + 22, y + 22 + hover, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a9fff';
    ctx.fillRect(x + 21, y + 21 + hover, 1, 1);
    // Arms (X frame)
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 6 + hover, 8, 3);
    ctx.fillRect(x + 32, y + 6 + hover, 8, 3);
    ctx.fillRect(x + 4, y + 24 + hover, 8, 3);
    ctx.fillRect(x + 32, y + 24 + hover, 8, 3);
    // Props (motors)
    ctx.fillStyle = c.main;
    [[8, 7], [36, 7], [8, 25], [36, 25]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx, y + dy + hover, 2, 0, Math.PI * 2); ctx.fill();
    });
    // Spinning blades
    ctx.fillStyle = 'rgba(160,160,168,0.6)';
    [[8, 7], [36, 7], [8, 25], [36, 25]].forEach(([dx, dy]) => {
      if (propSpin) {
        ctx.beginPath(); ctx.ellipse(x + dx, y + dy + hover, 6, 1, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.ellipse(x + dx, y + dy + hover, 1, 6, 0, 0, Math.PI * 2); ctx.fill();
      }
    });
    // Status LEDs
    ctx.fillStyle = Math.floor(time / 8) % 2 ? '#FF1D6C' : '#3a0a14';
    ctx.fillRect(x + 16, y + 14 + hover, 1, 1);
    ctx.fillStyle = Math.floor(time / 8) % 2 ? '#3acc3a' : '#0a3a14';
    ctx.fillRect(x + 27, y + 14 + hover, 1, 1);
  },

  // SMART SPEAKER (32x44)
  smartSpeaker(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const listening = opts.state === 'listening';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 42, 28, 2);
    // Cylinder body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 4, 28, 36);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 5, 26, 34);
    // Mesh / fabric texture
    ctx.fillStyle = c.dark;
    for (let yy = 8; yy < 36; yy += 2) {
      for (let xx = 4; xx < 28; xx += 2) {
        if ((xx + yy) % 4 === 0) ctx.fillRect(x + xx, y + yy, 1, 1);
      }
    }
    // Top
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.ellipse(x + 16, y + 4, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.ellipse(x + 16, y + 4, 13, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Listening ring
    if (listening) {
      const phase = (time / 4) % 8;
      const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
      colors.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(x + 4 + i * 6, y + 6, 4, 1);
      });
      // Soundwave bars
      ctx.fillStyle = '#fff';
      [8, 12, 16, 20, 24].forEach((px, i) => {
        const h = 2 + Math.abs(Math.sin(time / 4 + i)) * 4;
        ctx.fillRect(x + px, y + 14 - h, 2, h);
      });
    } else {
      // Subtle dot
      ctx.fillStyle = '#3a3a3e';
      ctx.beginPath(); ctx.arc(x + 16, y + 4, 2, 0, Math.PI * 2); ctx.fill();
    }
    // Base ring
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 38, 28, 2);
  },

  // ROUTER (60x32)
  router(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const lit = (opts.leds || 'on') === 'on';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 30, 52, 2);
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 4, y + 12, 52, 18);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 5, y + 13, 50, 16);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 5, y + 13, 50, 2);
    // Vents
    ctx.fillStyle = '#1a1a1a';
    for (let i = 8; i < 52; i += 4) ctx.fillRect(x + i, y + 26, 2, 2);
    // Antennae
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 8, y, 3, 14);
    ctx.fillRect(x + 18, y + 4, 3, 10);
    ctx.fillRect(x + 49, y, 3, 14);
    // Antennae tips
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 9, y + 1, 1, 12);
    // LEDs
    const ledColors = ['#3acc3a', '#3acc3a', '#F5A623', '#FF1D6C', '#3acc3a'];
    ledColors.forEach((col, i) => {
      const blink = Math.floor((time + i * 4) / 6) % 2;
      ctx.fillStyle = lit && blink ? col : '#1a1a1a';
      ctx.fillRect(x + 26 + i * 4, y + 18, 2, 2);
    });
    // WiFi signals (animated waves)
    if (lit) {
      ctx.strokeStyle = `rgba(41,121,255,${0.5 + Math.sin(time / 8) * 0.3})`;
      ctx.lineWidth = 1;
      [4, 8, 12].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(x + 9, y + 4, r, -Math.PI / 4, -Math.PI * 3 / 4, true);
        ctx.stroke();
      });
      ctx.lineWidth = 1;
    }
  },

  // BATTERY (32x16)
  battery(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const charge = opts.charge || 'full';
    const fillLevel = { empty: 0, low: 0.25, mid: 0.6, full: 1 }[charge];
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 2, y + 4, 24, 10);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 3, y + 5, 22, 8);
    // Tip
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 26, y + 7, 4, 4);
    // Fill
    const w = Math.floor(20 * fillLevel);
    if (w > 0) {
      const fillC = charge === 'low' ? '#FF1D6C' : charge === 'mid' ? '#F5A623' : '#3acc3a';
      ctx.fillStyle = fillC;
      ctx.fillRect(x + 4, y + 6, w, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 4, y + 6, w, 1);
    }
    // Lightning bolt for charging mode (using time pulse)
    if (Math.floor(time / 30) % 2 === 0 && charge !== 'empty') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 12, y + 5, 2, 4);
      ctx.fillRect(x + 11, y + 8, 4, 1);
      ctx.fillRect(x + 12, y + 8, 2, 4);
    }
  },

  // USB STICK (44x16)
  usb(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'pink'];
    // Body
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 12, y + 2, 32, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 13, y + 3, 30, 10);
    ctx.fillStyle = c.light;
    ctx.fillRect(x + 13, y + 3, 30, 2);
    // Loop
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 38, y + 6, 6, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 40, y + 7, 2, 2);
    // Connector — silver
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 4, 12, 8);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x, y + 4, 12, 1);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 1, y + 6, 10, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 2, y + 7, 8, 2);
    // LED
    ctx.fillStyle = Math.floor(time / 12) % 2 ? '#3acc3a' : '#0a3a14';
    ctx.fillRect(x + 16, y + 10, 2, 1);
    // Logo dot
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 32, y + 7, 2, 2);
  },

  // CABLE (60x32)
  cable(ctx, x, y, opts = {}, time = 0) {
    const c = this._palette[opts.color || 'white'];
    const type = opts.type || 'usb-c';
    // Cable
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 16);
    ctx.bezierCurveTo(x + 24, y + 4, x + 36, y + 28, x + 52, y + 16);
    ctx.stroke();
    ctx.strokeStyle = c.main;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 16);
    ctx.bezierCurveTo(x + 24, y + 4, x + 36, y + 28, x + 52, y + 16);
    ctx.stroke();
    ctx.lineWidth = 1;
    // Left connector
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 12, 8, 8);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x, y + 12, 8, 1);
    if (type === 'usb-c') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 1, y + 14, 6, 4);
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 2, y + 15, 4, 2);
    } else if (type === 'lightning') {
      ctx.fillStyle = '#a0a0a8';
      ctx.fillRect(x + 2, y + 14, 4, 4);
      ctx.fillStyle = '#5a5a60';
      [3, 5].forEach(px => ctx.fillRect(x + px, y + 15, 1, 2));
    } else { // hdmi
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x, y + 14, 8, 4);
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 1, y + 15, 6, 2);
    }
    // Strain relief
    ctx.fillStyle = c.dark;
    ctx.fillRect(x + 8, y + 14, 4, 4);
    ctx.fillRect(x + 48, y + 14, 4, 4);
    // Right connector
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 52, y + 12, 8, 8);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 52, y + 12, 8, 1);
    if (type === 'usb-c') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 53, y + 14, 6, 4);
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + 54, y + 15, 4, 2);
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 52, y + 14, 8, 4);
    }
  },

  // VR HEADSET (52x32)
  vrHeadset(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 30, 44, 2);
    // Strap
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x, y + 8, 52, 4);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x, y + 9, 52, 2);
    // Main body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 12, 36, 16);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 9, y + 13, 34, 14);
    // Lens recesses
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 12, y + 16, 12, 8);
    ctx.fillRect(x + 28, y + 16, 12, 8);
    // Lens reflections — animated rainbow
    const phase = Math.floor(time / 6) % 4;
    const colors = ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'];
    ctx.fillStyle = colors[phase];
    ctx.fillRect(x + 14, y + 18, 8, 4);
    ctx.fillRect(x + 30, y + 18, 8, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 15, y + 19, 2, 1);
    ctx.fillRect(x + 31, y + 19, 2, 1);
    // Nose cutout
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 24); ctx.lineTo(x + 28, y + 24);
    ctx.lineTo(x + 26, y + 28);
    ctx.closePath(); ctx.fill();
    // Brand LED
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 25, y + 13, 2, 1);
  },

  // SMART WATCH (28x36)
  smartWatch(ctx, x, y, time = 0) {
    // Strap top
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 8, y, 12, 8);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 9, y, 10, 7);
    [2, 5].forEach(yy => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 9, y + yy, 10, 1);
    });
    // Strap bottom
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 8, y + 28, 12, 8);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 9, y + 29, 10, 7);
    [30, 33].forEach(yy => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 9, y + yy, 10, 1);
    });
    // Watch case
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 4, y + 8, 20, 20);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 5, y + 9, 18, 18);
    // Screen
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 7, y + 11, 14, 14);
    // Time display
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 12, 4, 5);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 13, y + 12, 1, 5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 15, y + 12, 5, 5);
    // Heart rate
    ctx.fillStyle = '#FF1D6C';
    const beat = Math.floor(time / 8) % 6 < 2;
    if (beat) {
      ctx.fillRect(x + 9, y + 19, 2, 4);
      ctx.fillRect(x + 8, y + 20, 4, 2);
    } else {
      ctx.fillRect(x + 9, y + 20, 2, 2);
    }
    ctx.fillStyle = '#3acc3a';
    [13, 14, 15, 16, 17, 18, 19].forEach((px, i) => {
      const h = i === 3 ? 4 : i === 2 || i === 4 ? 2 : 1;
      ctx.fillRect(x + px, y + 23 - h, 1, h);
    });
    // Crown
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 24, y + 14, 2, 6);
  },

  // SD CARD (24x28)
  sdCard(ctx, x, y, time = 0) {
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 28); ctx.lineTo(x + 4, y + 6);
    ctx.lineTo(x + 12, y); ctx.lineTo(x + 20, y);
    ctx.lineTo(x + 20, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 27); ctx.lineTo(x + 5, y + 7);
    ctx.lineTo(x + 13, y + 1); ctx.lineTo(x + 19, y + 1);
    ctx.lineTo(x + 19, y + 27);
    ctx.closePath(); ctx.fill();
    // Connector pads
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 7, y + 4, 10, 8);
    ctx.fillStyle = '#a67c3d';
    [8, 11, 14].forEach(px => ctx.fillRect(x + px, y + 4, 2, 8));
    // Label
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7, y + 16, 10, 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 18, 8, 1);
    ctx.fillRect(x + 8, y + 20, 8, 1);
    ctx.fillRect(x + 8, y + 22, 6, 1);
    // Switch
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 4, y + 14, 1, 4);
  }
};

if (typeof module !== 'undefined') module.exports = TECH;
