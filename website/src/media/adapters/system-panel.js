function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderAction(action) {
  const attrs = [];
  if (action.surfaceId) attrs.push(`data-surface-id="${escapeHtml(action.surfaceId)}"`);
  if (action.href) attrs.push(`data-href="${escapeHtml(action.href)}"`);
  if (action.query) attrs.push(`data-query="${escapeHtml(action.query)}"`);
  return `<button type="button" class="surface-action" ${attrs.join(' ')}>${escapeHtml(action.label)}</button>`;
}

function renderInlineAction(action, className = 'surface-action') {
  const attrs = [];
  if (action.surfaceId) attrs.push(`data-surface-id="${escapeHtml(action.surfaceId)}"`);
  if (action.href) attrs.push(`data-href="${escapeHtml(action.href)}"`);
  if (action.query) attrs.push(`data-query="${escapeHtml(action.query)}"`);
  return `<button type="button" class="${className}" ${attrs.join(' ')}>${escapeHtml(action.label)}</button>`;
}

function renderItem(item) {
  const attrs = [];
  if (item.surfaceId) attrs.push(`data-surface-id="${escapeHtml(item.surfaceId)}"`);
  if (item.href) attrs.push(`data-href="${escapeHtml(item.href)}"`);
  if (item.query) attrs.push(`data-query="${escapeHtml(item.query)}"`);
  return `
    <button type="button" class="system-panel-card" ${attrs.join(' ')}>
      <span class="system-panel-card-title">${escapeHtml(item.title)}</span>
      <span class="system-panel-card-subtitle">${escapeHtml(item.subtitle || '')}</span>
    </button>
  `;
}

function renderSection(section) {
  return `
    <section class="system-panel-section">
      <div class="system-panel-section-head">
        <div class="system-panel-section-title">${escapeHtml(section.title)}</div>
        ${section.note ? `<div class="system-panel-section-note">${escapeHtml(section.note)}</div>` : ''}
      </div>
      <div class="system-panel-grid">
        ${(section.items || []).map(renderItem).join('')}
      </div>
    </section>
  `;
}

function renderMetric(metric) {
  return `
    <div class="system-panel-metric">
      <div class="system-panel-metric-value">${escapeHtml(metric.value || '')}</div>
      <div class="system-panel-metric-label">${escapeHtml(metric.label || '')}</div>
    </div>
  `;
}

function renderFact(fact) {
  return `
    <div class="system-panel-fact">
      <div class="system-panel-fact-label">${escapeHtml(fact.label || '')}</div>
      <div class="system-panel-fact-value">${escapeHtml(fact.value || '')}</div>
    </div>
  `;
}

function renderSequenceStep(step, index) {
  return `
    <div class="system-panel-sequence-step">
      <div class="system-panel-sequence-index">${escapeHtml(step.index || String(index + 1))}</div>
      <div class="system-panel-sequence-body">
        <div class="system-panel-sequence-title">${escapeHtml(step.title || '')}</div>
        <div class="system-panel-sequence-copy">${escapeHtml(step.subtitle || '')}</div>
      </div>
    </div>
  `;
}

function renderSpotlight(item) {
  const attrs = [];
  if (item.surfaceId) attrs.push(`data-surface-id="${escapeHtml(item.surfaceId)}"`);
  if (item.href) attrs.push(`data-href="${escapeHtml(item.href)}"`);
  if (item.query) attrs.push(`data-query="${escapeHtml(item.query)}"`);
  const interactive = attrs.length > 0;
  const tag = interactive ? 'button type="button"' : 'div';
  const closingTag = interactive ? 'button' : 'div';
  return `
    <${tag} class="system-panel-spotlight" ${attrs.join(' ')}>
      <div class="system-panel-spotlight-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-spotlight-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-spotlight-subtitle">${escapeHtml(item.subtitle || '')}</div>
    </${closingTag}>
  `;
}

function renderBrief(item) {
  const attrs = [];
  if (item.surfaceId) attrs.push(`data-surface-id="${escapeHtml(item.surfaceId)}"`);
  if (item.href) attrs.push(`data-href="${escapeHtml(item.href)}"`);
  if (item.query) attrs.push(`data-query="${escapeHtml(item.query)}"`);
  const interactive = attrs.length > 0;
  const tag = interactive ? 'button type="button"' : 'div';
  const closingTag = interactive ? 'button' : 'div';
  return `
    <${tag} class="system-panel-brief" ${attrs.join(' ')}>
      <div class="system-panel-brief-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-brief-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-brief-copy">${escapeHtml(item.copy || '')}</div>
    </${closingTag}>
  `;
}

function renderClusterItem(item) {
  const attrs = [];
  if (item.surfaceId) attrs.push(`data-surface-id="${escapeHtml(item.surfaceId)}"`);
  if (item.href) attrs.push(`data-href="${escapeHtml(item.href)}"`);
  if (item.query) attrs.push(`data-query="${escapeHtml(item.query)}"`);
  return `
    <button type="button" class="system-panel-cluster-item" ${attrs.join(' ')}>
      <span class="system-panel-cluster-item-title">${escapeHtml(item.title || '')}</span>
      <span class="system-panel-cluster-item-subtitle">${escapeHtml(item.subtitle || '')}</span>
    </button>
  `;
}

function renderClusterGroup(group) {
  return `
    <div class="system-panel-cluster-group">
      <div class="system-panel-cluster-group-head">
        <div class="system-panel-cluster-group-title">${escapeHtml(group.title || '')}</div>
        ${group.note ? `<div class="system-panel-cluster-group-note">${escapeHtml(group.note)}</div>` : ''}
      </div>
      <div class="system-panel-cluster-group-items">
        ${(group.items || []).map(renderClusterItem).join('')}
      </div>
    </div>
  `;
}

function renderBoardItem(item) {
  const attrs = [];
  if (item.surfaceId) attrs.push(`data-surface-id="${escapeHtml(item.surfaceId)}"`);
  if (item.href) attrs.push(`data-href="${escapeHtml(item.href)}"`);
  if (item.query) attrs.push(`data-query="${escapeHtml(item.query)}"`);
  return `
    <button type="button" class="system-panel-board-item" ${attrs.join(' ')}>
      <span class="system-panel-board-item-title">${escapeHtml(item.title || '')}</span>
      <span class="system-panel-board-item-subtitle">${escapeHtml(item.subtitle || '')}</span>
    </button>
  `;
}

function renderBoardColumn(column) {
  return `
    <div class="system-panel-board-column">
      <div class="system-panel-board-column-head">
        <div class="system-panel-board-column-title">${escapeHtml(column.title || '')}</div>
        ${column.note ? `<div class="system-panel-board-column-note">${escapeHtml(column.note)}</div>` : ''}
      </div>
      <div class="system-panel-board-items">
        ${(column.items || []).map(renderBoardItem).join('')}
      </div>
    </div>
  `;
}

function renderRunbook(item) {
  return `
    <div class="system-panel-runbook">
      <div class="system-panel-runbook-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-runbook-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-runbook-copy">${escapeHtml(item.copy || '')}</div>
      <div class="system-panel-runbook-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-runbook-action')).join('')}
      </div>
    </div>
  `;
}

function renderProtocolStage(stage) {
  return `
    <div class="system-panel-protocol-stage">
      <div class="system-panel-protocol-stage-label">${escapeHtml(stage.label || '')}</div>
      <div class="system-panel-protocol-stage-value">${escapeHtml(stage.value || '')}</div>
    </div>
  `;
}

function renderProtocol(item) {
  return `
    <div class="system-panel-protocol">
      <div class="system-panel-protocol-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-protocol-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-protocol-stages">
        ${(item.stages || []).map(renderProtocolStage).join('')}
      </div>
      <div class="system-panel-protocol-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-protocol-action')).join('')}
      </div>
    </div>
  `;
}

function renderTripwire(item) {
  return `
    <div class="system-panel-tripwire">
      <div class="system-panel-tripwire-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-tripwire-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-tripwire-lines">
        <div class="system-panel-tripwire-line">
          <span class="system-panel-tripwire-key">Signal</span>
          <span class="system-panel-tripwire-value">${escapeHtml(item.signal || '')}</span>
        </div>
        <div class="system-panel-tripwire-line">
          <span class="system-panel-tripwire-key">Trigger</span>
          <span class="system-panel-tripwire-value">${escapeHtml(item.trigger || '')}</span>
        </div>
        <div class="system-panel-tripwire-line">
          <span class="system-panel-tripwire-key">Response</span>
          <span class="system-panel-tripwire-value">${escapeHtml(item.response || '')}</span>
        </div>
      </div>
      <div class="system-panel-tripwire-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-tripwire-action')).join('')}
      </div>
    </div>
  `;
}

function renderDecision(item) {
  return `
    <div class="system-panel-decision">
      <div class="system-panel-decision-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-decision-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-decision-lines">
        <div class="system-panel-decision-line">
          <span class="system-panel-decision-key">Choose</span>
          <span class="system-panel-decision-value">${escapeHtml(item.decision || '')}</span>
        </div>
        <div class="system-panel-decision-line">
          <span class="system-panel-decision-key">When</span>
          <span class="system-panel-decision-value">${escapeHtml(item.condition || '')}</span>
        </div>
        <div class="system-panel-decision-line">
          <span class="system-panel-decision-key">Why</span>
          <span class="system-panel-decision-value">${escapeHtml(item.rationale || '')}</span>
        </div>
      </div>
      <div class="system-panel-decision-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-decision-action')).join('')}
      </div>
    </div>
  `;
}

function renderCheckpoint(item) {
  return `
    <div class="system-panel-checkpoint">
      <div class="system-panel-checkpoint-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-checkpoint-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-checkpoint-lines">
        <div class="system-panel-checkpoint-line">
          <span class="system-panel-checkpoint-key">Objective</span>
          <span class="system-panel-checkpoint-value">${escapeHtml(item.objective || '')}</span>
        </div>
        <div class="system-panel-checkpoint-line">
          <span class="system-panel-checkpoint-key">Proof</span>
          <span class="system-panel-checkpoint-value">${escapeHtml(item.proof || '')}</span>
        </div>
        <div class="system-panel-checkpoint-line">
          <span class="system-panel-checkpoint-key">Exit</span>
          <span class="system-panel-checkpoint-value">${escapeHtml(item.exit || '')}</span>
        </div>
      </div>
      <div class="system-panel-checkpoint-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-checkpoint-action')).join('')}
      </div>
    </div>
  `;
}

function renderDependency(item) {
  return `
    <div class="system-panel-dependency">
      <div class="system-panel-dependency-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-dependency-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-dependency-lines">
        <div class="system-panel-dependency-line">
          <span class="system-panel-dependency-key">Relies on</span>
          <span class="system-panel-dependency-value">${escapeHtml(item.reliesOn || '')}</span>
        </div>
        <div class="system-panel-dependency-line">
          <span class="system-panel-dependency-key">Watch</span>
          <span class="system-panel-dependency-value">${escapeHtml(item.watch || '')}</span>
        </div>
        <div class="system-panel-dependency-line">
          <span class="system-panel-dependency-key">Unlocks</span>
          <span class="system-panel-dependency-value">${escapeHtml(item.unlocks || '')}</span>
        </div>
      </div>
      <div class="system-panel-dependency-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-dependency-action')).join('')}
      </div>
    </div>
  `;
}

function renderGuardrail(item) {
  return `
    <div class="system-panel-guardrail">
      <div class="system-panel-guardrail-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-guardrail-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-guardrail-lines">
        <div class="system-panel-guardrail-line">
          <span class="system-panel-guardrail-key">Preserve</span>
          <span class="system-panel-guardrail-value">${escapeHtml(item.preserve || '')}</span>
        </div>
        <div class="system-panel-guardrail-line">
          <span class="system-panel-guardrail-key">Avoid</span>
          <span class="system-panel-guardrail-value">${escapeHtml(item.avoid || '')}</span>
        </div>
        <div class="system-panel-guardrail-line">
          <span class="system-panel-guardrail-key">Recover</span>
          <span class="system-panel-guardrail-value">${escapeHtml(item.recover || '')}</span>
        </div>
      </div>
      <div class="system-panel-guardrail-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-guardrail-action')).join('')}
      </div>
    </div>
  `;
}

function renderCustody(item) {
  return `
    <div class="system-panel-custody">
      <div class="system-panel-custody-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-custody-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-custody-lines">
        <div class="system-panel-custody-line">
          <span class="system-panel-custody-key">Current</span>
          <span class="system-panel-custody-value">${escapeHtml(item.current || '')}</span>
        </div>
        <div class="system-panel-custody-line">
          <span class="system-panel-custody-key">Shared with</span>
          <span class="system-panel-custody-value">${escapeHtml(item.sharedWith || '')}</span>
        </div>
        <div class="system-panel-custody-line">
          <span class="system-panel-custody-key">Transfers to</span>
          <span class="system-panel-custody-value">${escapeHtml(item.transfersTo || '')}</span>
        </div>
      </div>
      <div class="system-panel-custody-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-custody-action')).join('')}
      </div>
    </div>
  `;
}

function renderReceipt(item) {
  return `
    <div class="system-panel-receipt">
      <div class="system-panel-receipt-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-receipt-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-receipt-lines">
        <div class="system-panel-receipt-line">
          <span class="system-panel-receipt-key">Send</span>
          <span class="system-panel-receipt-value">${escapeHtml(item.sends || '')}</span>
        </div>
        <div class="system-panel-receipt-line">
          <span class="system-panel-receipt-key">Land</span>
          <span class="system-panel-receipt-value">${escapeHtml(item.lands || '')}</span>
        </div>
        <div class="system-panel-receipt-line">
          <span class="system-panel-receipt-key">Confirm</span>
          <span class="system-panel-receipt-value">${escapeHtml(item.confirms || '')}</span>
        </div>
      </div>
      <div class="system-panel-receipt-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-receipt-action')).join('')}
      </div>
    </div>
  `;
}

function renderCadence(item) {
  return `
    <div class="system-panel-cadence">
      <div class="system-panel-cadence-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-cadence-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-cadence-lines">
        <div class="system-panel-cadence-line">
          <span class="system-panel-cadence-key">Review</span>
          <span class="system-panel-cadence-value">${escapeHtml(item.review || '')}</span>
        </div>
        <div class="system-panel-cadence-line">
          <span class="system-panel-cadence-key">Pulse</span>
          <span class="system-panel-cadence-value">${escapeHtml(item.pulse || '')}</span>
        </div>
        <div class="system-panel-cadence-line">
          <span class="system-panel-cadence-key">Reset</span>
          <span class="system-panel-cadence-value">${escapeHtml(item.reset || '')}</span>
        </div>
      </div>
      <div class="system-panel-cadence-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-cadence-action')).join('')}
      </div>
    </div>
  `;
}

function renderFallback(item) {
  return `
    <div class="system-panel-fallback">
      <div class="system-panel-fallback-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-fallback-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-fallback-lines">
        <div class="system-panel-fallback-line">
          <span class="system-panel-fallback-key">Breaks</span>
          <span class="system-panel-fallback-value">${escapeHtml(item.breaks || '')}</span>
        </div>
        <div class="system-panel-fallback-line">
          <span class="system-panel-fallback-key">Fallback</span>
          <span class="system-panel-fallback-value">${escapeHtml(item.fallback || '')}</span>
        </div>
        <div class="system-panel-fallback-line">
          <span class="system-panel-fallback-key">Resume</span>
          <span class="system-panel-fallback-value">${escapeHtml(item.resume || '')}</span>
        </div>
      </div>
      <div class="system-panel-fallback-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-fallback-action')).join('')}
      </div>
    </div>
  `;
}

function renderPrimer(item) {
  return `
    <div class="system-panel-primer">
      <div class="system-panel-primer-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-primer-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-primer-lines">
        <div class="system-panel-primer-line">
          <span class="system-panel-primer-key">Start</span>
          <span class="system-panel-primer-value">${escapeHtml(item.start || '')}</span>
        </div>
        <div class="system-panel-primer-line">
          <span class="system-panel-primer-key">Gather</span>
          <span class="system-panel-primer-value">${escapeHtml(item.gather || '')}</span>
        </div>
        <div class="system-panel-primer-line">
          <span class="system-panel-primer-key">Ready</span>
          <span class="system-panel-primer-value">${escapeHtml(item.ready || '')}</span>
        </div>
      </div>
      <div class="system-panel-primer-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-primer-action')).join('')}
      </div>
    </div>
  `;
}

function renderRitual(item) {
  return `
    <div class="system-panel-ritual">
      <div class="system-panel-ritual-label">${escapeHtml(item.label || '')}</div>
      <div class="system-panel-ritual-title">${escapeHtml(item.title || '')}</div>
      <div class="system-panel-ritual-lines">
        <div class="system-panel-ritual-line">
          <span class="system-panel-ritual-key">Practice</span>
          <span class="system-panel-ritual-value">${escapeHtml(item.practice || '')}</span>
        </div>
        <div class="system-panel-ritual-line">
          <span class="system-panel-ritual-key">Frequency</span>
          <span class="system-panel-ritual-value">${escapeHtml(item.frequency || '')}</span>
        </div>
        <div class="system-panel-ritual-line">
          <span class="system-panel-ritual-key">Purpose</span>
          <span class="system-panel-ritual-value">${escapeHtml(item.purpose || '')}</span>
        </div>
      </div>
      <div class="system-panel-ritual-actions">
        ${(item.actions || []).map((action) => renderInlineAction(action, 'system-panel-ritual-action')).join('')}
      </div>
    </div>
  `;
}

function renderWidget(widget) {
  const body = widget.kind === 'facts'
    ? `<div class="system-panel-facts">${(widget.items || []).map(renderFact).join('')}</div>`
    : widget.kind === 'sequence'
      ? `<div class="system-panel-sequence">${(widget.items || []).map(renderSequenceStep).join('')}</div>`
      : widget.kind === 'spotlight'
        ? `<div class="system-panel-spotlights">${(widget.items || []).map(renderSpotlight).join('')}</div>`
        : widget.kind === 'primers'
          ? `<div class="system-panel-primers">${(widget.items || []).map(renderPrimer).join('')}</div>`
          : widget.kind === 'rituals'
            ? `<div class="system-panel-rituals">${(widget.items || []).map(renderRitual).join('')}</div>`
        : widget.kind === 'briefs'
          ? `<div class="system-panel-briefs">${(widget.items || []).map(renderBrief).join('')}</div>`
        : widget.kind === 'runbooks'
          ? `<div class="system-panel-runbooks">${(widget.items || []).map(renderRunbook).join('')}</div>`
        : widget.kind === 'protocols'
          ? `<div class="system-panel-protocols">${(widget.items || []).map(renderProtocol).join('')}</div>`
        : widget.kind === 'tripwires'
          ? `<div class="system-panel-tripwires">${(widget.items || []).map(renderTripwire).join('')}</div>`
        : widget.kind === 'decisions'
          ? `<div class="system-panel-decisions">${(widget.items || []).map(renderDecision).join('')}</div>`
        : widget.kind === 'checkpoints'
          ? `<div class="system-panel-checkpoints">${(widget.items || []).map(renderCheckpoint).join('')}</div>`
        : widget.kind === 'dependencies'
          ? `<div class="system-panel-dependencies">${(widget.items || []).map(renderDependency).join('')}</div>`
        : widget.kind === 'guardrails'
          ? `<div class="system-panel-guardrails">${(widget.items || []).map(renderGuardrail).join('')}</div>`
        : widget.kind === 'custody'
          ? `<div class="system-panel-custody-grid">${(widget.items || []).map(renderCustody).join('')}</div>`
        : widget.kind === 'receipts'
          ? `<div class="system-panel-receipts">${(widget.items || []).map(renderReceipt).join('')}</div>`
        : widget.kind === 'cadence'
          ? `<div class="system-panel-cadences">${(widget.items || []).map(renderCadence).join('')}</div>`
        : widget.kind === 'fallbacks'
          ? `<div class="system-panel-fallbacks">${(widget.items || []).map(renderFallback).join('')}</div>`
        : widget.kind === 'board'
          ? `<div class="system-panel-board">${(widget.columns || []).map(renderBoardColumn).join('')}</div>`
        : widget.kind === 'clusters'
          ? `<div class="system-panel-clusters">${(widget.groups || []).map(renderClusterGroup).join('')}</div>`
      : `<div class="system-panel-metrics">${(widget.items || []).map(renderMetric).join('')}</div>`;

  return `
    <section class="system-panel-widget">
      <div class="system-panel-section-head">
        <div class="system-panel-section-title">${escapeHtml(widget.title || '')}</div>
        ${widget.note ? `<div class="system-panel-section-note">${escapeHtml(widget.note)}</div>` : ''}
      </div>
      ${body}
    </section>
  `;
}

export const systemPanelAdapter = {
  id: 'system-panel',
  canHandle(surface) {
    return surface.kind === 'system' || surface.provider === 'blackroad-system';
  },
  render(surface, mountNode, context) {
    const panel = surface.meta?.panel;
    if (!panel) {
      context.showFallback(surface, 'System panel metadata is missing.');
      return () => {};
    }

    const wrap = document.createElement('div');
    wrap.className = 'system-panel';
    wrap.innerHTML = `
      <div class="system-panel-hero">
        <div class="system-panel-kicker">${escapeHtml(panel.kicker || surface.subtitle || 'System')}</div>
        <div class="system-panel-title">${escapeHtml(panel.title || surface.title)}</div>
        <div class="system-panel-copy">${escapeHtml(panel.description || surface.notes || '')}</div>
        <div class="surface-actions">
          ${(panel.actions || []).map(renderAction).join('')}
        </div>
      </div>
      <div class="system-panel-widgets">
        ${(panel.widgets || []).map(renderWidget).join('')}
      </div>
      ${(panel.sections || []).map(renderSection).join('')}
    `;

    wrap.addEventListener('click', (event) => {
      const target = event.target.closest('[data-surface-id], [data-href], [data-query]');
      if (!target) return;
      const surfaceId = target.getAttribute('data-surface-id');
      const href = target.getAttribute('data-href');
      const query = target.getAttribute('data-query');
      if (surfaceId) {
        context.openSurfaceById?.(surfaceId);
      } else if (query) {
        context.openQuery?.(query);
      } else if (href) {
        context.openExternal?.(href);
      }
    });

    mountNode.appendChild(wrap);
    return () => wrap.remove();
  },
};
