// PIXEL FOUNDRY — DISHES (extended food)
// ramen, pasta, sushi, salad, taco, burger, fries, sundae, popsicle, soup, steak

const DISHES = {
  AXES: {
    sushi:    { kind: ['nigiri','maki','temaki'] },
    popsicle: { color: ['pink','amber','violet','blue','white','green'] },
    sundae:   { flavor: ['vanilla','chocolate','strawberry','mint'] },
    soup:     { kind: ['tomato','chicken','pumpkin','seafood'] }
  },

  // RAMEN bowl (44x36)
  ramen(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 34, 40, 2);
    // Bowl
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 16); ctx.lineTo(x + 42, y + 16);
    ctx.quadraticCurveTo(x + 40, y + 34, x + 22, y + 34);
    ctx.quadraticCurveTo(x + 4, y + 34, x + 2, y + 16);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 2, y + 30, 40, 2);
    // Broth
    ctx.fillStyle = '#a85a26';
    ctx.beginPath(); ctx.ellipse(x + 22, y + 16, 20, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c4851c';
    ctx.beginPath(); ctx.ellipse(x + 22, y + 15, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Noodles
    ctx.fillStyle = '#daa86a';
    [12, 16, 20, 24, 28, 32].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(x + px, y + 14);
      ctx.bezierCurveTo(x + px - 2, y + 16, x + px + 2, y + 18, x + px, y + 19);
      ctx.stroke();
    });
    ctx.strokeStyle = '#daa86a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const px = x + 8 + i * 4;
      ctx.moveTo(px, y + 13);
      ctx.bezierCurveTo(px + 2, y + 15, px - 1, y + 17, px + 1, y + 18);
      ctx.stroke();
    }
    // Egg
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 14, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath(); ctx.ellipse(x + 14, y + 14, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // Pork slice
    ctx.fillStyle = '#FF5A90';
    ctx.fillRect(x + 22, y + 12, 8, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 22, y + 13, 8, 1);
    // Green onions
    ctx.fillStyle = '#3acc3a';
    [10, 18, 26, 32].forEach(px => ctx.fillRect(x + px, y + 12, 2, 1));
    // Chopsticks
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 30, y + 4, 2, 14);
    ctx.fillRect(x + 34, y + 4, 2, 14);
    // Steam
    if (Math.floor(time / 8) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 16, y + 4 - (time % 6), 2, 2);
      ctx.fillRect(x + 26, y + 2 - (time % 4), 2, 2);
    }
  },

  // PASTA (40x36)
  pasta(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Plate
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 26, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Sauce pool
    ctx.fillStyle = '#c41758';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Noodles (squiggly strands)
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const startX = x + 8 + (i * 2);
      ctx.beginPath();
      ctx.moveTo(startX, y + 18);
      ctx.bezierCurveTo(startX + 4, y + 16, startX - 2, y + 22, startX + 2, y + 24);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ffc46b';
    for (let i = 0; i < 6; i++) {
      const startX = x + 12 + (i * 3);
      ctx.beginPath();
      ctx.moveTo(startX, y + 14);
      ctx.quadraticCurveTo(startX + 2, y + 18, startX, y + 20);
      ctx.stroke();
    }
    // Meatballs
    ctx.fillStyle = '#5a3a1a';
    [[14, 22], [22, 18], [28, 22]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 2.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#7a5028';
    [[14, 22], [22, 18], [28, 22]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx - 1, y + dy - 1, 1, 0, Math.PI * 2); ctx.fill();
    });
    // Basil
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 18, y + 16, 2, 2);
    ctx.fillRect(x + 26, y + 20, 2, 2);
  },

  // SUSHI (44x28)
  sushi(ctx, x, y, opts = {}, time = 0) {
    const kind = opts.kind || 'nigiri';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 26, 40, 2);
    if (kind === 'nigiri') {
      // 3 nigiri pieces side by side
      [4, 18, 32].forEach((px, i) => {
        // Rice
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + px, y + 14, 10, 10);
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(x + px + 1, y + 24, 8, 1);
        // Topping
        ctx.fillStyle = ['#FF1D6C', '#F5A623', '#fff'][i];
        ctx.fillRect(x + px - 1, y + 8, 12, 8);
        if (i === 0) {
          ctx.fillStyle = '#fff';
          [3, 7].forEach(dx => ctx.fillRect(x + px - 1 + dx, y + 9, 1, 6));
        }
        // Wasabi dot
        ctx.fillStyle = '#3acc3a';
        ctx.fillRect(x + px + 4, y + 12, 2, 2);
      });
    } else if (kind === 'maki') {
      // 3 maki rolls
      [6, 22, 38].forEach((px, i) => {
        // Nori wrap
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath(); ctx.arc(x + px, y + 16, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a14';
        ctx.beginPath(); ctx.arc(x + px, y + 16, 6, 0, Math.PI * 2); ctx.fill();
        // Rice
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x + px, y + 16, 5, 0, Math.PI * 2); ctx.fill();
        // Filling
        ctx.fillStyle = ['#FF1D6C', '#3acc3a', '#F5A623'][i];
        ctx.beginPath(); ctx.arc(x + px, y + 16, 2, 0, Math.PI * 2); ctx.fill();
      });
    } else { // temaki cone
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 8);
      ctx.lineTo(x + 32, y + 8);
      ctx.lineTo(x + 22, y + 26);
      ctx.lineTo(x + 14, y + 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0a0a14';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 9);
      ctx.lineTo(x + 30, y + 9);
      ctx.lineTo(x + 22, y + 24);
      ctx.lineTo(x + 14, y + 24);
      ctx.closePath(); ctx.fill();
      // Rice + filling at top
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 8, y + 10, 20, 4);
      ctx.fillStyle = '#FF1D6C';
      ctx.fillRect(x + 12, y + 6, 12, 5);
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x + 16, y + 4, 4, 6);
    }
  },

  // SALAD (40x36)
  salad(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Bowl
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 28, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 26, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Lettuce base
    ctx.fillStyle = '#3acc3a';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 16, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7acc7a';
    [[10, 18], [16, 14], [22, 16], [28, 14], [16, 20], [24, 20]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#3acc3a';
    [[12, 18], [20, 14], [28, 18]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2); ctx.fill();
    });
    // Toppings
    // Tomato
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 14, y + 16, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 26, y + 14, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff5a90';
    ctx.fillRect(x + 13, y + 14, 1, 1);
    // Cucumber
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 18, y + 18, 4, 2);
    ctx.fillStyle = '#7acc7a';
    ctx.fillRect(x + 19, y + 18, 2, 2);
    // Carrot shreds
    ctx.fillStyle = '#F5A623';
    [10, 22, 28].forEach(px => ctx.fillRect(x + px, y + 14, 2, 1));
    // Croutons
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 24, y + 18, 2, 2);
    ctx.fillRect(x + 12, y + 20, 2, 2);
  },

  // TACO (40x32)
  taco(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Shell
    ctx.fillStyle = '#c4851c';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 28); ctx.quadraticCurveTo(x + 4, y + 8, x + 20, y + 8);
    ctx.quadraticCurveTo(x + 36, y + 8, x + 36, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 28); ctx.quadraticCurveTo(x + 6, y + 10, x + 20, y + 10);
    ctx.quadraticCurveTo(x + 34, y + 10, x + 34, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffc46b';
    ctx.fillRect(x + 6, y + 28, 28, 1);
    // Filling — meat
    ctx.fillStyle = '#5a3a1a';
    [[10, 14], [16, 12], [22, 14], [28, 12]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2); ctx.fill();
    });
    // Lettuce
    ctx.fillStyle = '#3acc3a';
    [8, 14, 20, 26, 32].forEach(px => ctx.fillRect(x + px, y + 8, 2, 4));
    // Tomato
    ctx.fillStyle = '#FF1D6C';
    [12, 24].forEach(px => {
      ctx.beginPath(); ctx.arc(x + px, y + 14, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    // Cheese
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 14, y + 16, 2, 2);
    ctx.fillRect(x + 22, y + 18, 2, 2);
    ctx.fillRect(x + 18, y + 14, 2, 2);
  },

  // BURGER (40x36)
  burger(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 34, 36, 2);
    // Bottom bun
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 30, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 4, y + 28, 32, 4);
    // Lettuce
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 3, y + 24, 34, 5);
    ctx.fillStyle = '#7acc7a';
    [4, 8, 12, 16, 20, 24, 28, 32].forEach(dx => ctx.fillRect(x + dx, y + 23, 2, 2));
    // Tomato
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 4, y + 21, 32, 3);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 21, 32, 1);
    // Cheese
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 2, y + 17, 36, 4);
    ctx.fillStyle = '#ffc46b';
    [6, 12, 28, 34].forEach(dx => ctx.fillRect(x + dx, y + 17, 2, 4));
    // Patty
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 4, y + 12, 32, 6);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 4, y + 12, 32, 2);
    // Top bun
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 12); ctx.quadraticCurveTo(x + 20, y, x + 36, y + 12);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#daa86a';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 12); ctx.quadraticCurveTo(x + 20, y + 1, x + 35, y + 12);
    ctx.closePath(); ctx.fill();
    // Sesame seeds
    ctx.fillStyle = '#fff';
    [12, 18, 24, 28].forEach(dx => ctx.fillRect(x + dx, y + 4 + (dx % 3), 2, 1));
  },

  // FRIES (32x40)
  fries(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 38, 28, 2);
    // Container
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 18); ctx.lineTo(x + 26, y + 18);
    ctx.lineTo(x + 28, y + 38); ctx.lineTo(x + 4, y + 38);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 19); ctx.lineTo(x + 25, y + 19);
    ctx.lineTo(x + 26, y + 36); ctx.lineTo(x + 6, y + 36);
    ctx.closePath(); ctx.fill();
    // Stripes
    ctx.fillStyle = '#fff';
    [22, 26, 30, 34].forEach(yy => ctx.fillRect(x + 6, y + yy, 20, 1));
    // Logo
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 13, y + 26, 6, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 14, y + 27, 4, 4);
    // Fries sticking out
    ctx.fillStyle = '#F5A623';
    [[8, 4], [12, 0], [16, -2], [20, 2], [24, 6], [10, 8], [22, 4], [14, 6]].forEach(([dx, dy]) => {
      ctx.fillRect(x + dx, y + dy, 2, 18);
    });
    ctx.fillStyle = '#ffc46b';
    [[8, 4], [12, 0], [16, -2], [20, 2], [24, 6], [10, 8]].forEach(([dx, dy]) => {
      ctx.fillRect(x + dx, y + dy, 1, 18);
    });
    // Salt sparkles
    ctx.fillStyle = '#fff';
    [[10, 6], [18, 2], [22, 8]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
  },

  // SUNDAE (32x52)
  sundae(ctx, x, y, opts = {}, time = 0) {
    const flav = opts.flavor || 'strawberry';
    const c = flav === 'vanilla'    ? ['#fff5e0', '#daa86a']
            : flav === 'chocolate'  ? ['#5a3a1a', '#3a2510']
            : flav === 'mint'       ? ['#a0e0a0', '#3acc3a']
                                    : ['#ff5a90', '#FF1D6C'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 50, 28, 2);
    // Tulip glass
    ctx.fillStyle = 'rgba(220,234,242,0.3)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 16); ctx.lineTo(x + 12, y + 38);
    ctx.lineTo(x + 20, y + 38); ctx.lineTo(x + 28, y + 16);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a5a60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 16); ctx.lineTo(x + 12, y + 38);
    ctx.lineTo(x + 20, y + 38); ctx.lineTo(x + 28, y + 16);
    ctx.stroke();
    // Stem + foot
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 15, y + 38, 2, 8);
    ctx.fillRect(x + 10, y + 46, 12, 4);
    // Ice cream scoops
    ctx.fillStyle = c[1];
    ctx.beginPath(); ctx.arc(x + 12, y + 14, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 20, y + 12, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16, y + 8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[0];
    ctx.beginPath(); ctx.arc(x + 12, y + 13, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 20, y + 11, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16, y + 7, 5, 0, Math.PI * 2); ctx.fill();
    // Whipped cream
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 16, y + 2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 13, y + 5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 19, y + 5, 3, 0, Math.PI * 2); ctx.fill();
    // Cherry
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 16, y, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 17, y - 2, 2, 2);
    // Sprinkles
    ['#FF1D6C', '#F5A623', '#9C27B0', '#2979FF'].forEach((c2, i) => {
      ctx.fillStyle = c2;
      ctx.fillRect(x + 8 + i * 4, y + 18 + (i % 2), 2, 1);
    });
  },

  // POPSICLE (24x44)
  popsicle(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color === 'pink' ? ['#FF1D6C','#c41758','#ff5a90']
            : opts.color === 'amber' ? ['#F5A623','#c4851c','#ffc46b']
            : opts.color === 'violet' ? ['#9C27B0','#7b1f8c','#c34dd6']
            : opts.color === 'blue' ? ['#2979FF','#1f5fcc','#5a9fff']
            : opts.color === 'green' ? ['#3acc3a','#2a8a2a','#7acc7a']
                                      : ['#fff','#c0c0c0','#ffffff'];
    // Stick
    ctx.fillStyle = '#a67c3d';
    ctx.fillRect(x + 10, y + 30, 4, 14);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 11, y + 30, 2, 14);
    // Pop
    ctx.fillStyle = c[1];
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 6); ctx.quadraticCurveTo(x + 4, y, x + 12, y);
    ctx.quadraticCurveTo(x + 20, y, x + 20, y + 6);
    ctx.lineTo(x + 20, y + 32); ctx.lineTo(x + 4, y + 32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c[0];
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 7); ctx.quadraticCurveTo(x + 5, y + 1, x + 12, y + 1);
    ctx.quadraticCurveTo(x + 19, y + 1, x + 19, y + 7);
    ctx.lineTo(x + 19, y + 30); ctx.lineTo(x + 5, y + 30);
    ctx.closePath(); ctx.fill();
    // Highlight
    ctx.fillStyle = c[2];
    ctx.fillRect(x + 6, y + 4, 2, 18);
    // Drip
    ctx.fillStyle = c[0];
    ctx.fillRect(x + 14, y + 32, 3, 4);
    ctx.beginPath(); ctx.arc(x + 15, y + 36, 2, 0, Math.PI * 2); ctx.fill();
  },

  // SOUP (40x32)
  soup(ctx, x, y, opts = {}, time = 0) {
    const kind = opts.kind || 'tomato';
    const c = kind === 'tomato'    ? '#FF1D6C'
            : kind === 'chicken'   ? '#F5A623'
            : kind === 'pumpkin'   ? '#c4851c'
                                   : '#5a9fff';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Bowl
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 14); ctx.lineTo(x + 38, y + 14);
    ctx.quadraticCurveTo(x + 36, y + 30, x + 20, y + 30);
    ctx.quadraticCurveTo(x + 4, y + 30, x + 2, y + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 2, y + 26, 36, 2);
    // Soup
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(x + 20, y + 14, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Garnish
    if (kind === 'tomato') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + 20, y + 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3acc3a';
      [[14, 12], [26, 14], [22, 16], [16, 16]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 2, 1));
    } else if (kind === 'chicken') {
      ctx.fillStyle = '#daa86a';
      [[12, 12], [20, 13], [28, 12], [16, 14], [24, 14]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(x + dx, y + dy, 1.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#3acc3a';
      [10, 22, 30].forEach(px => ctx.fillRect(x + px, y + 12, 2, 1));
    } else if (kind === 'pumpkin') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 13);
      [16, 20, 24, 28].forEach(px => ctx.lineTo(x + px, y + 13 + Math.sin(px) * 1));
      ctx.stroke();
      ctx.fillStyle = '#3a2510';
      [13, 19, 25].forEach(px => ctx.fillRect(x + px, y + 14, 2, 1));
    } else {
      ctx.fillStyle = '#FF1D6C';
      [[14, 13], [26, 14]].forEach(([dx, dy]) => {
        ctx.fillRect(x + dx, y + dy, 4, 2);
      });
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 18, y + 13, 2, 1);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + 22, y + 13, 2, 2);
    }
    // Steam
    if (Math.floor(time / 8) % 2) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x + 14, y + 4 - (time % 6), 2, 2);
      ctx.fillRect(x + 24, y + 2 - (time % 4), 2, 2);
    }
    // Spoon
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 32, y + 4, 2, 12);
    ctx.beginPath(); ctx.ellipse(x + 33, y + 4, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  },

  // STEAK (40x32)
  steak(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 2, y + 30, 36, 2);
    // Plate
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Steak
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath(); ctx.ellipse(x + 18, y + 18, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5028';
    ctx.beginPath(); ctx.ellipse(x + 18, y + 17, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Sear marks
    ctx.fillStyle = '#3a2510';
    [[12, 14], [18, 14], [24, 14], [12, 20], [18, 20], [24, 20]].forEach(([dx, dy]) => {
      ctx.fillRect(x + dx, y + dy, 4, 1);
    });
    // Pink center
    ctx.fillStyle = '#FF5A90';
    ctx.fillRect(x + 14, y + 16, 8, 2);
    // Asparagus
    ctx.fillStyle = '#3acc3a';
    [29, 32, 35].forEach((px, i) => ctx.fillRect(x + px, y + 16 + i, 1, 8));
    ctx.fillStyle = '#7acc7a';
    [29, 32, 35].forEach((px, i) => ctx.fillRect(x + px, y + 14 + i, 1, 3));
    // Butter pat
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(x + 16, y + 14, 4, 2);
    // Pepper grinds
    ctx.fillStyle = '#0a0a0c';
    [[14, 14], [22, 18], [16, 20]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 1));
  }
};

if (typeof module !== 'undefined') module.exports = DISHES;
