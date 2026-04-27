// PIXEL FOUNDRY — WEATHER & SKY (with axes)
// sun, cloud, rainbow, rainCloud, snowCloud, fog, aurora, sunset, thunderstorm, sunRays

const WEATHER = {
  AXES: {
    sun:    { time: ['day','dusk','dawn','noon'], size: ['s','m','l'] },
    cloud:  { kind: ['fluffy','flat','wispy','storm'], color: ['white','grey','black','pink','amber'] },
    rainbow:{ extent: ['arc','full','double'] },
    aurora: { color: ['violet','green','pink','blue'] },
    sunset: { time: ['dawn','dusk','blue-hour'] }
  },

  // SUN (52x52)
  sun(ctx, x, y, opts = {}, time = 0) {
    const tod = opts.time || 'noon';
    const sz = { s: 0.7, m: 1, l: 1.3 }[opts.size || 'm'];
    const c = tod === 'noon' ? { core: '#ffe080', main: '#F5A623', halo: 'rgba(245,166,35,0.4)' }
            : tod === 'dawn' ? { core: '#ffc46b', main: '#FF1D6C', halo: 'rgba(255,29,108,0.4)' }
            : tod === 'dusk' ? { core: '#FF1D6C', main: '#9C27B0', halo: 'rgba(156,39,176,0.4)' }
                             : { core: '#fff', main: '#F5A623', halo: 'rgba(245,166,35,0.4)' };
    const cx = x + 26, cy = y + 26;
    const pulse = 0.85 + Math.sin(time / 12) * 0.1;
    const r = 14 * sz;
    // Halo
    ctx.fillStyle = c.halo;
    ctx.globalAlpha = pulse;
    ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Rays
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time / 80;
      const r1 = r + 2, r2 = r + 7 + Math.sin(time / 8 + i) * 2;
      ctx.strokeStyle = c.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    // Disc
    ctx.fillStyle = c.main;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.core;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - r * 0.3, cy - r * 0.3, 2, 2);
    // Face on noon sun
    if (tod === 'noon') {
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(cx - 4, cy - 2, 2, 2);
      ctx.fillRect(cx + 2, cy - 2, 2, 2);
      ctx.fillRect(cx - 2, cy + 3, 4, 1);
    }
  },

  // CLOUD (60x32)
  cloud(ctx, x, y, opts = {}, time = 0) {
    const kind = opts.kind || 'fluffy';
    const colorMap = {
      white:  { dark:'#c0c0c0', mid:'#e0e0e0', light:'#ffffff' },
      grey:   { dark:'#5a5a60', mid:'#7a7a80', light:'#a0a0a8' },
      black:  { dark:'#1a1a1a', mid:'#2a2a2a', light:'#3a3a3a' },
      pink:   { dark:'#c41758', mid:'#FF1D6C', light:'#ff5a90' },
      amber:  { dark:'#c4851c', mid:'#F5A623', light:'#ffc46b' }
    };
    const c = colorMap[opts.color || 'white'];
    const drift = Math.sin(time / 30) * 1;
    if (kind === 'fluffy') {
      ctx.fillStyle = c.dark;
      [[16, 18, 10], [30, 14, 12], [44, 18, 10], [22, 12, 8], [38, 12, 8]].forEach(([cx, cy, r]) => {
        ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = c.mid;
      [[16, 16, 9], [30, 12, 11], [44, 16, 9], [22, 10, 7], [38, 10, 7]].forEach(([cx, cy, r]) => {
        ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = c.light;
      [[16, 14, 6], [30, 10, 8], [44, 14, 6]].forEach(([cx, cy, r]) => {
        ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r, 0, Math.PI * 2); ctx.fill();
      });
    } else if (kind === 'flat') {
      ctx.fillStyle = c.dark;
      ctx.fillRect(x + 4 + drift, y + 12, 52, 12);
      ctx.beginPath(); ctx.arc(x + 4 + drift, y + 18, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 56 + drift, y + 18, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.mid;
      ctx.fillRect(x + 6 + drift, y + 14, 48, 8);
      ctx.fillStyle = c.light;
      ctx.fillRect(x + 6 + drift, y + 14, 48, 1);
    } else if (kind === 'wispy') {
      ctx.fillStyle = c.mid;
      [[8, 16, 16, 4], [22, 12, 24, 5], [42, 18, 14, 4]].forEach(([cx, cy, w, h]) => {
        ctx.beginPath(); ctx.ellipse(x + cx + drift, y + cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = c.light;
      [[10, 14, 12, 2], [24, 10, 18, 3], [42, 16, 10, 2]].forEach(([cx, cy, w, h]) => {
        ctx.beginPath(); ctx.ellipse(x + cx + drift, y + cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
      });
    } else if (kind === 'storm') {
      ctx.fillStyle = c.dark;
      [[14, 16, 10], [30, 14, 13], [46, 16, 11], [22, 22, 8], [38, 22, 9]].forEach(([cx, cy, r]) => {
        ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = c.mid;
      [[14, 14, 9], [30, 12, 11], [46, 14, 9]].forEach(([cx, cy, r]) => {
        ctx.beginPath(); ctx.arc(x + cx + drift, y + cy, r, 0, Math.PI * 2); ctx.fill();
      });
      // Lightning hint
      if (Math.floor(time / 30) % 8 === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 28 + drift, y + 24, 2, 6);
      }
    }
  },

  // RAINBOW (96x52)
  rainbow(ctx, x, y, opts = {}, time = 0) {
    const ext = opts.extent || 'arc';
    const cx = x + 48, cy = y + 50;
    const colors = ['#FF1D6C', '#F5A623', '#ffe080', '#3acc3a', '#2979FF', '#9C27B0'];
    const startAng = ext === 'full' ? Math.PI : Math.PI;
    const endAng = ext === 'full' ? Math.PI * 2 : Math.PI * 2;
    colors.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 44 - i * 4, startAng, endAng);
      ctx.stroke();
    });
    if (ext === 'double') {
      // Outer fainter rainbow
      ctx.globalAlpha = 0.5;
      colors.slice().reverse().forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 56 - i * 2, Math.PI, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    ctx.lineWidth = 1;
    // Sparkle at end
    if (Math.floor(time / 12) % 2) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 4, y + 48, 2, 2);
      ctx.fillRect(x + 90, y + 48, 2, 2);
    }
  },

  // RAIN CLOUD (60x60)
  rainCloud(ctx, x, y, time = 0) {
    // Cloud
    const c = { dark:'#5a5a60', mid:'#7a7a80', light:'#a0a0a8' };
    ctx.fillStyle = c.dark;
    [[16, 14, 10], [30, 10, 12], [44, 14, 10], [22, 8, 8], [38, 8, 8]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = c.mid;
    [[16, 12, 9], [30, 8, 11], [44, 12, 9]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill();
    });
    // Rain streaks
    for (let i = 0; i < 10; i++) {
      const fall = (time / 2 + i * 14) % 36;
      const px = x + 12 + ((i * 5) % 36);
      ctx.fillStyle = '#7accea';
      ctx.fillRect(px, y + 24 + fall, 1, 4);
      ctx.fillStyle = 'rgba(122,204,234,0.4)';
      ctx.fillRect(px, y + 24 + fall - 4, 1, 4);
    }
    // Puddle
    ctx.fillStyle = 'rgba(122,204,234,0.5)';
    ctx.beginPath(); ctx.ellipse(x + 30, y + 58, 18, 2, 0, 0, Math.PI * 2); ctx.fill();
  },

  // SNOW CLOUD (60x60)
  snowCloud(ctx, x, y, time = 0) {
    const c = { dark:'#a0a0a8', mid:'#c0c0c4', light:'#e8e8ec' };
    ctx.fillStyle = c.dark;
    [[16, 14, 10], [30, 10, 12], [44, 14, 10]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = c.mid;
    [[16, 12, 9], [30, 8, 11], [44, 12, 9]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.arc(x + 30, y + 6, 8, 0, Math.PI * 2); ctx.fill();
    // Snowflakes
    for (let i = 0; i < 12; i++) {
      const drift = Math.sin((time + i * 50) / 30) * 4;
      const fall = (time / 4 + i * 16) % 36;
      const px = x + 12 + ((i * 4) % 36) + drift;
      const py = y + 22 + fall;
      ctx.fillStyle = '#fff';
      ctx.fillRect(px, py, 2, 2);
      ctx.fillRect(px - 1, py + 0.5, 1, 1);
      ctx.fillRect(px + 2, py + 0.5, 1, 1);
    }
    // Snow on ground
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y + 56, 60, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    [10, 22, 34, 48].forEach(sx => {
      ctx.beginPath(); ctx.arc(x + sx, y + 54, 3, 0, Math.PI * 2); ctx.fill();
    });
  },

  // FOG (64x40)
  fog(ctx, x, y, time = 0) {
    const drift1 = Math.sin(time / 30) * 4;
    const drift2 = Math.cos(time / 25) * 4;
    ctx.fillStyle = 'rgba(220,220,220,0.4)';
    [[8, 12, 28, 6], [30, 16, 32, 8], [10, 22, 30, 7], [28, 28, 30, 6]].forEach(([cx, cy, w, h], i) => {
      const d = i % 2 ? drift1 : drift2;
      ctx.beginPath(); ctx.ellipse(x + cx + d, y + cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(220,220,220,0.6)';
    [[12, 14, 22, 4], [34, 18, 24, 5], [16, 26, 22, 4]].forEach(([cx, cy, w, h], i) => {
      const d = i % 2 ? drift1 : drift2;
      ctx.beginPath(); ctx.ellipse(x + cx + d, y + cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    [[18, 16, 14, 2], [38, 22, 16, 2]].forEach(([cx, cy, w, h], i) => {
      const d = i % 2 ? drift1 : drift2;
      ctx.beginPath(); ctx.ellipse(x + cx + d, y + cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
    });
  },

  // AURORA (88x52)
  aurora(ctx, x, y, opts = {}, time = 0) {
    const colors = {
      violet: ['#9C27B0', '#c34dd6', '#FF1D6C'],
      green:  ['#3acc3a', '#7acc7a', '#a0e0a0'],
      pink:   ['#FF1D6C', '#ff5a90', '#F5A623'],
      blue:   ['#2979FF', '#5a9fff', '#9C27B0']
    }[opts.color || 'violet'];
    // Night sky
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x, y, 88, 52);
    // Stars
    for (let i = 0; i < 20; i++) {
      const sx = (i * 7) % 88;
      const sy = (i * 11) % 30;
      const tw = (time + i * 30) % 60 < 8;
      ctx.fillStyle = tw ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + sx, y + sy, 1, 1);
    }
    // Aurora ribbons
    colors.forEach((col, layer) => {
      for (let i = 0; i <= 88; i += 2) {
        const wave = Math.sin((i + time / 4 + layer * 20) / 8) * 4;
        const yOff = 16 + layer * 4 + wave;
        ctx.fillStyle = col + '80';
        ctx.fillRect(x + i, y + yOff, 2, 16 - layer * 3);
        ctx.fillStyle = col;
        ctx.fillRect(x + i, y + yOff + 2, 2, 1);
      }
    });
    // Mountain silhouette at bottom
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.moveTo(x, y + 52);
    ctx.lineTo(x, y + 44);
    ctx.lineTo(x + 16, y + 36);
    ctx.lineTo(x + 32, y + 42);
    ctx.lineTo(x + 48, y + 32);
    ctx.lineTo(x + 64, y + 40);
    ctx.lineTo(x + 88, y + 36);
    ctx.lineTo(x + 88, y + 52);
    ctx.closePath();
    ctx.fill();
  },

  // SUNSET (88x52)
  sunset(ctx, x, y, opts = {}, time = 0) {
    const t = opts.time || 'dusk';
    const sky = t === 'dawn'      ? ['#0a0a3a', '#9C27B0', '#FF1D6C', '#F5A623', '#ffe080']
              : t === 'dusk'      ? ['#9C27B0', '#FF1D6C', '#F5A623', '#ffc46b', '#0a0a3a']
                                   : ['#0a0a3a', '#1f5fcc', '#5a9fff', '#9C27B0', '#0a0a14'];
    // Gradient bands
    const bandH = 52 / sky.length;
    sky.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y + i * bandH, 88, bandH + 1);
    });
    // Sun (low on horizon)
    if (t !== 'blue-hour') {
      const sunY = y + 32;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(x + 44, sunY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t === 'dawn' ? '#ffe080' : '#FF1D6C';
      ctx.beginPath(); ctx.arc(x + 44, sunY, 8, 0, Math.PI * 2); ctx.fill();
      // Reflection
      ctx.fillStyle = `rgba(255,29,108,0.4)`;
      ctx.fillRect(x + 36, sunY + 12, 16, 2);
      ctx.fillRect(x + 38, sunY + 16, 12, 1);
    }
    // Water
    ctx.fillStyle = '#0a0a3a';
    ctx.fillRect(x, y + 42, 88, 10);
    // Cloud silhouettes
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    [[14, 16, 12, 3], [50, 12, 14, 3], [70, 18, 10, 2]].forEach(([cx, cy, w, h]) => {
      ctx.beginPath(); ctx.ellipse(x + cx, y + cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
    });
    // Stars in dawn/blue-hour upper sky
    if (t !== 'dusk') {
      ctx.fillStyle = '#fff';
      [[10, 4], [22, 8], [60, 6], [78, 10]].forEach(([sx, sy]) => {
        ctx.fillRect(x + sx, y + sy, 1, 1);
      });
    }
  },

  // THUNDERSTORM (60x60)
  thunderstorm(ctx, x, y, time = 0) {
    // Dark cloud
    const c = { dark:'#1a1a1a', mid:'#3a3a3e', light:'#5a5a60' };
    ctx.fillStyle = c.dark;
    [[16, 16, 12], [30, 12, 14], [46, 16, 12], [22, 8, 9], [38, 8, 9]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = c.mid;
    [[16, 14, 11], [30, 10, 12], [46, 14, 11]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill();
    });
    // Lightning bolt
    const flash = Math.floor(time / 60) % 6 === 0;
    if (flash && (time % 60) < 12) {
      ctx.fillStyle = `rgba(255,255,255,${1 - (time % 60) / 12})`;
      ctx.fillRect(x, y, 60, 60);
    }
    if (Math.floor(time / 30) % 4 === 0) {
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 28, y + 28, 4, 8);
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(x + 26, y + 32, 8, 4);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 30, y + 36, 4, 8);
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(x + 28, y + 40, 4, 4);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 32, y + 44, 4, 12);
      // Glow
      ctx.fillStyle = 'rgba(245,166,35,0.3)';
      ctx.fillRect(x + 18, y + 24, 24, 36);
    }
    // Rain
    for (let i = 0; i < 12; i++) {
      const fall = (time / 2 + i * 12) % 32;
      const px = x + 8 + ((i * 5) % 44);
      ctx.fillStyle = '#7accea';
      ctx.fillRect(px, y + 24 + fall, 1, 3);
    }
  },

  // SUN RAYS (52x60)
  sunRays(ctx, x, y, time = 0) {
    const cx = x + 26, cy = y;
    // Source sun small
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe080';
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    // Beams
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i / 5) * Math.PI * 2 / 3;
      const len = 56;
      const ex = cx + Math.cos(a) * len;
      const ey = cy + Math.sin(a) * len;
      ctx.fillStyle = `rgba(245,166,35,${0.15 + Math.sin(time / 8 + i) * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(cx - 1, cy);
      ctx.lineTo(cx + 1, cy);
      ctx.lineTo(ex + 4, ey);
      ctx.lineTo(ex - 4, ey);
      ctx.closePath();
      ctx.fill();
    }
    // Dust motes inside beams
    for (let i = 0; i < 12; i++) {
      const t = (time + i * 30) / 30;
      const px = cx + Math.cos(Math.PI / 3 + (i % 4) / 3 * Math.PI / 2) * (10 + t % 40);
      const py = cy + Math.sin(Math.PI / 3 + (i % 4) / 3 * Math.PI / 2) * (10 + t % 40);
      ctx.fillStyle = `rgba(255,255,255,${0.5})`;
      ctx.fillRect(px, py, 1, 1);
    }
  }
};

if (typeof module !== 'undefined') module.exports = WEATHER;
