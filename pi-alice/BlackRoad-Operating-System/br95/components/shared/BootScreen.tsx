import React from 'react';

type Props = {
  bootActive: boolean;
};

export default function BootScreen({ bootActive }: Props) {
  return (
    <div className="boot-screen" id="boot" style={{ pointerEvents: bootActive ? 'auto' : 'none' }}>
      <div className="boot-logo-container">
        <div className="boot-logo">
          <div className="boot-road"></div>
        </div>
        <div className="boot-title">BlackRoad OS</div>
        <div className="boot-sub">BR‑95 Edition · Safe Passage Through The Chaos</div>
        <div className="boot-loading">System Loading</div>
      </div>
    </div>
  );
}
