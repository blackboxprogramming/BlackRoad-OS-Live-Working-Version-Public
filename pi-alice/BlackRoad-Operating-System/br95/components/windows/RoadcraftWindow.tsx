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

export default function RoadcraftWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="roadcraft" title="RoadCraft" icon="⛏️" state={state} {...handlers}>
      <div className="window-inner">
        <div className="content-header">
          <h2>Voxel World Builder</h2>
          <p>Design agent habitats &amp; quantum sandboxes</p>
        </div>
        <div className="content-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn-primary">New World</button>
        </div>
      </div>
    </WindowFrame>
  );
}
