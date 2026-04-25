export class AchievementsManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.achievements = [];
        this.unlockedAchievements = [];
    }

    init() {
        // Define all achievements
        this.defineAchievements();

        // Load unlocked achievements
        const saved = this.storageManager.data.achievements || [];
        this.unlockedAchievements = saved;

        // Check for any newly unlocked achievements
        this.checkAll();
    }

    defineAchievements() {
        this.achievements = [
            // Explorer Achievements
            {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Move your avatar for the first time',
                icon: '👣',
                category: 'explorer',
                tier: 'bronze',
                check: (player) => player.stats.distanceTraveled > 0
            },
            {
                id: 'world_traveler',
                name: 'World Traveler',
                description: 'Travel 10 kilometers',
                icon: '🌍',
                category: 'explorer',
                tier: 'silver',
                check: (player) => player.stats.distanceTraveled >= 10000
            },
            {
                id: 'globe_trotter',
                name: 'Globe Trotter',
                description: 'Travel 100 kilometers',
                icon: '✈️',
                category: 'explorer',
                tier: 'gold',
                check: (player) => player.stats.distanceTraveled >= 100000
            },
            {
                id: 'around_the_world',
                name: 'Around the World',
                description: 'Travel the distance around Earth (40,075 km)',
                icon: '🌐',
                category: 'explorer',
                tier: 'platinum',
                check: (player) => player.stats.distanceTraveled >= 40075000
            },

            // Collector Achievements
            {
                id: 'first_collect',
                name: 'First Find',
                description: 'Collect your first item',
                icon: '✨',
                category: 'collector',
                tier: 'bronze',
                check: (player) => player.stats.itemsCollected > 0
            },
            {
                id: 'collector',
                name: 'Collector',
                description: 'Collect 100 items',
                icon: '📦',
                category: 'collector',
                tier: 'silver',
                check: (player) => player.stats.itemsCollected >= 100
            },
            {
                id: 'hoarder',
                name: 'Hoarder',
                description: 'Collect 1,000 items',
                icon: '💰',
                category: 'collector',
                tier: 'gold',
                check: (player) => player.stats.itemsCollected >= 1000
            },
            {
                id: 'treasure_master',
                name: 'Treasure Master',
                description: 'Collect 10,000 items',
                icon: '👑',
                category: 'collector',
                tier: 'platinum',
                check: (player) => player.stats.itemsCollected >= 10000
            },

            // Rarity Achievements
            {
                id: 'rare_find',
                name: 'Rare Find',
                description: 'Collect your first rare item',
                icon: '💎',
                category: 'rarity',
                tier: 'bronze',
                check: (player) => player.inventory.gems > 0
            },
            {
                id: 'epic_discovery',
                name: 'Epic Discovery',
                description: 'Collect your first epic item',
                icon: '🏆',
                category: 'rarity',
                tier: 'silver',
                check: (player) => player.inventory.trophies > 0
            },
            {
                id: 'legendary_hunter',
                name: 'Legendary Hunter',
                description: 'Collect your first legendary item',
                icon: '🗝️',
                category: 'rarity',
                tier: 'gold',
                check: (player) => player.inventory.keys > 0
            },
            {
                id: 'legend_master',
                name: 'Legend Master',
                description: 'Collect 10 legendary items',
                icon: '⚡',
                category: 'rarity',
                tier: 'platinum',
                check: (player) => player.inventory.keys >= 10
            },

            // Level Achievements
            {
                id: 'novice',
                name: 'Novice',
                description: 'Reach level 5',
                icon: '🌱',
                category: 'level',
                tier: 'bronze',
                check: (player) => player.level >= 5
            },
            {
                id: 'experienced',
                name: 'Experienced',
                description: 'Reach level 25',
                icon: '⭐',
                category: 'level',
                tier: 'silver',
                check: (player) => player.level >= 25
            },
            {
                id: 'expert',
                name: 'Expert',
                description: 'Reach level 50',
                icon: '💫',
                category: 'level',
                tier: 'gold',
                check: (player) => player.level >= 50
            },
            {
                id: 'master',
                name: 'Master',
                description: 'Reach level 100',
                icon: '🏅',
                category: 'level',
                tier: 'platinum',
                check: (player) => player.level >= 100
            },

            // Special Achievements
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Travel 1 km in under 1 minute',
                icon: '🚀',
                category: 'special',
                tier: 'gold',
                check: (player) => false // Requires special tracking
            },
            {
                id: 'mission_master',
                name: 'Mission Master',
                description: 'Complete 50 missions',
                icon: '🎯',
                category: 'special',
                tier: 'gold',
                check: (player) => player.stats.missionsCompleted >= 50
            },
            {
                id: 'daily_devotee',
                name: 'Daily Devotee',
                description: 'Log in for 7 consecutive days',
                icon: '📅',
                category: 'special',
                tier: 'silver',
                check: (player) => player.stats.loginDays >= 7
            },
            {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Be one of the first 100 players',
                icon: '🐦',
                category: 'special',
                tier: 'platinum',
                check: (player) => false // Requires server tracking
            }
        ];
    }

    checkAll() {
        const player = this.gameEngine.player;
        let newUnlocks = [];

        this.achievements.forEach(achievement => {
            // Skip if already unlocked
            if (this.isUnlocked(achievement.id)) return;

            // Check if criteria met
            if (achievement.check(player)) {
                this.unlock(achievement);
                newUnlocks.push(achievement);
            }
        });

        return newUnlocks;
    }

    unlock(achievement) {
        if (this.isUnlocked(achievement.id)) return;

        const unlocked = {
            id: achievement.id,
            unlockedAt: new Date().toISOString()
        };

        this.unlockedAchievements.push(unlocked);
        this.save();

        // Show notification
        this.showUnlockNotification(achievement);

        // Award bonus XP based on tier
        const bonusXP = {
            bronze: 100,
            silver: 250,
            gold: 500,
            platinum: 1000
        };

        this.gameEngine.addXP(bonusXP[achievement.tier] || 100, `achievement: ${achievement.name}`);

        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
    }

    showUnlockNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = `achievement-notification ${achievement.tier}`;
        notification.innerHTML = `
            <div class="achievement-header">
                <span class="achievement-icon">${achievement.icon}</span>
                <div>
                    <div class="achievement-title">ACHIEVEMENT UNLOCKED!</div>
                    <div class="achievement-tier">${achievement.tier.toUpperCase()}</div>
                </div>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }

    isUnlocked(achievementId) {
        return this.unlockedAchievements.some(a => a.id === achievementId);
    }

    getProgress() {
        const total = this.achievements.length;
        const unlocked = this.unlockedAchievements.length;
        return {
            total,
            unlocked,
            percent: (unlocked / total) * 100,
            remaining: total - unlocked
        };
    }

    getByCategory(category) {
        return this.achievements.filter(a => a.category === category);
    }

    getByTier(tier) {
        return this.achievements.filter(a => a.tier === tier);
    }

    getUnlocked() {
        return this.achievements.filter(a => this.isUnlocked(a.id));
    }

    getLocked() {
        return this.achievements.filter(a => !this.isUnlocked(a.id));
    }

    save() {
        this.storageManager.data.achievements = this.unlockedAchievements;
        this.storageManager.save();
    }
}
