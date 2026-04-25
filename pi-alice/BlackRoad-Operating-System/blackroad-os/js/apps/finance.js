/**
 * Finance & AUM App
 * Portfolio management, AUM tracking, market data
 * TODO: Add real-time market feeds
 * TODO: Add portfolio rebalancing tools
 * TODO: Add performance analytics
 */

window.FinanceApp = function() {
    const appId = 'finance';

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'window-toolbar';

    const refreshBtn = Components.Button('Refresh Data', {
        onClick: () => {
            window.OS.showNotification({
                type: 'info',
                title: 'Refreshing',
                message: 'Fetching latest market data',
                duration: 2000
            });
        }
    });

    const rebalanceBtn = Components.Button('Run Rebalance', {
        type: 'primary',
        onClick: () => {
            window.OS.showNotification({
                type: 'warning',
                title: 'Rebalancing',
                message: 'Portfolio rebalance initiated',
                duration: 3000
            });
        }
    });

    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(rebalanceBtn);

    // Create content
    const tabs = Components.Tabs([
        {
            id: 'overview',
            label: 'Overview',
            content: createOverviewTab()
        },
        {
            id: 'portfolios',
            label: 'Portfolios',
            content: createPortfoliosTab()
        },
        {
            id: 'annuities',
            label: 'Annuities',
            content: createAnnuitiesTab()
        },
        {
            id: 'market',
            label: 'Market Data',
            content: createMarketTab()
        }
    ]);

    // Create window
    window.OS.createWindow({
        id: appId,
        title: 'Finance & AUM',
        icon: '💰',
        toolbar: toolbar,
        content: tabs,
        width: '1100px',
        height: '750px'
    });
};

function createOverviewTab() {
    const container = document.createElement('div');

    // Calculate total AUM
    const totalAUM = MockData.portfolios.reduce((sum, p) => sum + p.aum, 0);
    const totalAccounts = MockData.portfolios.reduce((sum, p) => sum + p.accounts, 0);
    const avgReturn = MockData.portfolios.reduce((sum, p) => sum + p.ytdReturn, 0) / MockData.portfolios.length;

    const statsGrid = Components.Grid(4, [
        Components.StatsBox({
            value: `$${(totalAUM / 1000000).toFixed(1)}M`,
            label: 'Total AUM',
            change: 8.3
        }),
        Components.StatsBox({
            value: totalAccounts,
            label: 'Accounts',
            change: 2.1
        }),
        Components.StatsBox({
            value: `${avgReturn.toFixed(1)}%`,
            label: 'Avg YTD Return',
            change: 3.2
        }),
        Components.StatsBox({
            value: MockData.portfolios.length,
            label: 'Strategies'
        })
    ]);

    container.appendChild(statsGrid);
    container.appendChild(document.createElement('br'));

    // AUM chart
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = 'AUM Growth (12 Months)';
    chartTitle.style.marginBottom = '10px';
    container.appendChild(chartTitle);
    container.appendChild(Components.GraphPlaceholder('Historical AUM Chart'));

    container.appendChild(document.createElement('br'));

    // Performance summary
    const perfTitle = document.createElement('h3');
    perfTitle.textContent = 'Portfolio Performance';
    perfTitle.style.marginBottom = '10px';
    container.appendChild(perfTitle);

    const perfTable = Components.Table(
        [
            { key: 'name', label: 'Strategy' },
            { key: 'ytdReturn', label: 'YTD Return' },
            { key: 'benchmark', label: 'Benchmark' },
            { key: 'accounts', label: 'Accounts' }
        ],
        MockData.portfolios.map(p => ({
            ...p,
            ytdReturn: `${p.ytdReturn}%`
        }))
    );

    container.appendChild(perfTable);

    return container;
}

function createPortfoliosTab() {
    const container = document.createElement('div');

    const portfoliosGrid = Components.Grid(2,
        MockData.portfolios.map(portfolio => createPortfolioCard(portfolio))
    );

    container.appendChild(portfoliosGrid);

    return container;
}

function createPortfolioCard(portfolio) {
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div>
                <div style="color: var(--text-dim); font-size: 12px;">AUM</div>
                <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                    $${(portfolio.aum / 1000000).toFixed(2)}M
                </div>
            </div>
            <div>
                <div style="color: var(--text-dim); font-size: 12px;">YTD Return</div>
                <div style="font-size: 20px; font-weight: 700; color: ${portfolio.ytdReturn > 0 ? 'var(--success)' : 'var(--error)'};">
                    ${portfolio.ytdReturn}%
                </div>
            </div>
            <div>
                <div style="color: var(--text-dim); font-size: 12px;">Accounts</div>
                <div style="font-weight: 600;">${portfolio.accounts}</div>
            </div>
            <div>
                <div style="color: var(--text-dim); font-size: 12px;">Benchmark</div>
                <div style="font-weight: 600;">${portfolio.benchmark}</div>
            </div>
        </div>
        <div style="margin-top: 12px;">
            <div style="color: var(--text-dim); font-size: 12px; margin-bottom: 6px;">Allocation</div>
            <div style="display: flex; gap: 8px; font-size: 12px;">
                <div>${Components.Badge(`Equities ${portfolio.allocation.equities}%`, 'info').outerHTML}</div>
                <div>${Components.Badge(`Bonds ${portfolio.allocation.bonds}%`, 'success').outerHTML}</div>
                <div>${Components.Badge(`Alt ${portfolio.allocation.alternatives}%`, 'warning').outerHTML}</div>
            </div>
        </div>
    `;

    return Components.Card({
        title: portfolio.name,
        subtitle: portfolio.id,
        content: content
    });
}

function createAnnuitiesTab() {
    const container = document.createElement('div');

    const totalValue = MockData.annuityProducts.reduce((sum, a) => sum + a.currentValue, 0);

    const stats = Components.StatsBox({
        value: `$${(totalValue / 1000000).toFixed(2)}M`,
        label: 'Total Annuity Value'
    });
    container.appendChild(stats);
    container.appendChild(document.createElement('br'));

    const annuitiesTable = Components.Table(
        [
            { key: 'carrier', label: 'Carrier' },
            { key: 'product', label: 'Product' },
            { key: 'currentValue', label: 'Current Value' },
            { key: 'guaranteedRate', label: 'Guaranteed Rate' },
            { key: 'riders', label: 'Riders' }
        ],
        MockData.annuityProducts.map(a => ({
            ...a,
            currentValue: `$${a.currentValue.toLocaleString()}`,
            guaranteedRate: `${a.guaranteedRate}%`,
            riders: a.riders.join(', ')
        }))
    );

    container.appendChild(annuitiesTable);

    return container;
}

function createMarketTab() {
    const container = document.createElement('div');

    const market = MockData.marketSnapshot;

    const marketGrid = Components.Grid(3, [
        createMarketCard('S&P 500', market.sp500),
        createMarketCard('NASDAQ', market.nasdaq),
        createMarketCard('Dow Jones', market.dow),
        createMarketCard('VIX', market.vix),
        createMarketCard('Gold', market.gold),
        createMarketCard('Bitcoin', market.bitcoin)
    ]);

    container.appendChild(marketGrid);

    return container;
}

function createMarketCard(name, data) {
    const isPositive = data.change >= 0;
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            ${data.value.toLocaleString()}
        </div>
        <div style="font-size: 16px; font-weight: 600; color: ${isPositive ? 'var(--success)' : 'var(--error)'};">
            ${isPositive ? '+' : ''}${data.change} (${isPositive ? '+' : ''}${data.changePercent}%)
        </div>
    `;

    return Components.Card({
        title: name,
        content: content
    });
}
