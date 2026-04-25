import React from 'react';
import WindowFrame from '../shared/WindowFrame';
import { RoadChainStats, WindowState } from '../../hooks/useWindowManager';

type Props = {
  state: WindowState;
  stats: RoadChainStats;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, event: React.MouseEvent) => void;
  onFocus: (id: string) => void;
};

export default function RoadchainWindow({ state, stats, ...handlers }: Props) {
  return (
    <WindowFrame id="roadchain" title="RoadChain Explorer" icon="⛓️" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>RoadChain Network</h2>
          <p>Transparent AI governance on a distributed ledger</p>
        </div>
        <div className="content-body">
          <div className="grid grid-2" style={{ marginBottom: 10 }}>
            <div className="card">
              <div className="stat-row"><span className="stat-label">Block Height</span><span className="stat-value">{stats.currentBlock.toLocaleString()}</span></div>
              <div className="stat-row"><span className="stat-label">Network Hash</span><span className="stat-value">{stats.networkHashrate}</span></div>
              <div className="stat-row"><span className="stat-label">Active Nodes</span><span className="stat-value">{stats.activeNodes.toLocaleString()}</span></div>
            </div>
            <div className="card">
              <div className="stat-row"><span className="stat-label">Your Hashrate</span><span className="stat-value">{stats.yourHashrate}</span></div>
              <div className="stat-row"><span className="stat-label">Shares</span><span className="stat-value">{stats.shares}</span></div>
              <div className="stat-row"><span className="stat-label">Daily Earnings</span><span className="stat-value">{stats.dailyEarnings}</span></div>
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: 'var(--br-font-mono)', fontSize: '12px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Block #1,247,891</strong> • 23s ago<br />
                <span style={{ color: 'var(--br-muted)' }}>Hash: 0x8f4a2...c7b9d • 247 tx</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Block #1,247,890</strong> • 2m ago<br />
                <span style={{ color: 'var(--br-muted)' }}>Hash: 0x3c9e1...f2a4b • 189 tx</span>
              </div>
              <div>
                <strong>Block #1,247,889</strong> • 4m ago<br />
                <span style={{ color: 'var(--br-muted)' }}>Hash: 0x7d2b3...e8c1f • 312 tx</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
