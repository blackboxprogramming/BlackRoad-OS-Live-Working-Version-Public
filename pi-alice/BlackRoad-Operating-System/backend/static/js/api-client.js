/**
 * BlackRoad OS API Client
 * Centralized API communication module
 */

class ApiClient {
    constructor() {
        // Determine API base URL based on environment
        this.baseUrl = this.getApiBaseUrl();
        this.token = localStorage.getItem('blackroad_token');
    }

    /**
     * Get API base URL (development vs production)
     */
    getApiBaseUrl() {
        // In production on Railway, API and front-end are served from same origin
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Local development - backend on port 8000
            return 'http://localhost:8000';
        } else if (hostname === 'www.blackroad.systems' || hostname.includes('railway.app')) {
            // Production - same origin
            return window.location.origin;
        } else {
            // Default to same origin
            return window.location.origin;
        }
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('blackroad_token', token);
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('blackroad_token');
    }

    /**
     * Get current token
     */
    getToken() {
        return this.token;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get request headers
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Make API request
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const {
            includeAuth = true,
            headers: customHeaders = {},
            rawBody = false,
            ...fetchOptions
        } = options;

        const headers = {
            ...this.getHeaders(includeAuth),
            ...customHeaders,
        };

        const config = {
            method,
            headers,
            ...fetchOptions,
        };

        if (data !== null && data !== undefined) {
            config.body = rawBody ? data : JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.clearToken();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                throw new Error('Session expired. Please log in again.');
            }

            // Handle non-2xx responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${method} ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    /**
     * POST request
     */
    async post(endpoint, data = null, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    /**
     * PUT request
     */
    async put(endpoint, data = null, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    // ===== Authentication API =====

    async register(username, email, password, fullName = null) {
        return this.post('/api/auth/register', {
            username,
            email,
            password,
            full_name: fullName
        }, { includeAuth: false });
    }

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await this.request('POST', '/api/auth/login', formData, {
            includeAuth: false,
            rawBody: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.access_token) {
            this.setToken(response.access_token);
        }

        return response;
    }

    async logout() {
        try {
            await this.post('/api/auth/logout');
        } finally {
            this.clearToken();
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    }

    async getCurrentUser() {
        return this.get('/api/auth/me');
    }

    // ===== Blockchain/Wallet API =====

    async getWallet() {
        return this.get('/api/blockchain/wallet');
    }

    async getBalance() {
        return this.get('/api/blockchain/balance');
    }

    async getTransactions(limit = 10, offset = 0) {
        return this.get(`/api/blockchain/transactions?limit=${limit}&offset=${offset}`);
    }

    async getTransaction(txHash) {
        return this.get(`/api/blockchain/transactions/${txHash}`);
    }

    async createTransaction(toAddress, amount) {
        return this.post('/api/blockchain/transactions', {
            to_address: toAddress,
            amount
        });
    }

    async getBlocks(limit = 10, offset = 0) {
        return this.get(`/api/blockchain/blocks?limit=${limit}&offset=${offset}`);
    }

    async getBlock(blockId) {
        return this.get(`/api/blockchain/blocks/${blockId}`);
    }

    async mineBlock() {
        return this.post('/api/blockchain/mine');
    }

    async getBlockchainStats() {
        return this.get('/api/blockchain/stats');
    }

    // ===== Miner API =====

    async getMinerStatus() {
        return this.get('/api/miner/status');
    }

    async getMinerStats() {
        return this.get('/api/miner/stats');
    }

    async getMinedBlocks(limit = 10) {
        return this.get(`/api/miner/blocks?limit=${limit}`);
    }

    async controlMiner(action, poolUrl = null, workerId = null) {
        return this.post('/api/miner/control', {
            action,
            pool_url: poolUrl,
            worker_id: workerId
        });
    }

    async getPoolInfo() {
        return this.get('/api/miner/pool/info');
    }

    // ===== Devices API =====

    async getDevices() {
        return this.get('/api/devices/');
    }

    async getDeviceStats() {
        return this.get('/api/devices/stats');
    }

    async getDevice(deviceId) {
        return this.get(`/api/devices/${deviceId}`);
    }

    async createDevice(deviceData) {
        return this.post('/api/devices/', deviceData);
    }

    async updateDevice(deviceId, deviceData) {
        return this.put(`/api/devices/${deviceId}`, deviceData);
    }

    async deleteDevice(deviceId) {
        return this.delete(`/api/devices/${deviceId}`);
    }

    // ===== Email API =====

    async getEmailFolders() {
        return this.get('/api/email/folders');
    }

    async getEmails(folder = 'inbox', limit = 50, offset = 0) {
        const endpoint = folder === 'inbox'
            ? `/api/email/inbox?limit=${limit}&offset=${offset}`
            : `/api/email/sent?limit=${limit}&offset=${offset}`;
        return this.get(endpoint);
    }

    async getEmail(emailId) {
        return this.get(`/api/email/${emailId}`);
    }

    async sendEmail(to, subject, body, cc = null, bcc = null) {
        return this.post('/api/email/send', {
            to,
            subject,
            body,
            cc,
            bcc
        });
    }

    async deleteEmail(emailId) {
        return this.delete(`/api/email/${emailId}`);
    }

    // ===== Social API =====

    async getSocialFeed(limit = 20, offset = 0) {
        return this.get(`/api/social/feed?limit=${limit}&offset=${offset}`);
    }

    async createPost(content, images = null, videos = null) {
        return this.post('/api/social/posts', {
            content,
            images,
            videos
        });
    }

    async likePost(postId) {
        return this.post(`/api/social/posts/${postId}/like`);
    }

    async getComments(postId) {
        return this.get(`/api/social/posts/${postId}/comments`);
    }

    async addComment(postId, content) {
        return this.post(`/api/social/posts/${postId}/comments`, {
            content
        });
    }

    async followUser(userId) {
        return this.post(`/api/social/users/${userId}/follow`);
    }

    // ===== Video API =====

    async getVideos(limit = 20, offset = 0) {
        return this.get(`/api/videos?limit=${limit}&offset=${offset}`);
    }

    async getVideo(videoId) {
        return this.get(`/api/videos/${videoId}`);
    }

    async likeVideo(videoId) {
        return this.post(`/api/videos/${videoId}/like`);
    }

    // ===== AI Chat API =====

    async getConversations() {
        return this.get('/api/ai-chat/conversations');
    }

    async createConversation(title = 'New Conversation') {
        return this.post('/api/ai-chat/conversations', { title });
    }

    async getConversation(conversationId) {
        return this.get(`/api/ai-chat/conversations/${conversationId}`);
    }

    async getMessages(conversationId) {
        return this.get(`/api/ai-chat/conversations/${conversationId}/messages`);
    }

    async sendMessage(conversationId, message) {
        return this.post(`/api/ai-chat/conversations/${conversationId}/messages`, {
            content: message
        });
    }

    async deleteConversation(conversationId) {
        return this.delete(`/api/ai-chat/conversations/${conversationId}`);
    }

    // ===== Files API =====

    async getFolders() {
        return this.get('/api/files/folders');
    }

    async getFiles(folderId = null) {
        const endpoint = folderId
            ? `/api/files?folder_id=${folderId}`
            : '/api/files';
        return this.get(endpoint);
    }

    async getFile(fileId) {
        return this.get(`/api/files/${fileId}`);
    }

    async deleteFile(fileId) {
        return this.delete(`/api/files/${fileId}`);
    }

    // ===== IP Vault API =====

    async createLEO(idea, author = 'Alexa', title = null) {
        return this.post('/api/vault/leos', {
            idea,
            author,
            title
        });
    }

    async getLEOs(page = 1, perPage = 20, author = null) {
        let endpoint = `/api/vault/leos?page=${page}&per_page=${perPage}`;
        if (author) {
            endpoint += `&author=${encodeURIComponent(author)}`;
        }
        return this.get(endpoint);
    }

    async getLEO(leoId) {
        return this.get(`/api/vault/leos/${leoId}`);
    }

    async anchorLEO(leoId, chain = 'bitcoin') {
        return this.post(`/api/vault/leos/${leoId}/anchor`, {
            chain
        });
    }

    async getLEOEvents(leoId) {
        return this.get(`/api/vault/leos/${leoId}/events`);
    }
}

// Create singleton instance
const api = new ApiClient();

// Export for use in other modules
window.BlackRoadAPI = api;
