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

export default function RoadmailWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="roadmail" title="RoadMail" icon="📧" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Inbox</h2>
          <p>Secure AI‑aware communication</p>
        </div>
        <div className="content-body">
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Welcome to BlackRoad OS</div>
            <div style={{ fontSize: 11, color: 'var(--br-muted)' }}>From: BlackRoad Team • Today</div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
