/**
 * Research Lab App (Lucidia)
 * Experimental research, mathematical analysis, notebooks
 * TODO: Add Jupyter notebook integration
 * TODO: Add LaTeX rendering
 * TODO: Add experiment tracking
 */

window.ResearchApp = function() {
    const appId = 'research';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const newExperimentBtn = Components.Button('New Experiment', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Experiment creation wizard will be available in v0.2',
                duration: 3000
            });
        }
    });

    const notebookBtn = Components.Button('Open Notebook', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Coming Soon',
                message: 'Jupyter notebook integration in development',
                duration: 3000
            });
        }
    });

    toolbar.appendChild(newExperimentBtn);
    toolbar.appendChild(notebookBtn);

    // Create content
    const tabs = Components.Tabs([
        {
            id: 'experiments',
            label: 'Experiments',
            content: createExperimentsTab()
        },
        {
            id: 'notebooks',
            label: 'Notebooks',
            content: createNotebooksTab()
        },
        {
            id: 'analysis',
            label: 'Analysis',
            content: createAnalysisTab()
        }
    ]);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Research Lab (Lucidia)',
        icon: '🔬',
        toolbar: toolbar,
        content: tabs,
        width: '1000px',
        height: '700px'
    });
};

function createExperimentsTab() {
    const container = document.createElement('div');

    // Stats
    const active = MockData.experiments.filter(e => e.status === 'active').length;
    const completed = MockData.experiments.filter(e => e.status === 'completed').length;
    const planning = MockData.experiments.filter(e => e.status === 'planning').length;

    const statsGrid = Components.Grid(4, [
        Components.StatsBox({ value: MockData.experiments.length, label: 'Total Experiments' }),
        Components.StatsBox({ value: active, label: 'Active' }),
        Components.StatsBox({ value: completed, label: 'Completed' }),
        Components.StatsBox({ value: planning, label: 'Planning' })
    ]);

    container.appendChild(statsGrid);
    container.appendChild(document.createElement('br'));

    // Experiments grid
    const experimentsGrid = Components.Grid(2,
        MockData.experiments.map(exp => createExperimentCard(exp))
    );

    container.appendChild(experimentsGrid);

    return container;
}

function createExperimentCard(experiment) {
    const statusBadgeType = {
        'active': 'info',
        'completed': 'success',
        'planning': 'neutral'
    };

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="margin-bottom: 12px;">
            ${Components.Badge(experiment.status.toUpperCase(), statusBadgeType[experiment.status]).outerHTML}
            <span style="margin-left: 8px; color: var(--text-secondary); font-size: 12px;">
                by ${experiment.researcher}
            </span>
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
            ${experiment.description}
        </p>
        <div style="margin-bottom: 12px;">
            <div style="color: var(--text-dim); font-size: 11px; margin-bottom: 4px;">Progress</div>
            <div style="background: var(--bg-surface); border-radius: 8px; height: 8px; overflow: hidden;">
                <div style="background: var(--primary); height: 100%; width: ${experiment.progress}%; transition: width 0.3s;"></div>
            </div>
            <div style="text-align: right; color: var(--text-secondary); font-size: 11px; margin-top: 4px;">
                ${experiment.progress}%
            </div>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary);">
            Started: ${experiment.startDate}
        </div>
    `;

    return Components.Card({
        title: experiment.title,
        subtitle: experiment.id,
        content: content
    });
}

function createNotebooksTab() {
    const container = document.createElement('div');

    const notebooksList = Components.List([
        {
            icon: '📓',
            title: 'Quantum Algorithms Research',
            subtitle: 'Last modified 2 hours ago • 47 cells',
            actions: Components.Button('Open', { size: 'small' })
        },
        {
            icon: '📓',
            title: 'SHA∞ Mathematical Proofs',
            subtitle: 'Last modified yesterday • 32 cells',
            actions: Components.Button('Open', { size: 'small' })
        },
        {
            icon: '📓',
            title: 'Market Prediction Models',
            subtitle: 'Last modified 3 days ago • 68 cells',
            actions: Components.Button('Open', { size: 'small' })
        },
        {
            icon: '📓',
            title: 'Neural Network Experiments',
            subtitle: 'Last modified last week • 91 cells',
            actions: Components.Button('Open', { size: 'small' })
        }
    ]);

    container.appendChild(notebooksList);

    return container;
}

function createAnalysisTab() {
    const container = document.createElement('div');

    const analysisContent = document.createElement('div');
    analysisContent.innerHTML = `
        <h3 style="margin-bottom: 16px; color: var(--text-primary);">Mathematical Analysis Tools</h3>
        <div style="margin-bottom: 24px;">
            ${Components.GraphPlaceholder('Interactive Mathematical Visualization').outerHTML}
        </div>
        <div style="margin-bottom: 16px;">
            <h4 style="margin-bottom: 8px; color: var(--primary);">LaTeX Equation Rendering</h4>
            ${Components.CodeBlock('\\\\int_{0}^{\\\\infty} e^{-x^2} dx = \\\\frac{\\\\sqrt{\\\\pi}}{2}').outerHTML}
        </div>
        <div style="margin-top: 24px;">
            <h4 style="margin-bottom: 8px; color: var(--primary);">Statistical Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                ${Components.StatsBox({ value: '0.9847', label: 'Correlation' }).outerHTML}
                ${Components.StatsBox({ value: '3.24σ', label: 'Std Deviation' }).outerHTML}
                ${Components.StatsBox({ value: '0.0023', label: 'P-Value' }).outerHTML}
            </div>
        </div>
    `;

    container.appendChild(analysisContent);

    return container;
}
