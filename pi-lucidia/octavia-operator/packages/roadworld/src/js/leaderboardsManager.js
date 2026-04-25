export class LeaderboardsManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.localLeaderboard = [];
    }

    init() {
        // Load local leaderboard (simulated global for now)
        const saved = this.storageManager.data.leaderboard || [];
        this.localLeaderboard = saved;

        // Add current player if not present
        this.updatePlayerRank();
    }

    updatePlayerRank() {
        const player = this.gameEngine.player;

        // Create leaderboard entry
        const entry = {
            playerId: player.id,
            username: player.username,
            level: player.level,
            xp: player.xp,
            totalXP: this.calculateTotalXP(player.level, player.xp),
            stats: {
                distanceTraveled: player.stats.distanceTraveled,
                itemsCollected: player.stats.itemsCollected,
                missionsCompleted: player.stats.missionsCompleted,
                locationsDiscovered: player.stats.locationsDiscovered
            },
            updatedAt: new Date().toISOString()
        };

        // Find existing entry
        const existingIndex = this.localLeaderboard.findIndex(
            e => e.playerId === player.id
        );

        if (existingIndex >= 0) {
            // Update existing
            this.localLeaderboard[existingIndex] = entry;
        } else {
            // Add new
            this.localLeaderboard.push(entry);
        }

        // Sort by total XP
        this.localLeaderboard.sort((a, b) => b.totalXP - a.totalXP);

        // Keep top 100
        if (this.localLeaderboard.length > 100) {
            this.localLeaderboard = this.localLeaderboard.slice(0, 100);
        }

        this.save();
    }

    calculateTotalXP(level, currentXP) {
        // Calculate cumulative XP across all levels
        let total = currentXP;
        let xpRequired = 100;

        for (let i = 1; i < level; i++) {
            total += xpRequired;
            xpRequired = Math.floor(xpRequired * 1.5);
        }

        return total;
    }

    getGlobalRankings(category = 'level', limit = 10) {
        const sorted = [...this.localLeaderboard];

        switch (category) {
            case 'level':
                sorted.sort((a, b) => b.totalXP - a.totalXP);
                break;
            case 'distance':
                sorted.sort((a, b) => b.stats.distanceTraveled - a.stats.distanceTraveled);
                break;
            case 'items':
                sorted.sort((a, b) => b.stats.itemsCollected - a.stats.itemsCollected);
                break;
            case 'missions':
                sorted.sort((a, b) => b.stats.missionsCompleted - a.stats.missionsCompleted);
                break;
        }

        return sorted.slice(0, limit);
    }

    getPlayerRank(category = 'level') {
        const player = this.gameEngine.player;
        const rankings = this.getGlobalRankings(category, 100);

        const rank = rankings.findIndex(e => e.playerId === player.id);
        return rank >= 0 ? rank + 1 : null;
    }

    getPlayerStats() {
        const player = this.gameEngine.player;

        return {
            level: player.level,
            totalXP: this.calculateTotalXP(player.level, player.xp),
            rankings: {
                level: this.getPlayerRank('level'),
                distance: this.getPlayerRank('distance'),
                items: this.getPlayerRank('items'),
                missions: this.getPlayerRank('missions')
            }
        };
    }

    // Simulate additional players for demo purposes
    generateDemoPlayers() {
        const demoNames = [
            'MapMaster', 'Explorer99', 'GlobeWalker', 'TreasureSeeker',
            'WanderlustKing', 'RoadWarrior', 'CityScout', 'AdventureTime',
            'QuestHero', 'LegendFinder', 'StarCollector', 'GemHunter',
            'EpicVoyager', 'WorldRunner', 'PathFinder', 'TravelBug'
        ];

        demoNames.forEach(name => {
            const level = Math.floor(Math.random() * 50) + 1;
            const xp = Math.floor(Math.random() * 1000);

            const entry = {
                playerId: `demo_${name}`,
                username: name,
                level: level,
                xp: xp,
                totalXP: this.calculateTotalXP(level, xp),
                stats: {
                    distanceTraveled: Math.floor(Math.random() * 100000),
                    itemsCollected: Math.floor(Math.random() * 1000),
                    missionsCompleted: Math.floor(Math.random() * 50),
                    locationsDiscovered: Math.floor(Math.random() * 100)
                },
                updatedAt: new Date().toISOString(),
                isDemo: true
            };

            this.localLeaderboard.push(entry);
        });

        // Resort
        this.localLeaderboard.sort((a, b) => b.totalXP - a.totalXP);
        this.save();
    }

    save() {
        this.storageManager.data.leaderboard = this.localLeaderboard;
        this.storageManager.save();
    }
}
