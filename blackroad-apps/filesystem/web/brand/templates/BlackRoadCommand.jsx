import { useState, useEffect, useRef, useMemo } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Command registry ─────────────────────────────────────────────
const COMMANDS = [
  // Navigation
  { id: "nav-dashboard",  group: "Navigate",   icon: "◈", label: "Go to Dashboard",        sub: "Overview · metrics · activity",    keys: ["G","D"],  color: "#4488FF" },
  { id: "nav-explorer",   group: "Navigate",   icon: "◈", label: "Go to Explorer",          sub: "Event log · data table",           keys: ["G","E"],  color: "#4488FF" },
  { id: "nav-agents",     group: "Navigate",   icon: "◈", label: "Go to Agents",            sub: "Manage your agent fleet",          keys: ["G","A"],  color: "#4488FF" },
  { id: "nav-settings",   group: "Navigate",   icon: "◈", label: "Go to Settings",          sub: "Profile · API keys · security",    keys: ["G","S"],  color: "#4488FF" },
  { id: "nav-docs",       group: "Navigate",   icon: "◈", label: "Go to Docs",              sub: "Documentation · guides",           keys: ["G","?"],  color: "#4488FF" },
  { id: "nav-status",     group: "Navigate",   icon: "◈", label: "Go to Status Page",       sub: "System health · incidents",        keys: [],         color: "#4488FF" },
  { id: "nav-billing",    group: "Navigate",   icon: "◈", label: "Go to Billing",           sub: "Plan · invoices · usage",          keys: [],         color: "#4488FF" },

  // Agents
  { id: "agent-spawn",    group: "Agents",     icon: "△", label: "Spawn Agent",             sub: "Launch a new agent instance",      keys: ["⌘","⏎"],  color: "#8844FF" },
  { id: "agent-lucidia",  group: "Agents",     icon: "△", label: "Chat with Lucidia",       sub: "Cognition · memory agent",         keys: [],         color: "#8844FF" },
  { id: "agent-blackbot", group: "Agents",     icon: "△", label: "Run BlackBot task",       sub: "Orchestration · task runner",      keys: [],         color: "#4488FF" },
  { id: "agent-aura",     group: "Agents",     icon: "△", label: "Query Aura",              sub: "Intelligence · analysis",          keys: [],         color: "#00D4FF" },
  { id: "agent-sentinel", group: "Agents",     icon: "△", label: "Sentinel report",         sub: "Security · monitoring summary",    keys: [],         color: "#FF2255" },
  { id: "agent-pause",    group: "Agents",     icon: "△", label: "Pause all agents",        sub: "Halt all running agent processes",  keys: [],         color: "#FF6B2B" },
  { id: "agent-restart",  group: "Agents",     icon: "△", label: "Restart agent fleet",     sub: "Restart all agents gracefully",    keys: [],         color: "#FF6B2B" },

  // API & Dev
  { id: "api-newkey",     group: "API",        icon: "▣", label: "Create API key",          sub: "Generate a new API credential",    keys: [],         color: "#CC00AA" },
  { id: "api-keys",       group: "API",        icon: "▣", label: "View API keys",           sub: "List all workspace keys",          keys: [],         color: "#CC00AA" },
  { id: "api-webhooks",   group: "API",        icon: "▣", label: "Configure webhooks",      sub: "Manage event endpoint routing",    keys: [],         color: "#CC00AA" },
  { id: "api-logs",       group: "API",        icon: "▣", label: "View API logs",           sub: "Recent requests · errors",         keys: [],         color: "#CC00AA" },
  { id: "api-playground", group: "API",        icon: "▣", label: "Open API playground",     sub: "Interactive REST explorer",        keys: [],         color: "#CC00AA" },

  // Cluster
  { id: "cluster-health", group: "Cluster",    icon: "⬡", label: "Cluster health check",    sub: "K3s nodes · pods · services",      keys: [],         color: "#00D4FF" },
  { id: "cluster-alice",  group: "Cluster",    icon: "⬡", label: "SSH to Alice",            sub: "Gateway node · us-central",        keys: [],         color: "#00D4FF" },
  { id: "cluster-octavia",group: "Cluster",    icon: "⬡", label: "SSH to Octavia",          sub: "Hailo AI worker node",             keys: [],         color: "#00D4FF" },
  { id: "cluster-logs",   group: "Cluster",    icon: "⬡", label: "Stream cluster logs",     sub: "Live log pipeline · all pods",     keys: [],         color: "#00D4FF" },
  { id: "cluster-restart",group: "Cluster",    icon: "⬡", label: "Rolling restart",         sub: "Zero-downtime K3s restart",        keys: [],         color: "#FF6B2B" },

  // Memory
  { id: "mem-journal",    group: "Memory",     icon: "◉", label: "Open memory journal",     sub: "PS-SHA∞ append-only log",          keys: [],         color: "#FF2255" },
  { id: "mem-commit",     group: "Memory",     icon: "◉", label: "Force memory commit",     sub: "Flush pending truth-state writes", keys: [],         color: "#FF2255" },
  { id: "mem-export",     group: "Memory",     icon: "◉", label: "Export memory snapshot",  sub: "Download current agent memory",    keys: [],         color: "#FF2255" },
  { id: "mem-clear",      group: "Memory",     icon: "◉", label: "Clear session memory",    sub: "Wipe non-persisted session state", keys: [],         color: "#FF2255" },

  // Tools
  { id: "tool-theme",     group: "Tools",      icon: "◇", label: "Toggle theme",            sub: "Switch color mode",                keys: [],         color: "#525252" },
  { id: "tool-copy-ws",   group: "Tools",      icon: "◇", label: "Copy workspace ID",       sub: "ws_a3Kx9mZ2pQvL8rYt",             keys: [],         color: "#525252" },
  { id: "tool-shortcuts", group: "Tools",      icon: "◇", label: "View keyboard shortcuts", sub: "Full shortcut reference",          keys: ["?"],      color: "#525252" },
  { id: "tool-feedback",  group: "Tools",      icon: "◇", label: "Send feedback",           sub: "Report a bug or request a feature",keys: [],         color: "#525252" },
  { id: "tool-logout",    group: "Tools",      icon: "◇", label: "Sign out",                sub: "End your current session",         keys: [],         color: "#FF2255" },
];

const RECENT_IDS = ["nav-dashboard","agent-lucidia","api-newkey","cluster-health","mem-journal"];
const PINNED_IDS = ["agent-spawn","api-playground","cluster-logs"];

// ─── Fuzzy scorer ─────────────────────────────────────────────────
function score(query, cmd) {
  const q  = query.toLowerCase();
  const l  = (cmd.label + " " + cmd.sub + " " + cmd.group).toLowerCase();
  if (l.includes(q)) return 2;
  const chars = q.split("");
  let i = 0, pos = 0;
  for (; pos < l.length && i < chars.length; pos++) {
    if (l[pos] === chars[i]) i++;
  }
  return i === chars.length ? 1 : 0;
}

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// ─── Key badge ────────────────────────────────────────────────────
function KeyBadge({ k }) {
  return (
    <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", background: "#0d0d0d", border: "1px solid #1a1a1a", padding: "2px 6px", borderRadius: 3, lineHeight: 1 }}>{k}</span>
  );
}

// ─── Command row ──────────────────────────────────────────────────
function CmdRow({ cmd, active, onHover, onClick, recent, pinned }) {
  return (
    <div
      onClick={() => onClick(cmd)}
      onMouseEnter={onHover}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "9px 16px",
        background: active ? "#0d0d0d" : "transparent",
        borderLeft: active ? `2px solid ${cmd.color}` : "2px solid transparent",
        cursor: "pointer", transition: "background 0.08s",
        userSelect: "none",
      }}
    >
      {/* Icon */}
      <span style={{ fontFamily: mono, fontSize: 12, color: active ? cmd.color : "#242424", width: 16, flexShrink: 0, transition: "color 0.1s", textAlign: "center" }}>{cmd.icon}</span>

      {/* Label + sub */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: inter, fontSize: 13, color: active ? "#e0e0e0" : "#848484", lineHeight: 1, marginBottom: 3 }}>{cmd.label}</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: active ? "#3a3a3a" : "#1e1e1e", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cmd.sub}</div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
        {pinned  && <span style={{ fontFamily: mono, fontSize: 8, color: "#8844FF44", border: "1px solid #8844FF22", padding: "1px 5px" }}>pinned</span>}
        {recent  && !pinned && <span style={{ fontFamily: mono, fontSize: 8, color: "#1e1e1e", border: "1px solid #111", padding: "1px 5px" }}>recent</span>}
        {cmd.keys.length > 0 && (
          <div style={{ display: "flex", gap: 3 }}>
            {cmd.keys.map((k, i) => <KeyBadge key={i} k={k} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Group header ─────────────────────────────────────────────────
function GroupHead({ label }) {
  return (
    <div style={{ padding: "8px 16px 4px", fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.14em", borderTop: "1px solid #080808", marginTop: 4 }}>
      {label}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ cmd, onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 1800); return () => clearTimeout(id); }, []);
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 400, background: "#0a0a0a", border: `1px solid ${cmd.color}33`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, animation: "toastIn 0.2s ease both", boxShadow: "0 8px 32px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: cmd.color }}>{cmd.icon}</span>
      <span style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0" }}>{cmd.label}</span>
      <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a" }}>executed</span>
    </div>
  );
}

// ─── Palette ──────────────────────────────────────────────────────
function Palette({ onClose }) {
  const [query,     setQuery]     = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [toast,     setToast]     = useState(null);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  // Build displayed list
  const displayed = useMemo(() => {
    if (!query.trim()) {
      // Default: pinned then recent then nothing else
      const pinned  = COMMANDS.filter(c => PINNED_IDS.includes(c.id));
      const recent  = COMMANDS.filter(c => RECENT_IDS.includes(c.id) && !PINNED_IDS.includes(c.id));
      return [
        { type: "group", label: "Pinned" },
        ...pinned.map(c => ({ type: "cmd", cmd: c, pinned: true,  recent: false })),
        { type: "group", label: "Recent" },
        ...recent.map(c => ({ type: "cmd", cmd: c, pinned: false, recent: true  })),
      ];
    }
    const scored = COMMANDS
      .map(c => ({ cmd: c, s: score(query, c) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    if (!scored.length) return [{ type: "empty" }];

    // Group results
    const groups = {};
    scored.forEach(({ cmd }) => {
      if (!groups[cmd.group]) groups[cmd.group] = [];
      groups[cmd.group].push(cmd);
    });

    const rows = [];
    Object.entries(groups).forEach(([g, cmds]) => {
      rows.push({ type: "group", label: g });
      cmds.forEach(c => rows.push({ type: "cmd", cmd: c, pinned: PINNED_IDS.includes(c.id), recent: RECENT_IDS.includes(c.id) }));
    });
    return rows;
  }, [query]);

  const cmdRows = displayed.filter(r => r.type === "cmd");

  useEffect(() => { setActiveIdx(0); }, [query]);

  // Keyboard nav
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape")     { onClose(); return; }
      if (e.key === "ArrowDown")  { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, cmdRows.length - 1)); }
      if (e.key === "ArrowUp")    { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter")      { e.preventDefault(); if (cmdRows[activeIdx]) execute(cmdRows[activeIdx].cmd); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [activeIdx, cmdRows]);

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const execute = (cmd) => {
    setToast(cmd);
    onClose();
  };

  let cmdCount = 0;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} />

      {/* Palette panel */}
      <div style={{ position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)", zIndex: 301, width: "min(600px, calc(100vw - 32px))", background: "#050505", border: "1px solid #1a1a1a", boxShadow: "0 32px 80px rgba(0,0,0,0.9)", animation: "paletteIn 0.18s cubic-bezier(0.4,0,0.2,1) both", display: "flex", flexDirection: "column", maxHeight: "60vh" }}>

        {/* Top gradient line */}
        <div style={{ height: 1, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 3s linear infinite", flexShrink: 0 }} />

        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #0d0d0d", flexShrink: 0 }}>
          <span style={{ fontFamily: mono, fontSize: 14, color: "#2a2a2a", flexShrink: 0 }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, agents, pages…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: inter, fontSize: 15, color: "#d0d0d0", lineHeight: 1 }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ fontFamily: mono, fontSize: 11, color: "#2a2a2a", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
          )}
          <KeyBadge k="ESC" />
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto", flex: 1 }}>
          {displayed.map((row, i) => {
            if (row.type === "group") return <GroupHead key={i} label={row.label} />;
            if (row.type === "empty") return (
              <div key="empty" style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.12em" }}>No results for "{query}"</div>
              </div>
            );
            const localIdx = cmdCount++;
            const isActive = localIdx === activeIdx;
            return (
              <CmdRow
                key={row.cmd.id}
                cmd={row.cmd}
                active={isActive}
                pinned={row.pinned}
                recent={row.recent}
                onHover={() => setActiveIdx(localIdx)}
                onClick={execute}
                data-active={isActive}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderTop: "1px solid #0a0a0a" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {[["↑↓","Navigate"],["⏎","Execute"],["ESC","Close"]].map(([k,l]) => (
              <div key={k} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <KeyBadge k={k} />
                <span style={{ fontFamily: inter, fontSize: 10, color: "#1e1e1e" }}>{l}</span>
              </div>
            ))}
          </div>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>{cmdRows.length} commands</span>
        </div>
      </div>

      {toast && <Toast cmd={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Demo shell page ──────────────────────────────────────────────
function ShellPage({ onOpen }) {
  const w = useWidth();
  const mobile = w < 640;

  const recentCmds = COMMANDS.filter(c => RECENT_IDS.includes(c.id)).slice(0, 5);
  const groups = [...new Set(COMMANDS.map(c => c.group))];

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, background: "rgba(0,0,0,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
            </div>
            <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#252525" }}>· Command</span>
          </div>
          <button onClick={onOpen}
            style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: inter, fontSize: 13, color: "#2a2a2a", background: "#080808", border: "1px solid #141414", padding: "7px 14px", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#141414"; e.currentTarget.style.color = "#2a2a2a"; }}
          >
            <span>Search commands…</span>
            <div style={{ display: "flex", gap: 3 }}>
              <KeyBadge k="⌘" /><KeyBadge k="K" />
            </div>
          </button>
        </nav>
      </div>

      {/* Hero */}
      <div style={{ padding: mobile ? "52px 20px 40px" : "80px 48px 56px", borderBottom: "1px solid #0a0a0a", animation: "fadeUp 0.4s ease both" }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>Command palette · Z:=yx−w</div>
        <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 52px)", color: "#f0f0f0", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 16 }}>
          Everything in<br />one keystroke.
        </h1>
        <p style={{ fontFamily: inter, fontSize: 15, color: "#2e2e2e", lineHeight: 1.75, maxWidth: 440, marginBottom: 36 }}>
          Navigate the entire BlackRoad OS — agents, cluster, memory, API — without leaving your keyboard.
        </p>
        <button onClick={onOpen}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: mono, fontSize: 10, color: "#f0f0f0", background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite", border: "none", padding: "13px 28px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Open palette
          <div style={{ display: "flex", gap: 3 }}><KeyBadge k="⌘" /><KeyBadge k="K" /></div>
        </button>
      </div>

      {/* Content: recent + groups */}
      <div style={{ flex: 1, padding: mobile ? "32px 20px 60px" : "40px 48px 80px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 40 }}>

        {/* Recent commands */}
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>Recent</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentCmds.map(c => (
              <button key={c.id} onClick={onOpen}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#080808", border: "1px solid #0d0d0d", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#0a0a0a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#0d0d0d"; e.currentTarget.style.background = "#080808"; }}
              >
                <span style={{ fontFamily: mono, fontSize: 11, color: c.color, width: 14, flexShrink: 0, textAlign: "center" }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: inter, fontSize: 13, color: "#848484", marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>{c.group}</div>
                </div>
                {c.keys.length > 0 && (
                  <div style={{ display: "flex", gap: 3 }}>
                    {c.keys.map((k,i) => <KeyBadge key={i} k={k} />)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Command groups */}
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>Categories</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {groups.map((g, i) => {
              const cmds  = COMMANDS.filter(c => c.group === g);
              const color = cmds[0]?.color || "#525252";
              return (
                <button key={g} onClick={onOpen}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#080808", border: "1px solid #0d0d0d", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color + "44"; e.currentTarget.style.background = "#0a0a0a"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#0d0d0d"; e.currentTarget.style.background = "#080808"; }}
                >
                  <div style={{ width: 2, height: 28, background: color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#686868", marginBottom: 2 }}>{g}</div>
                    <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>{cmds.length} commands</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: "16px 48px", borderTop: "1px solid #0a0a0a", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>BlackRoad OS · Command Palette · Z:=yx−w</span>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>{COMMANDS.length} commands registered</span>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadCommand() {
  const [open, setOpen] = useState(false);

  // Global ⌘K trigger
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        button { appearance: none; font-family: inherit; }
        input  { appearance: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        input::placeholder { color: #2a2a2a; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);    }
          50%       { opacity: 0.45; transform: scaleY(0.6); }
        }
        @keyframes paletteIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);    }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <ShellPage onOpen={() => setOpen(true)} />
      {open && <Palette onClose={() => setOpen(false)} />}
    </>
  );
}
