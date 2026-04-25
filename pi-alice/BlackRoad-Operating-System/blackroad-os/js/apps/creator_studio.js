/**
 * Creator Studio - minimal hub for creative projects
 */

window.CreatorStudioApp = function() {
    const appId = 'creator-studio';
    const container = document.createElement('div');
    container.className = 'creator-studio';

    const header = document.createElement('div');
    header.className = 'creator-header';
    header.innerHTML = '<div><h2>Creator Studio</h2><p>Track creative work without a dozen tabs.</p></div>';
    const newBtn = Components.Button('New idea', {
        onClick: () => {
            const title = prompt('Project title');
            if (!title) return;
            MockData.creativeProjects.unshift({ id: Date.now(), title, type: 'mixed', status: 'idea', description: '' });
            renderProjects();
        }
    });
    header.appendChild(newBtn);

    container.appendChild(header);

    function renderProjects() {
        const listContainer = document.createElement('div');
        listContainer.className = 'creator-list';
        MockData.creativeProjects.forEach(project => {
            const assets = (project.links_to_assets || []).map(link => `<li><a href="${link}">${link}</a></li>`).join('');
            const revenue = Object.entries(project.revenue_streams || {}).map(([k,v]) => `${k}: $${v}`).join(', ') || 'No revenue data';
            const card = Components.Card({
                title: project.title,
                subtitle: `${project.type} • ${project.status}`,
                content: `<div class="creator-body">
                    <p>${project.description || 'No description yet'}</p>
                    <div class="creator-assets"><strong>Assets</strong><ul>${assets}</ul></div>
                    <div class="creator-revenue"><strong>Revenue</strong>: ${revenue}</div>
                    <div class="creator-notes">${project.notes || ''}</div>
                </div>`,
                footer: Components.Button('Mark published', {
                    size: 'small',
                    onClick: () => { project.status = 'published'; renderProjects(); }
                })
            });
            listContainer.appendChild(card);
        });
        return listContainer;
    }

    container.appendChild(renderProjects());

    window.OS.createWindow({
        id: appId,
        title: 'Creator Studio',
        icon: '🎨',
        content: container,
        width: '1000px',
        height: '700px'
    });
};
