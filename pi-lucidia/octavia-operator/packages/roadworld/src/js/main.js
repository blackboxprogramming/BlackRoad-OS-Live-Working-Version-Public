import { MapManager } from './mapManager.js';
import { UIController } from './uiController.js';
import { SearchService } from './searchService.js';
import { StorageManager } from './storageManager.js';
import { BuildingsManager } from './buildingsManager.js';
import { MarkerManager } from './markerManager.js';
import { MeasurementTools } from './measurementTools.js';
import { URLManager } from './urlManager.js';
import { GameEngine } from './gameEngine.js';
import { PlayerAvatar } from './playerAvatar.js';
import { CollectiblesRenderer } from './collectiblesRenderer.js';
import { MissionsManager } from './missionsManager.js';
import { AchievementsManager } from './achievementsManager.js';
import { LeaderboardsManager } from './leaderboardsManager.js';

class RoadWorldApp {
    constructor() {
        this.mapManager = null;
        this.uiController = null;
        this.searchService = null;
        this.storageManager = null;
        this.buildingsManager = null;
        this.markerManager = null;
        this.measurementTools = null;
        this.urlManager = null;

        // Game components
        this.gameEngine = null;
        this.playerAvatar = null;
        this.collectiblesRenderer = null;
        this.missionsManager = null;
        this.achievementsManager = null;
        this.leaderboardsManager = null;
        this.gameActive = false;
    }

    async init() {
        // Initialize managers
        this.storageManager = new StorageManager();
        this.mapManager = new MapManager('map');
        await this.mapManager.init();

        this.uiController = new UIController(this.mapManager);
        this.searchService = new SearchService(this.mapManager);
        this.buildingsManager = new BuildingsManager(this.mapManager);
        this.markerManager = new MarkerManager(this.mapManager, this.storageManager);
        this.measurementTools = new MeasurementTools(this.mapManager);
        this.urlManager = new URLManager(this.mapManager);

        // Setup event listeners
        this.setupMapEvents();
        this.setupControls();
        this.setupSearch();
        this.setupLayers();
        this.setupQuickLocations();
        this.setupPanels();
        this.setupTools();

        // Initial UI update
        this.uiController.updateStats();
        this.updateSavedCount();

        // Check URL params first
        const urlParams = this.urlManager.loadFromURL();
        if (urlParams) {
            this.mapManager.map.jumpTo(urlParams);
            if (urlParams.style) {
                // Will be handled by style change
            }
        } else {
            // Load last position if available
            const lastPosition = this.storageManager.getLastPosition();
            if (lastPosition && lastPosition.center) {
                this.mapManager.map.jumpTo(lastPosition);
            }
        }

        // Load saved markers
        this.markerManager.loadMarkersFromStorage();

        // Initialize game engine (but don't activate yet)
        this.gameEngine = new GameEngine(this.mapManager, this.storageManager);
        this.playerAvatar = new PlayerAvatar(this.mapManager, this.gameEngine);
        this.collectiblesRenderer = new CollectiblesRenderer(this.mapManager, this.gameEngine, {
            onItemCollected: (collectible) => this.onItemCollected(collectible)
        });

        // Setup game toggle
        this.setupGameToggle();

        // Setup game menu and panels
        this.setupGameMenu();

        console.log('RoadWorld initialized');
    }

    setupGameToggle() {
        const toggle = document.getElementById('game-toggle');

        toggle.addEventListener('click', () => {
            this.gameActive = !this.gameActive;

            if (this.gameActive) {
                this.activateGameMode();
                toggle.classList.add('active');
            } else {
                this.deactivateGameMode();
                toggle.classList.remove('active');
            }
        });
    }

    activateGameMode() {
        console.log('🎮 Game Mode Activated!');

        // Initialize game
        this.gameEngine.init();

        // Initialize progression systems
        this.missionsManager = new MissionsManager(this.gameEngine, this.storageManager);
        this.achievementsManager = new AchievementsManager(this.gameEngine, this.storageManager);
        this.leaderboardsManager = new LeaderboardsManager(this.gameEngine, this.storageManager);

        this.missionsManager.init();
        this.achievementsManager.init();
        this.leaderboardsManager.init();

        // Generate demo leaderboard players for testing
        if (this.leaderboardsManager.localLeaderboard.length < 5) {
            this.leaderboardsManager.generateDemoPlayers();
        }

        // Create player avatar
        this.playerAvatar.create();

        // Show game HUD and menu
        document.getElementById('game-hud').style.display = 'block';
        document.getElementById('game-menu-btn').style.display = 'block';

        // Setup map click to move player
        this.mapManager.map.on('click', this.onMapClickGame.bind(this));

        // Setup map movement to generate collectibles
        this.mapManager.map.on('moveend', this.onMapMoveGame.bind(this));

        // Initial HUD update
        this.updateGameHUD();

        // Show collectibles
        this.collectiblesRenderer.renderAll();

        this.showNotification('🎮 Game Mode Activated! Click to move your avatar.');
    }

    deactivateGameMode() {
        console.log('🎮 Game Mode Deactivated');

        // Hide game HUD and menu
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('game-menu-btn').style.display = 'none';

        // Close any open game panels
        this.closePanel('missions-panel');
        this.closePanel('achievements-panel');
        this.closePanel('leaderboard-panel');

        // Remove player avatar
        this.playerAvatar.remove();

        // Clear collectibles
        this.collectiblesRenderer.clearAll();

        // Remove map click handler (would need to track the handler)
        // For now, game click will just be ignored when not active

        this.showNotification('Game Mode Deactivated');
    }

    onMapClickGame(e) {
        if (!this.gameActive) return;

        const lngLat = [e.lngLat.lng, e.lngLat.lat];

        // Move player
        const distance = this.gameEngine.movePlayer(lngLat);

        // Update avatar position
        this.playerAvatar.updatePosition(lngLat);

        // Award XP for movement (1 XP per 10 meters)
        if (distance > 10) {
            const xp = Math.floor(distance / 10);
            this.gameEngine.addXP(xp, 'movement');
        }

        // Update mission progress for distance traveled
        if (this.missionsManager) {
            this.missionsManager.updateProgress('player_moved', { distance });
        }

        // Check for level up
        const levelUp = this.gameEngine.checkLevelUp();
        if (levelUp) {
            this.onLevelUp(levelUp);
        }

        // Check achievements
        if (this.achievementsManager) {
            const newAchievements = this.achievementsManager.checkAll();
            // Notifications are shown automatically by achievementsManager
        }

        // Update leaderboard
        if (this.leaderboardsManager) {
            this.leaderboardsManager.updatePlayerRank();
        }

        // Update HUD
        this.updateGameHUD();

        // Refresh visible collectibles
        this.collectiblesRenderer.refreshVisibleCollectibles();
    }

    onMapMoveGame() {
        if (!this.gameActive) return;

        // Generate new collectibles when map moves
        const zoom = this.mapManager.getZoom();
        if (zoom >= 14) {
            this.gameEngine.generateCollectibles();
            this.collectiblesRenderer.refreshVisibleCollectibles();
        }
    }

    onLevelUp(levelInfo) {
        console.log(`🎉 LEVEL UP! Now level ${levelInfo.level}`);

        // Update avatar
        this.playerAvatar.updateLevel();

        // Show special notification
        const notification = document.createElement('div');
        notification.className = 'notification level-up-notification';
        notification.innerHTML = `
            <div style="font-size: 20px;">🎉 LEVEL UP!</div>
            <div style="font-size: 16px; margin-top: 4px;">Level ${levelInfo.level}</div>
        `;
        notification.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        notification.style.color = '#000';
        notification.style.fontWeight = '700';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    onItemCollected(collectible) {
        if (!this.gameActive) return;

        // Update mission progress
        if (this.missionsManager) {
            this.missionsManager.updateProgress('item_collected', {
                rarity: collectible.rarity
            });
        }

        // Check achievements
        if (this.achievementsManager) {
            this.achievementsManager.checkAll();
        }

        // Update leaderboard
        if (this.leaderboardsManager) {
            this.leaderboardsManager.updatePlayerRank();
        }

        // Update HUD
        this.updateGameHUD();
    }

    updateGameHUD() {
        const player = this.gameEngine.player;
        const stats = this.gameEngine.getPlayerStats();
        const inventory = this.gameEngine.getInventorySummary();

        // Level and XP
        document.getElementById('hud-level').textContent = player.level;
        document.getElementById('hud-xp').textContent = player.xp;
        document.getElementById('hud-xp-next').textContent = player.xpToNextLevel;
        document.getElementById('hud-xp-bar').style.width = stats.xpProgress + '%';

        // Inventory
        document.getElementById('hud-stars').textContent = inventory.stars;
        document.getElementById('hud-gems').textContent = inventory.gems;
        document.getElementById('hud-trophies').textContent = inventory.trophies;
        document.getElementById('hud-keys').textContent = inventory.keys;

        // Stats
        const distanceKm = stats.distanceTraveled < 1000 ?
            `${stats.distanceTraveled.toFixed(0)} m` :
            `${(stats.distanceTraveled / 1000).toFixed(2)} km`;
        document.getElementById('hud-distance').textContent = distanceKm;
        document.getElementById('hud-collected').textContent = stats.itemsCollected;
    }

    setupGameMenu() {
        const menuBtn = document.getElementById('game-menu-btn');

        // Game menu button - create a popup menu
        menuBtn.addEventListener('click', () => {
            this.showGameMenu();
        });

        // Missions panel
        document.getElementById('missions-close').addEventListener('click', () => {
            this.closePanel('missions-panel');
        });

        // Achievements panel
        document.getElementById('achievements-close').addEventListener('click', () => {
            this.closePanel('achievements-panel');
        });

        // Leaderboard panel
        document.getElementById('leaderboard-close').addEventListener('click', () => {
            this.closePanel('leaderboard-panel');
        });

        // Setup tabs for missions
        document.querySelectorAll('.mission-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.mission-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderMissionsList(tab.dataset.tab);
            });
        });

        // Setup tabs for achievements
        document.querySelectorAll('.achievement-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.achievement-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderAchievementsList(tab.dataset.category);
            });
        });

        // Setup tabs for leaderboard
        document.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderLeaderboard(tab.dataset.category);
            });
        });
    }

    showGameMenu() {
        // Create temporary menu overlay
        const menu = document.createElement('div');
        menu.className = 'game-menu-overlay';
        menu.innerHTML = `
            <div class="game-menu">
                <div class="game-menu-header">Game Menu</div>
                <button class="game-menu-item" data-action="missions">📜 Missions</button>
                <button class="game-menu-item" data-action="achievements">🏆 Achievements</button>
                <button class="game-menu-item" data-action="leaderboard">🏅 Leaderboard</button>
                <button class="game-menu-item" data-action="close">✕ Close</button>
            </div>
        `;

        document.body.appendChild(menu);

        // Add event listeners
        menu.querySelectorAll('.game-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                document.body.removeChild(menu);

                switch (action) {
                    case 'missions':
                        this.openMissionsPanel();
                        break;
                    case 'achievements':
                        this.openAchievementsPanel();
                        break;
                    case 'leaderboard':
                        this.openLeaderboardPanel();
                        break;
                }
            });
        });

        // Close on click outside
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                document.body.removeChild(menu);
            }
        });
    }

    openMissionsPanel() {
        this.openPanel('missions-panel');
        this.renderMissionsList('daily');
    }

    openAchievementsPanel() {
        this.openPanel('achievements-panel');
        this.renderAchievementsList('all');

        // Update progress bar
        const progress = this.achievementsManager.getProgress();
        document.getElementById('achievements-count').textContent = progress.unlocked;
        document.getElementById('achievements-total').textContent = progress.total;
        document.getElementById('achievements-progress-bar').style.width = progress.percent + '%';
    }

    openLeaderboardPanel() {
        this.openPanel('leaderboard-panel');
        this.renderLeaderboard('level');
    }

    renderMissionsList(tab) {
        if (!this.missionsManager) return;

        const listEl = document.getElementById('missions-list');
        let missions = [];

        switch (tab) {
            case 'daily':
                missions = this.missionsManager.missions.filter(m => m.type === 'daily');
                break;
            case 'story':
                missions = this.missionsManager.missions.filter(m => m.type === 'story');
                break;
            case 'completed':
                missions = this.missionsManager.getCompletedMissions();
                break;
        }

        if (missions.length === 0) {
            listEl.innerHTML = '<div style="opacity: 0.5; text-align: center; padding: 20px;">No missions available</div>';
            return;
        }

        listEl.innerHTML = missions.map(mission => {
            const progress = this.missionsManager.getMissionProgress(mission);
            return `
                <div class="mission-item ${mission.completed ? 'completed' : ''}">
                    <div class="mission-header">
                        <div class="mission-name">${mission.name}</div>
                        ${mission.completed ? '<span class="mission-status">✅ Complete</span>' : ''}
                    </div>
                    <div class="mission-description">${mission.description}</div>
                    <div class="mission-progress-bar">
                        <div class="mission-progress-fill" style="width: ${progress.percent}%"></div>
                    </div>
                    <div class="mission-stats">
                        <span>${progress.current} / ${progress.target}</span>
                        <span class="mission-reward">
                            ${mission.reward.xp ? `+${mission.reward.xp} XP` : ''}
                            ${mission.reward.coins ? ` | +${mission.reward.coins} 🪙` : ''}
                        </span>
                    </div>
                    ${mission.completed && !mission.claimed ?
                        `<button class="mission-claim-btn" onclick="window.claimMissionReward('${mission.id}')">Claim Reward</button>` :
                        ''}
                </div>
            `;
        }).join('');
    }

    renderAchievementsList(category) {
        if (!this.achievementsManager) return;

        const listEl = document.getElementById('achievements-list');
        let achievements = category === 'all' ?
            this.achievementsManager.achievements :
            this.achievementsManager.getByCategory(category);

        listEl.innerHTML = achievements.map(achievement => {
            const unlocked = this.achievementsManager.isUnlocked(achievement.id);
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'} ${achievement.tier}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        <div class="achievement-tier-badge">${achievement.tier}</div>
                    </div>
                    ${unlocked ? '<div class="achievement-check">✅</div>' : ''}
                </div>
            `;
        }).join('');
    }

    renderLeaderboard(category) {
        if (!this.leaderboardsManager) return;

        const listEl = document.getElementById('leaderboard-list');
        const rankings = this.leaderboardsManager.getGlobalRankings(category, 50);
        const playerRank = this.leaderboardsManager.getPlayerRank(category);

        listEl.innerHTML = rankings.map((entry, index) => {
            const rank = index + 1;
            const isPlayer = entry.playerId === this.gameEngine.player.id;
            let value;

            switch (category) {
                case 'level':
                    value = `Level ${entry.level} (${entry.totalXP.toLocaleString()} XP)`;
                    break;
                case 'distance':
                    const km = entry.stats.distanceTraveled / 1000;
                    value = `${km.toFixed(2)} km`;
                    break;
                case 'items':
                    value = `${entry.stats.itemsCollected.toLocaleString()} items`;
                    break;
                case 'missions':
                    value = `${entry.stats.missionsCompleted} missions`;
                    break;
            }

            return `
                <div class="leaderboard-item ${isPlayer ? 'player' : ''}">
                    <div class="leaderboard-rank">#${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.username}</div>
                        <div class="leaderboard-stat">${value}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Update player rank display
        const rankEl = document.getElementById('player-rank');
        if (playerRank) {
            rankEl.innerHTML = `<strong>Your Rank:</strong> #${playerRank}`;
        } else {
            rankEl.innerHTML = '<strong>Not ranked yet</strong>';
        }
    }

    setupMapEvents() {
        this.mapManager.on('move', () => this.uiController.updateStats());
        this.mapManager.on('zoom', () => this.uiController.updateStats());
        this.mapManager.on('moveend', () => {
            this.uiController.updateStats();
            this.saveCurrentPosition();
        });
    }

    setupControls() {
        // Home button
        document.getElementById('btn-home').addEventListener('click', () => {
            this.mapManager.flyTo({
                center: [0, 20],
                zoom: 1.5,
                pitch: 0,
                bearing: 0,
                duration: 2000
            });
        });

        // North button
        document.getElementById('btn-north').addEventListener('click', () => {
            this.mapManager.easeTo({ bearing: 0, pitch: 0, duration: 500 });
        });

        // Zoom buttons
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.mapManager.zoomIn();
        });

        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.mapManager.zoomOut();
        });

        // 3D buildings toggle
        document.getElementById('btn-3d').addEventListener('click', (e) => {
            const isActive = this.buildingsManager.toggle();
            e.target.classList.toggle('active', isActive);

            if (isActive) {
                this.mapManager.easeTo({ pitch: 60, duration: 500 });
            } else {
                this.mapManager.easeTo({ pitch: 0, duration: 500 });
            }
        });

        // Globe view
        document.getElementById('btn-globe').addEventListener('click', () => {
            this.mapManager.flyTo({
                center: [0, 20],
                zoom: 1.5,
                pitch: 0,
                bearing: 0,
                duration: 2000
            });
        });

        // Locate user
        document.getElementById('btn-locate').addEventListener('click', () => {
            this.locateUser();
        });

        // Save location
        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveCurrentLocation();
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search');
        const searchBtn = document.getElementById('search-btn');

        const doSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;

            const result = await this.searchService.search(query);

            if (result.success) {
                this.searchService.flyToResult(result);
                this.uiController.updateElement('location-name', result.name);

                // Add to history
                this.storageManager.addToHistory({
                    type: 'search',
                    query: query,
                    result: result.name
                });
            } else {
                this.uiController.updateElement('location-name', 'Not found');
            }
        };

        searchBtn.addEventListener('click', doSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doSearch();
        });
    }

    setupLayers() {
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const styleName = btn.dataset.style;
                this.mapManager.changeStyle(styleName);

                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.storageManager.updateSettings({ defaultStyle: styleName });
            });
        });
    }

    setupQuickLocations() {
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lat = parseFloat(btn.dataset.lat);
                const lng = parseFloat(btn.dataset.lng);
                const zoom = parseFloat(btn.dataset.zoom);

                this.mapManager.flyTo({
                    center: [lng, lat],
                    zoom: zoom,
                    pitch: 60,
                    bearing: Math.random() * 60 - 30,
                    duration: 3000
                });

                const locationName = btn.textContent.split(' ')[0] + ' ' +
                    (btn.textContent.split(' ')[1] || '');
                this.uiController.updateElement('location-name', locationName);

                // Add to history
                this.storageManager.addToHistory({
                    type: 'quick_location',
                    name: locationName,
                    lat,
                    lng
                });
            });
        });
    }

    locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.mapManager.flyTo({
                    center: [pos.coords.longitude, pos.coords.latitude],
                    zoom: 17,
                    duration: 2000
                });
                this.uiController.updateElement('location-name', 'Your Location');

                // Add marker
                this.mapManager.addMarker([pos.coords.longitude, pos.coords.latitude], {
                    color: '#FF6B00'
                });
            }, (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please check permissions.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }

    saveCurrentLocation() {
        const center = this.mapManager.getCenter();
        const zoom = this.mapManager.getZoom();
        const locationName = document.getElementById('location-name').textContent;

        const saved = this.storageManager.saveLocation({
            name: locationName,
            lat: center.lat,
            lng: center.lng,
            zoom: zoom
        });

        this.updateSavedCount();

        // Visual feedback
        const btn = document.getElementById('btn-save');
        btn.style.background = 'rgba(0, 212, 255, 0.5)';
        setTimeout(() => {
            btn.style.background = '';
        }, 500);

        console.log('Location saved:', saved);
    }

    saveCurrentPosition() {
        const center = this.mapManager.getCenter();
        const zoom = this.mapManager.getZoom();
        const pitch = this.mapManager.getPitch();
        const bearing = this.mapManager.getBearing();

        this.storageManager.savePosition({
            center: [center.lng, center.lat],
            zoom,
            pitch,
            bearing
        });
    }

    updateSavedCount() {
        const count = this.storageManager.getSavedLocations().length;
        this.uiController.updateElement('saved-count', count.toString());
    }

    setupPanels() {
        // Tools panel
        document.getElementById('btn-tools').addEventListener('click', () => {
            this.togglePanel('tools-panel');
        });

        document.getElementById('tools-close').addEventListener('click', () => {
            this.closePanel('tools-panel');
        });

        // Marker add panel
        document.getElementById('marker-add-close').addEventListener('click', () => {
            this.closePanel('marker-add-panel');
        });

        // Saved locations panel
        document.getElementById('saved-close').addEventListener('click', () => {
            this.closePanel('saved-panel');
        });

        document.getElementById('btn-save').addEventListener('click', () => {
            this.openSavedPanel();
        });
    }

    setupTools() {
        // Share button
        document.getElementById('btn-share').addEventListener('click', async () => {
            const result = await this.urlManager.copyToClipboard();
            if (result.success) {
                this.showNotification('Share link copied to clipboard!');
            } else {
                this.showNotification('Failed to copy link');
            }
        });

        // Marker button
        document.getElementById('btn-marker').addEventListener('click', () => {
            this.openMarkerPanel();
        });

        // Measure button
        document.getElementById('btn-measure').addEventListener('click', () => {
            this.togglePanel('tools-panel');
        });

        // Measurement tools
        document.getElementById('measure-distance').addEventListener('click', () => {
            this.measurementTools.startDistance();
            this.showNotification('Click on map to measure distance');
            this.setupMeasurementListener();
        });

        document.getElementById('measure-area').addEventListener('click', () => {
            this.measurementTools.startArea();
            this.showNotification('Click on map to measure area');
            this.setupMeasurementListener();
        });

        document.getElementById('measure-clear').addEventListener('click', () => {
            this.measurementTools.clear();
            document.getElementById('measurement-result').innerHTML = '';
        });

        // Copy URL
        document.getElementById('copy-url').addEventListener('click', async () => {
            const result = await this.urlManager.copyToClipboard();
            if (result.success) {
                this.showNotification('Share link copied!');
            }
        });

        // Add marker from tools
        document.getElementById('add-marker-custom').addEventListener('click', () => {
            this.openMarkerPanel();
        });

        // View markers
        document.getElementById('view-markers').addEventListener('click', () => {
            const markers = this.markerManager.getMarkers();
            console.log('Markers:', markers);
            this.showNotification(`${markers.length} markers on map`);
        });

        // Clear markers
        document.getElementById('clear-markers').addEventListener('click', () => {
            if (confirm('Clear all markers?')) {
                this.markerManager.clearAllMarkers();
                this.showNotification('All markers cleared');
            }
        });

        // Save marker
        document.getElementById('marker-save').addEventListener('click', () => {
            const name = document.getElementById('marker-name').value;
            const category = document.getElementById('marker-category').value;
            const description = document.getElementById('marker-description').value;

            if (!name) {
                alert('Please enter a marker name');
                return;
            }

            const center = this.mapManager.getCenter();
            this.markerManager.addMarker([center.lng, center.lat], {
                name,
                category,
                description
            });

            this.showNotification('Marker added!');
            this.closePanel('marker-add-panel');

            // Clear form
            document.getElementById('marker-name').value = '';
            document.getElementById('marker-description').value = '';
        });
    }

    setupMeasurementListener() {
        const updateResults = () => {
            const results = this.measurementTools.getResults();
            if (results) {
                document.getElementById('measurement-result').innerHTML = `
                    <strong>${results.type === 'distance' ? 'Distance' : 'Area'}:</strong><br>
                    ${results.formatted}<br>
                    <small>${results.points} points</small>
                `;
            }
        };

        // Update on map click
        const clickHandler = () => {
            setTimeout(updateResults, 100);
        };

        this.mapManager.map.on('click', clickHandler);
    }

    openMarkerPanel() {
        const center = this.mapManager.getCenter();
        document.getElementById('marker-name').placeholder = `Marker at ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        this.openPanel('marker-add-panel');
        this.closePanel('tools-panel');
    }

    openSavedPanel() {
        const savedLocations = this.storageManager.getSavedLocations();
        const listEl = document.getElementById('saved-locations-list');

        if (savedLocations.length === 0) {
            listEl.innerHTML = '<p style="opacity: 0.5; text-align: center; padding: 20px;">No saved locations</p>';
        } else {
            listEl.innerHTML = savedLocations.map(loc => `
                <div class="saved-item" data-lat="${loc.lat}" data-lng="${loc.lng}" data-zoom="${loc.zoom}" data-id="${loc.id}">
                    <div class="saved-item-name">${loc.name}</div>
                    <div class="saved-item-coords">${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</div>
                </div>
            `).join('');

            // Add click handlers
            listEl.querySelectorAll('.saved-item').forEach(item => {
                item.addEventListener('click', () => {
                    const lat = parseFloat(item.dataset.lat);
                    const lng = parseFloat(item.dataset.lng);
                    const zoom = parseFloat(item.dataset.zoom);

                    this.mapManager.flyTo({
                        center: [lng, lat],
                        zoom: zoom,
                        duration: 2000
                    });

                    this.closePanel('saved-panel');
                });
            });
        }

        this.openPanel('saved-panel');
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel.style.display === 'none' || !panel.style.display) {
            this.openPanel(panelId);
        } else {
            this.closePanel(panelId);
        }
    }

    openPanel(panelId) {
        document.getElementById(panelId).style.display = 'block';
    }

    closePanel(panelId) {
        document.getElementById(panelId).style.display = 'none';
    }

    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
}

// Global app instance for window functions
let globalApp = null;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalApp = new RoadWorldApp();
        globalApp.init();
    });
} else {
    globalApp = new RoadWorldApp();
    globalApp.init();
}

// Global function for claiming mission rewards (called from HTML onclick)
window.claimMissionReward = function(missionId) {
    if (!globalApp || !globalApp.missionsManager) return;

    const mission = globalApp.missionsManager.missions.find(m => m.id === missionId);
    if (mission) {
        globalApp.missionsManager.claimReward(mission);
        // Refresh the missions list
        const activeTab = document.querySelector('.mission-tab.active');
        if (activeTab) {
            globalApp.renderMissionsList(activeTab.dataset.tab);
        }
    }
};
