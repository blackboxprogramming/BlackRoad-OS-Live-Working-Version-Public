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

export default function BlackstreamWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="blackstream" title="BlackStream" icon="📺" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Trending Streams</h2>
          <p>OS demos, agent orchestration runs, and live RoadChain dashboards</p>
        </div>
        <div className="content-body">
          <div
            className="card"
            style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--br-muted)' }}
          >
            Embedded stream player coming soon.
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
