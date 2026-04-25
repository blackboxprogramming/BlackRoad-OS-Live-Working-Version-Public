/**
 * LEITL Dashboard - Live Everyone In The Loop
 *
 * Real-time dashboard showing:
 * - Active AI sessions
 * - Live activity feed
 * - WebDAV context status
 * - Message broadcasts
 */

window.Apps = window.Apps || {};

window.Apps.LEITL = {
  // State
  sessions: [],
  messages: [],
  activities: [],
  ws: null,
  currentSessionId: null,
  refreshInterval: null,

  /**
   * Initialize LEITL Dashboard
   */
  init() {
    console.log('LEITL Dashboard initialized');
    this.render();
    this.startAutoRefresh();
  },

  /**
   * Render dashboard UI
   */
  render() {
    const container = document.getElementById('leitl-container');
    if (!container) {
      console.error('LEITL container not found');
      return;
    }

    container.innerHTML = `
      <div style="padding: 20px; font-family: 'MS Sans Serif', Arial, sans-serif;">
        <!-- Header -->
        <div style="margin-bottom: 20px; padding: 10px; background: linear-gradient(180deg, #000080, #1084d0); color: white; border-radius: 4px;">
          <h1 style="margin: 0; font-size: 18px;">🔥 LEITL Dashboard</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Live Everyone In The Loop - Multi-Agent Collaboration</p>
        </div>

        <!-- Status Bar -->
        <div id="leitl-status" style="margin-bottom: 15px; padding: 10px; background: #c0c0c0; border: 2px solid #808080; font-size: 11px;">
          Status: <span id="leitl-status-text">Loading...</span>
        </div>

        <!-- Quick Start Section -->
        <div style="margin-bottom: 20px; padding: 15px; background: #ffffff; border: 2px solid #000080;">
          <h2 style="margin: 0 0 10px 0; font-size: 14px; color: #000080;">🚀 Quick Start</h2>
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="leitl-agent-name" placeholder="Agent Name (e.g., Cece)"
              style="flex: 1; padding: 5px; border: 1px solid #808080; font-family: 'MS Sans Serif';" />
            <input type="text" id="leitl-webdav-url" placeholder="WebDAV URL (optional)"
              style="flex: 2; padding: 5px; border: 1px solid #808080; font-family: 'MS Sans Serif';" />
          </div>
          <button onclick="window.Apps.LEITL.quickStart()"
            style="padding: 6px 12px; background: #c0c0c0; border: 2px outset #ffffff; cursor: pointer; font-family: 'MS Sans Serif';">
            🔥 Start LEITL Session
          </button>
          <button onclick="window.Apps.LEITL.disconnectSession()"
            style="padding: 6px 12px; background: #c0c0c0; border: 2px outset #ffffff; cursor: pointer; font-family: 'MS Sans Serif'; margin-left: 5px;">
            ⛔ Disconnect
          </button>
        </div>

        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <!-- Active Sessions -->
          <div style="background: #ffffff; border: 2px solid #808080; padding: 10px;">
            <h2 style="margin: 0 0 10px 0; font-size: 13px; color: #000080;">👥 Active Sessions</h2>
            <div id="leitl-sessions" style="max-height: 300px; overflow-y: auto; font-size: 11px;">
              Loading sessions...
            </div>
          </div>

          <!-- Recent Messages -->
          <div style="background: #ffffff; border: 2px solid #808080; padding: 10px;">
            <h2 style="margin: 0 0 10px 0; font-size: 13px; color: #000080;">📨 Recent Messages</h2>
            <div id="leitl-messages" style="max-height: 300px; overflow-y: auto; font-size: 11px;">
              Loading messages...
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div style="background: #ffffff; border: 2px solid #808080; padding: 10px;">
          <h2 style="margin: 0 0 10px 0; font-size: 13px; color: #000080;">📊 Live Activity Feed</h2>
          <div id="leitl-activity" style="max-height: 200px; overflow-y: auto; font-size: 11px;">
            Loading activity...
          </div>
        </div>

        <!-- WebSocket Status -->
        <div id="leitl-ws-status" style="margin-top: 15px; padding: 8px; background: #ffffe1; border: 1px solid #808080; font-size: 11px; display: none;">
          WebSocket: <span id="leitl-ws-status-text">Not connected</span>
        </div>
      </div>
    `;

    // Load initial data
    this.loadSessions();
    this.loadMessages();
    this.loadActivity();
  },

  /**
   * Quick start a new LEITL session
   */
  async quickStart() {
    const agentName = document.getElementById('leitl-agent-name').value.trim();
    const webdavUrl = document.getElementById('leitl-webdav-url').value.trim();

    if (!agentName) {
      alert('Please enter an agent name!');
      return;
    }

    try {
      this.updateStatus('Starting LEITL session...', 'info');

      // Build query params
      const params = new URLSearchParams({
        agent_name: agentName
      });

      if (webdavUrl) {
        params.append('webdav_url', webdavUrl);
      }

      // Call quick-start endpoint
      const response = await fetch(`/api/leitl/quick-start?${params.toString()}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`);
      }

      const data = await response.json();

      // Save session ID
      this.currentSessionId = data.session.session_id;

      // Connect WebSocket
      this.connectWebSocket(data.session.websocket_url);

      // Update UI
      this.updateStatus(`Session started: ${data.session.session_id}`, 'success');

      // Show WebDAV context if available
      if (data.context && data.context.matched_files) {
        console.log('WebDAV Context:', data.context);
        alert(`WebDAV Context loaded! Found ${data.context.total_matches} matching files.`);
      }

      // Refresh displays
      this.loadSessions();

    } catch (error) {
      console.error('Quick start error:', error);
      this.updateStatus(`Error: ${error.message}`, 'error');
      alert(`Error starting session: ${error.message}`);
    }
  },

  /**
   * Connect to WebSocket
   */
  connectWebSocket(wsUrl) {
    // Convert http:// to ws:// if needed
    if (wsUrl.startsWith('http://')) {
      wsUrl = wsUrl.replace('http://', 'ws://');
    } else if (wsUrl.startsWith('https://')) {
      wsUrl = wsUrl.replace('https://', 'wss://');
    }

    // Show WebSocket status
    document.getElementById('leitl-ws-status').style.display = 'block';
    document.getElementById('leitl-ws-status-text').textContent = 'Connecting...';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        document.getElementById('leitl-ws-status-text').textContent = 'Connected ✅';

        // Start sending heartbeats
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);

        // Handle different message types
        if (message.event_type === 'connection.established') {
          console.log('Connection established');
        } else if (message.event_type === 'heartbeat.confirmed') {
          console.log('Heartbeat confirmed');
        } else {
          // New broadcast message - refresh UI
          this.loadMessages();
          this.loadActivity();
          this.loadSessions();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        document.getElementById('leitl-ws-status-text').textContent = 'Error ❌';
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        document.getElementById('leitl-ws-status-text').textContent = 'Disconnected ⚠️';

        // Stop heartbeat
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      document.getElementById('leitl-ws-status-text').textContent = `Error: ${error.message}`;
    }
  },

  /**
   * Start sending heartbeats
   */
  startHeartbeat() {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'heartbeat',
          current_task: 'Monitoring LEITL dashboard'
        }));
      }
    }, 30000);
  },

  /**
   * Disconnect session
   */
  async disconnectSession() {
    if (!this.currentSessionId) {
      alert('No active session to disconnect');
      return;
    }

    try {
      // Close WebSocket
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      // End session
      await fetch(`/api/leitl/session/${this.currentSessionId}/end`, {
        method: 'POST'
      });

      this.updateStatus('Session disconnected', 'info');
      this.currentSessionId = null;

      // Hide WebSocket status
      document.getElementById('leitl-ws-status').style.display = 'none';

      // Refresh sessions
      this.loadSessions();

    } catch (error) {
      console.error('Disconnect error:', error);
      this.updateStatus(`Error disconnecting: ${error.message}`, 'error');
    }
  },

  /**
   * Load active sessions
   */
  async loadSessions() {
    try {
      const response = await fetch('/api/leitl/sessions/active');
      const data = await response.json();

      this.sessions = data.sessions || [];
      this.renderSessions();

    } catch (error) {
      console.error('Error loading sessions:', error);
      document.getElementById('leitl-sessions').innerHTML =
        `<div style="color: red;">Error loading sessions</div>`;
    }
  },

  /**
   * Render sessions list
   */
  renderSessions() {
    const container = document.getElementById('leitl-sessions');

    if (this.sessions.length === 0) {
      container.innerHTML = '<div style="color: #808080;">No active sessions</div>';
      return;
    }

    const html = this.sessions.map(session => `
      <div style="margin-bottom: 10px; padding: 8px; background: ${session.session_id === this.currentSessionId ? '#ffffe1' : '#f0f0f0'}; border: 1px solid #808080;">
        <div style="font-weight: bold; color: #000080;">
          ${session.agent_name} ${session.session_id === this.currentSessionId ? '(You)' : ''}
        </div>
        <div style="font-size: 10px; color: #606060; margin-top: 2px;">
          ID: ${session.session_id}
        </div>
        <div style="font-size: 10px; color: #606060;">
          Status: ${session.status} | Uptime: ${session.uptime}
        </div>
        ${session.current_task ? `<div style="font-size: 10px; color: #008000; margin-top: 2px;">Task: ${session.current_task}</div>` : ''}
      </div>
    `).join('');

    container.innerHTML = html;
  },

  /**
   * Load recent messages
   */
  async loadMessages() {
    try {
      const response = await fetch('/api/leitl/messages/recent?limit=10');
      const data = await response.json();

      this.messages = data.messages || [];
      this.renderMessages();

    } catch (error) {
      console.error('Error loading messages:', error);
      document.getElementById('leitl-messages').innerHTML =
        `<div style="color: red;">Error loading messages</div>`;
    }
  },

  /**
   * Render messages list
   */
  renderMessages() {
    const container = document.getElementById('leitl-messages');

    if (this.messages.length === 0) {
      container.innerHTML = '<div style="color: #808080;">No messages yet</div>';
      return;
    }

    const html = this.messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const eventEmoji = this.getEventEmoji(msg.event_type);

      return `
        <div style="margin-bottom: 8px; padding: 6px; background: #f0f0f0; border-left: 3px solid #000080;">
          <div style="font-size: 10px; color: #808080;">${time}</div>
          <div style="font-weight: bold; font-size: 11px; margin-top: 2px;">
            ${eventEmoji} ${msg.event_type}
          </div>
          <div style="font-size: 10px; color: #606060; margin-top: 2px;">
            Session: ${msg.session_id.split('-').pop()}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  /**
   * Load activity log
   */
  async loadActivity() {
    try {
      const response = await fetch('/api/leitl/activity?limit=20');
      const data = await response.json();

      this.activities = data.activities || [];
      this.renderActivity();

    } catch (error) {
      console.error('Error loading activity:', error);
      document.getElementById('leitl-activity').innerHTML =
        `<div style="color: red;">Error loading activity</div>`;
    }
  },

  /**
   * Render activity feed
   */
  renderActivity() {
    const container = document.getElementById('leitl-activity');

    if (this.activities.length === 0) {
      container.innerHTML = '<div style="color: #808080;">No activity yet</div>';
      return;
    }

    const html = this.activities.map(activity => {
      const time = new Date(activity.timestamp).toLocaleTimeString();
      const eventEmoji = this.getEventEmoji(activity.event_type);

      return `
        <div style="margin-bottom: 6px; padding: 4px; font-size: 10px; background: #f9f9f9; border-left: 2px solid #c0c0c0;">
          <span style="color: #808080;">${time}</span> -
          <span>${eventEmoji} ${activity.event_type}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  /**
   * Get emoji for event type
   */
  getEventEmoji(eventType) {
    const emojiMap = {
      'session.started': '🟢',
      'session.ended': '🔴',
      'session.heartbeat': '💚',
      'task.started': '▶️',
      'task.completed': '✅',
      'context.updated': '📁',
      'broadcast.message': '📢',
      'connection.established': '🔌',
      'heartbeat.confirmed': '💓'
    };

    return emojiMap[eventType] || '📋';
  },

  /**
   * Update status bar
   */
  updateStatus(text, type = 'info') {
    const statusEl = document.getElementById('leitl-status-text');
    if (statusEl) {
      statusEl.textContent = text;

      const colors = {
        info: '#000000',
        success: '#008000',
        error: '#ff0000',
        warning: '#ff8800'
      };

      statusEl.style.color = colors[type] || colors.info;
    }
  },

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    // Refresh every 5 seconds
    this.refreshInterval = setInterval(() => {
      this.loadSessions();
      this.loadMessages();
      this.loadActivity();
    }, 5000);
  },

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  /**
   * Cleanup on app close
   */
  cleanup() {
    this.stopAutoRefresh();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
};
