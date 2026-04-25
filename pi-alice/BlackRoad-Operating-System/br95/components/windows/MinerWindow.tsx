import React from 'react';
import WindowFrame from '../shared/WindowFrame';
import { MinerStats, WindowState } from '../../hooks/useWindowManager';

type Props = {
  state: WindowState;
  stats: MinerStats;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, event: React.MouseEvent) => void;
  onFocus: (id: string) => void;
};

export default function MinerWindow({ state, stats, ...handlers }: Props) {
  return (
    <WindowFrame id="miner" title="RoadCoin Miner" icon="⛏️" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Mining Active</h2>
          <p>Contributing work to RoadChain network</p>
        </div>
        <div className="content-body">
          <div className="card">
            <div className="stat-row"><span className="stat-label">Hashrate</span><span className="stat-value">{stats.hashRate}</span></div>
            <div className="stat-row"><span className="stat-label">Accepted Shares</span><span className="stat-value">{stats.sharesAccepted.toLocaleString()}</span></div>
            <div className="stat-row"><span className="stat-label">Pool</span><span className="stat-value">{stats.poolName}</span></div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
