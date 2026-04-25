/**
 * BlackRoad OS Application Modules
 * Handles data loading and UI updates for all desktop applications
 */

class BlackRoadApps {
    constructor() {
        this.api = window.BlackRoadAPI;
        this.refreshIntervals = {};
        this.aiChatState = {
            conversations: [],
            activeConversationId: null,
            messages: [],
            loadingMessages: false,
            sendingMessage: false,
        };
    }

    /**
     * Initialize all apps when user logs in
     */
    initialize() {
        // Listen for login event
        window.addEventListener('auth:login', () => {
            this.loadAllApps();
        });

        // Listen for window open events to load data on-demand
        this.setupWindowListeners();
    }

    /**
     * Load all apps data
     */
    async loadAllApps() {
        // Load critical apps immediately
        await Promise.all([
            this.loadWallet(),
            this.loadMinerStats(),
            this.loadBlockchainStats(),
        ]);

        // Load other apps in the background
        setTimeout(() => {
            this.loadDevices();
            this.loadEmailInbox();
            this.loadSocialFeed();
            this.loadVideos();
        }, 1000);
    }

    /**
     * Setup listeners for window open events
     */
    setupWindowListeners() {
        // Override the global openWindow function to load data when windows open
        const originalOpenWindow = window.openWindow;
        window.openWindow = (id) => {
            originalOpenWindow(id);
            this.onWindowOpened(id);
        };
    }

    /**
     * Handle window opened event
     */
    onWindowOpened(windowId) {
        switch (windowId) {
            case 'roadcoin-miner':
                this.loadMinerStatus();
                this.startMinerRefresh();
                break;
            case 'roadchain':
                this.loadBlockchainExplorer();
                break;
            case 'wallet':
                this.loadWallet();
                break;
            case 'raspberry-pi':
                this.loadDevices();
                break;
            case 'roadmail':
                this.loadEmailInbox();
                break;
            case 'blackroad-social':
                this.loadSocialFeed();
                break;
            case 'blackstream':
                this.loadVideos();
                break;
            case 'ai-chat':
                this.loadAIChat();
                break;
            case 'ip-vault':
                this.loadIPVault();
                break;
        }
    }

    /**
     * Start auto-refresh for a window
     */
    startRefresh(windowId, callback, interval = 5000) {
        this.stopRefresh(windowId);
        this.refreshIntervals[windowId] = setInterval(callback, interval);
    }

    /**
     * Stop auto-refresh for a window
     */
    stopRefresh(windowId) {
        if (this.refreshIntervals[windowId]) {
            clearInterval(this.refreshIntervals[windowId]);
            delete this.refreshIntervals[windowId];
        }
    }

    // ===== MINER APPLICATION =====

    async loadMinerStatus() {
        try {
            const [status, stats, blocks] = await Promise.all([
                this.api.getMinerStatus(),
                this.api.getMinerStats(),
                this.api.getMinedBlocks(5),
            ]);

            this.updateMinerUI(status, stats, blocks);
        } catch (error) {
            console.error('Failed to load miner status:', error);
        }
    }

    async loadMinerStats() {
        try {
            const stats = await this.api.getMinerStats();
            this.updateMinerStatsInTaskbar(stats);
        } catch (error) {
            console.error('Failed to load miner stats:', error);
        }
    }

    updateMinerUI(status, stats, blocks) {
        const content = document.querySelector('#roadcoin-miner .window-content');
        if (!content) return;

        const statusColor = status.is_mining ? '#2ecc40' : '#ff4136';
        const statusText = status.is_mining ? 'MINING' : 'STOPPED';

        content.innerHTML = `
            <div class="miner-dashboard">
                <div class="miner-header">
                    <h2>⛏️ RoadCoin Miner</h2>
                    <div class="miner-status" style="color: ${statusColor}; font-weight: bold;">
                        ${statusText}
                    </div>
                </div>

                <div class="miner-stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Hashrate</div>
                        <div class="stat-value">${status.hashrate_mhs.toFixed(2)} MH/s</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Shares</div>
                        <div class="stat-value">${status.shares_accepted}/${status.shares_submitted}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Temperature</div>
                        <div class="stat-value">${status.temperature_celsius.toFixed(1)}°C</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Power</div>
                        <div class="stat-value">${status.power_watts.toFixed(0)}W</div>
                    </div>
                </div>

                <div class="miner-lifetime-stats">
                    <h3>Lifetime Statistics</h3>
                    <div class="stat-row">
                        <span>Blocks Mined:</span>
                        <span><strong>${stats.blocks_mined}</strong></span>
                    </div>
                    <div class="stat-row">
                        <span>RoadCoins Earned:</span>
                        <span><strong>${stats.roadcoins_earned.toFixed(2)} RC</strong></span>
                    </div>
                    <div class="stat-row">
                        <span>Pool:</span>
                        <span>${status.pool_url}</span>
                    </div>
                </div>

                <div class="miner-recent-blocks">
                    <h3>Recent Blocks</h3>
                    <div class="blocks-list">
                        ${blocks.length > 0 ? blocks.map(block => `
                            <div class="block-item">
                                <span>Block #${block.block_index}</span>
                                <span>${block.reward.toFixed(2)} RC</span>
                                <span class="text-muted">${this.formatTime(block.timestamp)}</span>
                            </div>
                        `).join('') : '<div class="text-muted">No blocks mined yet</div>'}
                    </div>
                </div>

                <div class="miner-controls">
                    <button class="btn ${status.is_mining ? 'btn-danger' : 'btn-success'}"
                            onclick="window.BlackRoadApps.toggleMiner()">
                        ${status.is_mining ? 'Stop Mining' : 'Start Mining'}
                    </button>
                </div>
            </div>
        `;
    }

    updateMinerStatsInTaskbar(stats) {
        // Update system tray icon tooltip or status
        const trayIcon = document.querySelector('.system-tray span:last-child');
        if (trayIcon) {
            trayIcon.title = `Mining: ${stats.blocks_mined} blocks, ${stats.roadcoins_earned.toFixed(2)} RC earned`;
        }
    }

    async toggleMiner() {
        try {
            const status = await this.api.getMinerStatus();
            const action = status.is_mining ? 'stop' : 'start';
            await this.api.controlMiner(action);
            await this.loadMinerStatus();
        } catch (error) {
            console.error('Failed to toggle miner:', error);
            alert('Failed to control miner: ' + error.message);
        }
    }

    startMinerRefresh() {
        this.startRefresh('roadcoin-miner', () => this.loadMinerStatus(), 5000);
    }

    // ===== BLOCKCHAIN EXPLORER =====

    async loadBlockchainExplorer() {
        try {
            const [stats, blocks] = await Promise.all([
                this.api.getBlockchainStats(),
                this.api.getBlocks(10),
            ]);

            this.updateBlockchainUI(stats, blocks);
        } catch (error) {
            console.error('Failed to load blockchain data:', error);
        }
    }

    async loadBlockchainStats() {
        try {
            const stats = await this.api.getBlockchainStats();
            this.updateBlockchainStatsInTaskbar(stats);
        } catch (error) {
            console.error('Failed to load blockchain stats:', error);
        }
    }

    updateBlockchainUI(stats, blocks) {
        const content = document.querySelector('#roadchain .window-content');
        if (!content) return;

        content.innerHTML = `
            <div class="blockchain-explorer">
                <div class="explorer-header">
                    <h2>⛓️ RoadChain Explorer</h2>
                </div>

                <div class="blockchain-stats">
                    <div class="stat-card">
                        <div class="stat-label">Chain Height</div>
                        <div class="stat-value">${stats.total_blocks}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Transactions</div>
                        <div class="stat-value">${stats.total_transactions}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Difficulty</div>
                        <div class="stat-value">${stats.difficulty}</div>
                    </div>
                </div>

                <div class="recent-blocks">
                    <h3>Recent Blocks</h3>
                    <div class="blocks-table">
                        ${blocks.map(block => `
                            <div class="block-row" onclick="window.BlackRoadApps.showBlockDetail(${block.id})">
                                <div class="block-index">#${block.index}</div>
                                <div class="block-hash">${block.hash.substring(0, 16)}...</div>
                                <div class="block-txs">${block.transactions?.length || 0} txs</div>
                                <div class="block-time">${this.formatTime(block.timestamp)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="explorer-actions">
                    <button class="btn btn-primary" onclick="window.BlackRoadApps.mineNewBlock()">
                        Mine New Block
                    </button>
                </div>
            </div>
        `;
    }

    updateBlockchainStatsInTaskbar(stats) {
        // Could update a taskbar indicator
    }

    async mineNewBlock() {
        try {
            const result = await this.api.mineBlock();
            alert(`Successfully mined block #${result.index}! Reward: ${result.reward} RC`);
            await this.loadBlockchainExplorer();
            await this.loadWallet();
        } catch (error) {
            console.error('Failed to mine block:', error);
            alert('Failed to mine block: ' + error.message);
        }
    }

    showBlockDetail(blockId) {
        // TODO: Open block detail modal
        console.log('Show block detail:', blockId);
    }

    // ===== WALLET =====

    async loadWallet() {
        try {
            const [wallet, balance, transactions] = await Promise.all([
                this.api.getWallet(),
                this.api.getBalance(),
                this.api.getTransactions(10),
            ]);

            this.updateWalletUI(wallet, balance, transactions);
        } catch (error) {
            console.error('Failed to load wallet:', error);
        }
    }

    updateWalletUI(wallet, balance, transactions) {
        const content = document.querySelector('#wallet .window-content');
        if (!content) return;

        const usdValue = balance.balance * 15; // Mock conversion rate

        content.innerHTML = `
            <div class="wallet-container">
                <div class="wallet-header">
                    <h2>💰 RoadCoin Wallet</h2>
                </div>

                <div class="wallet-balance">
                    <div class="balance-amount">${balance.balance.toFixed(8)} RC</div>
                    <div class="balance-usd">≈ $${usdValue.toFixed(2)} USD</div>
                </div>

                <div class="wallet-address">
                    <label>Your Address:</label>
                    <div class="address-field">
                        <input type="text" readonly value="${wallet.address}"
                               onclick="this.select()" style="width: 100%; font-size: 9px;" />
                    </div>
                </div>

                <div class="wallet-transactions">
                    <h3>Recent Transactions</h3>
                    <div class="transactions-list">
                        ${transactions.length > 0 ? transactions.map(tx => {
                            const isReceived = tx.to_address === wallet.address;
                            const sign = isReceived ? '+' : '-';
                            const color = isReceived ? '#2ecc40' : '#ff4136';
                            return `
                                <div class="transaction-item">
                                    <div class="tx-type" style="color: ${color};">${sign}${tx.amount.toFixed(4)} RC</div>
                                    <div class="tx-hash">${tx.hash.substring(0, 12)}...</div>
                                    <div class="tx-time">${this.formatTime(tx.created_at)}</div>
                                </div>
                            `;
                        }).join('') : '<div class="text-muted">No transactions yet</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    // ===== DEVICES (RASPBERRY PI) =====

    async loadDevices() {
        try {
            const [devices, stats] = await Promise.all([
                this.api.getDevices(),
                this.api.getDeviceStats(),
            ]);

            this.updateDevicesUI(devices, stats);
        } catch (error) {
            console.error('Failed to load devices:', error);
            // Show stub UI if no devices yet
            this.updateDevicesUI([], {
                total_devices: 0,
                online_devices: 0,
                offline_devices: 0,
                total_cpu_usage: 0,
                total_ram_usage: 0,
                average_temperature: 0,
            });
        }
    }

    updateDevicesUI(devices, stats) {
        const content = document.querySelector('#raspberry-pi .window-content');
        if (!content) return;

        content.innerHTML = `
            <div class="devices-container">
                <div class="devices-header">
                    <h2>🥧 Device Manager</h2>
                    <div class="devices-stats">
                        <span class="text-success">${stats.online_devices} online</span> /
                        <span class="text-muted">${stats.total_devices} total</span>
                    </div>
                </div>

                <div class="devices-list">
                    ${devices.length > 0 ? devices.map(device => {
                        const statusColor = device.is_online ? '#2ecc40' : '#aaa';
                        const statusText = device.is_online ? '🟢 Online' : '🔴 Offline';
                        return `
                            <div class="device-card">
                                <div class="device-name">
                                    <strong>${device.name}</strong>
                                    <span class="device-type">${device.device_type}</span>
                                </div>
                                <div class="device-status" style="color: ${statusColor};">
                                    ${statusText}
                                </div>
                                ${device.is_online ? `
                                    <div class="device-metrics">
                                        <div class="metric">CPU: ${device.cpu_usage_percent?.toFixed(1) || 0}%</div>
                                        <div class="metric">RAM: ${device.ram_usage_percent?.toFixed(1) || 0}%</div>
                                        <div class="metric">Temp: ${device.temperature_celsius?.toFixed(1) || 0}°C</div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('') : `
                        <div class="no-devices">
                            <p>No devices registered yet.</p>
                            <p class="text-muted">Deploy a device agent to see your Raspberry Pi, Jetson, and other IoT devices here.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // ===== EMAIL =====

    async loadEmailInbox() {
        try {
            const emails = await this.api.getEmails('inbox', 20);
            this.updateEmailUI(emails);
        } catch (error) {
            console.error('Failed to load emails:', error);
        }
    }

    updateEmailUI(emails) {
        const emailList = document.querySelector('#roadmail .email-list');
        if (!emailList) return;

        if (emails.length === 0) {
            emailList.innerHTML = '<div class="text-muted" style="padding: 10px;">No emails yet</div>';
            return;
        }

        emailList.innerHTML = emails.map(email => `
            <div class="email-item ${email.is_read ? '' : 'unread'}" onclick="window.BlackRoadApps.openEmail(${email.id})">
                <div class="email-from">${email.sender || 'Unknown'}</div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-date">${this.formatTime(email.created_at)}</div>
            </div>
        `).join('');
    }

    openEmail(emailId) {
        console.log('Open email:', emailId);
        // TODO: Show email detail
    }

    // ===== SOCIAL FEED =====

    async loadSocialFeed() {
        try {
            const feed = await this.api.getSocialFeed(20);
            this.updateSocialUI(feed);
        } catch (error) {
            console.error('Failed to load social feed:', error);
        }
    }

    updateSocialUI(posts) {
        const feedContainer = document.querySelector('#blackroad-social .social-feed');
        if (!feedContainer) return;

        if (posts.length === 0) {
            feedContainer.innerHTML = '<div class="text-muted">No posts yet. Be the first to post!</div>';
            return;
        }

        feedContainer.innerHTML = posts.map(post => `
            <div class="post-card">
                <div class="post-author">
                    <strong>${post.author?.username || 'Anonymous'}</strong>
                    <span class="text-muted">${this.formatTime(post.created_at)}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="btn-link" onclick="window.BlackRoadApps.likePost(${post.id})">
                        ❤️ ${post.likes_count || 0}
                    </button>
                    <button class="btn-link">💬 ${post.comments_count || 0}</button>
                </div>
            </div>
        `).join('');
    }

    async likePost(postId) {
        try {
            await this.api.likePost(postId);
            await this.loadSocialFeed();
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    }

    // ===== VIDEOS =====

    async loadVideos() {
        try {
            const videos = await this.api.getVideos(20);
            this.updateVideosUI(videos);
        } catch (error) {
            console.error('Failed to load videos:', error);
        }
    }

    updateVideosUI(videos) {
        const videoGrid = document.querySelector('#blackstream .video-grid');
        if (!videoGrid) return;

        if (videos.length === 0) {
            videoGrid.innerHTML = '<div class="text-muted">No videos available</div>';
            return;
        }

        videoGrid.innerHTML = videos.map(video => `
            <div class="video-card" onclick="window.BlackRoadApps.playVideo(${video.id})">
                <div class="video-thumbnail">📹</div>
                <div class="video-title">${video.title}</div>
                <div class="video-stats">
                    <span>👁️ ${video.views || 0}</span>
                    <span>❤️ ${video.likes || 0}</span>
                </div>
            </div>
        `).join('');
    }

    playVideo(videoId) {
        console.log('Play video:', videoId);
        // TODO: Open video player
    }

    // ===== AI CHAT =====

    async loadAIChat() {
        const content = document.querySelector('#ai-chat .window-content');
        if (!content) return;

        content.innerHTML = `
            <div class="ai-chat-container" style="display: flex; gap: 15px; height: 100%;">
                <div class="chat-sidebar" style="width: 220px; border-right: 1px solid #ddd; display: flex; flex-direction: column;">
                    <div class="chat-sidebar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 14px;">Conversations</h3>
                        <button class="btn btn-secondary" style="font-size: 11px; padding: 3px 8px;" onclick="window.BlackRoadApps.createAIConversation()">+ New</button>
                    </div>
                    <div id="ai-chat-conversations" class="chat-conversations" style="flex: 1; overflow-y: auto; font-size: 11px; padding-right: 5px;">
                        <div class="text-muted">Loading conversations...</div>
                    </div>
                </div>
                <div class="chat-main" style="flex: 1; display: flex; flex-direction: column;">
                    <div class="chat-messages" id="ai-chat-messages" style="flex: 1; overflow-y: auto; background: #f7f7f7; border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 12px;">
                        <div class="text-muted">Loading conversations...</div>
                    </div>
                    <div class="chat-input" style="display: flex; gap: 10px; margin-top: 10px;">
                        <input type="text" id="ai-chat-input" placeholder="Type your message..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
                        <button class="btn btn-primary" id="ai-chat-send-btn" onclick="window.BlackRoadApps.sendAIMessage()">Send</button>
                    </div>
                </div>
            </div>
        `;

        await this.fetchAIConversations({ selectFirst: true });
        if (this.aiChatState.activeConversationId) {
            await this.fetchAIMessages(this.aiChatState.activeConversationId);
        } else {
            this.updateAIChatMessagesUI();
        }
    }

    async fetchAIConversations({ selectFirst = false } = {}) {
        const container = document.getElementById('ai-chat-conversations');
        if (container && !this.aiChatState.conversations.length) {
            container.innerHTML = '<div class="text-muted">Loading conversations...</div>';
        }

        try {
            const conversations = await this.api.getConversations();
            this.aiChatState.conversations = conversations;

            if (selectFirst && conversations.length && !this.aiChatState.activeConversationId) {
                this.aiChatState.activeConversationId = conversations[0].id;
            }

            if (this.aiChatState.activeConversationId) {
                const exists = conversations.some(conv => conv.id === this.aiChatState.activeConversationId);
                if (!exists) {
                    this.aiChatState.activeConversationId = conversations[0]?.id || null;
                }
            }

            this.updateAIChatConversationsUI();
        } catch (error) {
            console.error('Failed to load AI chat conversations:', error);
            if (container) {
                container.innerHTML = `<div style="color: #d9534f;">${this.escapeHtml(error.message || 'Unable to load conversations')}</div>`;
            }
        }
    }

    updateAIChatConversationsUI() {
        const container = document.getElementById('ai-chat-conversations');
        if (!container) return;

        const { conversations, activeConversationId } = this.aiChatState;

        if (!conversations.length) {
            container.innerHTML = '<div class="text-muted">No conversations yet. Create one to start chatting.</div>';
            return;
        }

        container.innerHTML = conversations.map(convo => `
            <div class="chat-conversation ${convo.id === activeConversationId ? 'active' : ''}"
                onclick="window.BlackRoadApps.selectAIConversation(${convo.id})"
                style="padding: 8px; border-radius: 4px; margin-bottom: 4px; cursor: pointer; ${convo.id === activeConversationId ? 'background: #0d6efd; color: #fff;' : 'background: #f0f0f0;'}">
                <div style="font-weight: 600;">${this.escapeHtml(convo.title || 'Untitled')}</div>
                <div style="font-size: 10px; opacity: 0.8;">${convo.message_count || 0} messages</div>
            </div>
        `).join('');
    }

    async selectAIConversation(conversationId) {
        if (this.aiChatState.activeConversationId === conversationId && !this.aiChatState.loadingMessages) {
            return;
        }

        this.aiChatState.activeConversationId = conversationId;
        this.updateAIChatConversationsUI();
        await this.fetchAIMessages(conversationId);
    }

    async createAIConversation() {
        try {
            const conversation = await this.api.createConversation('New Conversation');
            this.aiChatState.conversations = [conversation, ...this.aiChatState.conversations];
            this.aiChatState.activeConversationId = conversation.id;
            this.aiChatState.messages = [];
            this.updateAIChatConversationsUI();
            this.updateAIChatMessagesUI();
            const input = document.getElementById('ai-chat-input');
            if (input) input.focus();
            return conversation;
        } catch (error) {
            console.error('Failed to create AI conversation:', error);
            const container = document.getElementById('ai-chat-conversations');
            if (container) {
                container.insertAdjacentHTML('afterbegin', `<div style="color: #d9534f; margin-bottom: 6px;">${this.escapeHtml(error.message || 'Unable to create conversation')}</div>`);
            }
            return null;
        }
    }

    async fetchAIMessages(conversationId) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '<div class="text-muted">Loading messages...</div>';
        }

        if (!conversationId) {
            this.aiChatState.messages = [];
            this.updateAIChatMessagesUI();
            return;
        }

        this.aiChatState.loadingMessages = true;

        try {
            const messages = await this.api.getMessages(conversationId);
            this.aiChatState.messages = messages;
            this.updateAIChatMessagesUI();
        } catch (error) {
            console.error('Failed to load AI chat messages:', error);
            if (messagesContainer) {
                messagesContainer.innerHTML = `<div style="color: #d9534f;">${this.escapeHtml(error.message || 'Unable to load messages')}</div>`;
            }
        } finally {
            this.aiChatState.loadingMessages = false;
        }
    }

    updateAIChatMessagesUI() {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;

        const { activeConversationId, messages } = this.aiChatState;

        if (!activeConversationId) {
            container.innerHTML = '<div class="text-muted">Select a conversation or create a new one to start chatting.</div>';
            return;
        }

        if (!messages.length) {
            container.innerHTML = '<div class="text-muted">No messages yet. Say hello!</div>';
            return;
        }

        container.innerHTML = messages.map(message => `
            <div class="chat-message" style="margin-bottom: 12px; display: flex; flex-direction: column; align-items: ${message.role === 'assistant' ? 'flex-start' : 'flex-end'};">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666;">
                    ${message.role === 'assistant' ? 'AI Assistant' : 'You'}
                </div>
                <div style="background: ${message.role === 'assistant' ? '#ffffff' : '#d1ecf1'}; border: 1px solid #ddd; padding: 8px 10px; border-radius: 8px; max-width: 80%; white-space: pre-wrap;">
                    ${this.escapeHtml(message.content)}
                </div>
            </div>
        `).join('');

        this.scrollAIChatToBottom();
    }

    scrollAIChatToBottom() {
        const container = document.getElementById('ai-chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    async sendAIMessage() {
        const input = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send-btn');
        if (!input) return;

        const message = input.value.trim();
        if (!message || this.aiChatState.sendingMessage) return;

        this.aiChatState.sendingMessage = true;
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
        }

        let conversationId = this.aiChatState.activeConversationId;

        try {
            if (!conversationId) {
                const conversation = await this.createAIConversation();
                conversationId = conversation?.id;
            }

            if (!conversationId) {
                throw new Error('Unable to start a new conversation');
            }

            // Optimistic user message
            this.aiChatState.messages = [
                ...this.aiChatState.messages,
                {
                    id: `temp-${Date.now()}`,
                    role: 'user',
                    content: message,
                    created_at: new Date().toISOString()
                }
            ];
            this.updateAIChatMessagesUI();
            input.value = '';

            await this.api.sendMessage(conversationId, message);
            await this.fetchAIMessages(conversationId);
            await this.fetchAIConversations();
        } catch (error) {
            console.error('Failed to send AI chat message:', error);
            const messagesContainer = document.getElementById('ai-chat-messages');
            if (messagesContainer) {
                messagesContainer.insertAdjacentHTML('beforeend', `<div style="color: #d9534f; margin-top: 8px;">${this.escapeHtml(error.message || 'Failed to send message')}</div>`);
            }
        } finally {
            this.aiChatState.sendingMessage = false;
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
            }
        }
    }

    // ===== IP VAULT APPLICATION =====

    async loadIPVault() {
        try {
            const response = await this.api.getLEOs(1, 20);
            this.updateIPVaultUI(response);
        } catch (error) {
            console.error('Failed to load IP Vault:', error);
        }
    }

    updateIPVaultUI(response) {
        const content = document.querySelector('#ip-vault .window-content');
        if (!content) return;

        const { leos, total, page, per_page } = response;

        content.innerHTML = `
            <div class="ip-vault-container" style="padding: 20px;">
                <div class="vault-header" style="margin-bottom: 20px;">
                    <h2 style="margin: 0 0 10px 0;">🔐 IP Vault</h2>
                    <p style="color: #666; font-size: 12px; margin: 0;">Cryptographic proof-of-origin for your ideas</p>
                </div>

                <div class="vault-form" style="background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Title (optional):</label>
                        <input type="text" id="vault-title-input"
                            style="width: 100%; padding: 8px; border: 1px solid #ccc; font-family: 'MS Sans Serif', Arial, sans-serif;"
                            placeholder="e.g. Quantum ledger architecture">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Idea:</label>
                        <textarea id="vault-idea-input"
                            style="width: 100%; height: 100px; padding: 8px; border: 1px solid #ccc; font-family: 'MS Sans Serif', Arial, sans-serif; resize: vertical;"
                            placeholder="Enter your idea or concept here..."></textarea>
                    </div>
                    <button onclick="window.BlackRoadApps.vaultIdea()"
                        style="padding: 8px 20px; background: #0078d7; color: white; border: none; cursor: pointer; font-weight: bold;">
                        🔒 Vault This
                    </button>
                    <div id="vault-status" style="margin-top: 10px; color: #666; font-size: 12px;"></div>
                </div>

                <div class="vault-list">
                    <h3 style="margin: 0 0 15px 0;">Recent Vaulted Ideas (${total} total)</h3>
                    <div class="leo-list" style="max-height: 300px; overflow-y: auto;">
                        ${leos.length > 0 ? leos.map(leo => `
                            <div class="leo-item" style="background: white; border: 1px solid #ccc; padding: 12px; margin-bottom: 10px; cursor: pointer;"
                                onclick="window.BlackRoadApps.viewLEO('${leo.id}')">
                                <div style="font-weight: bold; margin-bottom: 5px;">
                                    ${this.escapeHtml(leo.title || 'Untitled')}
                                </div>
                                <div style="font-size: 11px; color: #666; margin-bottom: 5px;">
                                    by ${this.escapeHtml(leo.author)} • ${this.formatTime(leo.created_at)}
                                </div>
                                <div style="font-size: 10px; font-family: monospace; color: #999;">
                                    SHA-256: ${leo.sha256.substring(0, 32)}...
                                </div>
                                <div style="font-size: 10px; margin-top: 5px;">
                                    Status: <span style="color: ${leo.anchor_status === 'anchored' ? '#2ecc40' : '#ff851b'}; font-weight: bold;">
                                        ${leo.anchor_status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        `).join('') : '<div style="color: #666; text-align: center; padding: 40px;">No vaulted ideas yet. Create your first one above!</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    async vaultIdea() {
        const titleInput = document.getElementById('vault-title-input');
        const ideaInput = document.getElementById('vault-idea-input');
        const statusDiv = document.getElementById('vault-status');

        const title = titleInput?.value.trim() || null;
        const idea = ideaInput?.value.trim();

        if (!idea) {
            if (statusDiv) statusDiv.innerHTML = '<span style="color: #d9534f;">Please enter an idea to vault.</span>';
            return;
        }

        try {
            if (statusDiv) statusDiv.innerHTML = '<span style="color: #0078d7;">Vaulting...</span>';

            const leo = await this.api.createLEO(idea, 'Alexa', title);

            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color: #2ecc40;">✓ Vaulted successfully! LEO ID: ${leo.id.substring(0, 8)}...</span>`;
            }

            // Clear inputs
            if (titleInput) titleInput.value = '';
            if (ideaInput) ideaInput.value = '';

            // Reload the list
            setTimeout(() => {
                this.loadIPVault();
            }, 1000);

        } catch (error) {
            console.error('Failed to vault idea:', error);
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color: #d9534f;">Failed to vault: ${this.escapeHtml(error.message || 'Unknown error')}</span>`;
            }
        }
    }

    async viewLEO(leoId) {
        try {
            const leo = await this.api.getLEO(leoId);

            // Create a modal/dialog to show LEO details
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
            modal.onclick = () => modal.remove();

            const dialog = document.createElement('div');
            dialog.style.cssText = 'background: white; padding: 20px; max-width: 600px; max-height: 80vh; overflow-y: auto; border: 2px solid #0078d7;';
            dialog.onclick = (e) => e.stopPropagation();

            dialog.innerHTML = `
                <h2 style="margin: 0 0 15px 0;">🔐 LEO Details</h2>

                <div style="margin-bottom: 20px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Title:</div>
                    <div style="margin-bottom: 15px;">${this.escapeHtml(leo.title || 'Untitled')}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">Author:</div>
                    <div style="margin-bottom: 15px;">${this.escapeHtml(leo.author)}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">Created:</div>
                    <div style="margin-bottom: 15px;">${new Date(leo.created_at).toLocaleString()}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">LEO ID:</div>
                    <div style="font-family: monospace; font-size: 11px; background: #f5f5f5; padding: 5px; margin-bottom: 15px;">${leo.id}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">SHA-256:</div>
                    <div style="font-family: monospace; font-size: 10px; background: #f5f5f5; padding: 5px; word-break: break-all; margin-bottom: 15px;">${leo.sha256}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">SHA-512:</div>
                    <div style="font-family: monospace; font-size: 10px; background: #f5f5f5; padding: 5px; word-break: break-all; margin-bottom: 15px;">${leo.sha512}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">Keccak-256 (Ethereum-compatible):</div>
                    <div style="font-family: monospace; font-size: 10px; background: #f5f5f5; padding: 5px; word-break: break-all; margin-bottom: 15px;">${leo.keccak256}</div>

                    <div style="font-weight: bold; margin-bottom: 5px;">Anchor Status:</div>
                    <div style="margin-bottom: 15px;">
                        <span style="color: ${leo.anchor_status === 'anchored' ? '#2ecc40' : '#ff851b'}; font-weight: bold;">
                            ${leo.anchor_status.toUpperCase()}
                        </span>
                        ${leo.anchor_txid ? `<br><span style="font-size: 11px;">TX: ${leo.anchor_txid}</span>` : ''}
                    </div>
                </div>

                <div style="margin-bottom: 20px; padding: 10px; background: #fffef0; border-left: 3px solid #ffdc00;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Verification Instructions:</div>
                    <div style="font-size: 11px; white-space: pre-wrap;">${this.escapeHtml(leo.verification_text)}</div>
                </div>

                <button onclick="this.parentElement.parentElement.remove()"
                    style="padding: 8px 20px; background: #0078d7; color: white; border: none; cursor: pointer; font-weight: bold;">
                    Close
                </button>
            `;

            modal.appendChild(dialog);
            document.body.appendChild(modal);

        } catch (error) {
            console.error('Failed to load LEO details:', error);
            alert('Failed to load LEO details: ' + (error.message || 'Unknown error'));
        }
    }

    // ===== UTILITY FUNCTIONS =====

    escapeHtml(value) {
        if (typeof value !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return value.replace(/[&<>"']/g, (char) => map[char]);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return date.toLocaleDateString();
    }
}

// Create singleton instance
const blackRoadApps = new BlackRoadApps();
window.BlackRoadApps = blackRoadApps;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        blackRoadApps.initialize();
    });
} else {
    blackRoadApps.initialize();
}
