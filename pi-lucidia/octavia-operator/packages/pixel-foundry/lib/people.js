// PIXEL FOUNDRY — PEOPLE TYPES (with axes)
// child, elder, chef, doctor, scientist, artist, business, athlete, wizard, witch, knight, farmer, royalty, ninja

const PEOPLE = {
  AXES: {
    child:    { skin: ['light','medium','dark'], hair: ['blonde','brown','red','black'], shirt: ['pink','amber','violet','blue'] },
    elder:    { skin: ['light','medium','dark'], hair: ['white','gray'] },
    chef:     { skin: ['light','medium','dark'] },
    doctor:   { skin: ['light','medium','dark'], hair: ['blonde','brown','black'] },
    scientist:{ skin: ['light','medium','dark'], hair: ['blonde','brown','black','red'] },
    artist:   { skin: ['light','medium','dark'], hair: ['blonde','brown','red','black','pink'] },
    business: { skin: ['light','medium','dark'], hair: ['blonde','brown','black'], suit: ['black','blue','violet'] },
    athlete:  { skin: ['light','medium','dark'], color: ['pink','amber','violet','blue','green'] },
    wizard:   { color: ['violet','blue','pink','amber'] },
    witch:    { hair: ['black','red','violet'], color: ['violet','black','pink'] },
    knight:   { armor: ['silver','gold','black','blue'] },
    farmer:   { skin: ['light','medium','dark'], hair: ['blonde','brown','red','black'] }
  },

  _skin: { light: '#e6c8a8', medium: '#c68642', dark: '#8d5524' },
  _skinShade: { light: '#c4a888', medium: '#a06830', dark: '#704018' },
  _hair: { blonde: '#d4a840', brown: '#5a3a1a', red: '#a85a26', black: '#1a1a1a', white: '#e0e0e0', gray: '#808080', pink: '#FF1D6C', violet: '#9C27B0' },
  _shirt: { pink: '#FF1D6C', amber: '#F5A623', violet: '#9C27B0', blue: '#2979FF', green: '#3acc3a', black: '#1a1a1a', white: '#f0f0f0', red: '#c41758' },

  // Helper: draws basic body footprint (legs, body, head)
  _bodyBase(ctx, x, y, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 38, 12, 2);
    // Legs
    ctx.fillStyle = c.pants || '#3a3a3e';
    ctx.fillRect(x + 6, y + 30, 3, 10);
    ctx.fillRect(x + 11, y + 30, 3, 10);
    // Feet
    ctx.fillStyle = c.shoes || '#1a1a1a';
    ctx.fillRect(x + 5, y + 38, 4, 2);
    ctx.fillRect(x + 11, y + 38, 4, 2);
    // Body / shirt
    ctx.fillStyle = c.shirt;
    ctx.fillRect(x + 4, y + 18, 12, 14);
    ctx.fillStyle = c.shirtDark || c.shirt;
    ctx.fillRect(x + 4, y + 28, 12, 4);
    // Arms
    ctx.fillStyle = c.shirt;
    ctx.fillRect(x + 2, y + 18, 2, 10);
    ctx.fillRect(x + 16, y + 18, 2, 10);
    // Hands
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 2, y + 28, 2, 2);
    ctx.fillRect(x + 16, y + 28, 2, 2);
    // Neck
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 8, y + 16, 4, 2);
    // Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 5, y + 4, 10, 12);
    ctx.fillStyle = c.skinShade;
    ctx.fillRect(x + 5, y + 12, 10, 2);
  },

  _eyesAndMouth(ctx, x, y, c, mouth = 'neutral') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 8, 2, 2);
    ctx.fillRect(x + 12, y + 8, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 8, 1, 1);
    ctx.fillRect(x + 12, y + 8, 1, 1);
    ctx.fillStyle = c.skinShade;
    if (mouth === 'smile') {
      ctx.fillRect(x + 8, y + 12, 4, 1);
      ctx.fillRect(x + 7, y + 13, 1, 1);
      ctx.fillRect(x + 12, y + 13, 1, 1);
    } else {
      ctx.fillRect(x + 9, y + 12, 2, 1);
    }
  },

  // CHILD (20x40) — smaller proportions
  child(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const hair = this._hair[opts.hair || 'blonde'];
    const shirt = this._shirt[opts.shirt || 'pink'];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 38, 12, 2);
    // Legs (short)
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 6, y + 32, 3, 8);
    ctx.fillRect(x + 11, y + 32, 3, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 38, 4, 2);
    ctx.fillRect(x + 11, y + 38, 4, 2);
    // T-shirt
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 4, y + 22, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 26, 4, 4);
    // Arms
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 2, y + 22, 2, 8);
    ctx.fillRect(x + 16, y + 22, 2, 8);
    ctx.fillStyle = skin;
    ctx.fillRect(x + 2, y + 30, 2, 2);
    ctx.fillRect(x + 16, y + 30, 2, 2);
    // Big head
    ctx.fillStyle = skin;
    ctx.fillRect(x + 4, y + 6, 12, 16);
    ctx.fillStyle = skinD;
    ctx.fillRect(x + 4, y + 18, 12, 2);
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 4, 12, 6);
    ctx.fillRect(x + 3, y + 6, 2, 6);
    ctx.fillRect(x + 15, y + 6, 2, 6);
    // Eyes (big)
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 12, 2, 3);
    ctx.fillRect(x + 12, y + 12, 2, 3);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 13, 1, 2);
    ctx.fillRect(x + 13, y + 13, 1, 2);
    // Big smile
    ctx.fillStyle = skinD;
    ctx.fillRect(x + 8, y + 17, 4, 1);
    ctx.fillStyle = '#FF5A90';
    ctx.fillRect(x + 9, y + 18, 2, 1);
  },

  // ELDER (20x40)
  elder(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const hair = this._hair[opts.hair || 'gray'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: '#5a5a60', shirtDark: '#3a3a3e', pants: '#1a1a1a' });
    // Hair (sparse / receded)
    ctx.fillStyle = hair;
    ctx.fillRect(x + 5, y + 4, 10, 2);
    ctx.fillRect(x + 4, y + 6, 2, 6);
    ctx.fillRect(x + 14, y + 6, 2, 6);
    // Glasses
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 5, y + 8, 4, 3);
    ctx.fillRect(x + 11, y + 8, 4, 3);
    ctx.fillRect(x + 9, y + 9, 2, 1);
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 6, y + 9, 2, 1);
    ctx.fillRect(x + 12, y + 9, 2, 1);
    // Mustache
    ctx.fillStyle = hair;
    ctx.fillRect(x + 7, y + 13, 6, 1);
    // Mouth
    ctx.fillStyle = skinD;
    ctx.fillRect(x + 9, y + 14, 2, 1);
    // Cane
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 18, y + 18, 1, 22);
    ctx.fillStyle = '#7a5028';
    ctx.beginPath(); ctx.arc(x + 18, y + 18, 2, 0, Math.PI * 2); ctx.fill();
  },

  // CHEF (20x40)
  chef(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: '#fff', shirtDark: '#e8e8e8', pants: '#1a1a1a' });
    // Apron buttons
    ctx.fillStyle = '#1a1a1a';
    [22, 26, 30].forEach(yy => ctx.fillRect(x + 9, y + yy, 2, 2));
    // Neckerchief
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 7, y + 16, 6, 3);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 9, y + 18, 2, 1);
    // Chef hat
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 10, y - 4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 6, y - 1, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 14, y - 1, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + 4, y + 1, 12, 6);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 4, y + 5, 12, 2);
    // Face
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 8, 2, 2);
    ctx.fillRect(x + 12, y + 8, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 8, 1, 1);
    ctx.fillRect(x + 12, y + 8, 1, 1);
    ctx.fillStyle = skinD;
    ctx.fillRect(x + 8, y + 12, 4, 1);
    ctx.fillRect(x + 7, y + 13, 1, 1);
    ctx.fillRect(x + 12, y + 13, 1, 1);
    // Wooden spoon
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 1, y + 14, 1, 14);
    ctx.beginPath(); ctx.ellipse(x + 1, y + 14, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
  },

  // DOCTOR (20x40)
  doctor(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const hair = this._hair[opts.hair || 'brown'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: '#fff', shirtDark: '#e8e8e8', pants: '#3a3a3e' });
    // Lab coat opening
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 9, y + 18, 2, 14);
    // Pocket
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x + 5, y + 24, 4, 4);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 6, y + 25, 1, 2);
    ctx.fillRect(x + 6, y + 26, 3, 1);
    // Stethoscope
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 7, y + 18, 3, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 13, y + 18, 3, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 9, y + 22, 2, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath(); ctx.arc(x + 10, y + 26, 1.5, 0, Math.PI * 2); ctx.fill();
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x + 5, y + 4, 10, 4);
    ctx.fillRect(x + 4, y + 6, 2, 4);
    ctx.fillRect(x + 14, y + 6, 2, 4);
    // Face
    this._eyesAndMouth(ctx, x, y, { skinShade: skinD }, 'smile');
  },

  // SCIENTIST (20x40)
  scientist(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const hair = this._hair[opts.hair || 'red'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: '#fff', shirtDark: '#e8e8e8', pants: '#5a5a60' });
    // Lab coat with gradient stains
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x + 9, y + 18, 2, 14);
    // Stains
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 6, y + 22, 2, 2);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 13, y + 26, 2, 2);
    // Crazy hair
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y, 12, 8);
    ctx.fillRect(x + 2, y + 4, 2, 8);
    ctx.fillRect(x + 16, y + 4, 2, 8);
    // Hair tufts
    ctx.fillStyle = hair;
    ctx.fillRect(x + 3, y - 2, 2, 2);
    ctx.fillRect(x + 7, y - 4, 2, 4);
    ctx.fillRect(x + 12, y - 3, 2, 3);
    ctx.fillRect(x + 15, y - 2, 2, 2);
    // Goggles
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 4, y + 8, 5, 4);
    ctx.fillRect(x + 11, y + 8, 5, 4);
    ctx.fillRect(x + 9, y + 9, 2, 2);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 5, y + 9, 3, 2);
    ctx.fillRect(x + 12, y + 9, 3, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 9, 1, 1);
    ctx.fillRect(x + 12, y + 9, 1, 1);
    // Mouth
    ctx.fillStyle = skinD;
    ctx.fillRect(x + 8, y + 14, 4, 1);
    // Test tube
    ctx.fillStyle = 'rgba(220,234,242,0.6)';
    ctx.fillRect(x + 17, y + 22, 3, 8);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(x + 17, y + 26, 3, 4);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 17, y + 22, 3, 1);
  },

  // ARTIST (20x40)
  artist(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const hair = this._hair[opts.hair || 'pink'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: '#FF1D6C', shirtDark: '#c41758', pants: '#2979FF' });
    // Paint splashes on shirt
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 6, y + 22, 2, 2);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(x + 12, y + 26, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 24, 1, 1);
    // Beret
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(x + 10, y + 4, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + 4, y + 2, 12, 4);
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 13, y + 1, 2, 2);
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 6, 12, 4);
    ctx.fillRect(x + 3, y + 6, 2, 8);
    ctx.fillRect(x + 15, y + 6, 2, 8);
    // Face
    this._eyesAndMouth(ctx, x, y, { skinShade: skinD }, 'smile');
    // Palette
    ctx.fillStyle = '#a67c3d';
    ctx.beginPath(); ctx.ellipse(x + 1, y + 28, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x, y + 27, 1, 1);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 2, y + 26, 1, 1);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 3, y + 28, 1, 1);
    // Brush
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 18, y + 20, 1, 8);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 18, y + 18, 1, 2);
  },

  // BUSINESS (20x40)
  business(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const hair = this._hair[opts.hair || 'brown'];
    const suit = { black: '#1a1a1a', blue: '#1f5fcc', violet: '#7b1f8c' }[opts.suit || 'black'];
    const suitD = { black: '#0a0a0a', blue: '#0a1f5a', violet: '#3a0a4a' }[opts.suit || 'black'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: suit, shirtDark: suitD, pants: suit });
    // White shirt collar
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 18, 4, 6);
    // Tie
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 18); ctx.lineTo(x + 11, y + 18);
    ctx.lineTo(x + 11, y + 26); ctx.lineTo(x + 10, y + 28);
    ctx.lineTo(x + 9, y + 26);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 9, y + 18, 2, 1);
    // Lapels
    ctx.fillStyle = suitD;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 18); ctx.lineTo(x + 8, y + 19);
    ctx.lineTo(x + 8, y + 24); ctx.lineTo(x + 4, y + 22);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 18); ctx.lineTo(x + 12, y + 19);
    ctx.lineTo(x + 12, y + 24); ctx.lineTo(x + 16, y + 22);
    ctx.closePath(); ctx.fill();
    // Pocket square
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 22, 1, 2);
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x + 5, y + 4, 10, 4);
    ctx.fillRect(x + 4, y + 6, 2, 4);
    ctx.fillRect(x + 14, y + 6, 2, 4);
    // Face
    this._eyesAndMouth(ctx, x, y, { skinShade: skinD });
    // Briefcase
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 17, y + 26, 4, 6);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 17, y + 27, 4, 4);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 18, y + 25, 2, 1);
  },

  // ATHLETE (20x40)
  athlete(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'light'];
    const skinD = this._skinShade[opts.skin || 'light'];
    const c = this._shirt[opts.color || 'pink'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: c, shirtDark: c, pants: '#1a1a1a' });
    // Number on shirt
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 22, 2, 6);
    ctx.fillRect(x + 8, y + 22, 1, 2);
    ctx.fillRect(x + 11, y + 26, 1, 2);
    // Sweatband
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 6, 12, 2);
    // Athletic hair (pulled back)
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 5, y + 4, 10, 2);
    // Face
    this._eyesAndMouth(ctx, x, y, { skinShade: skinD }, 'smile');
    // Sneakers
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 38, 4, 2);
    ctx.fillRect(x + 11, y + 38, 4, 2);
    ctx.fillStyle = c;
    ctx.fillRect(x + 5, y + 38, 1, 2);
    ctx.fillRect(x + 14, y + 38, 1, 2);
    // Sweat drop
    ctx.fillStyle = '#5a9fff';
    ctx.fillRect(x + 16, y + 9, 1, 2);
    ctx.fillRect(x + 15, y + 11, 2, 2);
  },

  // WIZARD (24x44)
  wizard(ctx, x, y, opts = {}, time = 0) {
    const c = { violet: '#9C27B0', blue: '#2979FF', pink: '#FF1D6C', amber: '#F5A623' }[opts.color || 'violet'];
    const cd = { violet: '#7b1f8c', blue: '#1f5fcc', pink: '#c41758', amber: '#c4851c' }[opts.color || 'violet'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 42, 12, 2);
    // Robe
    ctx.fillStyle = cd;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 42); ctx.lineTo(x + 4, y + 22);
    ctx.lineTo(x + 8, y + 18); ctx.lineTo(x + 16, y + 18);
    ctx.lineTo(x + 20, y + 22); ctx.lineTo(x + 20, y + 42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 42); ctx.lineTo(x + 5, y + 23);
    ctx.lineTo(x + 9, y + 19); ctx.lineTo(x + 15, y + 19);
    ctx.lineTo(x + 19, y + 23); ctx.lineTo(x + 19, y + 42);
    ctx.closePath(); ctx.fill();
    // Stars on robe
    ctx.fillStyle = '#F5A623';
    [[8, 28, 1], [16, 32, 1], [10, 36, 1], [18, 38, 1]].forEach(([dx, dy, s]) => {
      ctx.fillRect(x + dx, y + dy, 2, 1);
      ctx.fillRect(x + dx, y + dy - 1, 1, 3);
    });
    // Belt
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 5, y + 30, 14, 2);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 11, y + 30, 2, 2);
    // Beard
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 14); ctx.lineTo(x + 17, y + 14);
    ctx.lineTo(x + 16, y + 22); ctx.lineTo(x + 12, y + 24);
    ctx.lineTo(x + 8, y + 22);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    [9, 11, 13, 15].forEach(dx => ctx.fillRect(x + dx, y + 20, 1, 3));
    // Face
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 8, y + 8, 8, 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 9, y + 11, 1, 1);
    ctx.fillRect(x + 14, y + 11, 1, 1);
    // Hat — pointed
    ctx.fillStyle = cd;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 12, y - 8);
    ctx.lineTo(x + 20, y + 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + 12, y - 5);
    ctx.lineTo(x + 18, y + 8);
    ctx.closePath(); ctx.fill();
    // Brim
    ctx.fillStyle = cd;
    ctx.fillRect(x + 2, y + 8, 20, 2);
    // Stars on hat
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 11, y, 2, 1);
    ctx.fillRect(x + 10, y + 1, 4, 1);
    ctx.fillRect(x + 11, y + 2, 2, 1);
    // Staff
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 21, y + 16, 2, 26);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 22, y + 16, 1, 26);
    // Crystal at top
    const pulse = 0.7 + Math.sin(time / 8) * 0.3;
    ctx.fillStyle = `rgba(255,29,108,${pulse})`;
    ctx.fillRect(x + 19, y + 12, 6, 6);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 20, y + 13, 4, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 21, y + 14, 1, 1);
  },

  // WITCH (20x44)
  witch(ctx, x, y, opts = {}, time = 0) {
    const hair = this._hair[opts.hair || 'black'];
    const c = { violet: '#9C27B0', black: '#1a1a1a', pink: '#FF1D6C' }[opts.color || 'violet'];
    const cd = { violet: '#7b1f8c', black: '#0a0a0a', pink: '#c41758' }[opts.color || 'violet'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 42, 12, 2);
    // Robe
    ctx.fillStyle = cd;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 42); ctx.lineTo(x + 4, y + 22);
    ctx.lineTo(x + 16, y + 22); ctx.lineTo(x + 18, y + 42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 41); ctx.lineTo(x + 5, y + 23);
    ctx.lineTo(x + 15, y + 23); ctx.lineTo(x + 17, y + 41);
    ctx.closePath(); ctx.fill();
    // Belt
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 4, y + 30, 12, 2);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 9, y + 30, 2, 2);
    // Hair (long)
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 8, 12, 14);
    ctx.fillRect(x + 2, y + 12, 2, 18);
    ctx.fillRect(x + 16, y + 12, 2, 18);
    // Face
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 5, y + 10, 10, 10);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 13, 2, 2);
    ctx.fillRect(x + 12, y + 13, 2, 2);
    ctx.fillStyle = '#3acc3a';
    ctx.fillRect(x + 7, y + 14, 1, 1);
    ctx.fillRect(x + 13, y + 14, 1, 1);
    // Mouth — sly smile
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 8, y + 17, 4, 1);
    // Witch hat
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 8); ctx.lineTo(x + 9, y - 8);
    ctx.lineTo(x + 18, y + 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 9, y - 4);
    ctx.lineTo(x + 16, y + 8);
    ctx.closePath(); ctx.fill();
    // Hat band
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(x + 4, y + 6, 12, 2);
    ctx.fillStyle = '#F5A623';
    // Buckle
    ctx.fillRect(x + 9, y + 6, 2, 2);
    // Brim
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x, y + 8, 20, 2);
    // Broom hint
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x - 2, y + 26, 12, 2);
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x - 4, y + 24, 4, 6);
    [-3, -1].forEach(dx => ctx.fillRect(x + dx, y + 23, 1, 8));
  },

  // KNIGHT (24x44)
  knight(ctx, x, y, opts = {}, time = 0) {
    const armor = { silver: ['#a0a0a8', '#5a5a60', '#d0d0d4'], gold: ['#F5A623', '#c4851c', '#ffe080'], black: ['#3a3a3e', '#1a1a1a', '#5a5a60'], blue: ['#5a9fff', '#1f5fcc', '#bcd2dc'] }[opts.armor || 'silver'];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 42, 12, 2);
    // Legs / greaves
    ctx.fillStyle = armor[1];
    ctx.fillRect(x + 7, y + 30, 4, 12);
    ctx.fillRect(x + 13, y + 30, 4, 12);
    ctx.fillStyle = armor[0];
    ctx.fillRect(x + 7, y + 30, 4, 11);
    ctx.fillRect(x + 13, y + 30, 4, 11);
    ctx.fillStyle = armor[2];
    ctx.fillRect(x + 7, y + 30, 1, 11);
    ctx.fillRect(x + 13, y + 30, 1, 11);
    // Sabatons
    ctx.fillStyle = armor[1];
    ctx.fillRect(x + 6, y + 40, 6, 2);
    ctx.fillRect(x + 12, y + 40, 6, 2);
    // Body / cuirass
    ctx.fillStyle = armor[1];
    ctx.fillRect(x + 4, y + 16, 16, 16);
    ctx.fillStyle = armor[0];
    ctx.fillRect(x + 5, y + 17, 14, 14);
    ctx.fillStyle = armor[2];
    ctx.fillRect(x + 5, y + 17, 14, 2);
    // Chest cross emblem
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 11, y + 20, 2, 8);
    ctx.fillRect(x + 9, y + 22, 6, 2);
    // Pauldrons (shoulders)
    ctx.fillStyle = armor[1];
    ctx.fillRect(x + 2, y + 16, 4, 6);
    ctx.fillRect(x + 18, y + 16, 4, 6);
    // Arms
    ctx.fillStyle = armor[0];
    ctx.fillRect(x + 2, y + 22, 3, 8);
    ctx.fillRect(x + 19, y + 22, 3, 8);
    // Gauntlets
    ctx.fillStyle = armor[1];
    ctx.fillRect(x + 1, y + 28, 4, 4);
    ctx.fillRect(x + 19, y + 28, 4, 4);
    // Helmet
    ctx.fillStyle = armor[1];
    ctx.fillRect(x + 6, y, 12, 18);
    ctx.fillStyle = armor[0];
    ctx.fillRect(x + 7, y + 1, 10, 16);
    ctx.fillStyle = armor[2];
    ctx.fillRect(x + 7, y + 1, 10, 2);
    // Visor slit
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 8, y + 8, 8, 2);
    // Plume
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 11, y - 4, 2, 6);
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 11, y - 4, 1, 6);
    // Sword
    ctx.fillStyle = armor[2];
    ctx.fillRect(x + 22, y + 10, 2, 22);
    ctx.fillStyle = armor[0];
    ctx.fillRect(x + 23, y + 10, 1, 22);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 21, y + 26, 4, 2);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 22, y + 28, 2, 4);
  },

  // FARMER (20x40)
  farmer(ctx, x, y, opts = {}, time = 0) {
    const skin = this._skin[opts.skin || 'medium'];
    const skinD = this._skinShade[opts.skin || 'medium'];
    const hair = this._hair[opts.hair || 'brown'];
    this._bodyBase(ctx, x, y, { skin, skinShade: skinD, shirt: '#FF1D6C', shirtDark: '#c41758', pants: '#1f5fcc' });
    // Overalls straps
    ctx.fillStyle = '#1f5fcc';
    ctx.fillRect(x + 6, y + 18, 2, 8);
    ctx.fillRect(x + 12, y + 18, 2, 8);
    // Overall front
    ctx.fillStyle = '#1f5fcc';
    ctx.fillRect(x + 7, y + 22, 6, 8);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 6, y + 18, 2, 1);
    ctx.fillRect(x + 12, y + 18, 2, 1);
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x + 5, y + 4, 10, 4);
    // Straw hat
    ctx.fillStyle = '#daa86a';
    ctx.fillRect(x + 2, y + 4, 16, 2);
    ctx.fillStyle = '#c4935a';
    ctx.fillRect(x + 5, y + 0, 10, 4);
    ctx.fillStyle = '#a67c3d';
    [3, 7, 11, 15].forEach(dx => ctx.fillRect(x + dx, y + 4, 1, 2));
    // Hat band
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 5, y + 3, 10, 1);
    // Face
    this._eyesAndMouth(ctx, x, y, { skinShade: skinD }, 'smile');
    // Pitchfork
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 19, y + 16, 1, 24);
    ctx.fillStyle = '#a0a0a8';
    [17, 19, 21].forEach(dx => ctx.fillRect(x + dx, y + 12, 1, 4));
    ctx.fillRect(x + 17, y + 12, 5, 1);
  },

  // ROYALTY (24x44)
  royalty(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 6, y + 42, 12, 2);
    // Robe
    ctx.fillStyle = '#7b1f8c';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 42); ctx.lineTo(x + 4, y + 22);
    ctx.lineTo(x + 8, y + 20); ctx.lineTo(x + 16, y + 20);
    ctx.lineTo(x + 20, y + 22); ctx.lineTo(x + 22, y + 42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 41); ctx.lineTo(x + 5, y + 23);
    ctx.lineTo(x + 9, y + 21); ctx.lineTo(x + 15, y + 21);
    ctx.lineTo(x + 19, y + 23); ctx.lineTo(x + 20, y + 41);
    ctx.closePath(); ctx.fill();
    // Ermine trim
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 4, y + 22, 16, 3);
    ctx.fillStyle = '#1a1a1a';
    [6, 10, 14, 18].forEach(dx => ctx.fillRect(x + dx, y + 23, 1, 1));
    // Sash with medals
    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 22); ctx.lineTo(x + 16, y + 22);
    ctx.lineTo(x + 14, y + 36); ctx.lineTo(x + 10, y + 36);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF1D6C';
    [27, 31].forEach(yy => ctx.fillRect(x + 11, y + yy, 2, 2));
    // Face
    ctx.fillStyle = '#e6c8a8';
    ctx.fillRect(x + 7, y + 8, 10, 12);
    ctx.fillStyle = '#c4a888';
    ctx.fillRect(x + 7, y + 16, 10, 2);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 12, 2, 2);
    ctx.fillRect(x + 14, y + 12, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 8, y + 12, 1, 1);
    ctx.fillRect(x + 14, y + 12, 1, 1);
    // Mouth
    ctx.fillStyle = '#c41758';
    ctx.fillRect(x + 10, y + 17, 4, 1);
    // Crown
    ctx.fillStyle = '#c4851c';
    ctx.fillRect(x + 6, y + 4, 12, 4);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 7, y + 5, 10, 2);
    // Crown spikes with gems
    ctx.fillStyle = '#c4851c';
    [6, 10, 14].forEach(dx => {
      ctx.fillRect(x + dx, y, 2, 4);
      ctx.fillRect(x + dx, y + 1, 2, 1);
    });
    ctx.fillStyle = '#FF1D6C';
    [6, 14].forEach(dx => ctx.fillRect(x + dx, y + 1, 2, 1));
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 10, y + 1, 2, 1);
    // Scepter
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 1, y + 16, 2, 26);
    ctx.fillStyle = '#FF1D6C';
    ctx.beginPath(); ctx.arc(x + 2, y + 14, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 1, y + 13, 1, 1);
  },

  // NINJA (20x40)
  ninja(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 4, y + 38, 12, 2);
    // Outfit (all black)
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 6, y + 30, 3, 10);
    ctx.fillRect(x + 11, y + 30, 3, 10);
    ctx.fillRect(x + 4, y + 18, 12, 14);
    ctx.fillRect(x + 2, y + 18, 2, 10);
    ctx.fillRect(x + 16, y + 18, 2, 10);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 4, y + 18, 12, 2);
    ctx.fillRect(x + 4, y + 28, 12, 4);
    // Belt
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 4, y + 26, 12, 2);
    // Boots
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 5, y + 38, 4, 2);
    ctx.fillRect(x + 11, y + 38, 4, 2);
    // Mask + head
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 5, y + 4, 10, 14);
    // Eye slit
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 6, y + 9, 8, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7, y + 10, 2, 2);
    ctx.fillRect(x + 11, y + 10, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 7, y + 10, 1, 2);
    ctx.fillRect(x + 11, y + 10, 1, 2);
    // Hood mask wrap
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 4, y + 14, 12, 2);
    // Hands
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(x + 2, y + 28, 2, 2);
    ctx.fillRect(x + 16, y + 28, 2, 2);
    // Sword on back
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 16, y + 6, 2, 18);
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 17, y, 2, 8);
    ctx.fillStyle = '#d0d0d4';
    ctx.fillRect(x + 17, y, 1, 8);
    // Throwing star
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x + 1, y + 22, 3, 1);
    ctx.fillRect(x + 2, y + 21, 1, 3);
  }
};

if (typeof module !== 'undefined') module.exports = PEOPLE;
