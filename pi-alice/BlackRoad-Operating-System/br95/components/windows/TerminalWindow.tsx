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

export default function TerminalWindow({ state, ...handlers }: Props) {
  return (
    <WindowFrame id="terminal" title="C:\\BLACKROAD\\TERMINAL.EXE" icon="💻" state={state} {...handlers}>
      <div className="window-inner" style={{ padding: 8 }}>
        <div className="terminal-screen">
          <div className="terminal-line">BlackRoad OS Terminal v2.4.1</div>
          <div className="terminal-line">Copyright (c) 2024 BlackRoad Inc.</div>
          <div className="terminal-line" style={{ marginTop: 10 }}>────────────────────────────────────────────────────</div>
          <div className="terminal-line" style={{ marginTop: 10 }}>
            <span className="terminal-prompt">blackroad@cecilia:~$</span> lucidia status
          </div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ Lucidia Core: OPERATIONAL</div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ Active Agents: 1000/1000</div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ Memory Journals: 1000 active streams</div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ Event Bus: 847 events/sec</div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ System Health: 99.95%</div>
          <div className="terminal-line" style={{ marginTop: 10 }}>
            <span className="terminal-prompt">blackroad@cecilia:~$</span> roadchain sync
          </div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>Syncing with RoadChain network...</div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ Block height: 1,247,891</div>
          <div className="terminal-line" style={{ marginLeft: 18 }}>✓ Peers: 2847 connected</div>
          <div className="terminal-line" style={{ marginTop: 10 }}>
            <span className="terminal-prompt">blackroad@cecilia:~$</span>
            <span className="terminal-cursor"></span>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
