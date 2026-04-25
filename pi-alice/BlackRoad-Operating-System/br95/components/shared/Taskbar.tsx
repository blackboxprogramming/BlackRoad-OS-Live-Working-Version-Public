import React from 'react';
import { WindowId } from '../../hooks/useWindowManager';

type Props = {
  openWindows: WindowId[];
  activeWindow: WindowId | null;
  clockText: string;
  onTaskbarClick: (id: WindowId) => void;
  onToggleMenu: () => void;
  menuButtonRef: React.RefObject<HTMLDivElement>;
};

const titles: Record<WindowId, string> = {
  lucidia: '🧠 Lucidia',
  agents: '🤖 Agents',
  roadchain: '⛓️ Chain',
  wallet: '💰 Wallet',
  roadmail: '📧 Mail',
  social: '👥 Social',
  blackstream: '📺 Stream',
  roadview: '🌍 RoadView',
  terminal: '💻 Terminal',
  pi: '🥧 Pi',
  miner: '⛏️ Miner',
  roadcraft: '⛏️ RoadCraft',
};

export default function Taskbar({
  openWindows,
  activeWindow,
  clockText,
  onTaskbarClick,
  onToggleMenu,
  menuButtonRef,
}: Props) {
  return (
    <div className="taskbar">
      <div className="road-button" id="road-button" onClick={onToggleMenu} ref={menuButtonRef}>
        <span className="road-logo"></span>
        <span>Road</span>
      </div>
      <div className="taskbar-apps" id="taskbar-apps">
        {openWindows.map((id) => (
          <div
            key={id}
            className={`taskbar-app ${activeWindow === id ? 'active-app' : ''}`}
            onClick={() => onTaskbarClick(id)}
          >
            {titles[id] ?? id}
          </div>
        ))}
      </div>
      <div className="system-tray">
        <span>🌐</span>
        <span>🔊</span>
        <span>⛓️</span>
      </div>
      <div className="clock" id="clock">
        {clockText}
      </div>
    </div>
  );
}
