// BlackRoad OS — DoctorTerminalLog
// Terminal-style output rendered in the UI

export function DoctorTerminalLog({ terminalText = '' }) {
  const lines = terminalText.split('\n').map(line => {
    // Highlight status labels
    let styled = line;
    styled = styled.replace(/\[PASS\]/g, '<span class="br-term-pass">[PASS]</span>');
    styled = styled.replace(/\[FAIL\]/g, '<span class="br-term-fail">[FAIL]</span>');
    styled = styled.replace(/\[WARN\]/g, '<span class="br-term-warn">[WARN]</span>');
    styled = styled.replace(/\[MISSING\]/g, '<span class="br-term-missing">[MISSING]</span>');
    styled = styled.replace(/\[BLOCKED\]/g, '<span class="br-term-blocked">[BLOCKED]</span>');
    styled = styled.replace(/\[APPROVAL\]/g, '<span class="br-term-approval">[APPROVAL]</span>');
    return `<div class="br-term-line">${styled}</div>`;
  }).join('');

  return `
    <div class="br-terminal">
      <div class="br-terminal__bar">
        <span class="br-mono">BlackRoad Doctor</span>
      </div>
      <div class="br-terminal__body">
        ${lines}
      </div>
    </div>
  `;
}

export const TERMINAL_CSS = `
.br-terminal { background: var(--br-bg); border: 1px solid var(--br-line); border-radius: var(--br-radius-md); overflow: hidden; }
.br-terminal__bar { padding: var(--br-gap-sm) var(--br-gap-md); border-bottom: 1px solid var(--br-line-soft); background: var(--br-chip); }
.br-terminal__body { padding: var(--br-gap-md); font-family: var(--br-font-mono); font-size: 12px; line-height: 1.6; overflow-x: auto; white-space: pre; }
.br-term-line { min-height: 1.6em; }
.br-term-pass { color: var(--br-text); }
.br-term-fail { color: var(--br-text); font-weight: 600; }
.br-term-warn { color: var(--br-muted); }
.br-term-missing { color: var(--br-dim); }
.br-term-blocked { color: var(--br-text); font-weight: 600; }
.br-term-approval { color: var(--br-muted); }
`;
