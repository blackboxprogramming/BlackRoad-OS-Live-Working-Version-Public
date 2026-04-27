// PIXEL FOUNDRY — DINER
// dinerBooth, dinerCounter, jukebox, milkshake, neonSign, pieDisplay,
// coffeeMug, sodaGlass, ketchupBottle, dinerStool

const DINER = {
  AXES: {
    milkshake:    { flavor: ['vanilla','chocolate','strawberry','mint'] },
    sodaGlass:    { color: ['cola','orange','grape','lemon'] },
    neonSign:     { word: ['EAT','OPEN','24HR','DINER'] },
    dinerBooth:   { color: ['red','teal','amber','blue'] },
  },

  // DINER BOOTH (60x40) — back-to-back red vinyl bench
  dinerBooth(ctx, x, y, opts = {}, time = 0) {
    const colors = {
      red:   { main: '#C84A4A', dk: '#8E2E2E', lt: '#E0696A' },
      teal:  { main: '#3FA88E', dk: '#2A6F60', lt: '#5BC8AE' },
      amber: { main: '#D89B3D', dk: '#9E6E1F', lt: '#F5C84A' },
      blue:  { main: '#3D8FB6', dk: '#2A6F95', lt: '#5BA8C8' },
    };
    const c = colors[opts.color] || colors.red;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 38, 52, 2);
    // Backrest
    ctx.fillStyle = c.dk;
    ctx.fillRect(x + 2, y, 56, 22);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 4, y + 2, 52, 18);
    // Tufts (button pattern)
    ctx.fillStyle = c.dk;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        ctx.fillRect(x + 8 + col * 8, y + 5 + row * 5, 2, 2);
      }
    }
    // Top piping
    ctx.fillStyle = c.lt;
    ctx.fillRect(x + 4, y + 2, 52, 1);
    // Seat
    ctx.fillStyle = c.dk;
    ctx.fillRect(x, y + 22, 60, 12);
    ctx.fillStyle = c.main;
    ctx.fillRect(x + 1, y + 23, 58, 10);
    ctx.fillStyle = c.lt;
    ctx.fillRect(x + 1, y + 23, 58, 1);
    // Seat cushion seam
    ctx.fillStyle = c.dk;
    ctx.fillRect(x + 1, y + 28, 58, 1);
    // Chrome trim base
    ctx.fillStyle = '#C7C5B7';
    ctx.fillRect(x, y + 34, 60, 2);
    ctx.fillStyle = '#7E7B73';
    ctx.fillRect(x, y + 36, 60, 2);
    // Floor anchors
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x + 4, y + 36, 3, 3);
    ctx.fillRect(x + 53, y + 36, 3, 3);
  },

  // DINER COUNTER (60x32) — chrome-trim formica counter
  dinerCounter(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 56, 2);
    // Counter top
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x, y, 60, 6);
    ctx.fillStyle = '#D8CFB7';
    ctx.fillRect(x, y + 5, 60, 1);
    // Boomerang specks
    ctx.fillStyle = '#3FA88E';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(x + 3 + i * 5, y + 2, 2, 1);
    }
    ctx.fillStyle = '#E0696A';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(x + 5 + i * 6, y + 3, 1, 1);
    }
    // Chrome edge
    ctx.fillStyle = '#C7C5B7';
    ctx.fillRect(x, y + 6, 60, 2);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x, y + 7, 60, 1);
    // Front panel
    ctx.fillStyle = '#3D8FB6';
    ctx.fillRect(x, y + 8, 60, 22);
    ctx.fillStyle = '#2A6F95';
    ctx.fillRect(x, y + 8, 60, 1);
    ctx.fillStyle = '#5BA8C8';
    ctx.fillRect(x, y + 9, 60, 1);
    // Vertical chrome stripes
    ctx.fillStyle = '#C7C5B7';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + 6 + i * 10, y + 10, 1, 18);
    }
    // Bottom chrome
    ctx.fillStyle = '#C7C5B7';
    ctx.fillRect(x, y + 28, 60, 2);
  },

  // JUKEBOX (32x52) — classic Wurlitzer-style with arch
  jukebox(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 28, 3);
    // Base
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x, y + 36, 32, 16);
    ctx.fillStyle = '#8C5C34';
    ctx.fillRect(x + 1, y + 37, 30, 14);
    // Arch dome
    ctx.fillStyle = '#5C402B';
    ctx.beginPath();
    ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x + 16, y - 4, x + 32, y + 14);
    ctx.lineTo(x + 32, y + 36); ctx.lineTo(x, y + 36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8C5C34';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 16); ctx.quadraticCurveTo(x + 16, y, x + 30, y + 16);
    ctx.lineTo(x + 30, y + 34); ctx.lineTo(x + 2, y + 34); ctx.closePath(); ctx.fill();
    // Arch glass — colorful gradient bars (animated cycle)
    const cycle = Math.floor(time / 30) % 6;
    const glassColors = ['#FF1D6C','#F5A623','#FFC84A','#5BA85B','#3D8FB6','#7B5BA8'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = glassColors[(i + cycle) % 6];
      const xx = x + 4 + i * 4;
      const top = y + 4 + Math.abs(i - 2.5) * 1.5;
      ctx.fillRect(xx, top, 4, 26 - Math.abs(i - 2.5) * 1.5);
    }
    // Arch frame highlight
    ctx.strokeStyle = '#C7C5B7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 16); ctx.quadraticCurveTo(x + 16, y, x + 30, y + 16);
    ctx.stroke();
    // Speaker grille (round)
    ctx.fillStyle = '#1F1D1A';
    ctx.beginPath(); ctx.arc(x + 16, y + 42, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7E7B73';
    for (let r = 2; r < 6; r += 2) {
      ctx.beginPath(); ctx.arc(x + 16, y + 42, r, 0, Math.PI * 2); ctx.stroke();
    }
    // Coin slot
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 24, y + 38, 4, 1);
    // Title strip
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 4, y + 32, 24, 3);
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x + 6, y + 33, 6, 1);
    ctx.fillRect(x + 14, y + 33, 4, 1);
    ctx.fillRect(x + 20, y + 33, 6, 1);
  },

  // MILKSHAKE (20x36) — tall glass with whip + cherry + straw
  milkshake(ctx, x, y, opts = {}, time = 0) {
    const flavors = {
      vanilla:    { main: '#F5F0E0', dk: '#D8CFB7' },
      chocolate:  { main: '#8C5C34', dk: '#5C3F22' },
      strawberry: { main: '#FFB0C0', dk: '#E0696A' },
      mint:       { main: '#A8E0C8', dk: '#5BB494' },
    };
    const f = flavors[opts.flavor] || flavors.vanilla;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 34, 16, 2);
    // Glass sides (curved trapezoid)
    ctx.fillStyle = 'rgba(190,220,235,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 16, y + 8);
    ctx.lineTo(x + 14, y + 34); ctx.lineTo(x + 6, y + 34); ctx.closePath(); ctx.fill();
    // Liquid
    ctx.fillStyle = f.main;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 10); ctx.lineTo(x + 15, y + 10);
    ctx.lineTo(x + 13, y + 33); ctx.lineTo(x + 7, y + 33); ctx.closePath(); ctx.fill();
    // Liquid darker bottom
    ctx.fillStyle = f.dk;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 28); ctx.lineTo(x + 12, y + 28);
    ctx.lineTo(x + 13, y + 33); ctx.lineTo(x + 7, y + 33); ctx.closePath(); ctx.fill();
    // Whipped cream dome
    ctx.fillStyle = '#FFF8E8';
    ctx.beginPath(); ctx.arc(x + 10, y + 8, 5, 0, Math.PI, true); ctx.fill();
    ctx.fillRect(x + 5, y + 6, 10, 4);
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 6, y + 4, 3, 2);
    ctx.fillRect(x + 11, y + 5, 3, 2);
    // Cherry
    ctx.fillStyle = '#C84A4A';
    ctx.beginPath(); ctx.arc(x + 10, y + 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF8888';
    ctx.fillRect(x + 9, y + 2, 1, 1);
    ctx.fillStyle = '#5BA85B';
    ctx.fillRect(x + 11, y, 1, 2);
    // Straw
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 13, y, 2, 9);
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 13, y + 2, 2, 1);
    ctx.fillRect(x + 13, y + 5, 2, 1);
    // Glass highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 6, y + 10, 1, 18);
  },

  // NEON SIGN (52x24) — pink/blue neon "EAT"/"OPEN"/etc.
  neonSign(ctx, x, y, opts = {}, time = 0) {
    const word = (opts.word || 'EAT').toUpperCase();
    const flicker = Math.floor(time / 6) % 30 < 28;
    // Mounting box
    ctx.fillStyle = '#1F1D1A';
    ctx.fillRect(x, y, 52, 24);
    ctx.fillStyle = '#3F3D38';
    ctx.fillRect(x + 1, y + 1, 50, 22);
    // Border tubes (pink)
    ctx.strokeStyle = flicker ? '#FF1D6C' : '#5C2030';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 3, 46, 18);
    if (flicker) {
      ctx.strokeStyle = 'rgba(255,29,108,0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 3, y + 3, 46, 18);
    }
    ctx.lineWidth = 1;
    // Letters (3-letter or 4-letter words)
    const letters = word.split('').slice(0, 4);
    const letterW = letters.length === 4 ? 9 : 12;
    const startX = x + (52 - letters.length * letterW) / 2;
    ctx.strokeStyle = flicker ? '#5BA8E0' : '#1A4060';
    ctx.lineWidth = 2;
    letters.forEach((ch, i) => {
      const lx = startX + i * letterW;
      const ly = y + 7;
      drawLetter(ctx, ch, lx, ly, letterW - 2, 10);
    });
    // Glow
    if (flicker) {
      ctx.strokeStyle = 'rgba(91,168,224,0.35)';
      ctx.lineWidth = 4;
      letters.forEach((ch, i) => {
        const lx = startX + i * letterW;
        const ly = y + 7;
        drawLetter(ctx, ch, lx, ly, letterW - 2, 10);
      });
    }
    ctx.lineWidth = 1;
    // Mount bracket
    ctx.fillStyle = '#5A5852';
    ctx.fillRect(x - 3, y + 10, 3, 4);
    ctx.fillRect(x + 52, y + 10, 3, 4);
  },

  // PIE DISPLAY (40x36) — spinning glass dome over pie
  pieDisplay(ctx, x, y, time = 0) {
    const spin = Math.sin(time / 80) * 0.3;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Base
    ctx.fillStyle = '#7E7B73';
    ctx.fillRect(x + 2, y + 28, 36, 8);
    ctx.fillStyle = '#C7C5B7';
    ctx.fillRect(x + 2, y + 28, 36, 1);
    // Pie plate
    ctx.fillStyle = '#9E9C8E';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 26, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Pie crust
    ctx.fillStyle = '#D8AE6A';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Pie filling top
    ctx.fillStyle = '#C84A4A';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E0696A';
    ctx.beginPath(); ctx.ellipse(x + 17, y + 21, 3, 1, 0, 0, Math.PI * 2); ctx.fill();
    // Lattice strips
    ctx.strokeStyle = '#D8AE6A';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 20 + i * 4 - 4, y + 19);
      ctx.lineTo(x + 20 + i * 4 + 4, y + 24);
      ctx.stroke();
    }
    // Glass dome
    ctx.fillStyle = 'rgba(190,220,235,0.35)';
    ctx.beginPath();
    ctx.arc(x + 20, y + 22, 16, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 20, y + 22, 16, Math.PI, 0); ctx.stroke();
    // Dome highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(x + 12, y + 14, 3, 0, Math.PI * 2); ctx.fill();
    // Knob on top
    ctx.fillStyle = '#C7C5B7';
    ctx.fillRect(x + 18, y + 4, 4, 4);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 18, y + 7, 4, 1);
  },

  // COFFEE MUG (16x16) — diner mug with steam
  coffeeMug(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 14, 12, 2);
    // Mug body
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 2, y + 4, 10, 11);
    ctx.fillStyle = '#D8CFB7';
    ctx.fillRect(x + 2, y + 14, 10, 1);
    // Stripe
    ctx.fillStyle = '#3FA88E';
    ctx.fillRect(x + 2, y + 8, 10, 1);
    // Coffee top
    ctx.fillStyle = '#3D2818';
    ctx.fillRect(x + 3, y + 4, 8, 2);
    ctx.fillStyle = '#5C402B';
    ctx.fillRect(x + 3, y + 4, 8, 1);
    // Handle
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 12, y + 6, 3, 6);
    ctx.fillStyle = '#D8CFB7';
    ctx.fillRect(x + 13, y + 7, 1, 4);
    // Steam
    ctx.fillStyle = 'rgba(245,240,224,0.6)';
    const s = (time / 8) % 8;
    ctx.fillRect(x + 4, y - s, 1, 2);
    ctx.fillRect(x + 7, y - s + 2, 1, 2);
    ctx.fillRect(x + 10, y - s + 1, 1, 2);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 3, y + 5, 1, 8);
  },

  // SODA GLASS (16x28) — fizzy fountain soda
  sodaGlass(ctx, x, y, opts = {}, time = 0) {
    const colors = {
      cola:   { main: '#3D2818', foam: '#A88860' },
      orange: { main: '#FF8C42', foam: '#FFC8A0' },
      grape:  { main: '#7B5BA8', foam: '#C8A0F0' },
      lemon:  { main: '#F5C84A', foam: '#FFF0B0' },
    };
    const c = colors[opts.color] || colors.cola;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 26, 12, 2);
    // Glass
    ctx.fillStyle = 'rgba(190,220,235,0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 4); ctx.lineTo(x + 13, y + 4);
    ctx.lineTo(x + 12, y + 27); ctx.lineTo(x + 4, y + 27); ctx.closePath(); ctx.fill();
    // Liquid
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 12, y + 8);
    ctx.lineTo(x + 11, y + 26); ctx.lineTo(x + 5, y + 26); ctx.closePath(); ctx.fill();
    // Foam
    ctx.fillStyle = c.foam;
    ctx.fillRect(x + 4, y + 6, 8, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x + 4, y + 6, 8, 1);
    // Bubbles (animated)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const t = time / 4;
    for (let i = 0; i < 4; i++) {
      const by = y + 24 - ((t + i * 30) % 18);
      ctx.fillRect(x + 6 + i * 1.5, by, 1, 1);
    }
    // Lemon slice
    ctx.fillStyle = '#F5C84A';
    ctx.fillRect(x + 11, y + 5, 3, 3);
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(x + 12, y + 6, 1, 1);
    // Straw
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 8, y, 2, 9);
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 8, y + 2, 2, 1);
    ctx.fillRect(x + 8, y + 5, 2, 1);
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x + 4, y + 8, 1, 16);
  },

  // KETCHUP BOTTLE (10x24)
  ketchupBottle(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y + 22, 10, 2);
    // Body
    ctx.fillStyle = '#C84A4A';
    ctx.fillRect(x + 1, y + 8, 8, 14);
    ctx.fillStyle = '#8E2E2E';
    ctx.fillRect(x + 1, y + 21, 8, 1);
    ctx.fillStyle = '#E0696A';
    ctx.fillRect(x + 1, y + 8, 1, 14);
    // Neck
    ctx.fillStyle = '#C84A4A';
    ctx.fillRect(x + 3, y + 4, 4, 4);
    // Cap
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 2, y, 6, 4);
    ctx.fillStyle = '#D8CFB7';
    ctx.fillRect(x + 2, y + 3, 6, 1);
    // Label
    ctx.fillStyle = '#F5F0E0';
    ctx.fillRect(x + 1, y + 12, 8, 7);
    ctx.fillStyle = '#C84A4A';
    ctx.fillRect(x + 2, y + 14, 1, 2); ctx.fillRect(x + 4, y + 14, 1, 2);
    ctx.fillRect(x + 6, y + 14, 1, 2); ctx.fillRect(x + 7, y + 14, 1, 2);
    ctx.fillRect(x + 2, y + 17, 6, 1);
  },

  // DINER STOOL (16x32) — chrome counter stool
  dinerStool(ctx, x, y, time = 0) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, y + 30, 16, 2);
    // Base disc
    ctx.fillStyle = '#5A5852';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 30, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9E9C8E';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 29, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Chrome pole
    ctx.fillStyle = '#C7C5B7';
    ctx.fillRect(x + 6, y + 12, 4, 18);
    ctx.fillStyle = '#9E9C8E';
    ctx.fillRect(x + 9, y + 12, 1, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 7, y + 14, 1, 14);
    // Seat cushion (red vinyl)
    ctx.fillStyle = '#8E2E2E';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 11, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C84A4A';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E0696A';
    ctx.beginPath(); ctx.ellipse(x + 6, y + 8, 3, 1, 0, 0, Math.PI * 2); ctx.fill();
    // Chrome ring
    ctx.fillStyle = '#7E7B73';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 12, 7, 1, 0, 0, Math.PI * 2); ctx.fill();
  },
};

// Helper for neon letters
function drawLetter(ctx, ch, x, y, w, h) {
  const cx = x + w / 2;
  switch (ch) {
    case 'E':
      ctx.beginPath();
      ctx.moveTo(x + w, y); ctx.lineTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h);
      ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w * 0.7, y + h / 2);
      ctx.stroke();
      break;
    case 'A':
      ctx.beginPath();
      ctx.moveTo(x, y + h); ctx.lineTo(cx, y); ctx.lineTo(x + w, y + h);
      ctx.moveTo(x + w * 0.2, y + h * 0.6); ctx.lineTo(x + w * 0.8, y + h * 0.6);
      ctx.stroke();
      break;
    case 'T':
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + w, y);
      ctx.moveTo(cx, y); ctx.lineTo(cx, y + h);
      ctx.stroke();
      break;
    case 'O':
      ctx.beginPath();
      ctx.ellipse(cx, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'P':
      ctx.beginPath();
      ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x, y + h / 2);
      ctx.stroke();
      break;
    case 'N':
      ctx.beginPath();
      ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y);
      ctx.stroke();
      break;
    case 'D':
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w * 0.7, y + h);
      ctx.quadraticCurveTo(x + w, y + h / 2, x + w * 0.7, y); ctx.lineTo(x, y);
      ctx.stroke();
      break;
    case 'I':
      ctx.beginPath();
      ctx.moveTo(cx, y); ctx.lineTo(cx, y + h);
      ctx.moveTo(x + w * 0.3, y); ctx.lineTo(x + w * 0.7, y);
      ctx.moveTo(x + w * 0.3, y + h); ctx.lineTo(x + w * 0.7, y + h);
      ctx.stroke();
      break;
    case 'R':
      ctx.beginPath();
      ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x, y + h / 2); ctx.lineTo(x + w, y + h);
      ctx.stroke();
      break;
    case '2':
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x, y + h / 2); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h);
      ctx.stroke();
      break;
    case '4':
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
      ctx.moveTo(x + w * 0.7, y); ctx.lineTo(x + w * 0.7, y + h);
      ctx.stroke();
      break;
    case 'H':
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x, y + h);
      ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h);
      ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      break;
  }
}
