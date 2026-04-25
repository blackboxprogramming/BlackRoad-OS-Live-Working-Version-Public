/**
 * BlackRoad OS Component Library
 * Reusable UI primitives for building accessible app interfaces
 *
 * Philosophy:
 * - Vanilla JS only (no framework dependencies)
 * - Accessibility-first (ARIA attributes, keyboard navigation)
 * - Predictable API (consistent naming and options)
 * - Composable (components can contain other components)
 * - Theme-aware (uses CSS variables from styles.css)
 *
 * Usage:
 *   const card = Components.Card({ title: 'My Card', content: '...' });
 *   document.body.appendChild(card);
 *
 * All components return HTMLElement that can be:
 * - Appended to DOM
 * - Passed to window.OS.createWindow({ content: ... })
 * - Composed with other components
 */

const Components = {
    /**
     * Create a Card component
     * A container with optional header, body, and footer sections
     *
     * @param {Object} options - Card configuration
     * @param {string} [options.title] - Card title
     * @param {string} [options.subtitle] - Card subtitle
     * @param {HTMLElement|string} [options.content] - Card body content
     * @param {HTMLElement|string} [options.footer] - Card footer content
     * @param {HTMLElement} [options.headerActions] - Action buttons for header
     * @returns {HTMLElement} Card element
     *
     * @example
     * const card = Components.Card({
     *   title: 'System Status',
     *   subtitle: 'Last updated: 2 minutes ago',
     *   content: 'All systems operational'
     * });
     */
    Card(options = {}) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'article');

        if (options.title) {
            const header = document.createElement('div');
            header.className = 'card-header';

            const titleDiv = document.createElement('div');
            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = options.title;
            titleDiv.appendChild(title);

            if (options.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.className = 'card-subtitle';
                subtitle.textContent = options.subtitle;
                titleDiv.appendChild(subtitle);
            }

            header.appendChild(titleDiv);
            if (options.headerActions) {
                const actionsWrapper = document.createElement('div');
                actionsWrapper.className = 'card-header-actions';
                actionsWrapper.appendChild(options.headerActions);
                header.appendChild(actionsWrapper);
            }
            card.appendChild(header);
        }

        if (options.content) {
            const body = document.createElement('div');
            body.className = 'card-body';
            if (typeof options.content === 'string') {
                body.innerHTML = options.content;
            } else if (options.content instanceof HTMLElement) {
                body.appendChild(options.content);
            }
            card.appendChild(body);
        }

        if (options.footer) {
            const footer = document.createElement('div');
            footer.className = 'card-footer';
            if (typeof options.footer === 'string') {
                footer.innerHTML = options.footer;
            } else if (options.footer instanceof HTMLElement) {
                footer.appendChild(options.footer);
            }
            card.appendChild(footer);
        }

        return card;
    },

    /**
     * Create a Badge component
     * Small status indicator with color coding
     *
     * @param {string} text - Badge text
     * @param {string} [type='neutral'] - Badge type (success, warning, error, info, neutral)
     * @returns {HTMLElement} Badge element
     *
     * @example
     * const badge = Components.Badge('Online', 'success');
     */
    Badge(text, type = 'neutral') {
        const validTypes = ['success', 'warning', 'error', 'info', 'neutral'];
        const safeType = validTypes.includes(type) ? type : 'neutral';

        const badge = document.createElement('span');
        badge.className = `badge ${safeType}`;
        badge.textContent = text;
        badge.setAttribute('role', 'status');
        badge.setAttribute('aria-label', `Status: ${text}`);

        return badge;
    },

    /**
     * Create a Table component
     * Accessible data table with automatic header/body structure
     *
     * @param {Array<Object>} columns - Column definitions [{ key, label, render }]
     * @param {Array<Object>} data - Row data objects
     * @param {Object} [options] - Table options
     * @param {string} [options.caption] - Table caption for accessibility
     * @param {boolean} [options.striped=false] - Alternate row colors
     * @returns {HTMLElement} Table container element
     *
     * @example
     * const table = Components.Table(
     *   [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }],
     *   [{ name: 'Alice', status: 'Active' }, { name: 'Bob', status: 'Inactive' }],
     *   { caption: 'User list' }
     * );
     */
    Table(columns, data, options = {}) {
        const container = document.createElement('div');
        container.className = 'table-container';

        const table = document.createElement('table');
        table.className = 'table';
        if (options.striped) {
            table.classList.add('table-striped');
        }

        // Add caption for accessibility
        if (options.caption) {
            const caption = document.createElement('caption');
            caption.textContent = options.caption;
            caption.className = 'sr-only'; // Screen reader only
            table.appendChild(caption);
        }

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            th.setAttribute('scope', 'col');
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        if (data.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.setAttribute('colspan', columns.length);
            emptyCell.className = 'table-empty';
            emptyCell.textContent = 'No data available';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            data.forEach(row => {
                const tr = document.createElement('tr');
                columns.forEach(col => {
                    const td = document.createElement('td');
                    const value = row[col.key];

                    // Support custom render function
                    if (col.render && typeof col.render === 'function') {
                        const rendered = col.render(value, row);
                        if (rendered instanceof HTMLElement) {
                            td.appendChild(rendered);
                        } else {
                            td.innerHTML = rendered;
                        }
                    } else if (value instanceof HTMLElement) {
                        td.appendChild(value);
                    } else {
                        td.innerHTML = value !== undefined && value !== null ? value : '-';
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
        table.appendChild(tbody);

        container.appendChild(table);
        return container;
    },

    /**
     * Create a List component
     * Accessible list with icon, title, subtitle, and actions
     *
     * @param {Array<Object>} items - List items
     * @param {string} [items[].icon] - Icon HTML or emoji
     * @param {string} items[].title - Item title
     * @param {string} [items[].subtitle] - Item subtitle
     * @param {HTMLElement} [items[].actions] - Action buttons
     * @param {Function} [items[].onClick] - Click handler
     * @returns {HTMLElement} List element
     *
     * @example
     * const list = Components.List([
     *   { icon: '📁', title: 'Documents', subtitle: '45 files' },
     *   { icon: '🖼️', title: 'Images', subtitle: '128 files' }
     * ]);
     */
    List(items) {
        const list = document.createElement('ul');
        list.className = 'list';
        list.setAttribute('role', 'list');

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-item';
            li.setAttribute('role', 'listitem');

            if (item.icon) {
                const icon = document.createElement('div');
                icon.className = 'list-item-icon';
                icon.innerHTML = item.icon;
                icon.setAttribute('aria-hidden', 'true');
                li.appendChild(icon);
            }

            const content = document.createElement('div');
            content.className = 'list-item-content';

            const title = document.createElement('div');
            title.className = 'list-item-title';
            title.textContent = item.title;
            content.appendChild(title);

            if (item.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.className = 'list-item-subtitle';
                subtitle.textContent = item.subtitle;
                content.appendChild(subtitle);
            }

            li.appendChild(content);

            if (item.actions) {
                const actions = document.createElement('div');
                actions.className = 'list-item-actions';
                actions.appendChild(item.actions);
                li.appendChild(actions);
            }

            if (item.onClick) {
                li.classList.add('list-item-clickable');
                li.setAttribute('role', 'button');
                li.setAttribute('tabindex', '0');
                li.addEventListener('click', item.onClick);

                // Keyboard support
                li.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.onClick(e);
                    }
                });
            }

            list.appendChild(li);
        });

        return list;
    },

    /**
     * Create a Stats Box component
     * Display a metric with optional change indicator
     *
     * @param {Object} options - Stats box configuration
     * @param {string|number} options.value - Main metric value
     * @param {string} options.label - Metric label
     * @param {number} [options.change] - Percent change (positive or negative)
     * @param {string} [options.icon] - Optional icon
     * @returns {HTMLElement} Stats box element
     *
     * @example
     * const stats = Components.StatsBox({
     *   value: '42',
     *   label: 'Active Users',
     *   change: 12.5
     * });
     */
    StatsBox(options) {
        const box = document.createElement('div');
        box.className = 'stats-box';
        box.setAttribute('role', 'figure');
        box.setAttribute('aria-label', `${options.label}: ${options.value}`);

        if (options.icon) {
            const icon = document.createElement('div');
            icon.className = 'stats-icon';
            icon.innerHTML = options.icon;
            icon.setAttribute('aria-hidden', 'true');
            box.appendChild(icon);
        }

        const value = document.createElement('div');
        value.className = 'stats-value';
        value.textContent = options.value;
        box.appendChild(value);

        const label = document.createElement('div');
        label.className = 'stats-label';
        label.textContent = options.label;
        box.appendChild(label);

        if (options.change !== undefined) {
            const change = document.createElement('div');
            change.className = `stats-change ${options.change >= 0 ? 'positive' : 'negative'}`;
            change.textContent = `${options.change >= 0 ? '+' : ''}${options.change}%`;
            change.setAttribute('aria-label', `${options.change >= 0 ? 'Up' : 'Down'} ${Math.abs(options.change)} percent`);
            box.appendChild(change);
        }

        return box;
    },

    /**
     * Create a responsive Grid container
     *
     * @param {number|string} columns - Number of columns (2, 3, 4, 'auto')
     * @param {Array<HTMLElement>} children - Child elements
     * @returns {HTMLElement} Grid container
     *
     * @example
     * const grid = Components.Grid(3, [card1, card2, card3]);
     */
    Grid(columns, children) {
        const grid = document.createElement('div');
        grid.className = `grid grid-${columns}`;
        grid.setAttribute('role', 'group');
        children.forEach(child => {
            if (child instanceof HTMLElement) {
                grid.appendChild(child);
            }
        });
        return grid;
    },

    /**
     * Create a Graph/Chart placeholder
     * For indicating where charts will be rendered (e.g., with Chart.js)
     *
     * @param {string} [label='Chart Visualization'] - Placeholder text
     * @returns {HTMLElement} Placeholder element
     */
    GraphPlaceholder(label = 'Chart Visualization') {
        const placeholder = document.createElement('div');
        placeholder.className = 'graph-placeholder';
        placeholder.textContent = label;
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', `Placeholder for ${label}`);
        return placeholder;
    },

    /**
     * Create a Button component
     *
     * @param {string} text - Button text
     * @param {Object} [options] - Button options
     * @param {string} [options.type] - Button type (primary, danger, secondary)
     * @param {string} [options.size] - Button size (small, medium, large)
     * @param {Function} [options.onClick] - Click handler
     * @param {boolean} [options.disabled=false] - Disabled state
     * @param {string} [options.icon] - Optional icon
     * @param {string} [options.ariaLabel] - Custom ARIA label
     * @returns {HTMLElement} Button element
     *
     * @example
     * const btn = Components.Button('Save', {
     *   type: 'primary',
     *   onClick: () => console.log('Saved!')
     * });
     */
    Button(text, options = {}) {
        const btn = document.createElement('button');
        btn.className = 'btn';

        if (options.icon) {
            const icon = document.createElement('span');
            icon.className = 'btn-icon';
            icon.innerHTML = options.icon;
            icon.setAttribute('aria-hidden', 'true');
            btn.appendChild(icon);
        }

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        btn.appendChild(textSpan);

        if (options.type) {
            btn.classList.add(options.type);
        }

        if (options.size) {
            btn.classList.add(options.size);
        }

        if (options.disabled) {
            btn.disabled = true;
        }

        if (options.onClick) {
            btn.addEventListener('click', options.onClick);
        }

        if (options.ariaLabel) {
            btn.setAttribute('aria-label', options.ariaLabel);
        }

        return btn;
    },

    /**
     * Create an Empty State component
     * Displayed when no data is available
     *
     * @param {Object} options - Empty state configuration
     * @param {string} [options.icon] - Icon or emoji
     * @param {string} [options.title] - Empty state title
     * @param {string} [options.text] - Empty state description
     * @param {HTMLElement} [options.action] - Optional action button
     * @returns {HTMLElement} Empty state container
     *
     * @example
     * const empty = Components.EmptyState({
     *   icon: '📭',
     *   title: 'No messages',
     *   text: 'Your inbox is empty'
     * });
     */
    EmptyState(options) {
        const container = document.createElement('div');
        container.className = 'empty-state';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');

        if (options.icon) {
            const icon = document.createElement('div');
            icon.className = 'empty-state-icon';
            icon.textContent = options.icon;
            icon.setAttribute('aria-hidden', 'true');
            container.appendChild(icon);
        }

        if (options.title) {
            const title = document.createElement('div');
            title.className = 'empty-state-title';
            title.textContent = options.title;
            container.appendChild(title);
        }

        if (options.text) {
            const text = document.createElement('div');
            text.className = 'empty-state-text';
            text.textContent = options.text;
            container.appendChild(text);
        }

        if (options.action) {
            const actionWrapper = document.createElement('div');
            actionWrapper.className = 'empty-state-action';
            actionWrapper.appendChild(options.action);
            container.appendChild(actionWrapper);
        }

        return container;
    },

    /**
     * Create a Loading State component
     * Displayed during async operations
     *
     * @param {string} [message='Loading...'] - Loading message
     * @returns {HTMLElement} Loading state container
     *
     * @example
     * const loading = Components.LoadingState('Fetching data...');
     */
    LoadingState(message = 'Loading...') {
        const container = document.createElement('div');
        container.className = 'loading-state';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-busy', 'true');

        const spinner = this.Spinner();
        container.appendChild(spinner);

        const text = document.createElement('div');
        text.className = 'loading-state-text';
        text.textContent = message;
        container.appendChild(text);

        return container;
    },

    /**
     * Create an Error State component
     * Displayed when operations fail
     *
     * @param {Object} options - Error state configuration
     * @param {string} [options.title='Error'] - Error title
     * @param {string} options.message - Error message
     * @param {Function} [options.onRetry] - Retry callback
     * @returns {HTMLElement} Error state container
     *
     * @example
     * const error = Components.ErrorState({
     *   title: 'Failed to load',
     *   message: 'Could not connect to server',
     *   onRetry: () => fetchData()
     * });
     */
    ErrorState(options) {
        const container = document.createElement('div');
        container.className = 'error-state';
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'assertive');

        const icon = document.createElement('div');
        icon.className = 'error-state-icon';
        icon.textContent = '⚠️';
        icon.setAttribute('aria-hidden', 'true');
        container.appendChild(icon);

        const title = document.createElement('div');
        title.className = 'error-state-title';
        title.textContent = options.title || 'Error';
        container.appendChild(title);

        const message = document.createElement('div');
        message.className = 'error-state-message';
        message.textContent = options.message;
        container.appendChild(message);

        if (options.onRetry) {
            const retryBtn = this.Button('Retry', {
                type: 'primary',
                onClick: options.onRetry
            });
            container.appendChild(retryBtn);
        }

        return container;
    },

    /**
     * Create a Loading Spinner
     * Simple animated spinner for loading states
     *
     * @returns {HTMLElement} Spinner element
     */
    Spinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.setAttribute('role', 'progressbar');
        spinner.setAttribute('aria-label', 'Loading');
        spinner.setAttribute('aria-busy', 'true');
        return spinner;
    },

    /**
     * Create a Code Block
     * Pre-formatted code display with syntax highlighting support
     *
     * @param {string} code - Code content
     * @param {string} [language] - Programming language for syntax highlighting
     * @returns {HTMLElement} Code block element
     *
     * @example
     * const code = Components.CodeBlock('const x = 42;', 'javascript');
     */
    CodeBlock(code, language) {
        const block = document.createElement('pre');
        block.className = 'code-block';
        if (language) {
            block.classList.add(`language-${language}`);
            block.setAttribute('data-language', language);
        }

        const codeEl = document.createElement('code');
        codeEl.textContent = code;
        block.appendChild(codeEl);

        return block;
    },

    /**
     * Create a Sidebar Layout
     * Two-column layout with sidebar and main content
     *
     * @param {HTMLElement} sidebar - Sidebar content
     * @param {HTMLElement} content - Main content
     * @param {Object} [options] - Layout options
     * @param {string} [options.sidebarWidth='250px'] - Sidebar width
     * @returns {HTMLElement} Layout container
     *
     * @example
     * const layout = Components.SidebarLayout(menuEl, contentEl);
     */
    SidebarLayout(sidebar, content, options = {}) {
        const layout = document.createElement('div');
        layout.className = 'sidebar-layout';

        const sidebarEl = document.createElement('div');
        sidebarEl.className = 'sidebar';
        sidebarEl.setAttribute('role', 'complementary');
        sidebarEl.setAttribute('aria-label', 'Sidebar navigation');
        if (options.sidebarWidth) {
            sidebarEl.style.width = options.sidebarWidth;
        }
        sidebarEl.appendChild(sidebar);

        const contentEl = document.createElement('div');
        contentEl.className = 'sidebar-content';
        contentEl.setAttribute('role', 'main');
        contentEl.appendChild(content);

        layout.appendChild(sidebarEl);
        layout.appendChild(contentEl);

        return layout;
    },

    /**
     * Create a Tabs component
     * Tabbed interface with keyboard navigation
     *
     * @param {Array<Object>} tabs - Tab definitions
     * @param {string} tabs[].id - Tab identifier
     * @param {string} tabs[].label - Tab label
     * @param {HTMLElement|string} tabs[].content - Tab content
     * @returns {HTMLElement} Tabs container
     *
     * @example
     * const tabs = Components.Tabs([
     *   { id: 'overview', label: 'Overview', content: overviewEl },
     *   { id: 'details', label: 'Details', content: detailsEl }
     * ]);
     */
    Tabs(tabs) {
        const container = document.createElement('div');
        container.className = 'tabs-container';

        const tabsHeader = document.createElement('div');
        tabsHeader.className = 'tabs';
        tabsHeader.setAttribute('role', 'tablist');

        const contentContainer = document.createElement('div');
        contentContainer.className = 'tab-content';

        tabs.forEach((tab, index) => {
            const tabBtn = document.createElement('button');
            tabBtn.className = 'tab';
            tabBtn.textContent = tab.label;
            tabBtn.setAttribute('role', 'tab');
            tabBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tabBtn.setAttribute('aria-controls', `tab-panel-${tab.id}`);
            tabBtn.setAttribute('id', `tab-${tab.id}`);
            tabBtn.setAttribute('tabindex', index === 0 ? '0' : '-1');
            if (index === 0) tabBtn.classList.add('active');

            const tabContent = document.createElement('div');
            tabContent.id = `tab-panel-${tab.id}`;
            tabContent.className = 'tab-panel';
            tabContent.setAttribute('role', 'tabpanel');
            tabContent.setAttribute('aria-labelledby', `tab-${tab.id}`);
            tabContent.setAttribute('tabindex', '0');
            tabContent.style.display = index === 0 ? 'block' : 'none';

            if (typeof tab.content === 'string') {
                tabContent.innerHTML = tab.content;
            } else if (tab.content instanceof HTMLElement) {
                tabContent.appendChild(tab.content);
            }

            const activateTab = () => {
                // Deactivate all tabs
                tabsHeader.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                    t.setAttribute('tabindex', '-1');
                });
                contentContainer.querySelectorAll('.tab-panel').forEach(c => {
                    c.style.display = 'none';
                });

                // Activate clicked tab
                tabBtn.classList.add('active');
                tabBtn.setAttribute('aria-selected', 'true');
                tabBtn.setAttribute('tabindex', '0');
                tabContent.style.display = 'block';
                tabBtn.focus();
            };

            tabBtn.addEventListener('click', activateTab);

            // Keyboard navigation
            tabBtn.addEventListener('keydown', (e) => {
                const tabButtons = Array.from(tabsHeader.querySelectorAll('.tab'));
                const currentIndex = tabButtons.indexOf(tabBtn);

                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % tabButtons.length;
                    tabButtons[nextIndex].click();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                    tabButtons[prevIndex].click();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    tabButtons[0].click();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    tabButtons[tabButtons.length - 1].click();
                }
            });

            tabsHeader.appendChild(tabBtn);
            contentContainer.appendChild(tabContent);
        });

        container.appendChild(tabsHeader);
        container.appendChild(contentContainer);

        return container;
    }
};

// Make globally available
window.Components = Components;

// Log component library initialization
console.log('📦 Component library loaded:', Object.keys(Components).length, 'components');
