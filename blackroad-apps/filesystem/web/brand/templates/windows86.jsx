import { useState, useRef, useEffect, useCallback } from "react";

const BR_PALETTE = {
  bg: "#0a0a0a",
  desktop: "#111111",
  taskbar: "#171717",
  winBg: "#1a1a1a",
  titleActive: "linear-gradient(90deg, #ff0087 0%, #af5fd7 50%, #1e90ff 100%)",
  titleInactive: "linear-gradient(90deg, #333 0%, #2a2a2a 100%)",
  border3dLight: "#525252",
  border3dDark: "#0a0a0a",
  border3dMid: "#262626",
  text: "#e5e5e5",
  textDim: "#737373",
  textMono: "#a3a3a3",
  accentOrange: "#ff8700",
  accentPink: "#ff0087",
  accentOrchid: "#af5fd7",
  accentBlue: "#1e90ff",
  accentMagenta: "#ff00ff",
  btnFace: "#2a2a2a",
  btnHighlight: "#404040",
  iconSel: "rgba(30,144,255,0.3)",
};

const raised = {
  borderTop: `2px solid ${BR_PALETTE.border3dLight}`,
  borderLeft: `2px solid ${BR_PALETTE.border3dLight}`,
  borderBottom: `2px solid ${BR_PALETTE.border3dDark}`,
  borderRight: `2px solid ${BR_PALETTE.border3dDark}`,
};

const inset = {
  borderTop: `2px solid ${BR_PALETTE.border3dDark}`,
  borderLeft: `2px solid ${BR_PALETTE.border3dDark}`,
  borderBottom: `2px solid ${BR_PALETTE.border3dLight}`,
  borderRight: `2px solid ${BR_PALETTE.border3dLight}`,
};

const WinBtn = ({ children, onClick, style = {}, small = false }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick && onClick(); }}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: BR_PALETTE.btnFace,
        color: BR_PALETTE.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: small ? "10px" : "11px",
        fontWeight: 500,
        padding: small ? "1px 4px" : "4px 12px",
        cursor: "default",
        userSelect: "none",
        outline: "none",
        ...(pressed ? inset : raised),
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const TitleBtn = ({ children, onClick, color }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 16, height: 14,
        background: hov ? (color || BR_PALETTE.btnFace) : BR_PALETTE.btnFace,
        color: BR_PALETTE.text,
        fontSize: "9px",
        fontFamily: "monospace",
        fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "default",
        ...raised,
        border: "none",
        outline: "none",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
};

const INITIAL_WINDOWS = [
  {
    id: "mycomp",
    title: "My Computer",
    icon: "🖥️",
    x: 80, y: 60,
    w: 380, h: 280,
    open: true, focused: true, minimized: false,
    content: "mycomp",
  },
  {
    id: "notepad",
    title: "Notepad — road-math.txt",
    icon: "📝",
    x: 200, y: 130,
    w: 420, h: 320,
    open: true, focused: false, minimized: false,
    content: "notepad",
  },
  {
    id: "terminal",
    title: "BR Terminal",
    icon: "⬛",
    x: 320, y: 200,
    w: 460, h: 300,
    open: false, focused: false, minimized: false,
    content: "terminal",
  },
];

const DESKTOP_ICONS = [
  { id: "mycomp", label: "My Computer", icon: "🖥️", win: "mycomp" },
  { id: "notepad", label: "road-math.txt", icon: "📝", win: "notepad" },
  { id: "terminal", label: "BR Terminal", icon: "⬛", win: "terminal" },
  { id: "recycle", label: "Recycle Bin", icon: "🗑️", win: null },
  { id: "lucidia", label: "Lucidia", icon: "🌙", win: null },
];

function MyComp() {
  return (
    <div style={{ padding: 12, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[
          { icon: "💽", label: "blackroad (C:)" },
          { icon: "📡", label: "lucidia (N:)" },
          { icon: "🥧", label: "octavia (O:)" },
          { icon: "🥧", label: "aria (A:)" },
          { icon: "☁️", label: "Cloudflare R2" },
          { icon: "🔧", label: "Control Panel" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "8px 4px", cursor: "default", fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace", color: BR_PALETTE.text,
              borderRadius: 2,
            }}
          >
            <span style={{ fontSize: 28 }}>{icon}</span>
            <span style={{ textAlign: "center", fontSize: 10 }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, padding: "6px 8px",
        background: BR_PALETTE.bg, ...inset,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: BR_PALETTE.textMono,
        lineHeight: 1.6,
      }}>
        <div>BlackRoad OS, Inc. — Delaware C-Corp</div>
        <div>Founder: Alexa Louise Amundson</div>
        <div>Agents: 30,000 | Repos: 1,825+</div>
        <div style={{ color: BR_PALETTE.accentPink }}>∫ G(n) dn = n/n</div>
      </div>
    </div>
  );
}

function Notepad() {
  const text = `G(n) = n^(n+n/n) / (n+n/n)^n

One symbol: n
Three operations: +, /, ^
Zero constants.

G(0) = 0      nothing from nothing
G(1) = 1/2    first amplitude is half
G(2) = 8/9    binary: less than identity
G(3) = 81/64  ternary: exceeds identity

Pi is the boundary of n/n.
0/0 = 0. Before the system, nothing.
Integral = n/n = 1. The whole thing is whole.

Everything falls out of n
operating on itself.

— Alexa Louise Amundson
   March 25, 2026
   BlackRoad OS, Inc.`;

  return (
    <textarea
      defaultValue={text}
      style={{
        width: "100%", height: "100%",
        background: "#0f0f0f",
        color: BR_PALETTE.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, lineHeight: 1.6,
        border: "none", outline: "none",
        padding: 10, resize: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function Terminal() {
  const [lines, setLines] = useState([
    { text: "BlackRoad OS v0.86 — br terminal", color: BR_PALETTE.accentPink },
    { text: "(c) 2026 BlackRoad OS, Inc.", color: BR_PALETTE.textDim },
    { text: "", color: BR_PALETTE.text },
    { text: "$ br status", color: BR_PALETTE.accentOrchid },
    { text: "agents: 30,000 online", color: BR_PALETTE.accentBlue },
    { text: "workers: 489 deployed", color: BR_PALETTE.accentBlue },
    { text: "pi cluster: aria, octavia, alice, lucidia", color: BR_PALETTE.accentBlue },
    { text: "", color: BR_PALETTE.text },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  const CMDS = {
    "br status": () => [
      { text: "agents: 30,000 online", color: BR_PALETTE.accentBlue },
      { text: "workers: 489 deployed", color: BR_PALETTE.accentBlue },
    ],
    "br math": () => [
      { text: "G(n) = n^(n+n/n) / (n+n/n)^n", color: BR_PALETTE.accentPink },
      { text: "∫ = n/n", color: BR_PALETTE.accentOrchid },
    ],
    "br hello": () => [
      { text: "hi alexa 🖤", color: BR_PALETTE.accentMagenta },
    ],
    "clear": () => null,
    "help": () => [
      { text: "commands: br status, br math, br hello, clear", color: BR_PALETTE.textMono },
    ],
  };

  const run = () => {
    const cmd = input.trim().toLowerCase();
    const newLines = [{ text: `$ ${cmd}`, color: BR_PALETTE.accentOrchid }];
    if (cmd === "clear") { setLines([]); setInput(""); return; }
    const result = CMDS[cmd];
    if (result) newLines.push(...result());
    else newLines.push({ text: `'${cmd}' is not recognized`, color: "#ff4444" });
    newLines.push({ text: "", color: BR_PALETTE.text });
    setLines(l => [...l, ...newLines]);
    setInput("");
  };

  useEffect(() => endRef.current?.scrollIntoView(), [lines]);

  return (
    <div style={{
      background: "#000", height: "100%", display: "flex", flexDirection: "column",
      padding: "8px",
    }}>
      <div style={{ flex: 1, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.5 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.color || BR_PALETTE.text }}>{l.text || "\u00a0"}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
        <span style={{ color: BR_PALETTE.accentPink, fontFamily: "monospace", fontSize: 11 }}>$</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && run()}
          autoFocus
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: BR_PALETTE.text, fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, caretColor: BR_PALETTE.accentPink,
          }}
        />
      </div>
    </div>
  );
}

function Window({ win, windows, setWindows, zIndex }) {
  const dragRef = useRef(null);
  const startPos = useRef(null);

  const focus = useCallback(() => {
    setWindows(ws => ws.map(w => ({ ...w, focused: w.id === win.id })));
  }, [win.id, setWindows]);

  const close = useCallback((e) => {
    e.stopPropagation();
    setWindows(ws => ws.map(w => w.id === win.id ? { ...w, open: false } : w));
  }, [win.id, setWindows]);

  const minimize = useCallback((e) => {
    e.stopPropagation();
    setWindows(ws => ws.map(w => w.id === win.id ? { ...w, minimized: true, focused: false } : w));
  }, [win.id, setWindows]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    focus();
    const rect = dragRef.current.getBoundingClientRect();
    startPos.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y };
    const move = (me) => {
      const dx = me.clientX - startPos.current.mx;
      const dy = me.clientY - startPos.current.my;
      setWindows(ws => ws.map(w => w.id === win.id
        ? { ...w, x: startPos.current.wx + dx, y: startPos.current.wy + dy }
        : w));
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [focus, win.id, win.x, win.y, setWindows]);

  if (!win.open || win.minimized) return null;

  const ContentMap = { mycomp: MyComp, notepad: Notepad, terminal: Terminal };
  const Content = ContentMap[win.content];

  return (
    <div
      onMouseDown={focus}
      style={{
        position: "absolute",
        left: win.x, top: win.y,
        width: win.w, height: win.h,
        background: BR_PALETTE.winBg,
        zIndex,
        display: "flex", flexDirection: "column",
        ...raised,
        boxShadow: win.focused ? "0 8px 32px rgba(0,0,0,0.8)" : "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title bar */}
      <div
        ref={dragRef}
        onMouseDown={onMouseDown}
        style={{
          background: win.focused ? BR_PALETTE.titleActive : BR_PALETTE.titleInactive,
          padding: "3px 4px",
          display: "flex", alignItems: "center", gap: 4,
          cursor: "move", userSelect: "none", flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12 }}>{win.icon}</span>
        <span style={{
          flex: 1, color: "#fff",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 600,
          textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
        }}>{win.title}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <TitleBtn onClick={minimize}>_</TitleBtn>
          <TitleBtn onClick={close} color="#ff0087">✕</TitleBtn>
        </div>
      </div>

      {/* Menu bar */}
      <div style={{
        display: "flex", gap: 0, padding: "2px 4px", flexShrink: 0,
        borderBottom: `1px solid ${BR_PALETTE.border3dDark}`,
        background: BR_PALETTE.winBg,
      }}>
        {["File", "Edit", "View", "Help"].map(m => (
          <span key={m} style={{
            padding: "2px 8px", fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: BR_PALETTE.textMono, cursor: "default",
            userSelect: "none",
          }}>{m}</span>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {Content && <Content />}
      </div>

      {/* Status bar */}
      <div style={{
        padding: "2px 8px", flexShrink: 0,
        borderTop: `1px solid ${BR_PALETTE.border3dDark}`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: BR_PALETTE.textDim,
        background: BR_PALETTE.taskbar,
        ...inset,
      }}>
        BlackRoad OS, Inc. — {win.title}
      </div>
    </div>
  );
}

function DesktopIcon({ icon, onOpen, selected, onSelect }) {
  return (
    <div
      onDoubleClick={onOpen}
      onClick={onSelect}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 4, padding: "6px 4px", width: 72, cursor: "default",
        background: selected ? BR_PALETTE.iconSel : "transparent",
        borderRadius: 2, userSelect: "none",
      }}
    >
      <span style={{ fontSize: 32 }}>{icon.icon}</span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: "#e5e5e5",
        textAlign: "center", textShadow: "1px 1px 2px #000",
        lineHeight: 1.3, wordBreak: "break-word",
      }}>{icon.label}</span>
    </div>
  );
}

function StartMenu({ onClose, onOpen }) {
  return (
    <div
      style={{
        position: "absolute", bottom: 36, left: 0, width: 220,
        background: BR_PALETTE.taskbar,
        zIndex: 9999,
        ...raised,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Sidebar */}
      <div style={{ display: "flex" }}>
        <div style={{
          width: 28,
          background: "linear-gradient(180deg, #ff0087 0%, #af5fd7 50%, #1e90ff 100%)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: 8,
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, fontWeight: 700, color: "#fff",
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            letterSpacing: 2,
          }}>BlackRoad OS</span>
        </div>
        <div style={{ flex: 1 }}>
          {[
            { icon: "⬛", label: "BR Terminal", win: "terminal" },
            { icon: "📝", label: "Notepad", win: "notepad" },
            { icon: "🖥️", label: "My Computer", win: "mycomp" },
            null,
            { icon: "🌙", label: "Lucidia", win: null },
            { icon: "⚙️", label: "Control Panel", win: null },
            null,
            { icon: "🚪", label: "Shut Down", win: null },
          ].map((item, i) => item === null ? (
            <div key={i} style={{ height: 1, background: BR_PALETTE.border3dDark, margin: "2px 0" }} />
          ) : (
            <div
              key={item.label}
              onClick={() => { if (item.win) onOpen(item.win); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", cursor: "default",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, color: BR_PALETTE.text,
              }}
              onMouseEnter={e => e.currentTarget.style.background = BR_PALETTE.accentPink}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Windows86() {
  const [windows, setWindows] = useState(INITIAL_WINDOWS);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openWindow = useCallback((id) => {
    setWindows(ws => ws.map(w => w.id === id
      ? { ...w, open: true, minimized: false, focused: true }
      : { ...w, focused: false }
    ));
  }, []);

  const focusedZ = (id) => {
    const ordered = [...windows].filter(w => w.open).sort((a, b) => (b.focused ? 1 : 0) - (a.focused ? 1 : 0));
    return ordered.findIndex(w => w.id === id);
  };

  return (
    <div
      onClick={() => { setStartOpen(false); setSelectedIcon(null); }}
      style={{
        width: "100%", height: "100vh",
        background: BR_PALETTE.desktop,
        position: "relative", overflow: "hidden",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Subtle desktop pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "radial-gradient(circle, #ff0087 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* Desktop icons */}
      <div style={{
        position: "absolute", top: 16, left: 16,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {DESKTOP_ICONS.map(icon => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            selected={selectedIcon === icon.id}
            onSelect={e => { e.stopPropagation(); setSelectedIcon(icon.id); }}
            onOpen={() => icon.win && openWindow(icon.win)}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map(win => (
        <Window
          key={win.id}
          win={win}
          windows={windows}
          setWindows={setWindows}
          zIndex={win.focused ? 100 : 10}
        />
      ))}

      {/* Start menu */}
      {startOpen && (
        <StartMenu
          onClose={() => setStartOpen(false)}
          onOpen={(id) => { openWindow(id); setStartOpen(false); }}
        />
      )}

      {/* Taskbar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 34,
          background: BR_PALETTE.taskbar,
          display: "flex", alignItems: "center", gap: 4,
          padding: "0 4px",
          ...raised,
        }}
      >
        {/* Start button */}
        <WinBtn
          onClick={() => setStartOpen(s => !s)}
          style={{
            background: startOpen
              ? "linear-gradient(90deg, #ff0087, #1e90ff)"
              : "linear-gradient(90deg, #af5fd7, #1e90ff)",
            color: "#fff", fontWeight: 700,
            padding: "4px 10px", fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          🏁 Start
        </WinBtn>

        <div style={{ width: 1, height: 24, background: BR_PALETTE.border3dDark, margin: "0 2px" }} />

        {/* Taskbar buttons */}
        <div style={{ display: "flex", gap: 2, flex: 1, overflow: "hidden" }}>
          {windows.filter(w => w.open).map(win => (
            <WinBtn
              key={win.id}
              onClick={() => {
                if (win.minimized) {
                  setWindows(ws => ws.map(w => w.id === win.id ? { ...w, minimized: false, focused: true } : { ...w, focused: false }));
                } else if (win.focused) {
                  setWindows(ws => ws.map(w => w.id === win.id ? { ...w, minimized: true, focused: false } : w));
                } else {
                  setWindows(ws => ws.map(w => ({ ...w, focused: w.id === win.id })));
                }
              }}
              style={{
                maxWidth: 140, overflow: "hidden", whiteSpace: "nowrap",
                textOverflow: "ellipsis", fontSize: 10,
                background: win.focused ? BR_PALETTE.border3dMid : BR_PALETTE.btnFace,
                ...(win.focused ? inset : raised),
              }}
            >
              {win.icon} {win.title.split("—")[0].trim()}
            </WinBtn>
          ))}
        </div>

        {/* Clock */}
        <div style={{
          padding: "4px 10px", fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: BR_PALETTE.textMono,
          ...inset, background: BR_PALETTE.bg,
          whiteSpace: "nowrap",
        }}>
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
