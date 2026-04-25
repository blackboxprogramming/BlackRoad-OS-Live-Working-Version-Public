/**
 * BlackRoad OS Authentication Module
 * Handles login, registration, and session management
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.api = window.BlackRoadAPI;
        this.initialized = false;
    }

    /**
     * Initialize authentication
     */
    async initialize() {
        if (this.initialized) return;

        // Listen for logout events
        window.addEventListener('auth:logout', () => {
            this.handleLogout();
        });

        // Check if user is already logged in
        if (this.api.isAuthenticated()) {
            try {
                await this.loadCurrentUser();
                this.hideAuthModal();
                window.dispatchEvent(new CustomEvent('auth:login', { detail: this.currentUser }));
            } catch (error) {
                console.error('Failed to load current user:', error);
                this.showAuthModal();
            }
        } else {
            // Show login modal if not authenticated
            this.showAuthModal();
        }

        this.initialized = true;
    }

    /**
     * Load current user data
     */
    async loadCurrentUser() {
        this.currentUser = await this.api.getCurrentUser();
        return this.currentUser;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Show authentication modal
     */
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide authentication modal
     */
    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Handle login
     */
    async handleLogin(username, password) {
        try {
            const response = await this.api.login(username, password);
            await this.loadCurrentUser();
            this.hideAuthModal();
            window.dispatchEvent(new CustomEvent('auth:login', { detail: this.currentUser }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle registration
     */
    async handleRegister(username, email, password, fullName) {
        try {
            await this.api.register(username, email, password, fullName);
            // Auto-login after registration
            return await this.handleLogin(username, password);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            await this.api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.showAuthModal();
            // Optionally reload the page to reset state
            window.location.reload();
        }
    }

    /**
     * Create auth modal HTML
     */
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-window">
                    <div class="title-bar">
                        <div class="title-text">
                            <span>🛣️</span>
                            <span>BlackRoad OS - Login</span>
                        </div>
                    </div>
                    <div class="auth-container">
                        <div class="auth-header">
                            <h1 style="font-size: 24px; margin-bottom: 10px;">Welcome to BlackRoad OS</h1>
                            <p style="color: #666; font-size: 11px;">Please login or register to continue</p>
                        </div>

                        <!-- Login Form -->
                        <div id="login-form" class="auth-form">
                            <h3 style="margin-bottom: 15px;">Login</h3>
                            <div class="form-group">
                                <label>Username:</label>
                                <input type="text" id="login-username" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Password:</label>
                                <input type="password" id="login-password" class="form-input" />
                            </div>
                            <div class="form-error" id="login-error"></div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="window.BlackRoadAuth.submitLogin()">Login</button>
                                <button class="btn btn-secondary" onclick="window.BlackRoadAuth.switchToRegister()">Register</button>
                            </div>
                        </div>

                        <!-- Register Form -->
                        <div id="register-form" class="auth-form" style="display: none;">
                            <h3 style="margin-bottom: 15px;">Create Account</h3>
                            <div class="form-group">
                                <label>Username:</label>
                                <input type="text" id="register-username" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Email:</label>
                                <input type="email" id="register-email" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Full Name:</label>
                                <input type="text" id="register-fullname" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Password:</label>
                                <input type="password" id="register-password" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Confirm Password:</label>
                                <input type="password" id="register-password2" class="form-input" />
                            </div>
                            <div class="form-error" id="register-error"></div>
                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="window.BlackRoadAuth.submitRegister()">Create Account</button>
                                <button class="btn btn-secondary" onclick="window.BlackRoadAuth.switchToLogin()">Back to Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Switch to register form
     */
    switchToRegister() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.querySelector('.auth-window .title-text span:last-child').textContent = 'BlackRoad OS - Register';
    }

    /**
     * Switch to login form
     */
    switchToLogin() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.querySelector('.auth-window .title-text span:last-child').textContent = 'BlackRoad OS - Login';
    }

    /**
     * Submit login form
     */
    async submitLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        if (!username || !password) {
            errorEl.textContent = 'Please enter username and password';
            return;
        }

        errorEl.textContent = 'Logging in...';
        const result = await this.handleLogin(username, password);

        if (!result.success) {
            errorEl.textContent = result.error;
        }
    }

    /**
     * Submit register form
     */
    async submitRegister() {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const fullName = document.getElementById('register-fullname').value.trim();
        const password = document.getElementById('register-password').value;
        const password2 = document.getElementById('register-password2').value;
        const errorEl = document.getElementById('register-error');

        if (!username || !email || !password) {
            errorEl.textContent = 'Please fill in all required fields';
            return;
        }

        if (password !== password2) {
            errorEl.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            return;
        }

        errorEl.textContent = 'Creating account...';
        const result = await this.handleRegister(username, email, password, fullName);

        if (!result.success) {
            errorEl.textContent = result.error;
        }
    }

    /**
     * Add Enter key support for forms
     */
    setupKeyboardShortcuts() {
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitLogin();
            }
        });

        document.getElementById('register-password2').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitRegister();
            }
        });
    }
}

// Create singleton instance
const authManager = new AuthManager();
window.BlackRoadAuth = authManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authManager.createAuthModal();
        authManager.setupKeyboardShortcuts();
        authManager.initialize();
    });
} else {
    authManager.createAuthModal();
    authManager.setupKeyboardShortcuts();
    authManager.initialize();
}
