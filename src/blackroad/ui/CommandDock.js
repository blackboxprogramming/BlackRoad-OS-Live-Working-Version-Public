// BlackRoad OS — CommandDock (v2)
// The steering wheel. Routes everything.

import { execute } from '../command/commandActions.js';
import { addToHistory } from '../command/commandHistory.js';
import { logCommand, ready } from '../command/commandTelemetry.js';
import { openFromCommandResult } from '../surfaces/surfaceRuntime.js';
import { addToSurfaceHistory } from '../surfaces/surfaceHistory.js';

export function CommandDock({ placeholder = 'Search apps, docs, domains, products...' }) {
  return `
    <nav class="br-dock" data-component="command-dock">
      <div class="br-dock__input-wrap">
        <span class="br-dock__slash">/</span>
        <input
          type="text"
          class="br-dock__input"
          placeholder="${placeholder}"
          autocomplete="off"
          spellcheck="false"
          data-command-input
        >
        <span class="br-dock__hint">esc to close</span>
      </div>
      <div class="br-dock__suggestions" data-command-suggestions style="display:none"></div>
    </nav>
  `;
}

// Initialize dock behavior (call after DOM ready)
export function initCommandDock() {
  ready();

  const input = document.querySelector('[data-command-input]');
  if (!input) return;

  // Submit on Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      const result = execute(input.value.trim());
      logCommand(result);
      addToHistory(input.value.trim(), result);

      if (result.action !== 'error') {
        const surface = openFromCommandResult(result);
        if (surface) addToSurfaceHistory(surface);
      }

      input.value = '';
      hideSuggestions();
    }
  });

  // / to focus
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === 'Escape') {
      input.blur();
      input.value = '';
      hideSuggestions();
    }
  });
}

function hideSuggestions() {
  const el = document.querySelector('[data-command-suggestions]');
  if (el) el.style.display = 'none';
}

// Command parser (standalone, for use without DOM)
export { route as routeCommand } from '../command/commandRouter.js';
export { execute as executeCommand } from '../command/commandActions.js';
export { search as searchCommand } from '../command/commandSearch.js';
