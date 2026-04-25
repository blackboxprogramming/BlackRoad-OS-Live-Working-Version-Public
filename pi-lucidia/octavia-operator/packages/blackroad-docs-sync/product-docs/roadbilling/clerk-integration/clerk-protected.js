// 🔐 Clerk Protected Route Wrapper
// Add this to any page that requires authentication

(function() {
    // Wait for Clerk to load
    window.addEventListener('load', async () => {
        // Check if Clerk is loaded
        if (typeof Clerk === 'undefined') {
            console.error('Clerk not loaded');
            return;
        }

        await Clerk.load();

        // Check if user is authenticated
        if (!Clerk.user) {
            // Redirect to sign-in
            window.location.href = '/clerk-integration/clerk-auth.html';
            return;
        }

        // User is authenticated
        console.log('✅ User authenticated:', Clerk.user.fullName);

        // Add user info to page
        addUserInfo(Clerk.user);

        // Add sign-out button
        addSignOutButton();
    });

    function addUserInfo(user) {
        const userInfoDiv = document.createElement('div');
        userInfoDiv.id = 'clerk-user-info';
        userInfoDiv.style.cssText = `
            position: fixed;
            top: 21px;
            right: 21px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 13px;
            padding: 13px 21px;
            display: flex;
            align-items: center;
            gap: 13px;
            z-index: 1000;
        `;

        userInfoDiv.innerHTML = `
            <img src="${user.profileImageUrl}" alt="${user.fullName}"
                 style="width: 34px; height: 34px; border-radius: 50%;">
            <div>
                <div style="font-weight: 600; font-size: 14px;">${user.fullName || user.username}</div>
                <div style="font-size: 12px; opacity: 0.7;">${user.primaryEmailAddress.emailAddress}</div>
            </div>
        `;

        document.body.appendChild(userInfoDiv);
    }

    function addSignOutButton() {
        const signOutBtn = document.createElement('button');
        signOutBtn.textContent = 'Sign Out';
        signOutBtn.style.cssText = `
            position: fixed;
            top: 89px;
            right: 21px;
            background: linear-gradient(135deg, #F5A623 38.2%, #FF1D6C 61.8%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 21px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
        `;

        signOutBtn.addEventListener('click', async () => {
            await Clerk.signOut();
            window.location.href = '/clerk-integration/clerk-auth.html';
        });

        document.body.appendChild(signOutBtn);
    }
})();
