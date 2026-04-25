import { useState, useEffect, useRef, useCallback } from "react";

/* ─── PALETTE ────────────────────────────────────────────────── */
const P = {
  void:    "#060608",
  grout:   "#0e0e12",
  panel:   "#13131a",
  surface: "#1a1a24",
  rim:     "#252535",
  muted:   "#3a3a52",
  dim:     "#6060a0",
  text:    "#e8e8f8",
  soft:    "#9090c0",
  pink:    "#ff0087",
  orange:  "#ff8700",
  orchid:  "#af5fd7",
  blue:    "#1e90ff",
  magenta: "#ff00ff",
  teal:    "#00e5cc",
  gold:    "#ffd700",
};

const G = {
  pink:    `linear-gradient(135deg, ${P.pink} 0%, ${P.orchid} 100%)`,
  blue:    `linear-gradient(135deg, ${P.blue} 0%, ${P.teal} 100%)`,
  orange:  `linear-gradient(135deg, ${P.orange} 0%, ${P.gold} 100%)`,
  violet:  `linear-gradient(135deg, ${P.orchid} 0%, ${P.magenta} 100%)`,
  dark:    `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
  ink:     `linear-gradient(135deg, #0e0e1a 0%, #1a0e2e 100%)`,
};

/* ─── FONTS ──────────────────────────────────────────────────── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=Syne:wght@400;600;800&display=swap');
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
@keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes glow-in { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
@keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes border-spin {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes blink { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
* { box-sizing: border-box; margin: 0; padding: 0; }
`;

/* ─── TILE DATA ──────────────────────────────────────────────── */
// grid is a 12-column layout, rows are explicit heights
// col: start col (1-based), span, row, rowspan
const TILE_DEFS = [
  { id: "clock",    col:1,  span:4, row:1, rows:2, label:"Clock",        accent: P.blue,    bg: G.dark },
  { id: "formula",  col:5,  span:5, row:1, rows:2, label:"Road Math",    accent: P.pink,    bg: G.ink },
  { id: "agents",   col:10, span:3, row:1, rows:1, label:"Agents",       accent: P.teal,    bg: G.blue },
  { id: "network",  col:10, span:3, row:2, rows:1, label:"Network",      accent: P.orchid,  bg: G.violet },
  { id: "terminal", col:1,  span:5, row:3, rows:2, label:"Terminal",     accent: P.orange,  bg: G.ink },
  { id: "files",    col:6,  span:4, row:3, rows:1, label:"Files",        accent: P.gold,    bg: G.orange },
  { id: "weather",  col:10, span:3, row:3, rows:2, label:"System",       accent: P.pink,    bg: G.pink },
  { id: "art",      col:6,  span:4, row:4, rows:1, label:"Lucidia",      accent: P.magenta, bg: G.violet },
  { id: "log",      col:1,  span:12,row:5, rows:1, label:"Event Log",    accent: P.dim,     bg: G.ink },
];

/* ─── CLOCK TILE ─────────────────────────────────────────────── */
function ClockTile() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const h = t.getHours().toString().padStart(2,"0");
  const m = t.getMinutes().toString().padStart(2,"0");
  const s = t.getSeconds().toString().padStart(2,"0");
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  return (
    <div style={{ padding:16, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:600, color:P.blue, letterSpacing:3, opacity:0.8 }}>
        {days[t.getDay()]} · {t.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase()}
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:52, fontWeight:300, color:P.text, lineHeight:1 }}>{h}:{m}</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:22, color:P.blue, animation:"blink 1s step-end infinite" }}>{s}</span>
      </div>
      <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:13, color:P.soft }}>
        Lakeville, Minnesota
      </div>
    </div>
  );
}

/* ─── FORMULA TILE ───────────────────────────────────────────── */
function FormulaTile() {
  const lines = [
    { t:"G(n) = n^(n+n/n) / (n+n/n)^n", c:P.text, size:15 },
    { t:"", c:P.soft, size:11 },
    { t:"G(0) = 0      · nothing from nothing", c:P.soft, size:11 },
    { t:"G(1) = 1/2    · first amplitude", c:P.orchid, size:11 },
    { t:"G(2) = 8/9    · binary loses", c:P.soft, size:11 },
    { t:"G(3) = 81/64  · ternary wins", c:P.pink, size:11 },
    { t:"", c:P.soft, size:11 },
    { t:"∫ G(n) dn = n/n = 1", c:P.teal, size:13 },
  ];
  return (
    <div style={{ padding:16, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:10, fontWeight:600, color:P.pink, letterSpacing:3 }}>
        AMUNDSON FRAMEWORK · 2026
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {lines.map((l,i) => (
          <div key={i} style={{
            fontFamily:"'DM Mono',monospace", fontSize:l.size,
            color:l.c, lineHeight:1.4,
            animation:`slide-up 0.4s ease ${i*0.04}s both`,
          }}>{l.t || "\u00a0"}</div>
        ))}
      </div>
      <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:11, color:P.dim }}>
        Alexa Louise Amundson · BlackRoad OS
      </div>
    </div>
  );
}

/* ─── AGENTS TILE ────────────────────────────────────────────── */
function AgentsTile() {
  const [n, setN] = useState(30000);
  useEffect(() => {
    const i = setInterval(() => setN(v => v + Math.floor(Math.random()*3 - 1)), 2000);
    return () => clearInterval(i);
  }, []);
  return (
    <div style={{ padding:12, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:9, fontWeight:600, color:P.teal, letterSpacing:3 }}>AGENTS ONLINE</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:34, fontWeight:300, color:P.teal, animation:"pulse 3s ease infinite" }}>
        {n.toLocaleString()}
      </div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:P.dim }}>● LIVE</div>
    </div>
  );
}

/* ─── NETWORK TILE ───────────────────────────────────────────── */
function NetworkTile() {
  const nodes = ["aria","octavia","alice","lucidia","shellfish"];
  return (
    <div style={{ padding:12, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:9, fontWeight:600, color:P.orchid, letterSpacing:3 }}>CLUSTER</div>
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
        {nodes.map(n => (
          <div key={n} style={{
            fontFamily:"'DM Mono',monospace", fontSize:9,
            color:P.orchid, border:`1px solid ${P.orchid}44`,
            padding:"2px 6px", borderRadius:2,
          }}>●{" "}{n}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── TERMINAL TILE ──────────────────────────────────────────── */
function TerminalTile({ expanded }) {
  const [lines, setLines] = useState([
    { t:"mosaic os v1.0 — br shell", c:P.orange },
    { t:"type 'help' for commands", c:P.dim },
    { t:"", c:P.text },
  ]);
  const [inp, setInp] = useState("");
  const endRef = useRef(null);
  const CMDS = {
    "help":    () => [{ t:"commands: br agents, br math, br ls, br pi, clear", c:P.soft }],
    "br agents": () => [{ t:"30,000 agents online · 489 workers deployed", c:P.teal }],
    "br math": () => [{ t:"G(n) = n^(n+n/n)/(n+n/n)^n", c:P.pink },{ t:"∫ = n/n", c:P.orchid }],
    "br ls":   () => [
      { t:"aria 192.168.4.64", c:P.text },
      { t:"octavia 192.168.4.74", c:P.text },
      { t:"alice 192.168.4.49", c:P.text },
      { t:"lucidia 192.168.4.38", c:P.text },
    ],
    "br pi":   () => [{ t:"4× Pi 5 · 2× Hailo-8 NPU · Pironman 5-MAX", c:P.orange }],
    "clear":   () => null,
  };
  const run = () => {
    const cmd = inp.trim().toLowerCase();
    if (cmd === "clear") { setLines([]); setInp(""); return; }
    const res = CMDS[cmd];
    const out = res ? res() : [{ t:`command not found: ${cmd}`, c:"#ff4444" }];
    setLines(l => [...l, { t:`$ ${cmd}`, c:P.orange }, ...out, { t:"", c:P.text }]);
    setInp("");
  };
  useEffect(() => endRef.current?.scrollIntoView({ behavior:"smooth" }), [lines]);
  const fontSize = expanded ? 12 : 10;
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:12, background:"#05050a" }}>
      <div style={{ flex:1, overflowY:"auto", fontFamily:"'DM Mono',monospace", fontSize, lineHeight:1.5 }}>
        {lines.map((l,i) => <div key={i} style={{ color:l.c }}>{l.t||"\u00a0"}</div>)}
        <div ref={endRef}/>
      </div>
      <div style={{ display:"flex", gap:6, alignItems:"center", borderTop:`1px solid ${P.rim}`, paddingTop:8 }}>
        <span style={{ color:P.orange, fontFamily:"'DM Mono',monospace", fontSize }}>▸</span>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()}
          style={{ flex:1, background:"transparent", border:"none", outline:"none",
            color:P.text, fontFamily:"'DM Mono',monospace", fontSize, caretColor:P.orange }} autoFocus />
      </div>
    </div>
  );
}

/* ─── FILES TILE ─────────────────────────────────────────────── */
function FilesTile() {
  const files = [
    { n:"PAPER.md",        s:"22 KB", c:P.gold },
    { n:"VOLUME-II.md",    s:"18 KB", c:P.gold },
    { n:"verify.py",       s:"4.1 KB", c:P.teal },
    { n:"identities/",     s:"dir",   c:P.orchid },
    { n:"millennium/",     s:"dir",   c:P.orchid },
    { n:"quantum/",        s:"dir",   c:P.orchid },
  ];
  return (
    <div style={{ padding:12, height:"100%", overflow:"hidden" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:9, fontWeight:600, color:P.gold, letterSpacing:3, marginBottom:8 }}>
        ~/blackboxprogramming/road-math
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {files.map(f => (
          <div key={f.n} style={{ display:"flex", justifyContent:"space-between",
            fontFamily:"'DM Mono',monospace", fontSize:10, color:f.c, padding:"2px 0",
            borderBottom:`1px solid ${P.rim}20` }}>
            <span>{f.n}</span><span style={{ color:P.dim }}>{f.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SYSTEM TILE ────────────────────────────────────────────── */
function SystemTile() {
  const [cpu, setCpu] = useState(23);
  const [mem, setMem] = useState(61);
  useEffect(() => {
    const i = setInterval(() => {
      setCpu(v => Math.max(5, Math.min(95, v + Math.floor(Math.random()*10-5))));
      setMem(v => Math.max(40, Math.min(85, v + Math.floor(Math.random()*6-3))));
    }, 1500);
    return () => clearInterval(i);
  }, []);
  const Bar = ({ label, value, color }) => (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'DM Mono',monospace", fontSize:9, color:P.soft, marginBottom:4 }}>
        <span>{label}</span><span style={{ color }}>{value}%</span>
      </div>
      <div style={{ height:4, background:P.rim, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${value}%`, background:color, borderRadius:2,
          transition:"width 0.8s ease" }} />
      </div>
    </div>
  );
  return (
    <div style={{ padding:14, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:9, fontWeight:600, color:P.pink, letterSpacing:3 }}>SYSTEM</div>
      <div>
        <Bar label="CPU" value={cpu} color={P.teal} />
        <Bar label="MEM" value={mem} color={P.pink} />
      </div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:P.dim }}>
        BlackRoad OS · Delaware C-Corp
      </div>
    </div>
  );
}

/* ─── ART TILE ───────────────────────────────────────────────── */
function ArtTile() {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const i = setInterval(() => setPhase(p => (p+1)%4), 3000); return () => clearInterval(i); }, []);
  const msgs = [
    "LUCIDIA · PS-SHA-∞",
    "G(n) = n/e as n→∞",
    "∫ = n/n",
    "every path has meaning",
  ];
  const bgs = [G.violet, G.pink, G.blue, G.orange];
  return (
    <div style={{
      height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
      background: bgs[phase], transition:"background 1s ease",
      flexDirection:"column", gap:8,
    }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
        color:"rgba(255,255,255,0.9)", letterSpacing:2, textAlign:"center",
        animation:"float 4s ease-in-out infinite", padding:"0 16px" }}>
        {msgs[phase]}
      </div>
      <div style={{ display:"flex", gap:6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:6, height:6, borderRadius:"50%",
            background: i===phase ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
            transition:"background 0.4s",
          }}/>
        ))}
      </div>
    </div>
  );
}

/* ─── LOG TILE ───────────────────────────────────────────────── */
function LogTile() {
  const msgs = [
    "● agent:aria heartbeat ok · G(64)/64=0.370",
    "● worker:cf-489 deployed · runtime 12ms",
    "● lucidia:memory commit · PS-SHA-∞ hash written",
    "● agent:octavia hailo-8 inference · 26 TOPS",
    "● blackroad-cli br v3 layer-7 active",
    "● repo:road-math PAPER.md pushed · 628 lines",
    "● cluster:alice routing table updated",
    "● system:cecilia pid 1337 spawned",
    "● network:tailscale mesh healthy · 4 nodes",
    "● agent:aria heartbeat ok · G(64)/64=0.370",
    "● worker:cf-489 deployed · runtime 12ms",
  ];
  const doubled = [...msgs, ...msgs].join("   ·   ");
  return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", overflow:"hidden",
      borderTop:`1px solid ${P.rim}` }}>
      <div style={{ whiteSpace:"nowrap", animation:"ticker 40s linear infinite",
        fontFamily:"'DM Mono',monospace", fontSize:10, color:P.dim, paddingLeft:"100%" }}>
        {doubled}
      </div>
    </div>
  );
}

/* ─── TILE CONTENT MAP ───────────────────────────────────────── */
const CONTENT = {
  clock:    ClockTile,
  formula:  FormulaTile,
  agents:   AgentsTile,
  network:  NetworkTile,
  terminal: TerminalTile,
  files:    FilesTile,
  weather:  SystemTile,
  art:      ArtTile,
  log:      LogTile,
};

/* ─── TILE COMPONENT ─────────────────────────────────────────── */
function Tile({ def, onClick, expanded }) {
  const [hov, setHov] = useState(false);
  const Content = CONTENT[def.id];

  return (
    <div
      onClick={() => onClick(def.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        gridColumn: `${def.col} / span ${def.span}`,
        gridRow:    `${def.row} / span ${def.rows}`,
        background: def.bg,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hov ? "scale(1.008)" : "scale(1)",
        boxShadow: hov
          ? `0 0 0 1px ${def.accent}88, 0 12px 40px rgba(0,0,0,0.6)`
          : `0 0 0 1px ${P.rim}`,
        animation: `glow-in 0.5s ease both`,
        zIndex: hov ? 2 : 1,
      }}
    >
      {/* Accent corner stripe */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background: def.accent,
        opacity: hov ? 1 : 0.5,
        transition: "opacity 0.2s",
      }}/>

      {/* Content */}
      <div style={{ height:"100%" }}>
        {Content && <Content expanded={expanded} />}
      </div>

      {/* Label badge */}
      <div style={{
        position:"absolute", bottom:6, right:8,
        fontFamily:"'Syne',sans-serif", fontSize:8, fontWeight:600,
        color: def.accent, letterSpacing:2, opacity: hov ? 0.9 : 0.35,
        transition:"opacity 0.2s",
      }}>
        {def.label.toUpperCase()}
      </div>
    </div>
  );
}

/* ─── EXPANDED OVERLAY ───────────────────────────────────────── */
function Expanded({ def, onClose }) {
  const Content = CONTENT[def.id];
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
        zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
        animation:"glow-in 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"80vw", height:"70vh", background: def.bg,
          borderTop:`3px solid ${def.accent}`,
          boxShadow:`0 0 80px ${def.accent}44`,
          display:"flex", flexDirection:"column",
          position:"relative",
          animation:"glow-in 0.25s ease",
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"8px 16px", borderBottom:`1px solid ${P.rim}` }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:600,
            color:def.accent, letterSpacing:3 }}>{def.label.toUpperCase()}</span>
          <button onClick={onClose} style={{ background:"none", border:"none",
            color:P.soft, fontFamily:"'DM Mono',monospace", fontSize:16,
            cursor:"pointer", padding:"2px 8px" }}>✕</button>
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          {Content && <Content expanded={true}/>}
        </div>
      </div>
    </div>
  );
}

/* ─── TOPBAR ─────────────────────────────────────────────────── */
function TopBar() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()),1000); return () => clearInterval(i); },[]);
  return (
    <div style={{
      height:36, background:P.grout,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 20px", borderBottom:`1px solid ${P.rim}`,
      flexShrink:0,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div style={{
          fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800,
          background: G.pink, WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent", letterSpacing:1,
        }}>MOSAIC OS</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:9, fontWeight:600,
          color:P.dim, letterSpacing:3 }}>BLACKROAD OS, INC.</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:20 }}>
        {[
          { label:"AGENTS", val:"30k", c:P.teal },
          { label:"WORKERS", val:"489", c:P.orchid },
          { label:"REPOS", val:"1,825", c:P.pink },
        ].map(({label,val,c}) => (
          <div key={label} style={{ display:"flex", gap:5, alignItems:"baseline" }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:8, fontWeight:600,
              color:P.dim, letterSpacing:2 }}>{label}</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:c }}>{val}</span>
          </div>
        ))}
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:P.soft }}>
          {t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
        </div>
        <div style={{
          fontFamily:"'DM Mono',monospace", fontSize:10, color:P.pink,
          border:`1px solid ${P.pink}44`, padding:"2px 8px", borderRadius:2,
        }}>alexa</div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function MosaicOS() {
  const [expanded, setExpanded] = useState(null);

  const open = useCallback((id) => {
    setExpanded(d => d?.id === id ? null : TILE_DEFS.find(t => t.id === id));
  }, []);

  const expDef = expanded;

  return (
    <>
      <style>{FONTS}</style>
      <div style={{
        width:"100%", height:"100vh", background:P.void,
        display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>
        <TopBar/>

        {/* Mosaic grid */}
        <div style={{
          flex:1,
          display:"grid",
          gridTemplateColumns:"repeat(12, 1fr)",
          gridTemplateRows:"1fr 1fr 1fr 1fr 36px",
          gap:3,
          padding:3,
          overflow:"hidden",
          background:P.grout,
        }}>
          {TILE_DEFS.map(def => (
            <Tile key={def.id} def={def} onClick={open} expanded={false}/>
          ))}
        </div>

        {expDef && <Expanded def={expDef} onClose={() => setExpanded(null)}/>}
      </div>
    </>
  );
}
