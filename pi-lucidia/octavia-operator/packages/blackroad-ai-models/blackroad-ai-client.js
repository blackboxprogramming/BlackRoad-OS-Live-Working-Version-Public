/**
 * 🤖 BlackRoad AI Client Library
 * Universal client for all BlackRoad AI models
 * Works in Node.js, browsers, React, Next.js, etc.
 */

class BlackRoadAI {
    constructor(config = {}) {
        this.gatewayUrl = config.gatewayUrl || 'http://localhost:7000';
        this.defaultModel = config.defaultModel || 'auto';
        this.sessionId = config.sessionId || this.generateSessionId();
        this.useMemory = config.useMemory !== false;
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Chat with AI
     * @param {string} message - Your message
     * @param {object} options - Optional parameters
     * @returns {Promise<object>} AI response
     */
    async chat(message, options = {}) {
        const response = await fetch(`${this.gatewayUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                model: options.model || this.defaultModel,
                specific_model: options.specificModel,
                max_tokens: options.maxTokens || 512,
                temperature: options.temperature || 0.7,
                use_memory: options.useMemory !== undefined ? options.useMemory : this.useMemory,
                enable_actions: options.enableActions !== false,
                session_id: options.sessionId || this.sessionId,
                prefer_node: options.preferNode
            })
        });

        if (!response.ok) {
            throw new Error(`AI request failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Stream chat response (future enhancement)
     */
    async *chatStream(message, options = {}) {
        // TODO: Implement streaming
        const response = await this.chat(message, options);
        yield response;
    }

    /**
     * Get cluster health
     */
    async health() {
        const response = await fetch(`${this.gatewayUrl}/health`);
        return response.json();
    }

    /**
     * List available models
     */
    async models() {
        const response = await fetch(`${this.gatewayUrl}/models`);
        return response.json();
    }

    /**
     * Broadcast message to all nodes
     */
    async broadcast(message) {
        const response = await fetch(`${this.gatewayUrl}/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return response.json();
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlackRoadAI;
}
if (typeof window !== 'undefined') {
    window.BlackRoadAI = BlackRoadAI;
}

/* Usage Examples:

// Simple usage
const ai = new BlackRoadAI();
const response = await ai.chat("Hello!");
console.log(response.response);

// With options
const ai = new BlackRoadAI({
    gatewayUrl: 'http://192.168.4.38:7000',
    defaultModel: 'qwen',
    sessionId: 'user-123'
});

const response = await ai.chat("Explain quantum computing", {
    maxTokens: 1000,
    temperature: 0.8,
    enableActions: true
});

// Check health
const health = await ai.health();
console.log(`Healthy nodes: ${health.healthy_nodes}/${health.total_nodes}`);

// List models
const models = await ai.models();
console.log(models);

// React example
function ChatComponent() {
    const [ai] = useState(() => new BlackRoadAI());
    const [response, setResponse] = useState('');

    const handleSubmit = async (message) => {
        const result = await ai.chat(message);
        setResponse(result.response);
    };

    return <div>...</div>;
}

*/
