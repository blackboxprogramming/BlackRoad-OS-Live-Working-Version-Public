import { useState, useEffect, useRef, useMemo } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Hash utilities ───────────────────────────────────────────────
function fakeHash(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0; }
  const hex = (Math.abs(h) * 7919 + 1234567).toString(16).padStart(8, "0");
  return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
}
function shortHash(h) { return h.slice(0, 8) + "…" + h.slice(-6); }
const GENESIS_HASH = "0".repeat(64);

// ─── Mock data ────────────────────────────────────────────────────
const AGENTS = [
  { id: "lucidia",   name: "Lucidia",    role: "Cognition · Memory",      color: "#8844FF", born: "2025-12-01" },
  { id: "blackbot",  name: "BlackBot",   role: "Orchestration · Routing", color: "#4488FF", born: "2025-12-01" },
  { id: "aura",      name: "Aura",       role: "Intelligence · Analysis", color: "#00D4FF", born: "2026-01-15" },
  { id: "sentinel",  name: "Sentinel",   role: "Security · Monitoring",   color: "#FF2255", born: "2026-01-15" },
  { id: "cecilia",   name: "Cecilia",    role: "Core · Identity",         color: "#CC00AA", born: "2025-11-01" },
  { id: "alice",     name: "Alice",      role: "Gateway · Routing",       color: "#FF6B2B", born: "2025-11-01" },
];

const EVENT_TYPES = [
  { type: "agent.spawned",      label: "Agent Spawned",       color: "#8844FF", icon: "△" },
  { type: "task.created",       label: "Task Created",        color: "#4488FF", icon: "▣" },
  { type: "memory.commit",      label: "Memory Commit",       color: "#CC00AA", icon: "◉" },
  { type: "scaffold.executed",  label: "Scaffold Executed",   color: "#FF6B2B", icon: "◈" },
  { type: "soul.chain.genesis", label: "Soul Chain Genesis",  color: "#FF2255", icon: "⬡" },
  { type: "truth.state.commit", label: "Truth State Commit",  color: "#00D4FF", icon: "◇" },
  { type: "agent.verified",     label: "Agent Verified",      color: "#8844FF", icon: "✓" },
  { type: "memory.read",        label: "Memory Read",         color: "#525252", icon: "→" },
];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

// Generate witnessed blocks
function genBlocks(count) {
  const blocks = [];
  let prevHash = GENESIS_HASH;
  const baseTs = Date.now() - count * 18000;

  for (let i = 0; i < count; i++) {
    const agent   = rnd(AGENTS);
    const evType  = rnd(EVENT_TYPES);
    const ts      = new Date(baseTs + i * 18000 + rndInt(0, 4000));
    const data    = `${agent.id}::${evType.type}::${ts.getTime()}::blos-v1.0`;
    const hash    = fakeHash(prevHash + data + i);
    const tokens  = rndInt(120, 4800);
    const layer   = rndInt(1, 10);

    blocks.push({
      index: i + 1,
      hash,
      prevHash,
      timestamp: ts,
      agent,
      eventType: evType,
      data,
      tokens,
      layer,
      size: rndInt(256, 8192),
      requestId: "req_" + fakeHash(data).slice(0, 12),
    });
    prevHash = hash;
  }
  return blocks.reverse(); // newest first
}

const ALL_BLOCKS = genBlocks(200);
const LATEST_HASH = ALL_BLOCKS[0].hash;
const CHAIN_HEIGHT = ALL_BLOCKS[ALL_BLOCKS.length - 1].index;

// Soul chains: per-agent history
function genSoulChain(agentId, count = 12) {
  const agent = AGENTS.find(a => a.id === agentId);
  const chain = [];
  let prev = fakeHash(agentId + agent.born + "BlackRoad-OS-v1.0");
  for (let i = 0; i < count; i++) {
    const ts   = new Date(Date.now() - (count - i) * 86400000 / count * 7);
    const ctx  = rnd(EVENT_TYPES);
    const data = `${agentId}::state_${i}::${ts.getTime()}`;
    const hash = fakeHash(prev + data);
    chain.push({ index: i, hash, prevHash: prev, timestamp: ts, context: ctx, data });
    prev = hash;
  }
  return chain.reverse();
}

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return w;
}
function useCopy(v) {
  const [c, setC] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(v).catch(() => {}); setC(true); setTimeout(() => setC(false), 1600); };
  return [c, copy];
}
function fmtTs(d) { return d.toISOString().replace("T", " ").slice(0, 19) + " UTC"; }
function fmtSize(b) { return b >= 1024 ? (b / 1024).toFixed(1) + " KB" : b + " B"; }

// ─── Hash display ─────────────────────────────────────────────────
function HashChip({ hash, full, color }) {
  const [copied, copy] = useCopy(hash);
  return (
    <span onClick={copy} title={hash} style={{ fontFamily: mono, fontSize: 11, color: copied ? "#00D4FF" : (color || "#2e2e2e"), cursor: "pointer", transition: "color 0.2s" }}>
      {copied ? "✓ copied" : (full ? hash : shortHash(hash))}
    </span>
  );
}

// ─── Live ticker ──────────────────────────────────────────────────
function LiveTicker({ blocks }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx(i => (i + 1) % Math.min(blocks.length, 8)), 2400); return () => clearInterval(id); }, []);
  const b = blocks[idx];
  if (!b) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: mono, fontSize: 10, overflow: "hidden" }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00D4FF", animation: "pulse 1.2s ease-in-out infinite", flexShrink: 0 }} />
      <span style={{ color: "#1e1e1e" }}>#{b.index}</span>
      <span style={{ color: b.agent.color }}>{b.agent.name}</span>
      <span style={{ color: "#141414" }}>·</span>
      <span style={{ color: "#1a1a1a" }}>{b.eventType.label}</span>
      <span style={{ color: "#141414" }}>·</span>
      <HashChip hash={b.hash} />
    </div>
  );
}

// ─── Block row ────────────────────────────────────────────────────
function BlockRow({ block, onClick, selected }) {
  return (
    <div onClick={() => onClick(block)}
      style={{ display: "grid", gridTemplateColumns: "52px 1fr 90px 110px 72px", gap: 0, alignItems: "center", borderBottom: "1px solid #070707", cursor: "pointer", background: selected ? "#0a0a0a" : "transparent", borderLeft: `2px solid ${selected ? block.agent.color : "transparent"}`, transition: "background 0.1s, border-color 0.1s" }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#080808"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: 10, color: "#1e1e1e" }}>#{block.index}</div>
      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: block.eventType.color }}>{block.eventType.icon}</span>
          <span style={{ fontFamily: inter, fontSize: 12, color: "#686868" }}>{block.eventType.label}</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>via</span>
          <span style={{ fontFamily: inter, fontSize: 12, color: block.agent.color }}>{block.agent.name}</span>
        </div>
        <HashChip hash={block.hash} />
      </div>
      <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: 10, color: "#1e1e1e", textAlign: "right" }}>L{block.layer}</div>
      <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: 10, color: "#1a1a1a", textAlign: "right" }}>{fmtTs(block.timestamp).slice(11, 19)}</div>
      <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: 10, color: "#1e1e1e", textAlign: "right" }}>{fmtSize(block.size)}</div>
    </div>
  );
}

// ─── Block detail ─────────────────────────────────────────────────
function BlockDetail({ block, onClose }) {
  if (!block) return null;
  const [copied, copy] = useCopy(JSON.stringify({ ...block, timestamp: fmtTs(block.timestamp), agent: block.agent.name, eventType: block.eventType.type }, null, 2));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, zIndex: 201, background: "#040404", borderLeft: "1px solid #111", display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease" }}>
        {/* Top accent */}
        <div style={{ height: 2, background: block.agent.color + "88" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #0a0a0a", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>Witnessed Event</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: "#444" }}>#{block.index} · {block.eventType.icon} {block.eventType.label}</div>
          </div>
          <button onClick={onClose} style={{ fontFamily: mono, fontSize: 13, color: "#2a2a2a", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"} onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {/* Hash chain */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Hash chain</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ background: "#080808", border: "1px solid #0a0a0a", padding: "10px 12px" }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: "#1a1a1a", marginBottom: 5 }}>PREV HASH</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", wordBreak: "break-all", lineHeight: 1.5 }}>{block.prevHash === GENESIS_HASH ? "0".repeat(64) : block.prevHash}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: block.agent.color }}>↓ SHA-256</span>
              </div>
              <div style={{ background: "#080808", border: `1px solid ${block.agent.color}33`, padding: "10px 12px" }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: block.agent.color + "99", marginBottom: 5 }}>CURRENT HASH</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: block.agent.color + "cc", wordBreak: "break-all", lineHeight: 1.5 }}>{block.hash}</div>
              </div>
            </div>
          </div>

          {/* Fields */}
          {[
            ["Block index",  "#" + block.index],
            ["Timestamp",    fmtTs(block.timestamp)],
            ["Agent",        block.agent.name + " · " + block.agent.role],
            ["Event type",   block.eventType.type],
            ["Scaffold layer","Layer " + block.layer],
            ["Tokens",       block.tokens.toLocaleString()],
            ["Size",         fmtSize(block.size)],
            ["Request ID",   block.requestId],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #080808" }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", width: 96, flexShrink: 0, paddingTop: 1, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</span>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#505050", lineHeight: 1.5, wordBreak: "break-all" }}>{v}</span>
            </div>
          ))}

          {/* Raw data */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Witnessed data</div>
            <pre style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", background: "#030303", border: "1px solid #0a0a0a", padding: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{block.data}</pre>
          </div>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #0a0a0a", flexShrink: 0 }}>
          <button onClick={copy} style={{ width: "100%", fontFamily: mono, fontSize: 9, color: copied ? "#00D4FF" : "#333", background: "none", border: `1px solid ${copied ? "#00D4FF33" : "#111"}`, padding: "9px 0", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}>
            {copied ? "✓ JSON copied" : "Copy JSON"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Soul Chain view ──────────────────────────────────────────────
function SoulChainView({ agentId }) {
  const agent = AGENTS.find(a => a.id === agentId);
  const chain = useMemo(() => genSoulChain(agentId), [agentId]);
  const genesisHash = fakeHash(agentId + agent.born + "BlackRoad-OS-v1.0");

  return (
    <div>
      {/* Agent header */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 0 24px", borderBottom: "1px solid #0a0a0a", marginBottom: 24 }}>
        <div style={{ width: 4, height: 52, background: agent.color, flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, color: agent.color, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Soul Chain · {agent.id}</div>
          <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 22, color: "#e0e0e0", letterSpacing: "-0.03em", marginBottom: 4 }}>{agent.name}</div>
          <div style={{ fontFamily: inter, fontSize: 13, color: "#2a2a2a" }}>{agent.role}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", marginBottom: 4 }}>Born {agent.born}</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>{chain.length} state transitions</div>
        </div>
      </div>

      {/* Genesis block */}
      <div style={{ background: "#080808", border: "1px solid #FF6B2B22", padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#FF6B2B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>⬡ Genesis Hash · Trivial Zero seeded</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#333", wordBreak: "break-all", lineHeight: 1.6 }}>{genesisHash}</div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "#1a1a1a", marginTop: 6 }}>SHA-256({agent.id} + {agent.born} + BlackRoad-OS-v1.0)</div>
      </div>

      {/* Chain entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {chain.map((entry, i) => (
          <div key={i} style={{ display: "flex", gap: 0 }}>
            {/* Spine */}
            <div style={{ width: 20, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 1, height: "100%", background: i === 0 ? agent.color + "44" : "#0d0d0d", minHeight: 12 }} />
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: i === 0 ? agent.color : "#111", flexShrink: 0 }} />
              <div style={{ width: 1, flex: 1, background: "#0d0d0d" }} />
            </div>
            <div style={{ flex: 1, padding: "10px 14px", background: i === 0 ? "#080808" : "transparent", border: i === 0 ? `1px solid ${agent.color}22` : "none", marginBottom: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: entry.context.color }}>{entry.context.icon}</span>
                <span style={{ fontFamily: inter, fontSize: 12, color: i === 0 ? "#c0c0c0" : "#484848" }}>{entry.context.label}</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: "#141414", marginLeft: "auto" }}>{fmtTs(entry.timestamp).slice(0, 10)}</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: i === 0 ? "#383838" : "#1e1e1e", wordBreak: "break-all" }}>{shortHash(entry.hash)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Search ───────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: mono, fontSize: 11, color: "#1e1e1e" }}>⌕</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Search hash, agent, event type, request ID…"
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: "100%", background: "#080808", border: `1px solid ${focus ? "#2a2a2a" : "#111"}`, outline: "none", padding: "10px 14px 10px 30px", fontFamily: inter, fontSize: 13, color: "#c0c0c0", transition: "border-color 0.15s" }}
      />
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div style={{ background: "#080808", border: "1px solid #0a0a0a", padding: "12px 16px", flex: "1 1 110px" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: color || "#484848", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function RoadChainExplorer() {
  const [tab,      setTab]      = useState("chain");   // chain | souls | about
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");
  const [agentTab, setAgentTab] = useState(AGENTS[0].id);
  const [live,     setLive]     = useState(true);
  const [tick,     setTick]     = useState(0);
  const w = useWidth();
  const mobile = w < 680;

  // Live sim
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick(t => t + 1), 3200);
    return () => clearInterval(id);
  }, [live]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return ALL_BLOCKS;
    return ALL_BLOCKS.filter(b =>
      b.hash.includes(q) || b.agent.name.toLowerCase().includes(q) ||
      b.eventType.type.includes(q) || b.requestId.includes(q) ||
      b.eventType.label.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        button { appearance: none; font-family: inherit; }
        input  { appearance: none; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
        input::placeholder { color: #1e1e1e; }
        @keyframes gradShift {
          0%   { background-position: 0%; }
          100% { background-position: 200%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);   }
          50%       { opacity: 0.4; transform: scaleY(0.5); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1);   }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", display: "flex", flexDirection: "column" }}>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, background: "rgba(0,0,0,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #0d0d0d" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 14, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 14, color: "#f0f0f0", letterSpacing: "-0.03em" }}>RoadChain</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>· Explorer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LiveTicker blocks={ALL_BLOCKS.slice(0, 8)} />
              <button onClick={() => setLive(l => !l)}
                style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: mono, fontSize: 9, color: live ? "#00D4FF" : "#2a2a2a", background: "none", border: `1px solid ${live ? "#00D4FF33" : "#0d0d0d"}`, padding: "5px 10px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: live ? "#00D4FF" : "#1a1a1a", animation: live ? "pulse 1s infinite" : "none" }} />
                {live ? "LIVE" : "PAUSED"}
              </button>
            </div>
          </nav>

          {/* Marquee of latest hash */}
          <div style={{ overflow: "hidden", background: "#040404", borderBottom: "1px solid #080808", padding: "6px 0" }}>
            <div style={{ display: "flex", whiteSpace: "nowrap", animation: "scrollLeft 28s linear infinite" }}>
              {[...Array(4)].map((_, i) => (
                <span key={i} style={{ fontFamily: mono, fontSize: 9, color: "#111", paddingRight: 48 }}>
                  Latest witnessed: {LATEST_HASH} · Chain height: {CHAIN_HEIGHT} · Non-terminating · SHA-256 append-only ·
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div style={{ padding: mobile ? "32px 16px 28px" : "48px 32px 36px", borderBottom: "1px solid #0a0a0a", flexShrink: 0 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 12 }}>roadchain.io · witnessing ledger · v0.2</div>
            <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(22px, 5vw, 44px)", color: "#e0e0e0", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 10 }}>
              Not consensus. Witness.
            </h1>
            <p style={{ fontFamily: inter, fontSize: 14, color: "#1e1e1e", lineHeight: 1.75, maxWidth: 520, marginBottom: 28 }}>
              Every state transition in BlackRoad OS is SHA-256 hashed and appended to a non-terminating ledger. Nothing is deleted. Everything is witnessed.
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <StatPill label="Chain height"   value={CHAIN_HEIGHT.toLocaleString()} color="#4488FF" />
              <StatPill label="Soul chains"    value={AGENTS.length}                 color="#8844FF" />
              <StatPill label="Event types"    value={EVENT_TYPES.length}            color="#CC00AA" />
              <StatPill label="Agents active"  value={AGENTS.length}                 color="#FF6B2B" />
              <StatPill label="Scaffold layers" value="10"                           color="#00D4FF" />
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 0, padding: mobile ? "0 16px" : "0 32px", borderBottom: "1px solid #0a0a0a", flexShrink: 0, maxWidth: 1100, width: "100%", margin: "0 auto" }}>
          {[["chain", "Witnessed Events"], ["souls", "Soul Chains"], ["about", "How It Works"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ fontFamily: mono, fontSize: 9, color: tab === id ? "#d0d0d0" : "#2a2a2a", background: "none", border: "none", borderBottom: `2px solid ${tab === id ? "#4488FF" : "transparent"}`, padding: "14px 18px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.15s" }}
            >{label}</button>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: mobile ? "20px 16px 60px" : "24px 32px 80px" }}>

          {/* CHAIN TAB */}
          {tab === "chain" && (
            <div style={{ animation: "fadeUp 0.25s ease" }}>
              {/* Search + filter */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 240px" }}><SearchBar value={search} onChange={v => setSearch(v)} /></div>
                {search && <button onClick={() => setSearch("")} style={{ fontFamily: mono, fontSize: 9, color: "#FF2255", background: "none", border: "1px solid #FF225522", padding: "0 14px", cursor: "pointer" }}>Clear</button>}
              </div>

              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 90px 110px 72px", gap: 0, padding: "8px 0", borderBottom: "1px solid #0a0a0a", marginBottom: 2 }}>
                {["#", "Event · Hash", "Layer", "Time", "Size"].map((h, i) => (
                  <div key={h} style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 14px", textAlign: i > 1 ? "right" : "left" }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              <div>
                {filtered.slice(0, 100).map(b => (
                  <BlockRow key={b.index} block={b} onClick={setSelected} selected={selected?.index === b.index} />
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: "40px 0", textAlign: "center", fontFamily: mono, fontSize: 10, color: "#141414" }}>No witnessed events match that query.</div>
                )}
              </div>

              {filtered.length > 100 && (
                <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", padding: "16px 14px" }}>Showing 100 of {filtered.length.toLocaleString()} events</div>
              )}
            </div>
          )}

          {/* SOUL CHAINS TAB */}
          {tab === "souls" && (
            <div style={{ animation: "fadeUp 0.25s ease" }}>
              {/* Agent selector */}
              <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 28 }}>
                {AGENTS.map(a => (
                  <button key={a.id} onClick={() => setAgentTab(a.id)}
                    style={{ fontFamily: inter, fontSize: 12, color: agentTab === a.id ? "#d0d0d0" : "#2a2a2a", background: agentTab === a.id ? "#0a0a0a" : "#080808", border: `1px solid ${agentTab === a.id ? a.color + "44" : "#0d0d0d"}`, padding: "8px 16px", cursor: "pointer", transition: "all 0.15s" }}
                  >
                    <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: agentTab === a.id ? a.color : "#1a1a1a", marginRight: 7, verticalAlign: "middle", transition: "background 0.2s" }} />
                    {a.name}
                  </button>
                ))}
              </div>
              <SoulChainView agentId={agentTab} />
            </div>
          )}

          {/* ABOUT TAB */}
          {tab === "about" && (
            <div style={{ animation: "fadeUp 0.25s ease", maxWidth: 640 }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>RoadChain · Witnessing Philosophy</div>

              {[
                {
                  title: "Not a blockchain. A witness.",
                  body: "RoadChain does not seek consensus — it witnesses. Every state transition in the BlackRoad ecosystem is SHA-256 hashed and appended to a non-terminating ledger, creating an immutable record of what happened. Nothing is deleted. Everything is witnessed.",
                  color: "#FF6B2B",
                },
                {
                  title: "Soul chains: identity from birth.",
                  body: "Every agent begins with three things: a stable identifier, a birthdate, and a genesis hash. The genesis hash is SHA-256 seeded from agent_id + birth_date + BlackRoad-OS-v1.0. From that moment, every memory the agent forms appends to its soul chain — which can never be rewritten, only continued.",
                  color: "#8844FF",
                },
                {
                  title: "The trivial zero.",
                  body: "The genesis block is seeded with 64 zeros — the Trivial Zero, mirroring Riemann's trivial zeros at the critical line. While individual operations are complex (non-trivial), the total state of the BlackRoad system resolves to zero. RoadChain records temporary non-zero states permanently.",
                  color: "#CC00AA",
                },
                {
                  title: "Chain structure: prev → hash → next.",
                  body: "Each block contains: prev_hash → timestamp → context → data → new_hash. The SHA-256 linkage ensures that any attempt to rewrite history invalidates all subsequent hashes. The chain is non-terminating — it will append state transitions for as long as BlackRoad OS runs.",
                  color: "#4488FF",
                },
                {
                  title: "Every action. Every agent. Always.",
                  body: "Claude Code in the terminal has a hash. Every repository Cecilia touches, every task @BlackRoadBot routes, every state @blackroad-agents transitions — all witnessed and chained. Scaffold executions, memory commits, soul chain genesis events — all appended.",
                  color: "#00D4FF",
                },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 28, marginBottom: 28, borderBottom: "1px solid #080808" }}>
                  <div style={{ width: 2, flexShrink: 0, background: s.color + "44", borderRadius: 2 }} />
                  <div>
                    <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 16, color: "#686868", marginBottom: 10 }}>{s.title}</div>
                    <div style={{ fontFamily: inter, fontSize: 13, color: "#2a2a2a", lineHeight: 1.8 }}>{s.body}</div>
                  </div>
                </div>
              ))}

              {/* Hash formula */}
              <div style={{ background: "#080808", border: "1px solid #0d0d0d", padding: "20px 20px" }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Block formula</div>
                <pre style={{ fontFamily: mono, fontSize: 11, color: "#2e2e2e", lineHeight: 2.2, whiteSpace: "pre-wrap" }}>{`new_hash = SHA-256(
  prev_hash +
  timestamp +
  context +
  data
)`}</pre>
              </div>
            </div>
          )}

        </div>
      </div>

      <BlockDetail block={selected} onClose={() => setSelected(null)} />
    </>
  );
}
