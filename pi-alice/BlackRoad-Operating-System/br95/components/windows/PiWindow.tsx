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

export default function PiWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="pi" title="Pi Network Control Panel" icon="🥧" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Connected Devices</h2>
          <p>4 devices online · 1 Jetson Orin Nano</p>
        </div>
        <div className="content-body">
          <div className="card">
            <div className="stat-row"><span className="stat-label">Jetson Orin Nano</span><span className="badge badge-success">Online</span></div>
            <div className="stat-row"><span className="stat-label">Lucidia‑Pi‑01</span><span className="badge badge-success">Online</span></div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
