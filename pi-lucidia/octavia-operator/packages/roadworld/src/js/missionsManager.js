export class MissionsManager {
    constructor(gameEngine, storageManager) {
        this.gameEngine = gameEngine;
        this.storageManager = storageManager;
        this.missions = [];
        this.dailyMissions = [];
        this.storyMissions = [];
    }

    init() {
        // Load missions from storage
        const saved = this.storageManager.data.missions || {};
        this.missions = saved.active || [];
        this.dailyMissions = saved.daily || [];
        this.storyMissions = saved.story || [];

        // Check if we need to generate new daily missions
        this.checkDailyReset();

        // Generate initial missions if none exist
        if (this.missions.length === 0) {
            this.generateDailyMissions();
            this.generateStoryMission();
        }
    }

    checkDailyReset() {
        const lastReset = this.storageManager.data.lastDailyReset;
        const now = new Date();
        const today = now.toDateString();

        if (!lastReset || lastReset !== today) {
            console.log('🌅 New day! Generating fresh daily missions');
            this.resetDailyMissions();
            this.storageManager.data.lastDailyReset = today;
            this.storageManager.save();
        }
    }

    resetDailyMissions() {
        // Remove old daily missions
        this.missions = this.missions.filter(m => m.type !== 'daily');
        this.dailyMissions = [];

        // Generate new ones
        this.generateDailyMissions();
    }

    generateDailyMissions() {
        const dailyTemplates = [
            {
                id: 'daily_collect',
                name: 'Treasure Hunter',
                description: 'Collect {target} items',
                type: 'collect',
                target: Math.floor(Math.random() * 20) + 10, // 10-30 items
                reward: { xp: 500, coins: 100 }
            },
            {
                id: 'daily_distance',
                name: 'World Traveler',
                description: 'Travel {target} kilometers',
                type: 'distance',
                target: Math.floor(Math.random() * 5) + 1, // 1-5 km
                reward: { xp: 300, coins: 75 }
            },
            {
                id: 'daily_rare',
                name: 'Rare Hunter',
                description: 'Collect {target} rare or better items',
                type: 'collect_rare',
                target: Math.floor(Math.random() * 5) + 3, // 3-8 rares
                reward: { xp: 750, coins: 150 }
            },
            {
                id: 'daily_locations',
                name: 'Explorer',
                description: 'Discover {target} new locations',
                type: 'discover',
                target: Math.floor(Math.random() * 5) + 3, // 3-8 locations
                reward: { xp: 400, coins: 100 }
            }
        ];

        // Pick 3 random daily missions
        const shuffled = [...dailyTemplates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        selected.forEach((template, index) => {
            const mission = {
                id: `${template.id}_${Date.now()}_${index}`,
                name: template.name,
                description: template.description.replace('{target}', template.target),
                type: 'daily',
                category: template.type,
                target: template.target,
                progress: 0,
                reward: template.reward,
                completed: false,
                claimed: false,
                expiresAt: this.getEndOfDay()
            };

            this.missions.push(mission);
            this.dailyMissions.push(mission);
        });

        this.save();
    }

    generateStoryMission() {
        const player = this.gameEngine.player;
        const level = player.level;

        // Story missions unlock at certain levels
        const storyTemplates = [
            {
                minLevel: 1,
                id: 'story_first_steps',
                name: 'First Steps',
                description: 'Reach level 5',
                type: 'level',
                target: 5,
                reward: { xp: 1000, trophy: true }
            },
            {
                minLevel: 5,
                id: 'story_collector',
                name: 'The Collector',
                description: 'Collect 100 total items',
                type: 'total_collect',
                target: 100,
                reward: { xp: 2000, trophy: true }
            },
            {
                minLevel: 10,
                id: 'story_wanderer',
                name: 'The Wanderer',
                description: 'Travel a total of 25 kilometers',
                type: 'total_distance',
                target: 25000, // in meters
                reward: { xp: 3000, trophy: true }
            },
            {
                minLevel: 15,
                id: 'story_legend_hunter',
                name: 'Legend Hunter',
                description: 'Find your first legendary item',
                type: 'find_legendary',
                target: 1,
                reward: { xp: 5000, trophy: true }
            }
        ];

        // Find next available story mission
        const available = storyTemplates.find(t =>
            t.minLevel <= level &&
            !this.missions.some(m => m.id.includes(t.id))
        );

        if (available) {
            const mission = {
                id: `${available.id}_${Date.now()}`,
                name: available.name,
                description: available.description,
                type: 'story',
                category: available.type,
                target: available.target,
                progress: 0,
                reward: available.reward,
                completed: false,
                claimed: false
            };

            this.missions.push(mission);
            this.storyMissions.push(mission);
            this.save();

            console.log(`📜 New story mission unlocked: ${mission.name}`);
        }
    }

    updateProgress(event, data) {
        let updated = false;

        this.missions.forEach(mission => {
            if (mission.completed) return;

            switch (mission.category) {
                case 'collect':
                    if (event === 'item_collected') {
                        mission.progress++;
                        updated = true;
                    }
                    break;

                case 'collect_rare':
                    if (event === 'item_collected' &&
                        ['rare', 'epic', 'legendary'].includes(data.rarity)) {
                        mission.progress++;
                        updated = true;
                    }
                    break;

                case 'distance':
                    if (event === 'player_moved') {
                        mission.progress += data.distance / 1000; // Convert to km
                        updated = true;
                    }
                    break;

                case 'discover':
                    if (event === 'location_discovered') {
                        mission.progress++;
                        updated = true;
                    }
                    break;

                case 'level':
                    mission.progress = this.gameEngine.player.level;
                    updated = true;
                    break;

                case 'total_collect':
                    mission.progress = this.gameEngine.player.stats.itemsCollected;
                    updated = true;
                    break;

                case 'total_distance':
                    mission.progress = this.gameEngine.player.stats.distanceTraveled;
                    updated = true;
                    break;

                case 'find_legendary':
                    if (event === 'item_collected' && data.rarity === 'legendary') {
                        mission.progress++;
                        updated = true;
                    }
                    break;
            }

            // Check if completed
            if (mission.progress >= mission.target && !mission.completed) {
                mission.completed = true;
                this.onMissionCompleted(mission);
            }
        });

        if (updated) {
            this.save();
        }
    }

    onMissionCompleted(mission) {
        console.log(`✅ Mission completed: ${mission.name}`);

        // Show notification
        this.showCompletionNotification(mission);
    }

    showCompletionNotification(mission) {
        const notification = document.createElement('div');
        notification.className = 'mission-complete-notification';
        notification.innerHTML = `
            <div class="mission-complete-header">
                <span class="mission-complete-icon">✅</span>
                <span class="mission-complete-title">MISSION COMPLETE!</span>
            </div>
            <div class="mission-complete-name">${mission.name}</div>
            <div class="mission-complete-reward">
                ${mission.reward.xp ? `+${mission.reward.xp} XP` : ''}
                ${mission.reward.coins ? ` | +${mission.reward.coins} 🪙` : ''}
                ${mission.reward.trophy ? ' | 🏆 Trophy' : ''}
            </div>
            <button class="mission-claim-btn" data-mission-id="${mission.id}">
                Claim Reward
            </button>
        `;

        document.body.appendChild(notification);

        // Position it
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.zIndex = '10000';

        // Add click handler
        const claimBtn = notification.querySelector('.mission-claim-btn');
        claimBtn.addEventListener('click', () => {
            this.claimReward(mission);
            document.body.removeChild(notification);
        });

        // Show animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    claimReward(mission) {
        if (mission.claimed) return;

        mission.claimed = true;

        // Award rewards
        if (mission.reward.xp) {
            this.gameEngine.addXP(mission.reward.xp, `mission: ${mission.name}`);
        }

        if (mission.reward.coins) {
            this.gameEngine.player.inventory.coins =
                (this.gameEngine.player.inventory.coins || 0) + mission.reward.coins;
        }

        if (mission.reward.trophy) {
            this.gameEngine.player.inventory.trophies++;
        }

        // Update stats
        this.gameEngine.player.stats.missionsCompleted++;

        this.save();
        this.gameEngine.savePlayer();

        // Check if we should generate new story mission
        if (mission.type === 'story') {
            setTimeout(() => this.generateStoryMission(), 1000);
        }
    }

    getActiveMissions() {
        return this.missions.filter(m => !m.completed);
    }

    getCompletedMissions() {
        return this.missions.filter(m => m.completed && !m.claimed);
    }

    getMissionProgress(mission) {
        const percent = Math.min(100, (mission.progress / mission.target) * 100);
        return {
            percent,
            current: mission.progress,
            target: mission.target,
            remaining: mission.target - mission.progress
        };
    }

    getEndOfDay() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString();
    }

    save() {
        this.storageManager.data.missions = {
            active: this.missions,
            daily: this.dailyMissions,
            story: this.storyMissions
        };
        this.storageManager.save();
    }
}
