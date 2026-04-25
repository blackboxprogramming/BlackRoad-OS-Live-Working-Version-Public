import React from 'react';
import WindowFrame from '../shared/WindowFrame';
import { WindowState } from '../../hooks/useWindowManager';

type Props = {
  state: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, event: React.MouseEvent) => void;
  onFocus: (id: string) => void;
};

export default function AgentsWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="agents" title="AI Agent Orchestration" icon="🤖" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>1,000 Unique Agents</h2>
          <p>Each with names, memories, families &amp; Unity homes</p>
        </div>
        <div className="content-body">
          <div className="grid grid-2">
            <div className="card">
              <div style={{ textAlign: 'center', fontSize: '28px', marginBottom: '6px' }}>🤖</div>
              <div className="stat-row"><span className="stat-label">ID</span><span className="stat-value">Agent‑042</span></div>
              <div className="stat-row"><span className="stat-label">Persona</span><span className="stat-value">Alice</span></div>
              <div className="stat-row"><span className="stat-label">Status</span><span className="badge badge-success">Active</span></div>
              <div className="stat-row"><span className="stat-label">Tasks Today</span><span className="stat-value">247</span></div>
            </div>
            <div className="card">
              <div style={{ textAlign: 'center', fontSize: '28px', marginBottom: '6px' }}>🤖</div>
              <div className="stat-row"><span className="stat-label">ID</span><span className="stat-value">Agent‑189</span></div>
              <div className="stat-row"><span className="stat-label">Persona</span><span className="stat-value">Marcus</span></div>
              <div className="stat-row"><span className="stat-label">Status</span><span className="badge badge-success">Active</span></div>
              <div className="stat-row"><span className="stat-label">Tasks Today</span><span className="stat-value">189</span></div>
            </div>
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button className="btn-primary">View All 1000 Agents</button>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
