// ===== BLACKROAD AUTHENTICATION SYSTEM =====
// Handles login, session management, and authentication checks

class BlackRoadAuth {
    constructor() {
        this.storageKey = 'blackroad_user';
        this.sessionTimeout = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Check if user is logged in
    isLoggedIn() {
        const localUser = localStorage.getItem(this.storageKey);
        const sessionUser = sessionStorage.getItem(this.storageKey);
        
        if (localUser || sessionUser) {
            const userData = JSON.parse(localUser || sessionUser);
            const timeSinceLogin = Date.now() - userData.timestamp;
            
            // Check if session is still valid
            if (userData.remember && timeSinceLogin < this.sessionTimeout) {
                return userData;
            } else if (!userData.remember) {
                return userData;
            } else {
                // Session expired
                this.logout();
                return false;
            }
        }
        
        return false;
    }

    // Get current user data
    getCurrentUser() {
        return this.isLoggedIn();
    }

    // Login user
    login(username, password, remember = false) {
        const userData = {
            username: username,
            loggedIn: true,
            timestamp: Date.now(),
            remember: remember
        };

        if (remember) {
            localStorage.setItem(this.storageKey, JSON.stringify(userData));
        } else {
            sessionStorage.setItem(this.storageKey, JSON.stringify(userData));
        }

        return true;
    }

    // Guest login
    loginAsGuest() {
        const userData = {
            username: 'Guest',
            loggedIn: true,
            guest: true,
            timestamp: Date.now()
        };

        sessionStorage.setItem(this.storageKey, JSON.stringify(userData));
        return true;
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem(this.storageKey);
    }

    // Require authentication (redirect to login if not logged in)
    requireAuth(redirectUrl = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Display welcome message
    showWelcome() {
        const user = this.getCurrentUser();
        if (user) {
            console.log(`👋 Welcome, ${user.username}!`);
            return `Welcome, ${user.username}!`;
        }
        return null;
    }

    // Get user display name
    getUsername() {
        const user = this.getCurrentUser();
        return user ? user.username : 'Guest';
    }

    // Check if user is guest
    isGuest() {
        const user = this.getCurrentUser();
        return user && user.guest === true;
    }
}

// Create global auth instance
const blackRoadAuth = new BlackRoadAuth();

// Auto-check authentication on page load (optional, can be disabled)
if (typeof AUTH_REQUIRED !== 'undefined' && AUTH_REQUIRED === true) {
    document.addEventListener('DOMContentLoaded', () => {
        blackRoadAuth.requireAuth();
    });
}
