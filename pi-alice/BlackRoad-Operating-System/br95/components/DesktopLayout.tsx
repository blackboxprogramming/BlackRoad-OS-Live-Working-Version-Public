import React from 'react';
import AgentsWindow from './windows/AgentsWindow';
import BlackstreamWindow from './windows/BlackstreamWindow';
import LucidiaWindow from './windows/LucidiaWindow';
import MinerWindow from './windows/MinerWindow';
import PiWindow from './windows/PiWindow';
import RoadchainWindow from './windows/RoadchainWindow';
import RoadcraftWindow from './windows/RoadcraftWindow';
import RoadmailWindow from './windows/RoadmailWindow';
import RoadviewWindow from './windows/RoadviewWindow';
import SocialWindow from './windows/SocialWindow';
import TerminalWindow from './windows/TerminalWindow';
import WalletWindow from './windows/WalletWindow';
import BootScreen from './shared/BootScreen';
import Taskbar from './shared/Taskbar';
import RoadMenu from './shared/RoadMenu';
import { useWindowManager, WindowId } from '../hooks/useWindowManager';

const desktopIcons: { id: WindowId; icon: string; label: string }[] = [
  { id: 'lucidia', icon: '🧠', label: 'Lucidia Core' },
  { id: 'agents', icon: '🤖', label: 'AI Agents' },
  { id: 'roadchain', icon: '⛓️', label: 'RoadChain' },
  { id: 'wallet', icon: '💰', label: 'Wallet' },
  { id: 'terminal', icon: '💻', label: 'Terminal' },
  { id: 'roadmail', icon: '📧', label: 'RoadMail' },
  { id: 'social', icon: '👥', label: 'Social' },
  { id: 'blackstream', icon: '📺', label: 'BlackStream' },
  { id: 'roadview', icon: '🌍', label: 'RoadView' },
  { id: 'pi', icon: '🥧', label: 'Pi Network' },
  { id: 'miner', icon: '⛏️', label: 'Miner' },
  { id: 'roadcraft', icon: '⛏️', label: 'RoadCraft' },
];

export default function DesktopLayout() {
  const {
    windowStates,
    openWindows,
    activeWindow,
    roadMenuOpen,
    shellReady,
    clockText,
    lucidiaStats,
    roadchainStats,
    walletStats,
    minerStats,
    menuRef,
    menuButtonRef,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    startDrag,
    focusWindow,
    toggleRoadMenu,
    taskbarToggle,
  } = useWindowManager();

  return (
    <>
      <div className="scanline"></div>
      <BootScreen bootActive={!shellReady} />
      <div className={`shell ${shellReady ? 'ready' : ''}`} id="shell">
        <div className="menubar">
          <div className="menu-logo"></div>
          <div className="menu-items">
            <div className="menu-item">File</div>
            <div className="menu-item">View</div>
            <div className="menu-item">Agents</div>
            <div className="menu-item">RoadChain</div>
          </div>
          <div className="system-info">
            <span>BlackRoad OS v1.0</span>
            <span>Agents: 1000</span>
          </div>
        </div>

        <div className="desktop-area" id="desktop">
          {desktopIcons.map((item) => (
            <div key={item.id} className="icon" onDoubleClick={() => openWindow(item.id)}>
              <div className="icon-image">{item.icon}</div>
              <div className="icon-label">{item.label}</div>
            </div>
          ))}
        </div>

        <LucidiaWindow
          state={windowStates.lucidia}
          stats={lucidiaStats}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <AgentsWindow
          state={windowStates.agents}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <RoadchainWindow
          state={windowStates.roadchain}
          stats={roadchainStats}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <WalletWindow
          state={windowStates.wallet}
          stats={walletStats}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <TerminalWindow
          state={windowStates.terminal}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <RoadmailWindow
          state={windowStates.roadmail}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <SocialWindow
          state={windowStates.social}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <BlackstreamWindow
          state={windowStates.blackstream}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <RoadviewWindow
          state={windowStates.roadview}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <PiWindow
          state={windowStates.pi}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <MinerWindow
          state={windowStates.miner}
          stats={minerStats}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />
        <RoadcraftWindow
          state={windowStates.roadcraft}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={startDrag}
          onFocus={focusWindow}
        />

        <Taskbar
          openWindows={openWindows}
          activeWindow={activeWindow}
          clockText={clockText}
          onTaskbarClick={(id) => taskbarToggle(id)}
          onToggleMenu={toggleRoadMenu}
          menuButtonRef={menuButtonRef}
        />

        <RoadMenu isOpen={roadMenuOpen} onOpenWindow={(id) => openWindow(id)} menuRef={menuRef} />
      </div>
    </>
  );
}
