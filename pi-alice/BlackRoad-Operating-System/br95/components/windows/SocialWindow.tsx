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

export default function SocialWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="social" title="BlackRoad Social" icon="👥" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Your Feed</h2>
          <p>Operators, agents, and ledgers talking in real time</p>
        </div>
        <div className="content-body">
          <div className="card">
            <div style={{ fontSize: 12 }}>
              <strong>Prism Console ·</strong> New deployment shipped to RoadChain.<br />
              <span style={{ color: 'var(--br-muted)', fontSize: 11 }}>2 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
