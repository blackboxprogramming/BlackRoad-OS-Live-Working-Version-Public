/**
 * Prism Console - Merge Dashboard
 *
 * Real-time dashboard for PR and merge queue management.
 */

class MergeDashboard {
    constructor(apiBaseUrl = '/api/operator') {
        this.apiBaseUrl = apiBaseUrl;
        this.prs = new Map();
        this.queueStats = {};
        this.refreshInterval = null;
        this.refreshRate = 5000; // 5 seconds
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        console.log('[Prism] Initializing Merge Dashboard...');

        // Load initial data
        await this.refresh();

        // Start auto-refresh
        this.startAutoRefresh();

        // Setup event listeners
        this.setupEventListeners();

        console.log('[Prism] Merge Dashboard initialized');
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, this.refreshRate);

        console.log(`[Prism] Auto-refresh started (${this.refreshRate}ms)`);
    }

    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('[Prism] Auto-refresh stopped');
        }
    }

    /**
     * Refresh all data
     */
    async refresh() {
        try {
            await Promise.all([
                this.fetchQueueStats(),
                this.fetchActivePRs(),
            ]);

            this.render();
        } catch (error) {
            console.error('[Prism] Refresh error:', error);
            this.showError('Failed to refresh data');
        }
    }

    /**
     * Fetch queue statistics
     */
    async fetchQueueStats() {
        const response = await fetch(`${this.apiBaseUrl}/queue/stats`);
        if (!response.ok) throw new Error('Failed to fetch queue stats');

        this.queueStats = await response.json();
        console.log('[Prism] Queue stats:', this.queueStats);
    }

    /**
     * Fetch active PRs
     * (In production, this would come from GitHub API or a database)
     */
    async fetchActivePRs() {
        // TODO: Implement actual PR fetching
        // For now, return mock data
        this.prs = new Map([
            [1, {
                number: 1,
                title: 'feat: Phase Q2 — PR Action Intelligence',
                repo: 'BlackRoad-Operating-System',
                owner: 'blackboxprogramming',
                status: 'open',
                checks: 'passing',
                labels: ['claude-auto', 'backend', 'core'],
                queueStatus: 'queued',
            }],
        ]);
    }

    /**
     * Fetch actions for a specific PR
     */
    async fetchPRActions(owner, repo, prNumber) {
        const response = await fetch(
            `${this.apiBaseUrl}/queue/pr/${owner}/${repo}/${prNumber}`
        );
        if (!response.ok) throw new Error('Failed to fetch PR actions');

        return await response.json();
    }

    /**
     * Trigger a PR action
     */
    async triggerAction(actionType, owner, repo, prNumber, params = {}) {
        try {
            // This would call an API endpoint to enqueue the action
            console.log(`[Prism] Triggering ${actionType} for ${owner}/${repo}#${prNumber}`);

            const response = await fetch(`${this.apiBaseUrl}/queue/enqueue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action_type: actionType,
                    repo_owner: owner,
                    repo_name: repo,
                    pr_number: prNumber,
                    params: params,
                }),
            });

            if (!response.ok) throw new Error('Failed to enqueue action');

            const result = await response.json();
            console.log('[Prism] Action queued:', result);

            this.showSuccess(`Action ${actionType} queued successfully`);
            await this.refresh();

            return result;
        } catch (error) {
            console.error('[Prism] Action trigger error:', error);
            this.showError(`Failed to trigger ${actionType}`);
            throw error;
        }
    }

    /**
     * Render the dashboard
     */
    render() {
        this.renderQueueStats();
        this.renderPRList();
    }

    /**
     * Render queue statistics
     */
    renderQueueStats() {
        const statsContainer = document.getElementById('queue-stats');
        if (!statsContainer) return;

        const { queued, processing, completed, failed, running } = this.queueStats;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Queued</div>
                    <div class="stat-value">${queued || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Processing</div>
                    <div class="stat-value stat-value-processing">${processing || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Completed</div>
                    <div class="stat-value stat-value-success">${completed || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Failed</div>
                    <div class="stat-value stat-value-error">${failed || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Queue Status</div>
                    <div class="stat-value ${running ? 'stat-value-success' : 'stat-value-error'}">
                        ${running ? '🟢 Running' : '🔴 Stopped'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render PR list
     */
    renderPRList() {
        const listContainer = document.getElementById('pr-list');
        if (!listContainer) return;

        if (this.prs.size === 0) {
            listContainer.innerHTML = '<div class="empty-state">No active PRs</div>';
            return;
        }

        const prCards = Array.from(this.prs.values())
            .map(pr => this.renderPRCard(pr))
            .join('');

        listContainer.innerHTML = prCards;
    }

    /**
     * Render a single PR card
     */
    renderPRCard(pr) {
        const statusBadge = this.getStatusBadge(pr.checks);
        const labelBadges = pr.labels.map(label =>
            `<span class="pr-label">${label}</span>`
        ).join('');

        return `
            <div class="pr-card" data-pr-number="${pr.number}">
                <div class="pr-header">
                    <div class="pr-title">
                        <a href="https://github.com/${pr.owner}/${pr.repo}/pull/${pr.number}"
                           target="_blank">
                            #${pr.number}: ${pr.title}
                        </a>
                    </div>
                    <div class="pr-status">${statusBadge}</div>
                </div>
                <div class="pr-meta">
                    <span class="pr-repo">${pr.owner}/${pr.repo}</span>
                    ${labelBadges}
                </div>
                <div class="pr-queue">
                    <span>Queue Status: <strong>${pr.queueStatus}</strong></span>
                </div>
                <div class="pr-actions">
                    <button class="btn-action" onclick="prismDashboard.updateBranch('${pr.owner}', '${pr.repo}', ${pr.number})">
                        🔄 Update Branch
                    </button>
                    <button class="btn-action" onclick="prismDashboard.rerunChecks('${pr.owner}', '${pr.repo}', ${pr.number})">
                        ▶️ Rerun Checks
                    </button>
                    <button class="btn-action" onclick="prismDashboard.viewActions('${pr.owner}', '${pr.repo}', ${pr.number})">
                        📋 View Actions
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            passing: '<span class="status-badge status-success">✓ Passing</span>',
            failing: '<span class="status-badge status-error">✗ Failing</span>',
            pending: '<span class="status-badge status-pending">⏳ Pending</span>',
        };
        return badges[status] || badges.pending;
    }

    /**
     * Action: Update Branch
     */
    async updateBranch(owner, repo, prNumber) {
        await this.triggerAction('update_branch', owner, repo, prNumber);
    }

    /**
     * Action: Rerun Checks
     */
    async rerunChecks(owner, repo, prNumber) {
        await this.triggerAction('rerun_checks', owner, repo, prNumber);
    }

    /**
     * Action: View Actions
     */
    async viewActions(owner, repo, prNumber) {
        try {
            const data = await this.fetchPRActions(owner, repo, prNumber);
            this.showActionLog(data);
        } catch (error) {
            this.showError('Failed to load actions');
        }
    }

    /**
     * Show action log modal
     */
    showActionLog(data) {
        const { pr, actions } = data;

        const actionRows = actions.map(action => `
            <tr>
                <td>${new Date(action.created_at).toLocaleString()}</td>
                <td><code>${action.action_type}</code></td>
                <td><span class="status-badge status-${action.status}">${action.status}</span></td>
                <td>${action.attempts}/${action.max_attempts}</td>
            </tr>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Actions for ${pr}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <table class="action-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Action</th>
                                <th>Status</th>
                                <th>Attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${actionRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global instance
let prismDashboard = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    prismDashboard = new MergeDashboard();
    prismDashboard.init();
});
