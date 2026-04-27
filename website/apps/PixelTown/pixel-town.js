(() => {
  // ============== ATLASES ==============
  const ATLASES = [
    { id: 'sunnyside-16',  name: 'Sunnyside World 16px (danieldiggle)',
      tileSize: 16,
      src: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/Tileset/spr_tileset_sunnysideworld_16px.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'sunnyside-forest', name: 'Sunnyside Forest 32px',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/Tileset/spr_tileset_sunnysideworld_forest_32px.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'serene-outside', name: 'Serene Village — Outside (LimeZu, CC BY 4.0)',
      tileSize: 16,
      src: '../assets/commercial_ok/itchio_limezu_serene_village/16x16_original/Serene%20Village%20-%20Outside.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'serene-inside', name: 'Serene Village — Inside (LimeZu, CC BY 4.0)',
      tileSize: 16,
      src: '../assets/commercial_ok/itchio_limezu_serene_village/16x16_original/Serene%20Village%20-%20Inside.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'serene-revamped-32', name: 'Serene Village Revamped 32px (LimeZu)',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_limezu_serene_village_revamped/Serene_Village_32x32.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'penzilla-floors', name: 'Penzilla — Floors & Walls',
      tileSize: 16,
      src: '../assets/commercial_ok/penzilla_top_down_retro_interior/TopDownHouse_FloorsAndWalls.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'penzilla-furn1', name: 'Penzilla — Furniture State 1',
      tileSize: 16,
      src: '../assets/commercial_ok/penzilla_top_down_retro_interior/TopDownHouse_FurnitureState1.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'penzilla-furn2', name: 'Penzilla — Furniture State 2',
      tileSize: 16,
      src: '../assets/commercial_ok/penzilla_top_down_retro_interior/TopDownHouse_FurnitureState2.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'penzilla-doors', name: 'Penzilla — Doors & Windows',
      tileSize: 16,
      src: '../assets/commercial_ok/penzilla_top_down_retro_interior/TopDownHouse_DoorsAndWindows.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'penzilla-small', name: 'Penzilla — Small Items',
      tileSize: 16,
      src: '../assets/commercial_ok/penzilla_top_down_retro_interior/TopDownHouse_SmallItems.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'snowhex-all', name: 'Snowhex Pixel Plains — All Free Tiles',
      tileSize: 16,
      src: '../assets/commercial_ok/snowhex_pixel_plains_free_pack/All%20free%20tiles.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'snowhex-trees', name: 'Snowhex — Trees & Bushes',
      tileSize: 16,
      src: '../assets/commercial_ok/snowhex_pixel_plains_free_pack/Trees%20and%20bushes.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'rasak-modern-house-deco', name: 'Rasak — Modern House Decoration',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_rasak_moderne_tilesets/Modern/Tileset_ModernHouse_Decoration_Rasak.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'rasak-modern-bedroom', name: 'Rasak — Modern Bedroom',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_rasak_moderne_tilesets/Modern/Tileset_Modern%20Bedroom_Rasak.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'rasak-japanese-inside', name: 'Rasak — Japanese Inside',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_rasak_moderne_tilesets/Modern/Tileset_Japanese_Inside_Rasak.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'rasak-fences', name: 'Rasak — Fences',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_rasak_moderne_tilesets/Modern/Tileset_Fences_Rasak.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'rasak-buildings', name: 'Rasak — Buildings',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_rasak_moderne_tilesets/Modern/A3_Buildings_Rasak.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'rasak-street', name: 'Rasak — Street',
      tileSize: 32,
      src: '../assets/commercial_ok/itchio_rasak_moderne_tilesets/Modern/A5_Street_Rasak.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'hospital', name: 'Hospital Tileset',
      tileSize: 32,
      src: '../assets/commercial_ok/tilesetHospital/tilesethospital-4.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'creativa-urban-a2', name: 'CreativaStudio — Urban A2',
      tileSize: 16,
      src: '../assets/commercial_ok/itchio_creativastudio_basic_house_interior/img/tilesets/CGS_Urban_A2.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },
    { id: 'creativa-urban-b', name: 'CreativaStudio — Urban B',
      tileSize: 16,
      src: '../assets/commercial_ok/itchio_creativastudio_basic_house_interior/img/tilesets/CGS_UrbanB.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/greenbar_00.png' },

    // === ANIMATED ATLASES (kind: 'anim'). Each is one selectable tile that cycles frames. ===
    { id: 'anim-campfire-16',  name: 'Anim · Campfire 16px (LimeZu)',
      kind: 'anim', tileSize: 16, frameCount: 4, fps: 6,
      src: '../assets/commercial_ok/itchio_limezu_serene_village_revamped/Animated%20stuff/campfire_16x16.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'anim-campfire-32',  name: 'Anim · Campfire 32px (LimeZu)',
      kind: 'anim', tileSize: 32, frameCount: 4, fps: 6,
      src: '../assets/commercial_ok/itchio_limezu_serene_village_revamped/Animated%20stuff/campfire_32x32.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'anim-door-16',      name: 'Anim · Door 16px (LimeZu)',
      kind: 'anim', tileSize: 16, frameCount: 4, fps: 4,
      src: '../assets/commercial_ok/itchio_limezu_serene_village_revamped/Animated%20stuff/door_16x16.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'anim-water-16',     name: 'Anim · Water Waves 16px (LimeZu)',
      kind: 'anim', tileSize: 16, frameCount: 14, fps: 8,
      src: '../assets/commercial_ok/itchio_limezu_serene_village_revamped/Animated%20stuff/water_waves_16x16.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
    { id: 'anim-water-32',     name: 'Anim · Water Waves 32px (LimeZu)',
      kind: 'anim', tileSize: 32, frameCount: 14, fps: 8,
      src: '../assets/commercial_ok/itchio_limezu_serene_village_revamped/Animated%20stuff/water_waves_32x32.png',
      hudBar: '../assets/commercial_ok/itchio_danieldiggle_sunnyside_world_v2_1/Sunnyside_World_Assets/UI/bluebar_00.png' },
  ];

  // ============== STATE ==============
  const STORAGE_KEY = 'pixelTown.v2';
  const SAVE_VERSION = 2;
  const N_LAYERS = 4;
  const LAYER_NAMES = ['Floor', 'Mid', 'Furniture', 'Top'];

  let mapW = 64, mapH = 36, activeLayer = 0, brushSize = 1;
  /** @type {'paint'|'erase'|'eyedropper'|'select'} */
  let tool = 'paint';
  // Selection rectangle in tile coords. null = no selection. Active drag = isSelecting.
  let selection = null; // { x, y, w, h }
  let isSelecting = false;
  let selStart = null;  // { mx, my }
  /** @type {{ atlasIdx: number, tiles: Int32Array, visible: boolean }[]} */
  let layers = [];
  const atlasImages = new Array(ATLASES.length).fill(null);
  const atlasMeta = new Array(ATLASES.length).fill(null);

  function newLayer(atlasIdx) {
    return { atlasIdx, tiles: new Int32Array(mapW * mapH).fill(-1), visible: true };
  }
  for (let i = 0; i < N_LAYERS; i++) layers.push(newLayer(0));

  const selectedByAtlas = new Map();
  const atlasView = { zoom: 2, panX: 10, panY: 10, dragging: false, lastX: 0, lastY: 0 };
  const mapView = { zoom: 2.5, panX: 20, panY: 20, dragging: false, lastX: 0, lastY: 0 };
  let spaceDown = false;
  let animTime = 0;

  // ============== DOM ==============
  const elAtlasSelect = document.getElementById('atlasSelect');
  const elTileSize = document.getElementById('tileSize');
  const elMapW = document.getElementById('mapW');
  const elMapH = document.getElementById('mapH');
  const elResizeBtn = document.getElementById('resizeBtn');
  const elClearBtn = document.getElementById('clearBtn');
  const elSaveBtn = document.getElementById('saveBtn');
  const elLoadBtn = document.getElementById('loadBtn');
  const elLoadFile = document.getElementById('loadFile');
  const elBrushSize = document.getElementById('brushSize');
  const elExportBtn = document.getElementById('exportBtn');
  const elAtlasMeta = document.getElementById('atlasMeta');
  const elTileStatus = document.getElementById('tileStatus');
  const elMapStatus = document.getElementById('mapStatus');
  const elHudBar = document.getElementById('hudBar');
  const elHudText = document.getElementById('hudText');
  const elLayerTabs = document.getElementById('layerTabs');

  const atlasCanvas = document.getElementById('atlas');
  const mapCanvas = document.getElementById('map');
  const atlasCtx = atlasCanvas.getContext('2d');
  const mapCtx = mapCanvas.getContext('2d');
  atlasCtx.imageSmoothingEnabled = false;
  mapCtx.imageSmoothingEnabled = false;

  // ============== HELPERS ==============
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const getDpr = () => Math.max(1, window.devicePixelRatio || 1);

  function resizeCanvasToDisplaySize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = getDpr();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return { dpr, rect };
  }

  const isAnim = (i) => ATLASES[i] && ATLASES[i].kind === 'anim';
  const tilesAcrossOf = (i) => {
    if (isAnim(i)) return 1;  // animation atlases expose 1 selectable tile
    const m = atlasMeta[i]; if (!m) return 1;
    return Math.max(1, Math.floor(m.w / ATLASES[i].tileSize));
  };
  const tilesDownOf = (i) => {
    if (isAnim(i)) return 1;
    const m = atlasMeta[i]; if (!m) return 1;
    return Math.max(1, Math.floor(m.h / ATLASES[i].tileSize));
  };
  const tileToXY = (t, i) => ({ x: t % tilesAcrossOf(i), y: Math.floor(t / tilesAcrossOf(i)) });
  const activeAtlasIdx = () => layers[activeLayer].atlasIdx;
  const activeAtlas = () => ATLASES[activeAtlasIdx()];
  const selectedTile = () => selectedByAtlas.get(activeAtlasIdx()) || 0;
  const setSelectedTile = (t) => { selectedByAtlas.set(activeAtlasIdx(), t); updateTileStatus(); };

  // ============== ATLAS LOADING ==============
  function loadAtlasImg(i) {
    return new Promise((resolve) => {
      if (atlasMeta[i] && atlasMeta[i].ready) { resolve(atlasImages[i]); return; }
      const img = new Image();
      img.onload = () => {
        atlasImages[i] = img;
        atlasMeta[i] = { w: img.naturalWidth, h: img.naturalHeight, ready: true };
        resolve(img);
      };
      img.onerror = () => {
        atlasMeta[i] = { w: 1, h: 1, ready: false, error: true };
        resolve(null);
      };
      img.src = ATLASES[i].src;
      atlasImages[i] = img;
    });
  }
  const ensureAtlasLoaded = (i) =>
    (atlasMeta[i] && atlasMeta[i].ready) ? Promise.resolve(atlasImages[i]) : loadAtlasImg(i);

  function updateTileStatus() {
    const a = activeAtlas();
    const i = activeAtlasIdx();
    const t = selectedTile();
    const { x, y } = tileToXY(t, i);
    elTileStatus.textContent = `${a.name} · Tile #${t} (${x},${y}) · Layer: ${LAYER_NAMES[activeLayer]}`;
    elHudText.textContent = `tile: #${t} · ${LAYER_NAMES[activeLayer]}`;
  }

  function refreshAtlasMetaUI() {
    const i = activeAtlasIdx();
    const m = atlasMeta[i];
    if (m && m.ready) {
      elAtlasMeta.textContent = `${m.w}×${m.h}px · ${tilesAcrossOf(i)}×${tilesDownOf(i)} tiles`;
    } else if (m && m.error) {
      elAtlasMeta.textContent = 'Failed to load atlas image';
    } else {
      elAtlasMeta.textContent = 'Loading…';
    }
  }

  async function setActiveAtlasForActiveLayer(i) {
    layers[activeLayer].atlasIdx = i;
    elAtlasSelect.value = String(i);
    elTileSize.value = String(ATLASES[i].tileSize);
    elHudBar.src = ATLASES[i].hudBar;
    elHudBar.style.imageRendering = 'pixelated';
    elAtlasMeta.textContent = 'Loading…';
    await ensureAtlasLoaded(i);
    refreshAtlasMetaUI();
    updateTileStatus();
    renderLayerTabs();
    saveToStorage();
    drawAll();
  }

  // ============== DRAWING ==============
  function drawAtlas() {
    const { dpr } = resizeCanvasToDisplaySize(atlasCanvas);
    atlasCtx.setTransform(1, 0, 0, 1, 0, 0);
    atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

    const i = activeAtlasIdx();
    const img = atlasImages[i];
    const m = atlasMeta[i];
    if (!img || !m || !m.ready) return;

    atlasCtx.setTransform(dpr * atlasView.zoom, 0, 0, dpr * atlasView.zoom, dpr * atlasView.panX, dpr * atlasView.panY);

    const a = ATLASES[i];
    if (isAnim(i)) {
      // Render: 1) the full strip (so user sees all frames), 2) a big animated preview.
      atlasCtx.drawImage(img, 0, 0);
      const frame = currentAnimFrame(a);
      const previewSize = a.tileSize * 4;
      const py = a.tileSize + 12;
      atlasCtx.drawImage(
        img,
        frame * a.tileSize, 0, a.tileSize, a.tileSize,
        0, py, previewSize, previewSize
      );
      // Outline current playing frame in the strip
      atlasCtx.strokeStyle = 'rgba(245,200,90,0.9)';
      atlasCtx.lineWidth = 2 / (dpr * atlasView.zoom);
      atlasCtx.strokeRect(frame * a.tileSize + 0.5, 0.5, a.tileSize, a.tileSize);
      // Selected tile box (always tile 0 for anims)
      atlasCtx.strokeStyle = 'rgba(124, 182, 255, 0.95)';
      atlasCtx.strokeRect(0.5, 0.5, a.tileSize, a.tileSize);
      return;
    }

    atlasCtx.drawImage(img, 0, 0);

    const across = tilesAcrossOf(i);
    const down = tilesDownOf(i);

    atlasCtx.lineWidth = 1 / (dpr * atlasView.zoom);
    atlasCtx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x <= across; x++) {
      atlasCtx.beginPath();
      atlasCtx.moveTo(x * a.tileSize, 0); atlasCtx.lineTo(x * a.tileSize, down * a.tileSize);
      atlasCtx.stroke();
    }
    for (let y = 0; y <= down; y++) {
      atlasCtx.beginPath();
      atlasCtx.moveTo(0, y * a.tileSize); atlasCtx.lineTo(across * a.tileSize, y * a.tileSize);
      atlasCtx.stroke();
    }

    const t = selectedTile();
    const { x: sx, y: sy } = tileToXY(t, i);
    atlasCtx.strokeStyle = 'rgba(124, 182, 255, 0.95)';
    atlasCtx.lineWidth = 2 / (dpr * atlasView.zoom);
    atlasCtx.strokeRect(sx * a.tileSize + 0.5, sy * a.tileSize + 0.5, a.tileSize, a.tileSize);
  }

  function currentAnimFrame(a) {
    return Math.floor((animTime * a.fps) / 1000) % a.frameCount;
  }

  function drawMap() {
    const { dpr } = resizeCanvasToDisplaySize(mapCanvas);
    mapCtx.setTransform(1, 0, 0, 1, 0, 0);
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    const baseTS = activeAtlas().tileSize;
    mapCtx.setTransform(dpr * mapView.zoom, 0, 0, dpr * mapView.zoom, dpr * mapView.panX, dpr * mapView.panY);

    mapCtx.fillStyle = '#000';
    mapCtx.fillRect(0, 0, mapW * baseTS, mapH * baseTS);

    for (let li = 0; li < layers.length; li++) {
      const L = layers[li];
      if (!L.visible) continue;
      const aIdx = L.atlasIdx;
      const img = atlasImages[aIdx];
      const m = atlasMeta[aIdx];
      if (!img || !m || !m.ready) continue;
      const a = ATLASES[aIdx];
      const animOn = isAnim(aIdx);
      const frame = animOn ? currentAnimFrame(a) : 0;
      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const t = L.tiles[y * mapW + x];
          if (t < 0) continue;
          let sx, sy;
          if (animOn) {
            sx = frame * a.tileSize;
            sy = 0;
          } else {
            const xy = tileToXY(t, aIdx);
            sx = xy.x * a.tileSize;
            sy = xy.y * a.tileSize;
          }
          mapCtx.drawImage(
            img,
            sx, sy, a.tileSize, a.tileSize,
            x * baseTS, y * baseTS, baseTS, baseTS
          );
        }
      }
    }

    mapCtx.lineWidth = 1 / (dpr * mapView.zoom);
    mapCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x <= mapW; x++) {
      mapCtx.beginPath();
      mapCtx.moveTo(x * baseTS, 0); mapCtx.lineTo(x * baseTS, mapH * baseTS);
      mapCtx.stroke();
    }
    for (let y = 0; y <= mapH; y++) {
      mapCtx.beginPath();
      mapCtx.moveTo(0, y * baseTS); mapCtx.lineTo(mapW * baseTS, y * baseTS);
      mapCtx.stroke();
    }

    // Selection overlay
    if (selection) {
      const { x, y, w, h } = selection;
      mapCtx.fillStyle = 'rgba(124,182,255,0.12)';
      mapCtx.fillRect(x * baseTS, y * baseTS, w * baseTS, h * baseTS);
      mapCtx.strokeStyle = 'rgba(124,182,255,0.95)';
      mapCtx.lineWidth = 2 / (dpr * mapView.zoom);
      mapCtx.strokeRect(x * baseTS + 0.5, y * baseTS + 0.5, w * baseTS, h * baseTS);
    }
  }

  function drawAll() { drawAtlas(); drawMap(); }

  // ============== INPUT ==============
  function screenToWorld(canvas, view, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      wx: ((clientX - rect.left) - view.panX) / view.zoom,
      wy: ((clientY - rect.top)  - view.panY) / view.zoom,
    };
  }

  function onAtlasClick(ev) {
    const i = activeAtlasIdx();
    const m = atlasMeta[i];
    if (!m || !m.ready) return;
    const a = ATLASES[i];
    const { wx, wy } = screenToWorld(atlasCanvas, atlasView, ev.clientX, ev.clientY);
    const tx = Math.floor(wx / a.tileSize);
    const ty = Math.floor(wy / a.tileSize);
    if (tx < 0 || ty < 0 || tx >= tilesAcrossOf(i) || ty >= tilesDownOf(i)) return;
    setSelectedTile(ty * tilesAcrossOf(i) + tx);
    drawAll();
  }

  function paintAt(ev, erase) {
    const baseTS = activeAtlas().tileSize;
    const { wx, wy } = screenToWorld(mapCanvas, mapView, ev.clientX, ev.clientY);
    const mx = Math.floor(wx / baseTS);
    const my = Math.floor(wy / baseTS);
    if (mx < 0 || my < 0 || mx >= mapW || my >= mapH) return;
    const L = layers[activeLayer];
    const sel = selectedTile();
    const i = activeAtlasIdx();
    const across = tilesAcrossOf(i);
    const down = tilesDownOf(i);
    const { x: selX, y: selY } = tileToXY(sel, i);
    const half = Math.floor(brushSize / 2);
    for (let dy = 0; dy < brushSize; dy++) {
      for (let dx = 0; dx < brushSize; dx++) {
        const tx = mx + dx - half;
        const ty = my + dy - half;
        if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) continue;
        if (erase) {
          L.tiles[ty * mapW + tx] = -1;
        } else {
          // For brush > 1: paint a contiguous block of source tiles
          const sx = (selX + dx) % across;
          const sy = (selY + dy) % down;
          L.tiles[ty * mapW + tx] = sy * across + sx;
        }
      }
    }
    saveToStorageDebounced();
    drawMap();
  }

  function attachPanZoom(canvas, view) {
    canvas.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const delta = Math.sign(ev.deltaY);
      const oldZoom = view.zoom;
      const newZoom = clamp(oldZoom * (delta > 0 ? 0.9 : 1.1), 0.6, 10);
      const rect = canvas.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const wx = (cx - view.panX) / oldZoom;
      const wy = (cy - view.panY) / oldZoom;
      view.zoom = newZoom;
      view.panX = cx - wx * newZoom;
      view.panY = cy - wy * newZoom;
      drawAll();
    }, { passive: false });

    canvas.addEventListener('mousedown', (ev) => {
      const shouldPan = ev.button === 1 || spaceDown || ev.altKey;
      if (!shouldPan) return;
      view.dragging = true;
      view.lastX = ev.clientX; view.lastY = ev.clientY;
    });
    window.addEventListener('mouseup', () => { view.dragging = false; });
    canvas.addEventListener('mousemove', (ev) => {
      if (!view.dragging) return;
      view.panX += ev.clientX - view.lastX;
      view.panY += ev.clientY - view.lastY;
      view.lastX = ev.clientX; view.lastY = ev.clientY;
      drawAll();
    });
  }

  mapCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
  atlasCanvas.addEventListener('click', onAtlasClick);

  function mapCellOf(ev) {
    const baseTS = activeAtlas().tileSize;
    const { wx, wy } = screenToWorld(mapCanvas, mapView, ev.clientX, ev.clientY);
    return { mx: Math.floor(wx / baseTS), my: Math.floor(wy / baseTS) };
  }

  function eyedropAt(mx, my) {
    if (mx < 0 || my < 0 || mx >= mapW || my >= mapH) return;
    // Walk layers top-down — pick first non-empty
    for (let li = layers.length - 1; li >= 0; li--) {
      const L = layers[li];
      if (!L.visible) continue;
      const t = L.tiles[my * mapW + mx];
      if (t < 0) continue;
      activeLayer = li;
      const aIdx = L.atlasIdx;
      elAtlasSelect.value = String(aIdx);
      elTileSize.value = String(ATLASES[aIdx].tileSize);
      elHudBar.src = ATLASES[aIdx].hudBar;
      selectedByAtlas.set(aIdx, t);
      ensureAtlasLoaded(aIdx).then(() => {
        refreshAtlasMetaUI();
        updateTileStatus();
        renderLayerTabs();
        drawAll();
      });
      return;
    }
  }

  function clearSelectionInActiveLayer() {
    if (!selection) return;
    const L = layers[activeLayer];
    for (let y = selection.y; y < selection.y + selection.h; y++) {
      for (let x = selection.x; x < selection.x + selection.w; x++) {
        if (x < 0 || y < 0 || x >= mapW || y >= mapH) continue;
        L.tiles[y * mapW + x] = -1;
      }
    }
    saveToStorage();
    drawMap();
  }

  mapCanvas.addEventListener('mousedown', (ev) => {
    if (spaceDown || ev.button === 1 || ev.altKey) return;
    if (tool === 'paint') {
      if (ev.button === 2) { paintAt(ev, true); return; }
      if (ev.button === 0) { paintAt(ev, false); }
    } else if (tool === 'erase') {
      paintAt(ev, true);
    } else if (tool === 'eyedropper') {
      const { mx, my } = mapCellOf(ev);
      eyedropAt(mx, my);
    } else if (tool === 'select') {
      const { mx, my } = mapCellOf(ev);
      if (mx < 0 || my < 0 || mx >= mapW || my >= mapH) return;
      isSelecting = true;
      selStart = { mx, my };
      selection = { x: mx, y: my, w: 1, h: 1 };
      drawMap();
    }
  });
  mapCanvas.addEventListener('mousemove', (ev) => {
    if (spaceDown) return;
    if (tool === 'paint') {
      if (ev.buttons === 1) paintAt(ev, false);
      if (ev.buttons === 2) paintAt(ev, true);
    } else if (tool === 'erase') {
      if (ev.buttons === 1) paintAt(ev, true);
    } else if (tool === 'select' && isSelecting) {
      const { mx, my } = mapCellOf(ev);
      const x0 = Math.max(0, Math.min(mx, selStart.mx));
      const y0 = Math.max(0, Math.min(my, selStart.my));
      const x1 = Math.min(mapW - 1, Math.max(mx, selStart.mx));
      const y1 = Math.min(mapH - 1, Math.max(my, selStart.my));
      selection = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
      drawMap();
    }
  });
  mapCanvas.addEventListener('mouseup', () => { isSelecting = false; });
  window.addEventListener('mouseup', () => { isSelecting = false; });

  attachPanZoom(atlasCanvas, atlasView);
  attachPanZoom(mapCanvas, mapView);

  // ============== LAYER UI ==============
  function renderLayerTabs() {
    elLayerTabs.innerHTML = '';
    layers.forEach((L, i) => {
      const tab = document.createElement('div');
      tab.className = 'layerTab' + (i === activeLayer ? ' active' : '');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = L.visible;
      cb.addEventListener('click', (e) => e.stopPropagation());
      cb.addEventListener('change', () => {
        L.visible = cb.checked;
        saveToStorage();
        drawMap();
      });
      const name = document.createElement('span');
      name.className = 'layerName';
      const a = ATLASES[L.atlasIdx];
      const shortName = a ? a.name.split(' — ')[0].split(' (')[0] : '?';
      name.textContent = `${i + 1}. ${LAYER_NAMES[i]} — ${shortName}`;
      tab.appendChild(cb);
      tab.appendChild(name);
      tab.addEventListener('click', () => {
        activeLayer = i;
        elAtlasSelect.value = String(L.atlasIdx);
        elTileSize.value = String(ATLASES[L.atlasIdx].tileSize);
        elHudBar.src = ATLASES[L.atlasIdx].hudBar;
        ensureAtlasLoaded(L.atlasIdx).then(() => {
          refreshAtlasMetaUI(); updateTileStatus(); renderLayerTabs(); drawAll();
        });
      });
      elLayerTabs.appendChild(tab);
    });
  }

  // ============== UI WIRING ==============
  ATLASES.forEach((a, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = a.name;
    elAtlasSelect.appendChild(opt);
  });

  elAtlasSelect.addEventListener('change', () => {
    setActiveAtlasForActiveLayer(parseInt(elAtlasSelect.value, 10));
  });

  elTileSize.addEventListener('change', () => {
    const v = parseInt(elTileSize.value, 10);
    if (!v || v < 4 || v > 128) return;
    ATLASES[activeAtlasIdx()].tileSize = v;
    refreshAtlasMetaUI(); updateTileStatus(); saveToStorage(); drawAll();
  });

  elResizeBtn.addEventListener('click', () => {
    const w = clamp(parseInt(elMapW.value, 10) || mapW, 8, 256);
    const h = clamp(parseInt(elMapH.value, 10) || mapH, 8, 256);
    if (w === mapW && h === mapH) return;
    layers = layers.map((L) => {
      const newTiles = new Int32Array(w * h).fill(-1);
      const cw = Math.min(w, mapW);
      const ch = Math.min(h, mapH);
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) newTiles[y * w + x] = L.tiles[y * mapW + x];
      }
      return { ...L, tiles: newTiles };
    });
    mapW = w; mapH = h;
    saveToStorage(); drawMap();
  });

  elClearBtn.addEventListener('click', () => {
    if (!confirm(`Clear layer "${LAYER_NAMES[activeLayer]}"?`)) return;
    layers[activeLayer].tiles.fill(-1);
    saveToStorage(); drawMap();
  });

  elSaveBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `pixel-town-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    elMapStatus.textContent = `Saved · ${link.download}`;
  });

  elBrushSize.addEventListener('change', () => {
    brushSize = clamp(parseInt(elBrushSize.value, 10) || 1, 1, 5);
  });

  function setTool(t) {
    tool = t;
    document.querySelectorAll('#toolGroup .tool').forEach((b) => {
      b.classList.toggle('active', b.dataset.tool === t);
    });
    if (t !== 'select') { selection = null; drawMap(); }
    // Cursor hint
    mapCanvas.style.cursor =
      t === 'paint' ? 'crosshair' :
      t === 'erase' ? 'not-allowed' :
      t === 'eyedropper' ? 'cell' :
      t === 'select' ? 'crosshair' : 'default';
  }
  document.querySelectorAll('#toolGroup .tool').forEach((b) => {
    b.addEventListener('click', () => setTool(b.dataset.tool));
  });

  elExportBtn.addEventListener('click', exportHtml);

  elLoadBtn.addEventListener('click', () => elLoadFile.click());
  elLoadFile.addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      await deserialize(JSON.parse(await file.text()));
      elMapStatus.textContent = `Loaded · ${file.name}`;
    } catch (e) {
      elMapStatus.textContent = `Load failed: ${e.message}`;
    }
    elLoadFile.value = '';
  });

  // ============== SERIALIZATION ==============
  function serialize() {
    return {
      version: SAVE_VERSION,
      mapW, mapH, activeLayer,
      layers: layers.map((L) => ({
        atlasId: ATLASES[L.atlasIdx].id,
        visible: L.visible,
        tiles: Array.from(L.tiles),
      })),
    };
  }

  async function deserialize(data) {
    if (!data || !data.version) throw new Error('not a pixel-town save');
    mapW = clamp(data.mapW || 64, 8, 256);
    mapH = clamp(data.mapH || 36, 8, 256);
    elMapW.value = String(mapW); elMapH.value = String(mapH);
    const newLayers = [];
    const incoming = data.layers || [];
    for (let i = 0; i < N_LAYERS; i++) {
      const src = incoming[i];
      if (!src) { newLayers.push(newLayer(0)); continue; }
      const aIdx = Math.max(0, ATLASES.findIndex((a) => a.id === src.atlasId));
      const tiles = new Int32Array(mapW * mapH).fill(-1);
      if (Array.isArray(src.tiles)) {
        for (let k = 0; k < Math.min(tiles.length, src.tiles.length); k++) tiles[k] = src.tiles[k];
      }
      newLayers.push({ atlasIdx: aIdx, tiles, visible: src.visible !== false });
    }
    layers = newLayers;
    activeLayer = clamp(data.activeLayer || 0, 0, N_LAYERS - 1);
    const used = new Set(layers.map((L) => L.atlasIdx));
    await Promise.all([...used].map((i) => ensureAtlasLoaded(i)));
    elAtlasSelect.value = String(activeAtlasIdx());
    elHudBar.src = activeAtlas().hudBar;
    elTileSize.value = String(activeAtlas().tileSize);
    refreshAtlasMetaUI(); renderLayerTabs(); updateTileStatus(); drawAll();
  }

  // ============== EXPORT AS PLAYABLE HTML ==============
  async function imageToDataURL(img) {
    // draw the image into a canvas and pull a PNG dataURL
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(img, 0, 0);
    try { return c.toDataURL('image/png'); }
    catch (e) {
      // canvas tainted by file:// cross-dir — fall back to fetch
      try {
        const resp = await fetch(img.src);
        const blob = await resp.blob();
        return await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } catch { return null; }
    }
  }

  async function exportHtml() {
    elMapStatus.textContent = 'Exporting…';
    const usedAtlasIdxs = [...new Set(layers.map((L) => L.atlasIdx))];
    // Make sure all used atlases are loaded
    await Promise.all(usedAtlasIdxs.map((i) => ensureAtlasLoaded(i)));

    // Convert each used atlas to dataURL
    const atlasData = {};
    for (const i of usedAtlasIdxs) {
      const img = atlasImages[i];
      if (!img) continue;
      const dataURL = await imageToDataURL(img);
      if (!dataURL) {
        elMapStatus.textContent = `Export failed: could not embed ${ATLASES[i].name}. Tip: serve via "python3 -m http.server" instead of file://`;
        return;
      }
      const a = ATLASES[i];
      atlasData[a.id] = {
        dataURL,
        tileSize: a.tileSize,
        name: a.name,
        kind: a.kind || 'static',
        frameCount: a.frameCount || 1,
        fps: a.fps || 0,
      };
    }

    const exportData = {
      mapW, mapH,
      layers: layers.map((L) => ({
        atlasId: ATLASES[L.atlasIdx].id,
        visible: L.visible,
        tiles: Array.from(L.tiles),
      })),
      atlases: atlasData,
    };

    const html = buildPlayableHTML(exportData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `pixel-town-game-${stamp}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    elMapStatus.textContent = `Exported · ${link.download} · ${sizeMB} MB · open it anywhere`;
  }

  function buildPlayableHTML(data) {
    // The exported game is fully self-contained. Player walks with WASD/arrows.
    // Top layer (last) is treated as collidable (block walking) by default.
    return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Pixel Town · Exported</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #000; color: #f2f2f6;
    font: 14px ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
  canvas { image-rendering: pixelated; image-rendering: crisp-edges; background: #000;
    display: block; outline: none; box-shadow: 0 8px 32px rgba(0,0,0,.5); border-radius: 6px; max-width: 100%; height: auto; }
  .hud { font-size: 12px; color: #888; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .hud kbd { background: #2a2a2a; border: 1px solid #333; border-radius: 4px; padding: 2px 6px; font: inherit; font-size: 11px; }
  .title { color: #f2f2f6; font-weight: 600; letter-spacing: .04em; }
</style></head><body>
<canvas id="game" width="800" height="480" tabindex="0"></canvas>
<div class="hud">
  <span class="title">Pixel Town · exported</span>
  <span>walk <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
  <span>collision: top layer · click canvas if input is frozen</span>
</div>
<script>
(()=>{
const DATA = ${JSON.stringify(data)};
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const VW = 800, VH = 480;
cv.width = VW; cv.height = VH;

// Load atlases
const atlasImgs = {};
const promises = [];
for (const [id, a] of Object.entries(DATA.atlases)) {
  const img = new Image();
  promises.push(new Promise((resolve) => {
    img.onload = () => { atlasImgs[id] = { img, tileSize: a.tileSize }; resolve(); };
    img.onerror = resolve;
    img.src = a.dataURL;
  }));
}

// We anchor the world to the FIRST layer's atlas tile size as the grid base
const baseTS = DATA.atlases[DATA.layers[0].atlasId].tileSize;
const W = DATA.mapW * baseTS, H = DATA.mapH * baseTS;

// Build collision map from the topmost visible non-empty layer (treat as walls)
function isSolid(mx, my) {
  if (mx < 0 || my < 0 || mx >= DATA.mapW || my >= DATA.mapH) return true;
  // top-most layer (index N-1) being non-empty blocks
  const L = DATA.layers[DATA.layers.length - 1];
  if (!L.visible) return false;
  return L.tiles[my * DATA.mapW + mx] >= 0;
}

const player = { x: (DATA.mapW * baseTS) / 2, y: (DATA.mapH * baseTS) / 2, dir: 0, frame: 0, moveT: 0 };
const camera = { x: 0, y: 0 };
const keys = {};
window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)) {
    keys[e.key] = true; e.preventDefault();
  }
}, { passive: false });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });
cv.addEventListener('click', () => cv.focus());

function tileXY(t, atlasId) {
  const img = atlasImgs[atlasId];
  if (!img) return { x: 0, y: 0, ts: baseTS };
  const ts = img.tileSize;
  const across = Math.floor(img.img.naturalWidth / ts);
  return { x: t % across, y: Math.floor(t / across), ts };
}

function canMove(nx, ny) {
  const r = baseTS * 0.35;
  const corners = [
    [nx - r, ny - r], [nx + r, ny - r], [nx - r, ny + r], [nx + r, ny + r],
  ];
  for (const [cx, cy] of corners) {
    const mx = Math.floor(cx / baseTS), my = Math.floor(cy / baseTS);
    if (isSolid(mx, my)) return false;
  }
  return true;
}

function drawPlayer(g, sx, sy) {
  // Simple 16x24 little dude
  const x = Math.round(sx - 8), y = Math.round(sy - 16);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(x + 2, y + 22, 12, 3);
  g.fillStyle = '#3F4682'; g.fillRect(x + 4, y + 14, 8, 8);
  const ph = Math.floor(player.moveT / 180) % 2;
  const offset = ph === 0 ? 0 : 1;
  g.fillStyle = '#1F1D1A';
  g.fillRect(x + 4, y + 21 - offset, 3, 3); g.fillRect(x + 9, y + 21 + offset, 3, 3);
  g.fillStyle = '#C84A4A'; g.fillRect(x + 3, y + 8, 10, 7);
  g.fillStyle = '#F5C9A0'; g.fillRect(x + 5, y + 4, 6, 5);
  g.fillStyle = '#5C3A21'; g.fillRect(x + 4, y + 1, 8, 4); g.fillRect(x + 3, y + 2, 10, 2);
  g.fillStyle = '#1A1310';
  if (player.dir === 0) g.fillStyle = '#3F2614', g.fillRect(x + 4, y + 5, 8, 3);
  else if (player.dir === 1) { g.fillRect(x + 6, y + 6, 1, 1); g.fillRect(x + 9, y + 6, 1, 1); }
  else if (player.dir === 2) g.fillRect(x + 5, y + 6, 1, 1);
  else g.fillRect(x + 10, y + 6, 1, 1);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(50, now - last); last = now;
  let dx = 0, dy = 0;
  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy = -1;
  else if (keys['ArrowDown'] || keys['s'] || keys['S']) dy = 1;
  else if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx = -1;
  else if (keys['ArrowRight'] || keys['d'] || keys['D']) dx = 1;
  if (dy < 0) player.dir = 0; else if (dy > 0) player.dir = 1;
  else if (dx < 0) player.dir = 2; else if (dx > 0) player.dir = 3;
  if (dx || dy) {
    const sp = (baseTS / 16) * 1.6 * (dt / 16.66);
    const nx = player.x + dx * sp, ny = player.y + dy * sp;
    if (canMove(nx, player.y)) player.x = nx;
    if (canMove(player.x, ny)) player.y = ny;
    player.moveT += dt;
  }

  // Camera follows player, clamped to world
  camera.x = Math.max(0, Math.min(W - VW, player.x - VW / 2));
  camera.y = Math.max(0, Math.min(H - VH, player.y - VH / 2));

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, VW, VH);

  // Determine visible tile range
  const x0 = Math.floor(camera.x / baseTS);
  const y0 = Math.floor(camera.y / baseTS);
  const x1 = Math.min(DATA.mapW, x0 + Math.ceil(VW / baseTS) + 1);
  const y1 = Math.min(DATA.mapH, y0 + Math.ceil(VH / baseTS) + 1);

  for (const L of DATA.layers) {
    if (!L.visible) continue;
    const aImg = atlasImgs[L.atlasId];
    if (!aImg) continue;
    const meta = DATA.atlases[L.atlasId];
    const ts = aImg.tileSize;
    const isAnim = meta.kind === 'anim';
    const across = isAnim ? 1 : Math.max(1, Math.floor(aImg.img.naturalWidth / ts));
    const frame = isAnim ? Math.floor((now * meta.fps) / 1000) % meta.frameCount : 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const t = L.tiles[y * DATA.mapW + x];
        if (t < 0) continue;
        let sx, sy;
        if (isAnim) { sx = frame * ts; sy = 0; }
        else { sx = (t % across) * ts; sy = Math.floor(t / across) * ts; }
        ctx.drawImage(
          aImg.img,
          sx, sy, ts, ts,
          x * baseTS - camera.x, y * baseTS - camera.y, baseTS, baseTS
        );
      }
    }
  }

  drawPlayer(ctx, player.x - camera.x, player.y - camera.y);
  requestAnimationFrame(loop);
}

Promise.all(promises).then(() => {
  cv.focus();
  requestAnimationFrame(loop);
});
})();
</script></body></html>`;
  }

  // ============== AUTOSAVE ==============
  let saveTimer = null;
  function saveToStorageDebounced() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveToStorage, 400);
  }
  function saveToStorage() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize())); } catch (e) { /* ignore quota */ }
  }
  async function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try { await deserialize(JSON.parse(raw)); return true; } catch { return false; }
  }

  // ============== KEYBOARD ==============
  window.addEventListener('keydown', (ev) => {
    const t = ev.target;
    const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (isTyping) return;
    if (ev.code === 'Space') { spaceDown = true; ev.preventDefault(); return; }
    // Tool shortcuts
    if (ev.key === 'b' || ev.key === 'B') { setTool('paint'); return; }
    if (ev.key === 'x' || ev.key === 'X') { setTool('erase'); return; }
    if (ev.key === 'e' || ev.key === 'E') { setTool('eyedropper'); return; }
    if (ev.key === 'v' || ev.key === 'V') { setTool('select'); return; }
    if (ev.key === 'Escape') { selection = null; drawMap(); return; }
    if ((ev.key === 'Delete' || ev.key === 'Backspace') && selection) {
      clearSelectionInActiveLayer();
      ev.preventDefault();
      return;
    }
    if (ev.key >= '1' && ev.key <= String(N_LAYERS)) {
      activeLayer = parseInt(ev.key, 10) - 1;
      const L = layers[activeLayer];
      elAtlasSelect.value = String(L.atlasIdx);
      elTileSize.value = String(ATLASES[L.atlasIdx].tileSize);
      elHudBar.src = ATLASES[L.atlasIdx].hudBar;
      renderLayerTabs();
      ensureAtlasLoaded(L.atlasIdx).then(() => {
        refreshAtlasMetaUI(); updateTileStatus(); drawAll();
      });
    }
  });
  window.addEventListener('keyup', (ev) => {
    if (ev.code === 'Space') { spaceDown = false; ev.preventDefault(); }
  });

  window.addEventListener('resize', () => drawAll());

  // ============== ANIMATION TICK ==============
  function hasActiveAnim() {
    for (const L of layers) {
      if (!L.visible) continue;
      if (isAnim(L.atlasIdx)) {
        // any non-empty cell triggers anim
        for (let i = 0; i < L.tiles.length; i++) if (L.tiles[i] >= 0) return true;
      }
    }
    // Also animate if the active atlas itself is an anim (so the picker preview moves)
    if (isAnim(activeAtlasIdx())) return true;
    return false;
  }
  let lastTick = performance.now();
  function tick(now) {
    const dt = now - lastTick; lastTick = now;
    if (hasActiveAnim()) {
      animTime += dt;
      drawAll();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ============== START ==============
  (async () => {
    elMapW.value = String(mapW);
    elMapH.value = String(mapH);
    const restored = await loadFromStorage();
    if (!restored) {
      const defaults = [
        ATLASES.findIndex((a) => a.id === 'serene-outside'),
        ATLASES.findIndex((a) => a.id === 'penzilla-floors'),
        ATLASES.findIndex((a) => a.id === 'penzilla-furn1'),
        ATLASES.findIndex((a) => a.id === 'snowhex-trees'),
      ];
      layers.forEach((L, i) => { if (defaults[i] >= 0) L.atlasIdx = defaults[i]; });
      await Promise.all(layers.map((L) => ensureAtlasLoaded(L.atlasIdx)));
      activeLayer = 0;
    }
    renderLayerTabs();
    elAtlasSelect.value = String(activeAtlasIdx());
    elHudBar.src = activeAtlas().hudBar;
    elHudBar.style.imageRendering = 'pixelated';
    elTileSize.value = String(activeAtlas().tileSize);
    refreshAtlasMetaUI();
    updateTileStatus();
    drawAll();
  })();
})();
