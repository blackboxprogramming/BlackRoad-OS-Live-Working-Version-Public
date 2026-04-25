import React from 'react';
import WindowFrame from '../shared/WindowFrame';
import { WalletStats, WindowState } from '../../hooks/useWindowManager';

type Props = {
  state: WindowState;
  stats: WalletStats;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, event: React.MouseEvent) => void;
  onFocus: (id: string) => void;
};

export default function WalletWindow({ state, stats, ...handlers }: Props) {
  return (
    <WindowFrame id="wallet" title="RoadCoin Wallet" icon="💰" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2 style={{ fontSize: 26 }}>{stats.balanceRC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RC</h2>
          <p>≈ ${stats.balanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD • Synced with RoadChain</p>
        </div>
        <div className="content-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button className="btn-primary">📤 Send</button>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--br-white)' }}>
              📥 Receive
            </button>
          </div>
          <div className="card">
            <div className="stat-row">
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Received</div>
                <div style={{ fontSize: 11, color: 'var(--br-muted)' }}>Mining rewards • 2h ago</div>
              </div>
              <div style={{ color: '#22c55e', fontWeight: 600 }}>+47.23 RC</div>
            </div>
          </div>
          <div className="card">
            <div className="stat-row">
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Sent</div>
                <div style={{ fontSize: 11, color: 'var(--br-muted)' }}>Payment to Alice • Yesterday</div>
              </div>
              <div style={{ color: '#ef4444', fontWeight: 600 }}>‑12.50 RC</div>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
