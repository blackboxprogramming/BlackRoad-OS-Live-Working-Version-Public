/**
 * BlackRoad Metaverse - API Client
 * Backend integration for AI agents & multiplayer
 */

class APIClient {
    constructor(baseURL = 'https://api.blackroad.io') {
        this.baseURL = baseURL;
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.eventHandlers = {};
    }
    
    /**
     * Connect to WebSocket for real-time features
     */
    connectWebSocket() {
        const wsURL = this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
        
        try {
            this.ws = new WebSocket(wsURL + '/ws');
            
            this.ws.onopen = () => {
                console.log('🔌 Connected to backend');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
            
            this.ws.onclose = () => {
                console.log('🔌 Disconnected from backend');
                this.isConnected = false;
                this.emit('disconnected');
                this.attemptReconnect();
            };
            
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }
    
    /**
     * Attempt to reconnect with exponential backoff
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return;
        }
        
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectAttempts++;
        
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => this.connectWebSocket(), delay);
    }
    
    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(data) {
        const { type, payload } = data;
        
        switch(type) {
            case 'agent_response':
                this.emit('agentResponse', payload);
                break;
            case 'player_joined':
                this.emit('playerJoined', payload);
                break;
            case 'player_left':
                this.emit('playerLeft', payload);
                break;
            case 'player_moved':
                this.emit('playerMoved', payload);
                break;
            case 'world_update':
                this.emit('worldUpdate', payload);
                break;
            default:
                console.log('Unknown message type:', type);
        }
    }
    
    /**
     * Send message to agent
     */
    async sendToAgent(agentName, message) {
        if (!this.isConnected) {
            console.warn('Not connected to backend');
            return null;
        }
        
        const payload = {
            type: 'agent_message',
            payload: {
                agent: agentName,
                message: message,
                timestamp: Date.now()
            }
        };
        
        this.ws.send(JSON.stringify(payload));
    }
    
    /**
     * Update player position
     */
    updatePosition(x, y, z) {
        if (!this.isConnected) return;
        
        const payload = {
            type: 'player_position',
            payload: { x, y, z, timestamp: Date.now() }
        };
        
        this.ws.send(JSON.stringify(payload));
    }
    
    /**
     * Save player state to backend
     */
    async savePlayerState(state) {
        try {
            const response = await fetch(`${this.baseURL}/api/player/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Failed to save state:', error);
            return null;
        }
    }
    
    /**
     * Load player state from backend
     */
    async loadPlayerState(playerId) {
        try {
            const response = await fetch(`${this.baseURL}/api/player/${playerId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to load state:', error);
            return null;
        }
    }
    
    /**
     * Event system
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }
    
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }
    
    /**
     * Disconnect and cleanup
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}
