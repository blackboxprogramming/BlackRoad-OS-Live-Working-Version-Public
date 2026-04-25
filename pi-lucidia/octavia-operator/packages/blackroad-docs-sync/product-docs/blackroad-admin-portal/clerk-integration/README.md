# Clerk Authentication Integration for blackroad-admin-portal

## Setup Instructions

### 1. Get Clerk API Keys

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your publishable key (pk_test_...) and secret key (sk_test_...)
4. Update the keys in:
   - `clerk-auth.html` (line 66)
   - Main `index.html` (add Clerk SDK)

### 2. Update Main HTML File

Add Clerk SDK to `index.html` before closing `</body>`:

```html
<!-- Clerk SDK -->
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_YOUR_KEY"
    src="https://YOUR_FRONTEND_API/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
></script>

<!-- Clerk Protected Route -->
<script src="./clerk-integration/clerk-protected.js"></script>
```

### 3. Configure Clerk Dashboard

1. **Allowed Origins**: Add your domain(s)
   - http://localhost:*
   - https://YOUR_CLOUDFLARE_PAGES.pages.dev
   - https://YOUR_CUSTOM_DOMAIN.com

2. **Social Login** (optional):
   - Enable Google, GitHub, Apple
   - Configure OAuth apps

3. **Appearance**:
   - Theme: Dark
   - Primary color: #F5A623

### 4. Deploy

```bash
# Update Clerk keys in files
# Deploy to Cloudflare Pages
wrangler pages deploy .
```

### 5. Test

1. Visit your site
2. You'll be redirected to sign-in
3. Create account or sign in
4. Access protected content

## Features Enabled

✅ Email/password authentication
✅ Social login (Google, GitHub, Apple)
✅ Multi-factor authentication (MFA)
✅ Passwordless sign-in
✅ User profile management
✅ Session management
✅ Organization support (teams)

## Files Created

- `clerk-auth.html` - Sign-in/sign-up page
- `clerk-protected.js` - Route protection script
- `README.md` - This file

## API Usage

```javascript
// Get current user
const user = Clerk.user;

// Sign out
await Clerk.signOut();

// Check authentication
if (Clerk.user) {
    console.log('Authenticated');
}
```

🖤🛣️ Secure authentication powered by Clerk
