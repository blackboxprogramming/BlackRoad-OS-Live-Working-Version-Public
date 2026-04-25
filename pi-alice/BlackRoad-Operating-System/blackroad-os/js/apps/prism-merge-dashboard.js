/**
 * Prism Merge Dashboard
 *
 * Real-time visualization of GitHub merge queue and PR automation.
 * Part of Phase Q - Merge Queue & Automation Strategy.
 *
 * Related docs: MERGE_QUEUE_PLAN.md, OPERATOR_PR_EVENT_HANDLERS.md
 */

window.Apps = window.Apps || {}

window.Apps.PrismMergeDashboard = {
  name: 'Merge Queue Dashboard',
  version: '1.0.0',

  // Dashboard state
  state: {
    queuedPRs: [],
    mergingPRs: [],
    recentMerges: [],
    metrics: {
      prsPerDay: 0,
      avgTimeToMerge: 0,
      autoMergeRate: 0,
      failureRate: 0
    },
    wsConnection: null
  },

  /**
   * Initialize dashboard
   */
  init() {
    console.log('Initializing Prism Merge Dashboard...')

    // Connect to WebSocket for real-time updates
    this.connectWebSocket()

    // Load initial data
    this.loadDashboardData()

    // Set up auto-refresh
    setInterval(() => this.loadDashboardData(), 60000) // Refresh every minute
  },

  /**
   * Connect to WebSocket for real-time GitHub events
   */
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/prism`

    try {
      this.state.wsConnection = new WebSocket(wsUrl)

      this.state.wsConnection.onopen = () => {
        console.log('✅ WebSocket connected')
      }

      this.state.wsConnection.onmessage = (event) => {
        const message = JSON.parse(event.data)
        this.handleWebSocketMessage(message)
      }

      this.state.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.state.wsConnection.onclose = () => {
        console.log('WebSocket closed, reconnecting in 5s...')
        setTimeout(() => this.connectWebSocket(), 5000)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  },

  /**
   * Handle incoming WebSocket messages
   */
  handleWebSocketMessage(message) {
    console.log('GitHub Event:', message)

    switch (message.type) {
      case 'github:pr_opened':
        this.onPROpened(message.data)
        break
      case 'github:pr_approved':
        this.onPRApproved(message.data)
        break
      case 'github:pr_entered_queue':
        this.onPREnteredQueue(message.data)
        break
      case 'github:pr_check_completed':
        this.onCheckCompleted(message.data)
        break
      case 'github:pr_closed':
        this.onPRClosed(message.data)
        break
      default:
        console.log('Unknown event type:', message.type)
    }

    // Refresh dashboard after event
    this.render()
  },

  /**
   * Load dashboard data from API
   */
  async loadDashboardData() {
    try {
      // Fetch queue data
      const queueResponse = await fetch('/api/github/merge-queue')
      const queueData = await queueResponse.json()

      this.state.queuedPRs = queueData.queued || []
      this.state.mergingPRs = queueData.merging || []
      this.state.recentMerges = queueData.recent || []

      // Fetch metrics
      const metricsResponse = await fetch('/api/github/metrics')
      const metricsData = await metricsResponse.json()

      this.state.metrics = metricsData

      this.render()
    } catch (error) {
      console.error('Failed to load dashboard data:', error)

      // Use mock data for demonstration
      this.useMockData()
    }
  },

  /**
   * Use mock data when API is unavailable
   */
  useMockData() {
    this.state.queuedPRs = [
      { number: 123, title: 'Add user authentication', status: 'testing', enteredAt: new Date(Date.now() - 300000) },
      { number: 124, title: 'Update API documentation', status: 'ready', enteredAt: new Date(Date.now() - 120000) },
      { number: 125, title: 'Fix CORS issue', status: 'rebasing', enteredAt: new Date(Date.now() - 60000) }
    ]

    this.state.metrics = {
      prsPerDay: 12,
      avgTimeToMerge: 45,
      autoMergeRate: 87,
      failureRate: 3
    }

    this.render()
  },

  /**
   * Event handlers
   */
  onPROpened(data) {
    console.log(`PR #${data.pr_number} opened: ${data.title}`)
    this.showNotification(`New PR #${data.pr_number}`, data.title, 'info')
  },

  onPRApproved(data) {
    console.log(`PR #${data.pr_number} approved by ${data.reviewer}`)
    this.showNotification(`PR #${data.pr_number} Approved`, `By ${data.reviewer}`, 'success')
  },

  onPREnteredQueue(data) {
    console.log(`PR #${data.pr_number} entered queue at position ${data.position}`)
    this.showNotification(`PR #${data.pr_number} Queued`, `Position: ${data.position}`, 'info')

    // Add to queued PRs
    this.state.queuedPRs.push({
      number: data.pr_number,
      status: 'queued',
      position: data.position,
      enteredAt: new Date()
    })
  },

  onCheckCompleted(data) {
    console.log(`PR #${data.pr_number} check '${data.check_name}': ${data.result}`)

    if (data.result === 'failure') {
      this.showNotification(`PR #${data.pr_number} Check Failed`, data.check_name, 'error')
    }
  },

  onPRClosed(data) {
    if (data.merged) {
      console.log(`PR #${data.pr_number} merged successfully`)
      this.showNotification(`PR #${data.pr_number} Merged`, 'Successfully merged to main', 'success')

      // Remove from queue
      this.state.queuedPRs = this.state.queuedPRs.filter(pr => pr.number !== data.pr_number)

      // Add to recent merges
      this.state.recentMerges.unshift({
        number: data.pr_number,
        mergedAt: new Date()
      })

      // Keep only last 10
      this.state.recentMerges = this.state.recentMerges.slice(0, 10)
    } else {
      console.log(`PR #${data.pr_number} closed without merge`)
      this.state.queuedPRs = this.state.queuedPRs.filter(pr => pr.number !== data.pr_number)
    }
  },

  /**
   * Show notification
   */
  showNotification(title, message, type) {
    // Use OS notification system if available
    if (window.OS && window.OS.showNotification) {
      window.OS.showNotification({
        title,
        message,
        type,
        duration: 5000
      })
    } else {
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
    }
  },

  /**
   * Render dashboard UI
   */
  render() {
    const { queuedPRs, mergingPRs, recentMerges, metrics } = this.state

    return `
      <div class="prism-merge-dashboard">
        <div class="dashboard-header">
          <h1>🌌 Merge Queue Dashboard</h1>
          <div class="status-badge ${queuedPRs.length > 0 ? 'active' : 'idle'}">
            ${queuedPRs.length > 0 ? '🟢 Queue Active' : '⚪ Queue Idle'}
          </div>
        </div>

        <!-- Metrics Summary -->
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-value">${queuedPRs.length}</div>
            <div class="metric-label">Queued PRs</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${mergingPRs.length}</div>
            <div class="metric-label">Merging</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.prsPerDay}</div>
            <div class="metric-label">PRs/Day</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.avgTimeToMerge}m</div>
            <div class="metric-label">Avg Time</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.autoMergeRate}%</div>
            <div class="metric-label">Auto-Merge</div>
          </div>
        </div>

        <!-- Queue List -->
        <div class="queue-section">
          <h2>📋 Merge Queue</h2>
          ${queuedPRs.length === 0
            ? '<p class="empty-state">No PRs in queue</p>'
            : this.renderQueueList(queuedPRs)
          }
        </div>

        <!-- Recent Merges -->
        <div class="recent-section">
          <h2>✅ Recent Merges</h2>
          ${recentMerges.length === 0
            ? '<p class="empty-state">No recent merges</p>'
            : this.renderRecentMerges(recentMerges)
          }
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>⚡ Quick Actions</h2>
          <button onclick="Apps.PrismMergeDashboard.refreshData()">🔄 Refresh</button>
          <button onclick="Apps.PrismMergeDashboard.openGitHub()">📊 View on GitHub</button>
          <button onclick="Apps.PrismMergeDashboard.exportMetrics()">📥 Export Metrics</button>
        </div>
      </div>

      <style>
        .prism-merge-dashboard {
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
        }
        .status-badge.active {
          background: #2ea44f;
          color: white;
        }
        .status-badge.idle {
          background: #6e7681;
          color: white;
        }
        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2328;
        }
        .metric-label {
          font-size: 14px;
          color: #656d76;
          margin-top: 4px;
        }
        .queue-section, .recent-section, .actions-section {
          margin-top: 24px;
          background: white;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 16px;
        }
        .queue-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #eaeef2;
        }
        .queue-item:last-child {
          border-bottom: none;
        }
        .pr-title {
          font-weight: 600;
        }
        .pr-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .pr-status.testing {
          background: #fff8c5;
          color: #9a6700;
        }
        .pr-status.ready {
          background: #dafbe1;
          color: #1a7f37;
        }
        .pr-status.rebasing {
          background: #ddf4ff;
          color: #0969da;
        }
        .empty-state {
          text-align: center;
          color: #656d76;
          padding: 32px;
        }
        .actions-section button {
          margin: 8px 8px 8px 0;
          padding: 8px 16px;
          background: #2ea44f;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .actions-section button:hover {
          background: #2c974b;
        }
      </style>
    `
  },

  renderQueueList(queuedPRs) {
    return queuedPRs.map(pr => `
      <div class="queue-item">
        <div>
          <div class="pr-title">#${pr.number} ${pr.title || 'Loading...'}</div>
          <div class="pr-meta">
            ${pr.enteredAt ? `Queued ${this.formatRelativeTime(pr.enteredAt)}` : 'Just now'}
          </div>
        </div>
        <div>
          <span class="pr-status ${pr.status}">${pr.status}</span>
        </div>
      </div>
    `).join('')
  },

  renderRecentMerges(recentMerges) {
    return recentMerges.map(pr => `
      <div class="queue-item">
        <div>
          <div class="pr-title">#${pr.number}</div>
        </div>
        <div class="pr-meta">
          ${pr.mergedAt ? `Merged ${this.formatRelativeTime(pr.mergedAt)}` : 'Just now'}
        </div>
      </div>
    `).join('')
  },

  formatRelativeTime(date) {
    const seconds = Math.floor((new Date() - date) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  },

  /**
   * User actions
   */
  refreshData() {
    this.loadDashboardData()
  },

  openGitHub() {
    window.open('https://github.com/blackboxprogramming/BlackRoad-Operating-System/pulls', '_blank')
  },

  exportMetrics() {
    const data = JSON.stringify(this.state.metrics, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `merge-metrics-${Date.now()}.json`
    a.click()
  }
}

// Auto-initialize if loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.Apps.PrismMergeDashboard.init()
  })
} else {
  window.Apps.PrismMergeDashboard.init()
}
