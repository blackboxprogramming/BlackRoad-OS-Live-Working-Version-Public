/**
 * Cece Ultra - Full Stack Cognition Interface
 *
 * Interactive dashboard for the Cece Ultra cognitive processing engine.
 * Provides:
 * - Input normalization visualization
 * - 15-step cognitive pipeline tracking
 * - Architecture layer visualization
 * - Multi-agent orchestration display
 * - Execution history
 */

window.Apps = window.Apps || {};

window.Apps.CeceUltra = {
  // State
  currentExecution: null,
  executionHistory: [],
  isProcessing: false,

  /**
   * Initialize Cece Ultra app
   */
  init() {
    console.log('💜 Cece Ultra initialized');
    this.render();
    this.loadHistory();
  },

  /**
   * Render main UI
   */
  render() {
    const container = document.getElementById('ceceultra-container');
    if (!container) {
      console.error('Cece Ultra container not found');
      return;
    }

    container.innerHTML = `
      <div style="padding: 20px; font-family: 'MS Sans Serif', Arial, sans-serif; background: #008080; min-height: 100%;">
        <!-- Header -->
        <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(180deg, #800080, #c000c0); color: white; border-radius: 4px; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);">
          <h1 style="margin: 0; font-size: 20px;">🟣 Cece Ultra</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.95;">Full Stack Cognition Engine v1.0</p>
        </div>

        <!-- Input Section -->
        <div style="margin-bottom: 20px; padding: 15px; background: #ffffff; border: 3px solid #800080; border-radius: 4px;">
          <h2 style="margin: 0 0 10px 0; font-size: 14px; color: #800080;">🎯 Input</h2>
          <textarea id="cece-input" placeholder="Enter your question, thought, or challenge... (e.g., 'I'm overwhelmed with this project 😭')"
            style="width: 100%; height: 80px; padding: 8px; border: 2px solid #808080; font-family: 'MS Sans Serif'; font-size: 12px; resize: vertical;"></textarea>

          <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
            <select id="cece-mode" style="padding: 5px; border: 2px solid #808080; font-family: 'MS Sans Serif'; font-size: 11px;">
              <option value="full_stack">Full Stack</option>
              <option value="quick">Quick</option>
              <option value="deep_dive">Deep Dive</option>
            </select>

            <label style="font-size: 11px; display: flex; align-items: center; gap: 5px;">
              <input type="checkbox" id="cece-orchestrate" />
              Enable Multi-Agent Orchestration
            </label>

            <button onclick="window.Apps.CeceUltra.runCognition()"
              style="padding: 8px 16px; background: #800080; color: white; border: 2px outset #c000c0; cursor: pointer; font-family: 'MS Sans Serif'; font-weight: bold; margin-left: auto;">
              🟣 Run Cognition
            </button>

            <button onclick="window.Apps.CeceUltra.quickAnalysis()"
              style="padding: 8px 16px; background: #c0c0c0; border: 2px outset #ffffff; cursor: pointer; font-family: 'MS Sans Serif';">
              ⚡ Quick Analysis
            </button>
          </div>
        </div>

        <!-- Status Bar -->
        <div id="cece-status" style="margin-bottom: 15px; padding: 10px; background: #c0c0c0; border: 2px solid #808080; font-size: 11px; display: none;">
          <span id="cece-status-text">Ready</span>
        </div>

        <!-- Results Tabs -->
        <div id="cece-results" style="display: none;">
          <!-- Tab Navigation -->
          <div style="display: flex; gap: 5px; margin-bottom: -2px;">
            <button onclick="window.Apps.CeceUltra.switchTab('pipeline')" id="tab-pipeline"
              style="padding: 6px 12px; background: #800080; color: white; border: 2px solid #800080; border-bottom: none; cursor: pointer; font-family: 'MS Sans Serif'; font-size: 11px;">
              🧠 Pipeline
            </button>
            <button onclick="window.Apps.CeceUltra.switchTab('architecture')" id="tab-architecture"
              style="padding: 6px 12px; background: #c0c0c0; border: 2px solid #808080; border-bottom: none; cursor: pointer; font-family: 'MS Sans Serif'; font-size: 11px;">
              🛠️ Architecture
            </button>
            <button onclick="window.Apps.CeceUltra.switchTab('action')" id="tab-action"
              style="padding: 6px 12px; background: #c0c0c0; border: 2px solid #808080; border-bottom: none; cursor: pointer; font-family: 'MS Sans Serif'; font-size: 11px;">
              📋 Action Plan
            </button>
            <button onclick="window.Apps.CeceUltra.switchTab('summary')" id="tab-summary"
              style="padding: 6px 12px; background: #c0c0c0; border: 2px solid #808080; border-bottom: none; cursor: pointer; font-family: 'MS Sans Serif'; font-size: 11px;">
              🌿 Summary
            </button>
          </div>

          <!-- Tab Content -->
          <div style="background: #ffffff; border: 3px solid #800080; padding: 15px; min-height: 300px;">
            <div id="tab-content-pipeline" class="tab-content">Loading...</div>
            <div id="tab-content-architecture" class="tab-content" style="display: none;">Loading...</div>
            <div id="tab-content-action" class="tab-content" style="display: none;">Loading...</div>
            <div id="tab-content-summary" class="tab-content" style="display: none;">Loading...</div>
          </div>
        </div>

        <!-- Execution History -->
        <div style="margin-top: 20px; padding: 15px; background: #ffffff; border: 3px solid #800080; border-radius: 4px;">
          <h2 style="margin: 0 0 10px 0; font-size: 14px; color: #800080;">📜 Execution History</h2>
          <div id="cece-history" style="max-height: 200px; overflow-y: auto; font-size: 11px;">
            Loading history...
          </div>
        </div>

        <!-- Info Footer -->
        <div style="margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 10px; color: white;">
          <strong>Invocation:</strong> "Cece, run cognition." |
          <strong>Docs:</strong> /docs/CECE_ULTRAPROMPT.md |
          <strong>Slash Command:</strong> /cece-ultra
        </div>
      </div>
    `;
  },

  /**
   * Switch between result tabs
   */
  switchTab(tabName) {
    // Update button styles
    const tabs = ['pipeline', 'architecture', 'action', 'summary'];
    tabs.forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      const content = document.getElementById(`tab-content-${tab}`);

      if (tab === tabName) {
        btn.style.background = '#800080';
        btn.style.color = 'white';
        btn.style.border = '2px solid #800080';
        content.style.display = 'block';
      } else {
        btn.style.background = '#c0c0c0';
        btn.style.color = 'black';
        btn.style.border = '2px solid #808080';
        content.style.display = 'none';
      }
    });
  },

  /**
   * Run full cognition
   */
  async runCognition() {
    const input = document.getElementById('cece-input').value.trim();
    if (!input) {
      alert('Please enter some input to process');
      return;
    }

    const mode = document.getElementById('cece-mode').value;
    const orchestrate = document.getElementById('cece-orchestrate').checked;

    this.showStatus('🟣 Running full stack cognition...', true);
    this.isProcessing = true;

    try {
      const response = await fetch('/api/cece/cognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          mode,
          orchestrate,
          save_to_memory: true,
          context: {
            source: 'ceceultra-app',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      this.currentExecution = result;

      this.showStatus('✅ Cognition complete!', false);
      this.displayResults(result);
      this.loadHistory();

    } catch (error) {
      console.error('Cognition error:', error);
      this.showStatus(`❌ Error: ${error.message}`, false);
      alert(`Cognition failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  },

  /**
   * Quick analysis (lightweight)
   */
  async quickAnalysis() {
    const input = document.getElementById('cece-input').value.trim();
    if (!input) {
      alert('Please enter some input to analyze');
      return;
    }

    this.showStatus('⚡ Running quick analysis...', true);

    try {
      const response = await fetch('/api/cece/cognition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          focus: 'emotional'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();

      this.showStatus('✅ Analysis complete!', false);

      // Display quick analysis in alert
      const summary = `
Quick Analysis Results:

Emotional Payload: ${result.emotional_payload}
Urgency: ${result.urgency}
Vibe: ${result.vibe}

Suggestions:
${result.suggestions.map((s, i) => `${i+1}. ${s}`).join('\n')}
      `.trim();

      alert(summary);

    } catch (error) {
      console.error('Analysis error:', error);
      this.showStatus(`❌ Error: ${error.message}`, false);
      alert(`Analysis failed: ${error.message}`);
    }
  },

  /**
   * Display cognition results
   */
  displayResults(result) {
    const resultsDiv = document.getElementById('cece-results');
    resultsDiv.style.display = 'block';

    // Pipeline tab
    this.renderPipeline(result.cognitive_pipeline, result.normalized_input);

    // Architecture tab
    this.renderArchitecture(result.architecture_output);

    // Action plan tab
    this.renderActionPlan(result.action_plan);

    // Summary tab
    this.renderSummary(result);

    // Switch to pipeline tab
    this.switchTab('pipeline');
  },

  /**
   * Render cognitive pipeline visualization
   */
  renderPipeline(pipeline, normalizedInput) {
    const container = document.getElementById('tab-content-pipeline');

    const steps = [
      { emoji: '🚨', label: 'Not Ok', key: 'trigger' },
      { emoji: '❓', label: 'Why', key: 'root_cause' },
      { emoji: '⚡', label: 'Impulse', key: 'impulse' },
      { emoji: '🪞', label: 'Reflect', key: 'reflection' },
      { emoji: '⚔️', label: 'Argue', key: 'challenge' },
      { emoji: '🔁', label: 'Counterpoint', key: 'counterpoint' },
      { emoji: '🎯', label: 'Determine', key: 'determination' },
      { emoji: '🧐', label: 'Question', key: 'question' },
      { emoji: '⚖️', label: 'Offset Bias', key: 'bias_offset' },
      { emoji: '🧱', label: 'Reground', key: 'values_alignment' },
      { emoji: '✍️', label: 'Clarify', key: 'clarification' },
      { emoji: '♻️', label: 'Restate', key: 'restatement' },
      { emoji: '🔎', label: 'Clarify Again', key: 'final_clarification' },
      { emoji: '🤝', label: 'Validate', key: 'validation' },
      { emoji: '⭐', label: 'Final', key: 'final_answer' }
    ];

    const stepsHTML = steps.map(step => `
      <div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-left: 4px solid #800080;">
        <div style="font-weight: bold; color: #800080; margin-bottom: 5px;">
          ${step.emoji} ${step.label}
        </div>
        <div style="font-size: 11px; color: #333;">
          ${pipeline[step.key] || 'N/A'}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="margin-bottom: 15px; padding: 10px; background: #e6e6fa; border: 2px solid #800080;">
        <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #800080;">🔮 Normalized Input</h3>
        <div style="font-size: 11px;">
          <strong>Real Question:</strong> ${normalizedInput.real_question}<br>
          <strong>Emotional Payload:</strong> ${normalizedInput.emotional_payload}<br>
          <strong>Urgency:</strong> ${normalizedInput.urgency}<br>
          <strong>Vibe:</strong> ${normalizedInput.vibe}
        </div>
      </div>

      <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #800080;">🧠 15-Step Pipeline</h3>
      ${stepsHTML}

      <div style="margin-top: 15px; padding: 10px; background: #e6e6fa; border: 2px solid #800080;">
        <strong>Emotional State:</strong> ${pipeline.emotional_state_before} → ${pipeline.emotional_state_after}<br>
        <strong>Confidence:</strong> ${(pipeline.confidence * 100).toFixed(0)}%
      </div>
    `;
  },

  /**
   * Render architecture layer visualization
   */
  renderArchitecture(architecture) {
    const container = document.getElementById('tab-content-architecture');

    container.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #800080;">🛠️ Architecture Layer</h3>

      ${architecture.structure ? `
        <div style="margin-bottom: 15px; padding: 10px; background: #e6f3ff; border-left: 4px solid #0066cc;">
          <div style="font-weight: bold; color: #0066cc; margin-bottom: 5px;">🟦 Structure</div>
          <pre style="font-size: 10px; margin: 0; overflow-x: auto;">${JSON.stringify(architecture.structure, null, 2)}</pre>
        </div>
      ` : ''}

      ${architecture.priorities ? `
        <div style="margin-bottom: 15px; padding: 10px; background: #ffe6e6; border-left: 4px solid #cc0000;">
          <div style="font-weight: bold; color: #cc0000; margin-bottom: 5px;">🟥 Priorities</div>
          <pre style="font-size: 10px; margin: 0; overflow-x: auto;">${JSON.stringify(architecture.priorities, null, 2)}</pre>
        </div>
      ` : ''}

      ${architecture.translation ? `
        <div style="margin-bottom: 15px; padding: 10px; background: #e6ffe6; border-left: 4px solid #009900;">
          <div style="font-weight: bold; color: #009900; margin-bottom: 5px;">🟩 Translation</div>
          <pre style="font-size: 10px; margin: 0; overflow-x: auto;">${JSON.stringify(architecture.translation, null, 2)}</pre>
        </div>
      ` : ''}

      ${architecture.stabilization ? `
        <div style="margin-bottom: 15px; padding: 10px; background: #f0e6ff; border-left: 4px solid #6600cc;">
          <div style="font-weight: bold; color: #6600cc; margin-bottom: 5px;">🟪 Stabilization</div>
          <pre style="font-size: 10px; margin: 0; overflow-x: auto;">${JSON.stringify(architecture.stabilization, null, 2)}</pre>
        </div>
      ` : ''}

      ${architecture.project_plan ? `
        <div style="margin-bottom: 15px; padding: 10px; background: #ffffcc; border-left: 4px solid #cc9900;">
          <div style="font-weight: bold; color: #cc9900; margin-bottom: 5px;">🟨 Project Plan</div>
          <pre style="font-size: 10px; margin: 0; overflow-x: auto;">${JSON.stringify(architecture.project_plan, null, 2)}</pre>
        </div>
      ` : ''}

      <div style="margin-top: 15px; padding: 10px; background: #ffe6cc; border: 2px solid #ff9900;">
        <strong>🟧 Loopback Needed:</strong> ${architecture.loopback_needed ? 'Yes' : 'No'}
      </div>
    `;
  },

  /**
   * Render action plan
   */
  renderActionPlan(actionPlan) {
    const container = document.getElementById('tab-content-action');

    const stepsHTML = actionPlan.map((step, index) => `
      <div style="margin-bottom: 10px; padding: 8px; background: #f9f9f9; border-left: 3px solid #800080;">
        ${step}
      </div>
    `).join('');

    container.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #800080;">🪜 Action Plan</h3>
      ${stepsHTML || '<p style="color: #666;">No action plan generated</p>'}
    `;
  },

  /**
   * Render stable summary
   */
  renderSummary(result) {
    const container = document.getElementById('tab-content-summary');

    container.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #800080;">🌿 Stable Summary</h3>
      <div style="padding: 15px; background: #f0f0f0; border: 2px solid #800080; line-height: 1.6;">
        ${result.stable_summary}
      </div>

      ${result.orchestration ? `
        <h3 style="margin: 20px 0 10px 0; font-size: 13px; color: #800080;">👥 Multi-Agent Orchestration</h3>
        <div style="padding: 10px; background: #e6e6fa; border: 2px solid #800080;">
          <strong>Mode:</strong> ${result.orchestration.orchestration_mode}<br>
          <strong>Agents Used:</strong> ${result.orchestration.agents_used.join(', ')}<br>
          <strong>Chain:</strong> ${result.orchestration.chain_of_thought}
        </div>
      ` : ''}

      <h3 style="margin: 20px 0 10px 0; font-size: 13px; color: #800080;">🎁 Extras</h3>
      <pre style="font-size: 10px; background: #f9f9f9; padding: 10px; border: 1px solid #ddd; overflow-x: auto;">${JSON.stringify(result.extras, null, 2)}</pre>

      <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border: 2px solid #ffc107;">
        <strong>Execution ID:</strong> ${result.execution_id}<br>
        <strong>Status:</strong> ${result.status}<br>
        <strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}
      </div>
    `;
  },

  /**
   * Load execution history
   */
  async loadHistory() {
    const container = document.getElementById('cece-history');

    try {
      const response = await fetch('/api/cece/cognition/history?limit=10');
      if (!response.ok) {
        throw new Error('Failed to load history');
      }

      const history = await response.json();
      this.executionHistory = history;

      if (history.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No execution history yet</p>';
        return;
      }

      const historyHTML = history.map(exec => `
        <div style="margin-bottom: 8px; padding: 8px; background: #f9f9f9; border-left: 3px solid ${
          exec.status === 'completed' ? '#00cc00' : '#cc0000'
        }; cursor: pointer;" onclick="window.Apps.CeceUltra.loadExecution('${exec.execution_id}')">
          <div style="font-size: 10px; color: #666;">${new Date(exec.started_at).toLocaleString()}</div>
          <div style="font-size: 11px; margin-top: 3px;">${exec.input_preview}</div>
          <div style="font-size: 10px; color: #666; margin-top: 3px;">
            Status: ${exec.status} |
            Duration: ${exec.duration_seconds ? exec.duration_seconds.toFixed(2) + 's' : 'N/A'} |
            Confidence: ${exec.confidence ? (exec.confidence * 100).toFixed(0) + '%' : 'N/A'}
          </div>
        </div>
      `).join('');

      container.innerHTML = historyHTML;

    } catch (error) {
      console.error('Error loading history:', error);
      container.innerHTML = '<p style="color: red;">Error loading history</p>';
    }
  },

  /**
   * Load specific execution from history
   */
  async loadExecution(executionId) {
    this.showStatus('📥 Loading execution...', true);

    try {
      const response = await fetch(`/api/cece/cognition/${executionId}`);
      if (!response.ok) {
        throw new Error('Failed to load execution');
      }

      const result = await response.json();
      this.currentExecution = result;

      this.showStatus('✅ Execution loaded!', false);
      this.displayResults(result);

    } catch (error) {
      console.error('Error loading execution:', error);
      this.showStatus(`❌ Error: ${error.message}`, false);
      alert(`Failed to load execution: ${error.message}`);
    }
  },

  /**
   * Show status message
   */
  showStatus(message, isLoading) {
    const statusDiv = document.getElementById('cece-status');
    const statusText = document.getElementById('cece-status-text');

    statusText.textContent = message;
    statusDiv.style.display = 'block';

    if (!isLoading) {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
};
