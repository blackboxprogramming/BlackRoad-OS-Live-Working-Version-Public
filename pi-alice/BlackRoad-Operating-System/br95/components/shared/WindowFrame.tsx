import React from 'react';
import { WindowState } from '../../hooks/useWindowManager';

type Props = {
  id: string;
  title: string;
  icon: string;
  state: WindowState;
  children: React.ReactNode;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, event: React.MouseEvent) => void;
  onFocus: (id: string) => void;
};

export default function WindowFrame({
  id,
  title,
  icon,
  state,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  onFocus,
}: Props) {
  if (!state) return null;

  const style = state.isMaximized
    ? { zIndex: state.zIndex }
    : {
        left: state.position.x,
        top: state.position.y,
        width: state.size.width,
        height: state.size.height,
        zIndex: state.zIndex,
      };

  return (
    <div
      className={`window ${state.isOpen ? 'active' : ''} ${state.isMaximized ? 'maximized' : ''}`}
      style={style}
      onMouseDown={() => onFocus(id)}
    >
      <div className="title-bar" onMouseDown={(e) => onDragStart(id, e)}>
        <div className="title-text">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <div className="title-buttons">
          <div className="title-button" onClick={() => onMinimize(id)}>
            _
          </div>
          <div className="title-button" onClick={() => onMaximize(id)}>
            □
          </div>
          <div className="title-button" onClick={() => onClose(id)}>
            ×
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
