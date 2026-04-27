// PIXEL FOUNDRY — SHEETS
// PNG sprite sheet loader for external (commercial-OK) packs from /Applications/okreusepixel
// Wired in via foundry/external symlink → assets/commercial_ok

const SHEETS = {
  registry: {},
  // Register a sheet (lazy-loads on first reference)
  register(id, src) {
    if (this.registry[id]) return this.registry[id];
    const img = new Image();
    const entry = { img, src, ready: false, error: false };
    img.onload  = () => { entry.ready = true; };
    img.onerror = () => { entry.error = true; };
    img.src = src;
    this.registry[id] = entry;
    return entry;
  },
  // Draw a slice or whole sheet to the canvas
  // tile(ctx, dx, dy, id, [sx, sy, sw, sh], dw, dh)
  tile(ctx, dx, dy, id, sx, sy, sw, sh, dw, dh) {
    const r = this.registry[id];
    const targetW = dw || sw;
    const targetH = dh || sh;
    if (!r || !r.ready) {
      // placeholder while loading / on error
      ctx.fillStyle = r && r.error ? '#3a1a1a' : '#2a2a2e';
      ctx.fillRect(dx, dy, targetW, targetH);
      ctx.strokeStyle = '#5a5a60';
      ctx.lineWidth = 1;
      ctx.strokeRect(dx + 0.5, dy + 0.5, targetW - 1, targetH - 1);
      ctx.fillStyle = r && r.error ? '#ff6b6b' : '#7e7b73';
      ctx.fillRect(dx + targetW / 2 - 1, dy + targetH / 2 - 1, 2, 2);
      return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(r.img, sx, sy, sw, sh, dx, dy, targetW, targetH);
  },
  // Fit-whole-sheet helper: scales the full image to fit dw x dh, preserving aspect
  preview(ctx, dx, dy, id, dw, dh) {
    const r = this.registry[id];
    if (!r || !r.ready) {
      this.tile(ctx, dx, dy, id, 0, 0, dw, dh);
      return;
    }
    const iw = r.img.naturalWidth, ih = r.img.naturalHeight;
    const scale = Math.min(dw / iw, dh / ih);
    const w = Math.floor(iw * scale), h = Math.floor(ih * scale);
    const ox = dx + (dw - w) / 2, oy = dy + (dh - h) / 2;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(r.img, 0, 0, iw, ih, ox, oy, w, h);
  },
};

// === REGISTER SHEETS ===
// LIMEZU — Serene Village (CC BY 4.0)
SHEETS.register('limezu-serene-32',  'external/itchio_limezu_serene_village_revamped/Serene_Village_32x32.png');
SHEETS.register('limezu-serene-16',  'external/itchio_limezu_serene_village_revamped/Serene_Village_16x16.png');
SHEETS.register('limezu-serene-48',  'external/itchio_limezu_serene_village_revamped/Serene_Village_48x48.png');
SHEETS.register('limezu-campfire',   'external/itchio_limezu_serene_village_revamped/Animated stuff/campfire_32x32.png');
SHEETS.register('limezu-water',      'external/itchio_limezu_serene_village_revamped/Animated stuff/water_waves_16x16.png');
SHEETS.register('limezu-door',       'external/itchio_limezu_serene_village_revamped/Animated stuff/door_16x16.png');

// PENZILLA — Top Down Retro Interior
SHEETS.register('penzilla-floors',     'external/penzilla_top_down_retro_interior/TopDownHouse_FloorsAndWalls.png');
SHEETS.register('penzilla-floors-od',  'external/penzilla_top_down_retro_interior/TopDownHouse_FloorsAndWalls_OpenDoors.png');
SHEETS.register('penzilla-doors',      'external/penzilla_top_down_retro_interior/TopDownHouse_DoorsAndWindows.png');
SHEETS.register('penzilla-furn1',      'external/penzilla_top_down_retro_interior/TopDownHouse_FurnitureState1.png');
SHEETS.register('penzilla-furn2',      'external/penzilla_top_down_retro_interior/TopDownHouse_FurnitureState2.png');
SHEETS.register('penzilla-small',      'external/penzilla_top_down_retro_interior/TopDownHouse_SmallItems.png');

// SNOWHEX — Pixel Plains
SHEETS.register('snowhex-all',     'external/snowhex_pixel_plains_free_pack/All free tiles.png');
SHEETS.register('snowhex-basic',   'external/snowhex_pixel_plains_free_pack/New Basic Tiles Free.png');
SHEETS.register('snowhex-trees',   'external/snowhex_pixel_plains_free_pack/Trees and bushes.png');

// === ANIMATED HELPERS ===
// Many animated sheets are horizontal strips of N frames at the same size.
// drawAnimStrip cycles based on time.
SHEETS.animStrip = function(ctx, dx, dy, id, frameW, frameH, frameCount, time, fps = 8, dw, dh) {
  const frame = Math.floor((time * fps) / 1000) % frameCount;
  this.tile(ctx, dx, dy, id, frame * frameW, 0, frameW, frameH, dw || frameW, dh || frameH);
};
