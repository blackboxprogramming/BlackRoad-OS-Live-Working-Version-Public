import React from 'react';
import WindowFrame from '../shared/WindowFrame';
import { LucidiaStats, WindowState } from '../../hooks/useWindowManager';

type Props = {
  state: WindowState;
  stats: LucidiaStats;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, event: React.MouseEvent) => void;
  onFocus: (id: string) => void;
};

export default function LucidiaWindow({ state, stats, ...handlers }: Props) {
  return (
    <WindowFrame id="lucidia" title="Lucidia Core System" icon="🧠" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Recursive AI Engine</h2>
          <p>Trinary logic · Paraconsistent reasoning · PS‑SHA∞ memory</p>
        </div>
        <div className="content-body">
          <div className="grid grid-2">
            <div className="card">
              <div className="stat-row">
                <span className="stat-label">Active Agents</span>
                <span className="stat-value">{stats.activeAgents} / {stats.totalAgents}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Memory Journals</span>
                <span className="stat-value">{stats.memoryJournals} streams</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Event Bus</span>
                <span className="stat-value">{stats.eventBusRate} events/sec</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Uptime</span>
                <span className="stat-value">{stats.uptime.toFixed(2)}%</span>
              </div>
            </div>
            <div className="card">
              <div className="stat-row">
                <span className="stat-label">Mode</span>
                <span className="stat-value">Trinary (1/0/‑1)</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Contradictions</span>
                <span className="stat-value">Paraconsistent</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Memory Hash</span>
                <span className="stat-value">PS‑SHA∞</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Coordination</span>
                <span className="stat-value">Hybrid P2P</span>
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 10 }}>
            <div style={{ fontSize: '12px' }}>
              <div style={{ marginBottom: '6px' }}>
                <span className="badge badge-success">Agent‑042</span> proposed new routing rule • 2m ago
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span className="badge badge-info">Agent‑189</span> memory journal sync complete • 5m ago
              </div>
              <div>
                <span className="badge badge-warning">Agent‑734</span> contradiction quarantined • 12m ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
