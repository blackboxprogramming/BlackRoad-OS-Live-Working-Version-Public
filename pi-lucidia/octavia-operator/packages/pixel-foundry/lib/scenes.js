// PIXEL FOUNDRY — SCENES
// Composed rooms / interiors that pull from every other module.
// Each scene draws floor + walls + furniture + props at fixed offsets in its own canvas.

const SCENES = {
  AXES: {
    bedroomScene:  { palette: ['warm','cool','pastel','dark'], time: ['day','night'] },
    kitchenScene:  { palette: ['white','wood','dark'] },
    livingRoom:    { palette: ['warm','cool','pastel'], time: ['day','dusk','night'] },
    officeRoom:    { palette: ['white','wood','dark'], state: ['idle','working'] },
    bathroomScene: { palette: ['white','pink','dark'] },
    diningRoom:    { palette: ['wood','elegant','rustic'] },
    cafe:          { time: ['day','dusk','night'] },
    lab:           { state: ['idle','active'] },
    wizardRoom:    { color: ['violet','blue','pink'] },
    gardenScene:   { season: ['summer','autumn','winter'] },
    street:        { time: ['day','dusk','night'] },
    classroom:     { state: ['empty','busy'] }
  },

  // ============= helpers =============
  _floor(ctx, x, y, w, h, color) {
    // Tile floor row
    for (let xx = 0; xx < w; xx += 32) {
      for (let yy = 0; yy < h; yy += 32) {
        const odd = ((xx + yy) / 32) & 1;
        ctx.fillStyle = odd ? color.dark : color.main;
        ctx.fillRect(x + xx, y + yy, 32, 32);
        ctx.fillStyle = color.light;
        ctx.fillRect(x + xx, y + yy, 32, 1);
      }
    }
    // Floor edge shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y, w, 4);
  },

  _wall(ctx, x, y, w, h, color, accent) {
    // Wall fill
    ctx.fillStyle = color.dark;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color.main;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color.light;
    ctx.fillRect(x, y, w, 4);
    // Baseboard
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x, y + h - 4, w, 4);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x, y + h - 4, w, 1);
    // Optional accent stripe
    if (accent) {
      ctx.fillStyle = accent;
      ctx.fillRect(x, y + h - 12, w, 2);
    }
  },

  // ============= BEDROOM (240x160) =============
  bedroomScene(ctx, x, y, opts = {}, time = 0) {
    const palette = opts.palette || 'warm';
    const night = opts.time === 'night';
    const wallC = palette === 'cool'   ? { dark: '#3a4a5a', main: '#5a7a9a', light: '#7a9aba' }
                : palette === 'pastel' ? { dark: '#daa8b8', main: '#f0c8d8', light: '#ffe0e8' }
                : palette === 'dark'   ? { dark: '#1a1a1a', main: '#2a2a2a', light: '#3a3a3a' }
                                        : { dark: '#a85a26', main: '#daa86a', light: '#f0c890' };
    const floorC = palette === 'dark' ? { main: '#3a3a3e', dark: '#1a1a1d', light: '#5a5a60' }
                                       : { main: '#a67c3d', dark: '#7a5028', light: '#daa86a' };
    const bedColor = palette === 'cool' ? 'blue' : palette === 'pastel' ? 'pink' : palette === 'dark' ? 'violet' : 'amber';
    // Floor
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    // Back wall
    this._wall(ctx, x, y, 240, 100, wallC);
    // Window
    if (typeof ARCHITECTURE !== 'undefined') {
      ARCHITECTURE.window(ctx, x + 36, y + 14, { style: 'rect', time: night ? 'night' : 'day' });
    }
    // Picture frame
    if (typeof ART !== 'undefined') {
      ART.frame(ctx, x + 130, y + 14, { style: 'modern', color: 'amber' });
    }
    // Bed
    if (typeof BEDROOM !== 'undefined') BEDROOM.bed(ctx, x + 8, y + 92, bedColor);
    // Nightstand
    if (typeof BEDROOM !== 'undefined') BEDROOM.nightstand(ctx, x + 100, y + 110);
    // Lamp
    if (typeof BEDROOM !== 'undefined') BEDROOM.tableLamp(ctx, x + 106, y + 70, time);
    // Dresser
    if (typeof BEDROOM !== 'undefined') BEDROOM.dresser(ctx, x + 144, y + 102);
    // Mirror over dresser
    if (typeof BEDROOM !== 'undefined') BEDROOM.mirror(ctx, x + 156, y + 50);
    // Plant
    if (typeof PLANTS !== 'undefined') PLANTS.bush(ctx, x + 210, y + 124, { size: 's', flowering: 'no', color: 'pink' }, time);
    // Rug
    if (typeof BEDROOM !== 'undefined') BEDROOM.rug(ctx, x + 30, y + 130, palette === 'cool' ? 'blue' : palette === 'pastel' ? 'pink' : 'violet');
    // Window light spill
    if (!night) {
      ctx.fillStyle = 'rgba(245,166,35,0.18)';
      ctx.fillRect(x + 30, y + 80, 80, 80);
    } else {
      ctx.fillStyle = 'rgba(20,20,40,0.3)';
      ctx.fillRect(x, y, 240, 160);
    }
  },

  // ============= KITCHEN (240x160) =============
  kitchenScene(ctx, x, y, opts = {}, time = 0) {
    const palette = opts.palette || 'white';
    const wallC = palette === 'wood' ? { dark: '#5a3a1a', main: '#a67c3d', light: '#daa86a' }
                : palette === 'dark' ? { dark: '#1a1a1a', main: '#2a2a2a', light: '#3a3a3a' }
                                      : { dark: '#a0a0a8', main: '#e8e8ec', light: '#fff' };
    const floorC = { main: '#7a7a80', dark: '#5a5a60', light: '#a0a0a8' };
    // Floor
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    // Back wall
    this._wall(ctx, x, y, 240, 100, wallC);
    // Tile backsplash
    ctx.fillStyle = '#bcd2dc';
    ctx.fillRect(x, y + 60, 240, 16);
    for (let xx = 0; xx < 240; xx += 12) {
      ctx.fillStyle = '#7a9aa8';
      ctx.fillRect(x + xx, y + 60, 1, 16);
    }
    [60, 68].forEach(yy => {
      ctx.fillStyle = '#7a9aa8';
      ctx.fillRect(x, y + yy, 240, 1);
    });
    // Counter (long)
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 8, y + 100, 224, 20);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 8, y + 102, 224, 16);
    ctx.fillStyle = '#7a5028';
    ctx.fillRect(x + 8, y + 102, 224, 2);
    // Cabinets under counter
    ctx.fillStyle = '#5a3a1a';
    [12, 60, 108, 156, 204].forEach(dx => {
      ctx.fillStyle = '#3a2510';
      ctx.fillRect(x + dx, y + 120, 28, 36);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + dx + 1, y + 121, 26, 34);
      ctx.fillStyle = '#7a5028';
      ctx.fillRect(x + dx + 1, y + 121, 26, 1);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(x + dx + 22, y + 138, 2, 4);
    });
    // Stove on counter
    if (typeof KITCHEN !== 'undefined') KITCHEN.stove(ctx, x + 14, y + 60, time);
    // Sink (wall-mounted)
    if (typeof KITCHEN !== 'undefined') KITCHEN.sink(ctx, x + 86, y + 64);
    // Coffee maker
    if (typeof KITCHEN !== 'undefined') KITCHEN.coffeeMaker(ctx, x + 158, y + 76, time);
    // Microwave
    if (typeof KITCHEN !== 'undefined') KITCHEN.microwave(ctx, x + 198, y + 78, time);
    // Toaster
    if (typeof KITCHEN !== 'undefined') KITCHEN.toaster(ctx, x + 156, y + 70, time);
    // Fridge (right side)
    if (typeof KITCHEN !== 'undefined') KITCHEN.fridge(ctx, x + 188, y + 32, 'steel');
    // Plant
    if (typeof PLANTS !== 'undefined') PLANTS.bush(ctx, x + 8, y + 32, { size: 's', flowering: 'yes', color: 'pink' }, time);
    // Coffee mug on counter
    if (typeof FOOD !== 'undefined') FOOD.coffee(ctx, x + 130, y + 86, time);
    // Cake on counter
    if (typeof FOOD !== 'undefined') FOOD.cake(ctx, x + 56, y + 76);
  },

  // ============= LIVING ROOM (240x160) =============
  livingRoom(ctx, x, y, opts = {}, time = 0) {
    const palette = opts.palette || 'warm';
    const tod = opts.time || 'day';
    const wallC = palette === 'cool'   ? { dark: '#3a4a5a', main: '#5a7a9a', light: '#7a9aba' }
                : palette === 'pastel' ? { dark: '#daa8b8', main: '#f0c8d8', light: '#ffe0e8' }
                                        : { dark: '#7a5028', main: '#daa86a', light: '#f0c890' };
    const floorC = { main: '#a67c3d', dark: '#7a5028', light: '#daa86a' };
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    this._wall(ctx, x, y, 240, 100, wallC);
    // Window
    if (typeof ARCHITECTURE !== 'undefined') {
      ARCHITECTURE.window(ctx, x + 16, y + 12, { style: 'rect', time: tod });
    }
    // Wall art trio
    if (typeof ART !== 'undefined') {
      ART.frame(ctx, x + 102, y + 14, { style: 'modern', color: 'amber' });
      ART.frame(ctx, x + 174, y + 14, { style: 'modern', color: 'pink' });
    }
    // Couch
    if (typeof FURNITURE !== 'undefined') FURNITURE.couch(ctx, x + 16, y + 100, palette === 'cool' ? 'blue' : 'gray');
    // Coffee table
    if (typeof FURNITURE !== 'undefined') FURNITURE.coffeeTable(ctx, x + 24, y + 130);
    // TV stand + TV
    if (typeof FURNITURE_PLUS !== 'undefined') FURNITURE_PLUS.tvStand(ctx, x + 144, y + 110, { material: 'wood', color: 'black' }, time);
    if (typeof ELECTRONICS !== 'undefined') ELECTRONICS.tv(ctx, x + 140, y + 36, time);
    // Floor lamp
    if (typeof LAMPS !== 'undefined') LAMPS.floorLamp(ctx, x + 110, y + 64, { color: 'amber', style: 'cone', state: tod === 'night' ? 'on' : 'off' }, time);
    // Plant
    if (typeof PLANTS !== 'undefined') PLANTS.fern(ctx, x + 200, y + 110, { size: 'm' }, time);
    // Cat on couch
    if (typeof PETS !== 'undefined') PETS.cat(ctx, x + 70, y + 96, 'orange', time);
    // Rug
    if (typeof BEDROOM !== 'undefined') BEDROOM.rug(ctx, x + 16, y + 138, 'violet');
    // Lighting tint
    if (tod === 'night') {
      ctx.fillStyle = 'rgba(20,20,60,0.25)';
      ctx.fillRect(x, y, 240, 160);
      ctx.fillStyle = 'rgba(245,166,35,0.18)';
      ctx.fillRect(x + 100, y + 60, 40, 100);
    } else if (tod === 'dusk') {
      ctx.fillStyle = 'rgba(255,29,108,0.12)';
      ctx.fillRect(x, y, 240, 160);
    }
  },

  // ============= OFFICE ROOM (240x160) =============
  officeRoom(ctx, x, y, opts = {}, time = 0) {
    const working = opts.state === 'working';
    const palette = opts.palette || 'white';
    const wallC = palette === 'wood' ? { dark: '#5a3a1a', main: '#a67c3d', light: '#daa86a' }
                : palette === 'dark' ? { dark: '#1a1a1a', main: '#2a2a2a', light: '#3a3a3a' }
                                      : { dark: '#a0a0a8', main: '#e8e8ec', light: '#fff' };
    const floorC = { main: '#a67c3d', dark: '#7a5028', light: '#daa86a' };
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    this._wall(ctx, x, y, 240, 100, wallC);
    // Whiteboard
    if (typeof PROPS !== 'undefined') PROPS.whiteboard(ctx, x + 16, y + 12);
    // Window
    if (typeof ARCHITECTURE !== 'undefined') ARCHITECTURE.window(ctx, x + 100, y + 14, { style: 'grid', time: 'day' });
    // Clock
    if (typeof PROPS !== 'undefined') PROPS.clock(ctx, x + 174, y + 22, time);
    // Bookshelf
    if (typeof FURNITURE_PLUS !== 'undefined') FURNITURE_PLUS.shelf(ctx, x + 168, y + 60, { style: 'bookcase', color: 'wood' }, time);
    // Desk
    if (typeof DESK !== 'undefined') DESK.workstation(ctx, x + 24, y + 110, time);
    // Chair behind desk
    if (typeof CHAIR !== 'undefined') CHAIR.facingUp(ctx, x + 32, y + 118, 'blue');
    // Monitor (extra)
    if (typeof ELECTRONICS !== 'undefined') ELECTRONICS.monitor(ctx, x + 74, y + 88, time);
    // Server rack
    if (typeof SERVER !== 'undefined') SERVER.miniRack(ctx, x + 132, y + 96, time);
    // Plant
    if (typeof PLANT !== 'undefined') PLANT.large(ctx, x + 226, y + 100, time);
    // Sticky notes on whiteboard
    if (typeof OFFICE_EXTRA !== 'undefined') {
      OFFICE_EXTRA.stickyNote(ctx, x + 22, y + 16, { color: 'amber' }, time);
      OFFICE_EXTRA.stickyNote(ctx, x + 56, y + 18, { color: 'pink' }, time);
    }
    // Coffee on desk
    if (typeof FOOD !== 'undefined') FOOD.coffee(ctx, x + 90, y + 100, time);
    // Working glow on monitor
    if (working) {
      ctx.fillStyle = 'rgba(41,121,255,0.18)';
      ctx.fillRect(x + 60, y + 80, 60, 40);
    }
  },

  // ============= BATHROOM (200x140) =============
  bathroomScene(ctx, x, y, opts = {}, time = 0) {
    const palette = opts.palette || 'white';
    const wallC = palette === 'pink' ? { dark: '#daa8b8', main: '#f0c8d8', light: '#ffe0e8' }
                : palette === 'dark' ? { dark: '#1a1a1a', main: '#2a2a2a', light: '#3a3a3a' }
                                      : { dark: '#bcd2dc', main: '#e8e8ec', light: '#fff' };
    // Tile floor
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 80, 200, 60);
    for (let xx = 0; xx < 200; xx += 16) for (let yy = 80; yy < 140; yy += 16) {
      ctx.fillStyle = ((xx + yy) / 16) & 1 ? '#c0c0c4' : '#a0a0a8';
      ctx.fillRect(x + xx + 1, y + yy + 1, 14, 14);
    }
    // Tile back wall
    ctx.fillStyle = wallC.main;
    ctx.fillRect(x, y, 200, 84);
    for (let xx = 0; xx < 200; xx += 12) {
      ctx.fillStyle = wallC.dark;
      ctx.fillRect(x + xx, y, 1, 84);
    }
    [12, 24, 36, 48, 60, 72].forEach(yy => {
      ctx.fillStyle = wallC.dark;
      ctx.fillRect(x, y + yy, 200, 1);
    });
    // Tub
    if (typeof BATHROOM !== 'undefined') BATHROOM.tub(ctx, x + 8, y + 60);
    // Toilet
    if (typeof BATHROOM !== 'undefined') BATHROOM.toilet(ctx, x + 120, y + 80);
    // Sink
    if (typeof BATHROOM !== 'undefined') BATHROOM.sink(ctx, x + 152, y + 70);
    // Mirror over sink
    if (typeof BEDROOM !== 'undefined') BEDROOM.mirror(ctx, x + 158, y + 22);
    // Towel rack
    if (typeof BATHROOM !== 'undefined') BATHROOM.towelRack(ctx, x + 18, y + 24, palette === 'pink' ? 'pink' : 'white');
    // TP
    if (typeof BATHROOM !== 'undefined') BATHROOM.toiletPaper(ctx, x + 102, y + 96);
    // Plant
    if (typeof PLANTS !== 'undefined') PLANTS.fern(ctx, x + 184, y + 96, { size: 's' }, time);
  },

  // ============= DINING ROOM (240x160) =============
  diningRoom(ctx, x, y, opts = {}, time = 0) {
    const palette = opts.palette || 'wood';
    const wallC = palette === 'elegant' ? { dark: '#3a0a4a', main: '#7b1f8c', light: '#9C27B0' }
                : palette === 'rustic'  ? { dark: '#5a3a1a', main: '#a67c3d', light: '#daa86a' }
                                          : { dark: '#7a5028', main: '#c4935a', light: '#daa86a' };
    const floorC = { main: '#a67c3d', dark: '#7a5028', light: '#daa86a' };
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    this._wall(ctx, x, y, 240, 100, wallC);
    // Chandelier
    if (typeof LAMPS !== 'undefined') LAMPS.chandelier(ctx, x + 90, y, { color: 'amber', size: 'm' }, time);
    // Wall art
    if (typeof ART !== 'undefined') ART.frame(ctx, x + 16, y + 30, { style: 'ornate', color: 'amber' });
    if (typeof ART !== 'undefined') ART.frame(ctx, x + 174, y + 30, { style: 'ornate', color: 'amber' });
    // Round table center
    if (typeof FURNITURE_PLUS !== 'undefined') FURNITURE_PLUS.roundTable(ctx, x + 90, y + 96, { material: palette === 'rustic' ? 'wood' : 'marble', size: 'l' }, time);
    // 4 chairs around
    if (typeof FURNITURE_PLUS !== 'undefined') {
      FURNITURE_PLUS.diningChair(ctx, x + 60, y + 76, { style: 'classic', color: 'wood' }, time);
      FURNITURE_PLUS.diningChair(ctx, x + 148, y + 76, { style: 'classic', color: 'wood' }, time);
    }
    // Place settings — plates with food
    if (typeof DISHES !== 'undefined') DISHES.steak(ctx, x + 100, y + 102);
    if (typeof FOOD !== 'undefined') FOOD.coffee(ctx, x + 156, y + 110, time);
    // Console table on side
    if (typeof FURNITURE_PLUS !== 'undefined') FURNITURE_PLUS.console(ctx, x + 16, y + 110, { material: 'wood', color: 'black' }, time);
    if (typeof FURNITURE_PLUS !== 'undefined') FURNITURE_PLUS.console(ctx, x + 152, y + 110, { material: 'wood', color: 'black' }, time);
    // Plant
    if (typeof PLANTS !== 'undefined') PLANTS.bush(ctx, x + 16, y + 100, { size: 's', flowering: 'yes', color: 'pink' }, time);
  },

  // ============= CAFE (260x160) =============
  cafe(ctx, x, y, opts = {}, time = 0) {
    const tod = opts.time || 'dusk';
    const wallC = { dark: '#5a3a1a', main: '#a67c3d', light: '#daa86a' };
    const floorC = { main: '#7a5028', dark: '#5a3a1a', light: '#a67c3d' };
    this._floor(ctx, x, y + 96, 260, 64, floorC);
    this._wall(ctx, x, y, 260, 100, wallC);
    // Big window front
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 4, y + 10, 156, 86);
    const sky = tod === 'day' ? '#bcd2dc' : tod === 'dusk' ? '#FF5A90' : '#0a0a3a';
    ctx.fillStyle = sky;
    ctx.fillRect(x + 8, y + 14, 148, 78);
    // Window grid
    ctx.fillStyle = '#3a2510';
    [80].forEach(dx => ctx.fillRect(x + dx, y + 14, 2, 78));
    [40, 70].forEach(dy => ctx.fillRect(x + 8, y + dy, 148, 2));
    // Chalkboard menu
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 168, y + 14, 60, 40);
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 168, y + 14, 60, 4);
    ctx.fillRect(x + 168, y + 50, 60, 4);
    ctx.fillStyle = '#fff';
    ['MENU', '— ESPRESSO', '— LATTE', '— PASTRY'].forEach((s, i) => {
      [4, 8, 12, 16, 20].slice(0, s.length).forEach((dx, j) => {
        ctx.fillRect(x + 172 + j * 3, y + 22 + i * 6, 2, 2);
      });
    });
    // Counter
    if (typeof KITCHEN !== 'undefined') KITCHEN.coffeeMaker(ctx, x + 174, y + 70, time);
    if (typeof KITCHEN !== 'undefined') KITCHEN.toaster(ctx, x + 196, y + 78, time);
    if (typeof FOOD !== 'undefined') FOOD.donut(ctx, x + 226, y + 82);
    // Counter base
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 168, y + 100, 88, 40);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 168, y + 102, 88, 36);
    // Tables in foreground
    if (typeof FURNITURE_PLUS !== 'undefined') {
      FURNITURE_PLUS.roundTable(ctx, x + 14, y + 102, { material: 'wood', size: 's' }, time);
      FURNITURE_PLUS.roundTable(ctx, x + 84, y + 102, { material: 'wood', size: 's' }, time);
    }
    if (typeof FURNITURE_PLUS !== 'undefined') {
      FURNITURE_PLUS.diningChair(ctx, x + 4, y + 96, { style: 'modern', color: 'wood' }, time);
      FURNITURE_PLUS.diningChair(ctx, x + 56, y + 96, { style: 'modern', color: 'wood' }, time);
      FURNITURE_PLUS.diningChair(ctx, x + 74, y + 96, { style: 'modern', color: 'wood' }, time);
      FURNITURE_PLUS.diningChair(ctx, x + 124, y + 96, { style: 'modern', color: 'wood' }, time);
    }
    // Coffee on tables
    if (typeof FOOD !== 'undefined') FOOD.coffee(ctx, x + 38, y + 98, time);
    if (typeof FOOD !== 'undefined') FOOD.coffee(ctx, x + 108, y + 98, time);
    // Hanging lights
    if (typeof LAMPS !== 'undefined') {
      LAMPS.pendant(ctx, x + 30, y, { color: 'amber', state: tod !== 'day' ? 'on' : 'off' }, time);
      LAMPS.pendant(ctx, x + 100, y, { color: 'amber', state: tod !== 'day' ? 'on' : 'off' }, time);
    }
    // Tinting
    if (tod === 'dusk') {
      ctx.fillStyle = 'rgba(255,29,108,0.1)';
      ctx.fillRect(x, y, 260, 160);
    } else if (tod === 'night') {
      ctx.fillStyle = 'rgba(20,20,60,0.3)';
      ctx.fillRect(x, y, 260, 160);
    }
  },

  // ============= LAB (240x160) =============
  lab(ctx, x, y, opts = {}, time = 0) {
    const active = opts.state === 'active';
    const wallC = { dark: '#7a7a80', main: '#c0c0c4', light: '#fff' };
    const floorC = { main: '#5a5a60', dark: '#3a3a3e', light: '#7a7a80' };
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    this._wall(ctx, x, y, 240, 100, wallC);
    // Tile pattern on wall
    ctx.fillStyle = '#a0a0a8';
    for (let xx = 0; xx < 240; xx += 24) {
      for (let yy = 0; yy < 96; yy += 24) {
        ctx.fillRect(x + xx, y + yy, 1, 24);
        ctx.fillRect(x + xx, y + yy, 24, 1);
      }
    }
    // Pipes on wall
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 8, y + 4, 6, 90);
    ctx.fillRect(x + 226, y + 4, 6, 90);
    ctx.fillStyle = '#a0a0a8';
    [22, 42, 62].forEach(yy => {
      ctx.fillRect(x + 8, y + yy, 6, 3);
      ctx.fillRect(x + 226, y + yy, 6, 3);
    });
    // Workbench
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 16, y + 100, 208, 8);
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 16, y + 100, 208, 2);
    // Bench legs
    [22, 220].forEach(dx => {
      ctx.fillStyle = '#3a3a3e';
      ctx.fillRect(x + dx, y + 108, 4, 32);
    });
    // Microscope
    if (typeof TOOLS !== 'undefined') TOOLS.microscope(ctx, x + 36, y + 56, time);
    // Beakers
    if (typeof TOOLS !== 'undefined') {
      TOOLS.beaker(ctx, x + 84, y + 64, { liquid: 'green', state: active ? 'bubbling' : 'still' }, time);
      TOOLS.beaker(ctx, x + 110, y + 68, { liquid: 'pink', state: active ? 'bubbling' : 'still' }, time);
      TOOLS.beaker(ctx, x + 138, y + 72, { liquid: 'blue', state: 'still' }, time);
    }
    // Computer
    if (typeof ELECTRONICS !== 'undefined') ELECTRONICS.monitor(ctx, x + 162, y + 52, time);
    // Telescope in corner
    if (typeof TOOLS !== 'undefined') TOOLS.telescope(ctx, x + 196, y + 60, time);
    // Posters / charts
    if (typeof PROPS !== 'undefined') PROPS.poster(ctx, x + 16, y + 14, 'chart');
    // Spilled chemicals
    if (active) {
      ctx.fillStyle = 'rgba(58,204,58,0.4)';
      ctx.fillRect(x + 100, y + 108, 12, 4);
      ctx.fillStyle = '#3acc3a';
      [102, 106, 110].forEach(dx => ctx.fillRect(x + dx, y + 110, 1, 2));
    }
    // Notebook
    if (typeof OFFICE_EXTRA !== 'undefined') OFFICE_EXTRA.notebook(ctx, x + 64, y + 92, { color: 'pink' }, time);
    // Active lighting
    if (active) {
      ctx.fillStyle = 'rgba(58,204,58,0.1)';
      ctx.fillRect(x, y, 240, 160);
    }
  },

  // ============= WIZARD ROOM (240x160) =============
  wizardRoom(ctx, x, y, opts = {}, time = 0) {
    const c = opts.color || 'violet';
    const wallC = c === 'blue' ? { dark: '#0a1f5a', main: '#1f5fcc', light: '#5a9fff' }
                : c === 'pink' ? { dark: '#5a0a28', main: '#c41758', light: '#FF5A90' }
                                : { dark: '#3a0a4a', main: '#7b1f8c', light: '#9C27B0' };
    const floorC = { main: '#5a3a1a', dark: '#3a2510', light: '#7a5028' };
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    this._wall(ctx, x, y, 240, 100, wallC);
    // Stars on wall
    ctx.fillStyle = '#F5A623';
    [[20, 14, 1], [80, 22, 2], [140, 12, 1], [200, 20, 1], [56, 38, 1], [180, 40, 2], [120, 30, 1]].forEach(([dx, dy, sz]) => {
      ctx.fillRect(x + dx, y + dy, 2, 2);
      ctx.fillRect(x + dx - 1, y + dy + 1, 4, 1);
      if (sz === 2) ctx.fillRect(x + dx, y + dy - 1, 2, 4);
    });
    // Bookshelf full of magic books
    if (typeof FURNITURE_PLUS !== 'undefined') FURNITURE_PLUS.shelf(ctx, x + 14, y + 60, { style: 'bookcase', color: 'wood' }, time);
    // Cauldron in center
    if (typeof MAGICAL !== 'undefined') MAGICAL.cauldron(ctx, x + 96, y + 110, { contents: 'glowing' }, time);
    // Crystal ball on stand
    if (typeof MAGICAL !== 'undefined') MAGICAL.crystal(ctx, x + 156, y + 92, { color: c, size: 'l' }, time);
    // Pentagram on floor (subtle)
    if (typeof MAGICAL !== 'undefined') {
      ctx.globalAlpha = 0.6;
      MAGICAL.pentagram(ctx, x + 80, y + 116, { color: c }, time);
      ctx.globalAlpha = 1;
    }
    // Spellbook on table
    if (typeof MAGICAL !== 'undefined') MAGICAL.spellbook(ctx, x + 176, y + 122, { color: c }, time);
    // Potions on shelf top
    if (typeof MAGICAL !== 'undefined') {
      MAGICAL.potion(ctx, x + 22, y + 58, { color: 'pink', shape: 'round' }, time);
      MAGICAL.potion(ctx, x + 38, y + 60, { color: 'amber', shape: 'tall' }, time);
      MAGICAL.potion(ctx, x + 54, y + 60, { color: 'blue', shape: 'squat' }, time);
    }
    // Candles
    if (typeof MAGICAL !== 'undefined') {
      MAGICAL.candle(ctx, x + 130, y + 116, { color: 'amber', lit: 'lit' }, time);
      MAGICAL.candle(ctx, x + 218, y + 124, { color: 'pink', lit: 'lit' }, time);
    }
    // Magic glow
    ctx.fillStyle = 'rgba(156,39,176,0.18)';
    ctx.fillRect(x + 80, y + 90, 60, 60);
    // Wizard NPC
    if (typeof PEOPLE !== 'undefined') PEOPLE.wizard(ctx, x + 200, y + 88, { color: c }, time);
  },

  // ============= GARDEN (240x160) =============
  gardenScene(ctx, x, y, opts = {}, time = 0) {
    const season = opts.season || 'summer';
    // Sky gradient
    const skyTop = season === 'winter' ? '#a0c0d8' : season === 'autumn' ? '#FF5A90' : '#5a9fff';
    const grd = ctx.createLinearGradient(x, y, x, y + 80);
    grd.addColorStop(0, skyTop); grd.addColorStop(1, '#bcd2dc');
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, 240, 80);
    // Grass / snow
    if (season === 'winter') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y + 80, 240, 80);
      ctx.fillStyle = '#e8e8e8';
      [40, 110, 180].forEach(dx => {
        ctx.beginPath(); ctx.arc(x + dx, y + 110, 6, 0, Math.PI * 2); ctx.fill();
      });
    } else if (season === 'autumn') {
      ctx.fillStyle = '#c4851c';
      ctx.fillRect(x, y + 80, 240, 80);
      ctx.fillStyle = '#a85a26';
      [20, 60, 100, 140, 180, 220].forEach(dx => {
        ctx.fillRect(x + dx, y + 90 + (dx % 30), 4, 2);
      });
      // Leaves on ground
      ['#FF1D6C', '#F5A623', '#c4851c'].forEach((col, i) => {
        ctx.fillStyle = col;
        [30, 80, 150, 200].forEach(dx => {
          ctx.fillRect(x + dx + i * 4, y + 130 + i * 6, 3, 2);
        });
      });
    } else {
      ctx.fillStyle = '#3acc3a';
      ctx.fillRect(x, y + 80, 240, 80);
      ctx.fillStyle = '#7acc7a';
      for (let i = 0; i < 24; i++) {
        const px = ((i * 13) % 240);
        ctx.fillRect(x + px, y + 84 + (i % 6), 1, 3);
      }
    }
    // Sun
    if (typeof WEATHER !== 'undefined') WEATHER.sun(ctx, x + 180, y + 4, { time: 'noon', size: 's' }, time);
    // Clouds
    if (typeof WEATHER !== 'undefined') WEATHER.cloud(ctx, x + 16, y + 8, { kind: 'fluffy', color: 'white' }, time);
    // Trees
    if (typeof PLANTS !== 'undefined') {
      PLANTS.tree(ctx, x + 12, y + 88, { species: 'oak', season }, time);
      PLANTS.tree(ctx, x + 184, y + 88, { species: 'cherry', season: season === 'winter' ? 'winter' : 'spring' }, time);
    }
    // Bench
    if (typeof OUTDOOR !== 'undefined') OUTDOOR.bench(ctx, x + 84, y + 124);
    // Garden gnome
    if (typeof GARDEN !== 'undefined') GARDEN.gardenGnome(ctx, x + 60, y + 108, { color: 'red' }, time);
    // Plant pots
    if (typeof GARDEN !== 'undefined') {
      GARDEN.plantPot(ctx, x + 156, y + 116, { color: 'terra', plant: 'flower' }, time);
      GARDEN.plantPot(ctx, x + 196, y + 116, { color: 'terra', plant: 'leafy' }, time);
    }
    // Flowers in grass
    if (typeof PLANTS !== 'undefined' && season === 'summer') {
      PLANTS.flower(ctx, x + 36, y + 120, { species: 'rose', color: 'pink', size: 's' }, time);
      PLANTS.flower(ctx, x + 124, y + 130, { species: 'sunflower', color: 'amber', size: 's' }, time);
      PLANTS.flower(ctx, x + 220, y + 130, { species: 'daisy', color: 'white', size: 's' }, time);
    }
    // Butterfly
    if (season === 'summer' && typeof ANIMALS !== 'undefined') ANIMALS.butterfly(ctx, x + 140, y + 60, { color: 'pink' }, time);
    // Watering can
    if (typeof GARDEN !== 'undefined') GARDEN.wateringCan(ctx, x + 224, y + 134, { color: 'green' }, time);
  },

  // ============= STREET (260x180) =============
  street(ctx, x, y, opts = {}, time = 0) {
    const tod = opts.time || 'day';
    const skyTop = tod === 'night' ? '#0a0a3a' : tod === 'dusk' ? '#9C27B0' : '#5a9fff';
    const skyBot = tod === 'night' ? '#1a1a5a' : tod === 'dusk' ? '#FF5A90' : '#bcd2dc';
    const grd = ctx.createLinearGradient(x, y, x, y + 60);
    grd.addColorStop(0, skyTop); grd.addColorStop(1, skyBot);
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, 260, 60);
    // Stars at night
    if (tod === 'night') {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 30; i++) ctx.fillRect(x + (i * 13) % 260, y + (i * 7) % 40, 1, 1);
    }
    // Sidewalk
    ctx.fillStyle = '#a0a0a8';
    ctx.fillRect(x, y + 130, 260, 50);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(x, y + 130, 260, 4);
    for (let xx = 0; xx < 260; xx += 30) {
      ctx.fillRect(x + xx, y + 130, 1, 50);
    }
    // Road
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x, y + 120, 260, 14);
    ctx.fillStyle = '#F5A623';
    for (let xx = 8; xx < 260; xx += 20) ctx.fillRect(x + xx, y + 126, 8, 1);
    // Buildings
    if (typeof BUILDINGS !== 'undefined') {
      BUILDINGS.cafe(ctx, x + 8, y + 44, { color: 'amber', time: tod }, time);
      BUILDINGS.storefront(ctx, x + 100, y + 50, { color: 'pink', sign: 'neon' }, time);
    }
    if (typeof BUILDINGS_EXTRA !== 'undefined') BUILDINGS_EXTRA.apartment(ctx, x + 200, y + 0, { color: 'violet', floors: 3 }, time);
    // Street lamps
    if (typeof OUTDOOR !== 'undefined') {
      OUTDOOR.streetlight(ctx, x + 92, y + 56, time);
      OUTDOOR.streetlight(ctx, x + 188, y + 56, time);
    }
    // Trash + mailbox
    if (typeof OUTDOOR !== 'undefined') OUTDOOR.trashcan(ctx, x + 6, y + 132);
    if (typeof OUTDOOR !== 'undefined') OUTDOOR.mailbox(ctx, x + 240, y + 124, true);
    // Tree
    if (typeof OUTDOOR !== 'undefined') OUTDOOR.tree(ctx, x + 56, y + 112, time);
    // Car on road
    if (typeof VEHICLES !== 'undefined') VEHICLES.car(ctx, x + 130, y + 116, 'pink');
    // People
    if (typeof PEOPLE !== 'undefined') {
      PEOPLE.business(ctx, x + 36, y + 132, { skin: 'light', hair: 'brown', suit: 'black' }, time);
      PEOPLE.athlete(ctx, x + 220, y + 132, { skin: 'medium', color: 'amber' }, time);
      PEOPLE.child(ctx, x + 90, y + 142, { skin: 'light', hair: 'blonde', shirt: 'pink' }, time);
    }
    // Cat
    if (typeof PETS !== 'undefined') PETS.cat(ctx, x + 168, y + 162, 'black', time);
    // Tinting
    if (tod === 'night') {
      ctx.fillStyle = 'rgba(20,20,60,0.4)';
      ctx.fillRect(x, y, 260, 180);
      // Window glow on apartment
      ctx.fillStyle = 'rgba(245,166,35,0.2)';
      ctx.fillRect(x + 200, y + 0, 60, 130);
    } else if (tod === 'dusk') {
      ctx.fillStyle = 'rgba(255,29,108,0.1)';
      ctx.fillRect(x, y, 260, 180);
    }
  },

  // ============= CLASSROOM (240x160) =============
  classroom(ctx, x, y, opts = {}, time = 0) {
    const busy = opts.state === 'busy';
    const wallC = { dark: '#a85a26', main: '#daa86a', light: '#f0c890' };
    const floorC = { main: '#a67c3d', dark: '#7a5028', light: '#daa86a' };
    this._floor(ctx, x, y + 96, 240, 64, floorC);
    this._wall(ctx, x, y, 240, 100, wallC);
    // Big chalkboard
    ctx.fillStyle = '#3a2510';
    ctx.fillRect(x + 16, y + 8, 130, 60);
    ctx.fillStyle = '#1a4a2a';
    ctx.fillRect(x + 19, y + 11, 124, 54);
    ctx.fillStyle = '#fff';
    // Chalk text
    [16, 22, 28, 34].forEach((dy, i) => {
      const w = 30 + (i * 6) % 80;
      ctx.fillRect(x + 24, y + 20 + dy, w, 1);
    });
    // Math equation
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 26, y + 50, 16, 2);
    ctx.fillRect(x + 50, y + 50, 12, 2);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(x + 70, y + 50, 16, 2);
    // Tray for chalk
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + 16, y + 64, 130, 4);
    ctx.fillStyle = '#fff';
    [22, 30, 100].forEach(dx => ctx.fillRect(x + dx, y + 65, 4, 1));
    // Teacher's desk
    if (typeof DESK !== 'undefined') DESK.workstation(ctx, x + 36, y + 110, time);
    // Apple on desk
    if (typeof FOOD !== 'undefined') FOOD.apple(ctx, x + 78, y + 102);
    // Student desks (3)
    [104, 144, 184].forEach((dx, i) => {
      if (typeof FURNITURE_PLUS !== 'undefined') {
        ctx.fillStyle = '#daa86a';
        ctx.fillRect(x + dx, y + 116, 28, 16);
        ctx.fillStyle = '#a67c3d';
        ctx.fillRect(x + dx + 1, y + 117, 26, 14);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(x + dx + 1, y + 117, 26, 1);
        // Legs
        ctx.fillStyle = '#3a2510';
        ctx.fillRect(x + dx + 2, y + 132, 2, 8);
        ctx.fillRect(x + dx + 24, y + 132, 2, 8);
      }
      // Notebook
      if (typeof OFFICE_EXTRA !== 'undefined') {
        OFFICE_EXTRA.notebook(ctx, x + dx + 4, y + 100, { color: i === 0 ? 'pink' : i === 1 ? 'amber' : 'violet' }, time);
      }
      // Chair
      ctx.fillStyle = '#5a5a60';
      ctx.fillRect(x + dx + 8, y + 140, 12, 16);
      ctx.fillStyle = '#7a7a80';
      ctx.fillRect(x + dx + 9, y + 141, 10, 14);
    });
    // Students if busy
    if (busy && typeof PEOPLE !== 'undefined') {
      PEOPLE.child(ctx, x + 110, y + 116, { skin: 'light',  hair: 'blonde', shirt: 'pink' }, time);
      PEOPLE.child(ctx, x + 150, y + 116, { skin: 'medium', hair: 'black',  shirt: 'blue' }, time);
      PEOPLE.child(ctx, x + 190, y + 116, { skin: 'dark',   hair: 'brown',  shirt: 'amber' }, time);
    }
    // Clock
    if (typeof PROPS !== 'undefined') PROPS.clock(ctx, x + 196, y + 18, time);
    // Globe
    if (typeof COSMIC !== 'undefined') COSMIC.planet(ctx, x + 8, y + 80, { kind: 'ocean', ring: 'no' }, time);
    // Flag
    ctx.fillStyle = '#3a3a3e';
    ctx.fillRect(x + 162, y + 8, 1, 14);
    ctx.fillStyle = '#FF1D6C';
    ctx.fillRect(x + 163, y + 8, 8, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 163, y + 12, 8, 4);
    ctx.fillStyle = '#2979FF';
    ctx.fillRect(x + 163, y + 8, 4, 4);
  }
};

if (typeof module !== 'undefined') module.exports = SCENES;
