import React from 'react';
import { WindowId } from '../../hooks/useWindowManager';

type Props = {
  isOpen: boolean;
  onOpenWindow: (id: WindowId) => void;
  menuRef: React.RefObject<HTMLDivElement>;
};

const items: { id: WindowId; icon: string; label: string }[] = [
  { id: 'lucidia', icon: '🧠', label: 'Lucidia Core' },
  { id: 'agents', icon: '🤖', label: 'AI Agents' },
  { id: 'roadchain', icon: '⛓️', label: 'RoadChain Explorer' },
  { id: 'wallet', icon: '💰', label: 'RoadCoin Wallet' },
  { id: 'roadmail', icon: '📧', label: 'RoadMail' },
  { id: 'terminal', icon: '💻', label: 'Terminal' },
  { id: 'pi', icon: '🥧', label: 'Pi Network' },
  { id: 'miner', icon: '⛏️', label: 'RoadCoin Miner' },
  { id: 'roadcraft', icon: '⛏️', label: 'RoadCraft' },
];

export default function RoadMenu({ isOpen, onOpenWindow, menuRef }: Props) {
  return (
    <div className={`road-menu ${isOpen ? 'active' : ''}`} id="road-menu" ref={menuRef}>
      <div className="road-menu-header">
        <h3>BlackRoad OS</h3>
        <p>BR‑95 Desktop · Agent Orchestration</p>
      </div>
      <div className="road-menu-content">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="road-menu-item" onClick={() => onOpenWindow(item.id)}>
              <span className="emoji">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {index === 2 || index === 5 ? <div className="road-menu-separator"></div> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
