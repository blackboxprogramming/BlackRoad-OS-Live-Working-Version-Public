/**
 * Identity Center - unified profile
 */

window.IdentityCenterApp = function() {
    const appId = 'identity-center';
    const profile = MockData.identityProfile;

    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';
    const completeness = calculateCompleteness(profile);
    const completenessBadge = Components.Badge(`${completeness}% complete`, completeness > 80 ? 'success' : 'warning');
    toolbar.appendChild(completenessBadge);

    const container = document.createElement('div');
    container.className = 'identity-center';

    function field(label, value) {
        const row = document.createElement('div');
        row.className = 'identity-row';
        row.innerHTML = `<div class="label">${label}</div><div class="value">${value || 'Not set'}</div>`;
        return row;
    }

    const profileCard = Components.Card({
        title: 'Profile',
        subtitle: 'One canonical record',
        content: (() => {
            const wrap = document.createElement('div');
            wrap.appendChild(field('Name', profile.name));
            wrap.appendChild(field('Legal name', profile.legal_name));
            wrap.appendChild(field('Email', profile.email));
            wrap.appendChild(field('Phone', profile.phone));
            wrap.appendChild(field('Address', profile.address));
            wrap.appendChild(field('Timezone', profile.timezone));
            wrap.appendChild(field('Pronouns', profile.pronouns));
            return wrap;
        })()
    });

    const externalList = Components.List(Object.entries(profile.external_ids || {}).map(([key, val]) => ({
        icon: '🔗',
        title: key,
        subtitle: val
    })));

    const connections = Components.Card({ title: 'Connected services', content: externalList || 'No connections yet' });

    const howTo = Components.Card({
        title: 'Reuse identity in apps',
        content: `<ul class="identity-howto">
            <li>Apps read from this profile instead of re-asking basic info.</li>
            <li>Developers can call /api/identity/profile via the SDK.</li>
            <li>External IDs keep GitHub/Railway/Discord linked without re-auth prompts.</li>
        </ul>`
    });

    container.appendChild(profileCard);
    container.appendChild(connections);
    container.appendChild(howTo);

    window.OS.createWindow({
        id: appId,
        title: 'Identity Center',
        icon: '🪪',
        toolbar,
        content: container,
        width: '800px',
        height: '650px'
    });
};

function calculateCompleteness(profile) {
    const filled = ['name', 'email', 'phone', 'address', 'timezone', 'pronouns'].filter(key => profile[key]);
    let score = Math.round((filled.length / 6) * 100);
    if (profile.avatar_url) score += 10;
    return Math.min(score, 100);
}
