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

export default function RoadviewWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="roadview" title="RoadView Browser" icon="🌍" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Welcome to BlackRoad</h2>
          <p>The complete AI orchestration ecosystem, in one desktop.</p>
        </div>
        <div className="content-body">
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--br-muted)' }}>
              This browser surface will eventually connect to your real BlackRoad services:
              <code>core.blackroad.systems</code>, <code>api.blackroad.systems</code>,
              <code>agents.blackroad.systems</code>, and more.
            </p>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
