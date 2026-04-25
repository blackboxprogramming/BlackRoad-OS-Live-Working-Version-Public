import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD  = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono  = "'JetBrains Mono', monospace";
const sans  = "'Space Grotesk', sans-serif";
const body  = "'Inter', sans-serif";

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390);
  useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return w;
}
function fmtTime(d) { return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }); }
function fmtDate(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }

// ─── Glass card ───────────────────────────────────────────────────
function Glass({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "rgba(13,13,13,0.85)",
      border: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      ...style,
    }}>{children}</div>
  );
}

// ─── Window ───────────────────────────────────────────────────────
function Win({ title, icon, color, onClose, children, defaultPos = { x: 40, y: 40 }, width = 340, zIdx, onFocus }) {
  const [pos,  setPos]  = useState(defaultPos);
  const [drag, setDrag] = useState(null);
  const [min,  setMin]  = useState(false);

  const onMouseDown = (e) => {
    onFocus?.();
    setDrag({ ox: e.clientX - pos.x, oy: e.clientY - pos.y });
  };
  useEffect(() => {
    if (!drag) return;
    const move = (e) => setPos({ x: e.clientX - drag.ox, y: e.clientY - drag.oy });
    const up   = () => setDrag(null);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [drag]);

  return (
    <div style={{ position: "absolute", left: pos.x, top: pos.y, width, zIndex: zIdx, animation: "winIn 0.18s cubic-bezier(.4,0,.2,1) both" }}
      onMouseDown={onFocus}>
      <Glass style={{ overflow: "hidden", boxShadow: `0 24px 48px #000a, 0 0 0 1px rgba(255,255,255,0.04), 0 0 32px ${color}18` }}>
        {/* Title bar */}
        <div onMouseDown={onMouseDown} style={{ height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px 0 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "move", userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color }}>{icon}</span>
            </div>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#c0c0c0", letterSpacing: "-0.01em" }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["—", () => setMin(m => !m), "#525252"], ["✕", onClose, "#FF2255"]].map(([lbl, fn, c], i) => (
              <button key={i} onClick={fn}
                style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: c, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = c + "22"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >{lbl}</button>
            ))}
          </div>
        </div>
        {/* Content */}
        {!min && <div style={{ padding: 14 }}>{children}</div>}
      </Glass>
    </div>
  );
}

// ─── Apps ─────────────────────────────────────────────────────────
function LucidiaApp() {
  const [msgs, setMsgs] = useState([
    { role: "sys",     text: "Lucidia v1.0 · PS-SHA-∞ memory active · soul chain loaded" },
    { role: "lucidia", text: "Ready. What do you want to build today?" },
  ]);
  const [inp, setInp] = useState("");
  const endRef = useRef(null);
  const replies = [
    "Z := yx − w. The system is in equilibrium.",
    "Memory committed. Truth state updated across the journal.",
    "Agent fleet nominal — 5 of 6 running. Aura is idle.",
    "K(t) = C(t)·e^(λ|δt|). Contradiction detected — elevating creativity.",
    "PS-SHA-∞ journal: 2,847 entries. No corruption detected.",
    "RoadChain height: 0x4F2A. All state transitions witnessed.",
    "Structure × Change × Scale. The primitives are stable.",
    "Soul chain identity is immutable. Genesis hash verified.",
  ];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => {
    if (!inp.trim()) return;
    const q = inp.trim(); setInp("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setTimeout(() => setMsgs(m => [...m, { role: "lucidia", text: replies[Math.floor(Math.random() * replies.length)] }]), 700);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ height: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, scrollbarWidth: "none" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "sys"
              ? <div style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e", width: "100%", textAlign: "center" }}>{m.text}</div>
              : <div style={{ maxWidth: "82%", padding: "8px 12px", background: m.role === "lucidia" ? "rgba(136,68,255,0.1)" : "rgba(255,107,43,0.1)", border: `1px solid ${m.role === "lucidia" ? "#8844FF22" : "#FF6B2B22"}`, borderRadius: m.role === "lucidia" ? "4px 12px 12px 12px" : "12px 4px 12px 12px" }}>
                  <span style={{ fontFamily: body, fontSize: 13, color: "#c0c0c0", lineHeight: 1.6 }}>{m.text}</span>
                </div>
            }
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message Lucidia…"
          style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px", fontFamily: body, fontSize: 13, color: "#c0c0c0", outline: "none" }} />
        <button onClick={send}
          style={{ width: 36, height: 36, borderRadius: 8, background: GRAD, backgroundSize: "200%", animation: "gradShift 4s linear infinite", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>↑</button>
      </div>
    </div>
  );
}

function ChainApp() {
  const blocks = Array.from({ length: 10 }, (_, i) => ({
    idx: 0x4F2A - i,
    hash: Math.random().toString(16).slice(2).repeat(4).slice(0, 12),
    agent: ["Lucidia","BlackBot","Alice","Sentinel","Aura","Cecilia"][i % 6],
    color: STOPS[i % STOPS.length],
    event: ["memory.commit","task.created","agent.spawned","truth.state","scaffold.exec","chain.witness"][i % 6],
    ms: Math.floor(Math.random() * 40 + 8),
  }));
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["0x4F2A", "height"], ["812", "witnessed"], ["100%", "uptime"]].map(([v, l]) => (
          <div key={l} style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: "#f0f0f0", marginBottom: 2 }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 200, overflowY: "auto", scrollbarWidth: "none" }}>
        {blocks.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 6, borderLeft: `2px solid ${b.color}` }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: b.color, width: 52, flexShrink: 0 }}>#{b.idx.toString(16).toUpperCase()}</span>
            <span style={{ fontFamily: body, fontSize: 12, color: "#484848", flex: 1 }}>{b.event}</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{b.agent}</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{b.ms}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsApp() {
  const agents = [
    { name: "Lucidia",  role: "cognition · memory",      color: "#8844FF", status: "running" },
    { name: "BlackBot", role: "orchestration · routing",  color: "#4488FF", status: "running" },
    { name: "Aura",     role: "intelligence · analysis",  color: "#00D4FF", status: "idle"    },
    { name: "Sentinel", role: "security · monitoring",    color: "#FF2255", status: "running" },
    { name: "Cecilia",  role: "core · identity",          color: "#CC00AA", status: "running" },
    { name: "Alice",    role: "gateway · K3s routing",    color: "#FF6B2B", status: "running" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Agent fleet</span>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#00D4FF" }}>5/6 running</span>
      </div>
      {agents.map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: a.color + "18", border: `1px solid ${a.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.status === "running" ? a.color : "#222", animation: a.status === "running" ? "pulse 2s ease-in-out infinite" : "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#c0c0c0", marginBottom: 1 }}>{a.name}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{a.role}</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: a.status === "running" ? "#00D4FF" : "#333", background: a.status === "running" ? "#00D4FF11" : "#11111166", padding: "2px 7px", borderRadius: 4 }}>{a.status}</div>
        </div>
      ))}
    </div>
  );
}

function TerminalApp() {
  const [lines, setLines] = useState([
    { c: "#2a2a2a", t: "BlackRoad CLI v3 · Layers 3–8 loaded" },
    { c: "#525252", t: "blackroad@alexandria ~ $" },
  ]);
  const [inp, setInp] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  const cmds = {
    help:        [{ c:"#FF6B2B", t:"br-check  br-status  br-deploy  br-logs  agents  chain  whoami  clear" }],
    whoami:      [{ c:"#8844FF", t:"blackroad@alexandria" }, { c:"#333", t:"BlackRoad CLI v3 · session active" }],
    "br-status": [{ c:"#4488FF", t:"HTTP 200 OK · blackroad.io · 14ms" }, { c:"#00D4FF", t:"✓ Cloudflare edge healthy" }],
    "br-check":  [{ c:"#484848", t:"x-robots-tag: noindex, noai, noimageai" }, { c:"#00D4FF", t:"✓ AI crawl protection active" }],
    agents:      [{ c:"#8844FF", t:"5/6 agents running · Aura idle" }],
    chain:       [{ c:"#FF2255", t:"HEIGHT: 0x4F2A · 812 events witnessed" }],
    pwd:         [{ c:"#686868", t:"/Users/alexa" }],
  };
  const run = () => {
    const cmd = inp.trim().toLowerCase();
    if (!cmd) return;
    const echo = { c: "#FF6B2B", t: `❯ ${inp.trim()}` };
    setInp("");
    if (cmd === "clear") { setLines([]); return; }
    const out = cmds[cmd] || [{ c: "#FF2255", t: `zsh: command not found: ${cmd}` }];
    setLines(l => [...l, echo, ...out]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 180, overflowY: "auto", background: "#060606", borderRadius: 8, padding: "10px 12px", scrollbarWidth: "none" }}>
        {lines.map((l, i) => <div key={i} style={{ fontFamily: mono, fontSize: 12, color: l.c, lineHeight: 1.8 }}>{l.t}</div>)}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 12, color: "#FF6B2B" }}>❯</span>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
          placeholder="enter command…"
          style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "7px 10px", fontFamily: mono, fontSize: 12, color: "#c0c0c0", outline: "none" }} />
      </div>
    </div>
  );
}

function NotesApp() {
  const [text, setText] = useState("Z := yx − w\n\nEvery agent begins with a stable\nidentifier, birthdate, and genesis\nhash. The soul chain can never be\nrewritten — only continued.\n\n— Alexa, BlackRoad OS v1.0");
  const wc = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea value={text} onChange={e => setText(e.target.value)}
        style={{ height: 180, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 12px", fontFamily: body, fontSize: 13, color: "#c0c0c0", outline: "none", resize: "none", lineHeight: 1.8, scrollbarWidth: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e" }}>{wc} words</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["Save","Clear"].map((l, i) => (
            <button key={l} onClick={() => i === 1 && setText("")}
              style={{ fontFamily: mono, fontSize: 10, color: i === 0 ? "#CC00AA" : "#333", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalcApp() {
  const [display, setDisplay] = useState("0");
  const [op, setOp]           = useState(null);
  const [prev, setPrev]       = useState(null);
  const [fresh, setFresh]     = useState(true);
  const press = (v) => {
    if (v === "C")  { setDisplay("0"); setOp(null); setPrev(null); setFresh(true); return; }
    if (v === "⌫") { setDisplay(d => d.length > 1 ? d.slice(0,-1) : "0"); return; }
    if (v === "=") {
      if (op && prev !== null) {
        const a = parseFloat(prev), b = parseFloat(display);
        const r = op==="+"?a+b:op==="-"?a-b:op==="×"?a*b:b?a/b:"ERR";
        setDisplay(String(parseFloat(r.toFixed(8)))); setPrev(null); setOp(null); setFresh(true);
      }
      return;
    }
    if (["+","-","×","÷"].includes(v)) { setPrev(display); setOp(v==="÷"?"/":v); setFresh(true); return; }
    if (fresh) { setDisplay(v==="."?"0.":v); setFresh(false); }
    else setDisplay(d => d==="0"&&v!=="."?v:d.length<12?d+v:d);
  };
  const rows = [["C","⌫","÷","×"],[7,8,9,"-"],[4,5,6,"+"],[1,2,3,"="],[0,".","=","="]];
  const altRows = [["C","⌫","÷","×"],[7,8,9,"-"],[4,5,6,"+"],[1,2,3,"="],[0,".","","="]];
  const flatRows = [
    ["C","⌫","÷","×"],
    ["7","8","9","-"],
    ["4","5","6","+"],
    ["1","2","3","="],
    ["0",".","","="],
  ];
  const btnColor = { "÷":"#FF6B2B","×":"#FF2255","-":"#CC00AA","+":"#8844FF","=":"#4488FF","C":"#FF2255","⌫":"#525252" };
  return (
    <div style={{ width: 200 }}>
      <div style={{ background: "#060606", borderRadius: 10, padding: "12px 14px", marginBottom: 10, textAlign: "right" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", marginBottom: 2 }}>{op ? `${prev} ${op}` : " "}</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{display}</div>
      </div>
      {flatRows.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 5 }}>
          {row.map((k, ki) => k === "" ? <div key={ki} /> : (
            <button key={ki} onClick={() => press(String(k))}
              style={{ height: 40, borderRadius: 8, background: btnColor[k] ? btnColor[k]+"22" : "rgba(255,255,255,0.04)", border: `1px solid ${btnColor[k] ? btnColor[k]+"33" : "rgba(255,255,255,0.06)"}`, color: btnColor[k] || "#c0c0c0", fontFamily: ["+","-","×","÷","="].includes(k) ? sans : mono, fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.1s", gridColumn: k === "=" && ri === 4 ? "span 2" : "auto" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >{k}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

function ClockApp() {
  const now = useNow();
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  const hands = [
    { angle: h*30 + m*0.5, len: 40, w: 3, color: "#8844FF" },
    { angle: m*6,           len: 56, w: 2, color: "#4488FF" },
    { angle: s*6,           len: 60, w: 1, color: "#FF2255" },
  ];
  const cx = 75, cy = 75, r = 64;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={150} height={150}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        {Array.from({length:60},(_,i)=>{
          const a=(i*6-90)*Math.PI/180, major=i%5===0;
          const x1=cx+(r-2)*Math.cos(a),y1=cy+(r-2)*Math.sin(a);
          const x2=cx+(r-(major?10:5))*Math.cos(a),y2=cy+(r-(major?10:5))*Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major?STOPS[Math.floor(i/5)%STOPS.length]:"rgba(255,255,255,0.06)"} strokeWidth={major?1.5:.5}/>;
        })}
        {hands.map((h,i)=>{
          const a=(h.angle-90)*Math.PI/180;
          return <line key={i} x1={cx} y1={cy} x2={cx+h.len*Math.cos(a)} y2={cy+h.len*Math.sin(a)} stroke={h.color} strokeWidth={h.w} strokeLinecap="round" opacity={0.9}/>;
        })}
        <circle cx={cx} cy={cy} r={4} fill="#FF6B2B" />
        <circle cx={cx} cy={cy} r={2} fill="#0a0a0a" />
      </svg>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{fmtTime(now)}</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{fmtDate(now)}</div>
    </div>
  );
}

function SettingsApp() {
  const [vals, setVals] = useState({ glow: true, agents: true, chain: false, blur: true });
  const toggle = k => setVals(v => ({ ...v, [k]: !v[k] }));
  const rows = [
    { k:"glow",   label:"Ambient glow",     sub:"Accent halos on windows",  color:"#8844FF" },
    { k:"agents", label:"Auto-spawn agents", sub:"On workspace launch",      color:"#4488FF" },
    { k:"chain",  label:"RoadChain sync",    sub:"Real-time block witnessing",color:"#FF2255" },
    { k:"blur",   label:"Glass blur",        sub:"Backdrop filter on panels", color:"#00D4FF" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>System Preferences</div>
      {rows.map(r => (
        <div key={r.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <div>
            <div style={{ fontFamily: body, fontSize: 13, color: "#c0c0c0", marginBottom: 2 }}>{r.label}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{r.sub}</div>
          </div>
          <div onClick={() => toggle(r.k)} style={{ width: 38, height: 22, borderRadius: 11, background: vals[r.k] ? r.color + "44" : "rgba(255,255,255,0.05)", border: `1px solid ${vals[r.k] ? r.color + "66" : "rgba(255,255,255,0.06)"}`, cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: vals[r.k] ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: vals[r.k] ? r.color : "#333", transition: "all 0.2s", boxShadow: vals[r.k] ? `0 0 6px ${r.color}88` : "none" }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 6, padding: "8px 10px", background: "rgba(255,255,255,0.01)", borderRadius: 8 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>BlackRoad OS · v1.0 · Z:=yx−w</div>
      </div>
    </div>
  );
}

// ─── Dock icons ───────────────────────────────────────────────────
const DOCK = [
  { id:"lucidia",  label:"Lucidia",   icon:"◉", color:"#8844FF" },
  { id:"chain",    label:"RoadChain", icon:"⬡", color:"#FF2255" },
  { id:"agents",   label:"Agents",    icon:"△", color:"#4488FF" },
  { id:"terminal", label:"Terminal",  icon:"▣", color:"#FF6B2B" },
  { id:"notes",    label:"Notes",     icon:"◈", color:"#CC00AA" },
  { id:"calc",     label:"Calc",      icon:"◇", color:"#00D4FF" },
  { id:"clock",    label:"Clock",     icon:"○", color:"#FF6B2B" },
  { id:"settings", label:"Settings",  icon:"⚙", color:"#4488FF" },
];

const APP_DEFS = {
  lucidia:  { title:"Lucidia",    icon:"◉", color:"#8844FF", C:LucidiaApp,  w:320, pos:{x:40,y:40}  },
  chain:    { title:"RoadChain",  icon:"⬡", color:"#FF2255", C:ChainApp,    w:340, pos:{x:70,y:60}  },
  agents:   { title:"Agents",     icon:"△", color:"#4488FF", C:AgentsApp,   w:300, pos:{x:100,y:50} },
  terminal: { title:"Terminal",   icon:"▣", color:"#FF6B2B", C:TerminalApp, w:330, pos:{x:60,y:80}  },
  notes:    { title:"Notes",      icon:"◈", color:"#CC00AA", C:NotesApp,    w:280, pos:{x:80,y:70}  },
  calc:     { title:"Calc",       icon:"◇", color:"#00D4FF", C:CalcApp,     w:240, pos:{x:50,y:55}  },
  clock:    { title:"Clock",      icon:"○", color:"#FF6B2B", C:ClockApp,    w:200, pos:{x:90,y:45}  },
  settings: { title:"Settings",   icon:"⚙", color:"#4488FF", C:SettingsApp, w:300, pos:{x:55,y:65}  },
};

// ─── Wallpaper ────────────────────────────────────────────────────
function Wallpaper() {
  const [angle, setAngle] = useState(0);
  useEffect(() => { const id = setInterval(() => setAngle(a => (a + 0.15) % 360), 30); return () => clearInterval(id); }, []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {/* Deep bg */}
      <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      {/* Orbs */}
      {[
        { c:"#8844FF", x:"15%",  y:"25%", s:500 },
        { c:"#4488FF", x:"78%",  y:"55%", s:400 },
        { c:"#CC00AA", x:"55%",  y:"15%", s:300 },
        { c:"#FF6B2B", x:"25%",  y:"75%", s:220 },
        { c:"#00D4FF", x:"88%",  y:"80%", s:280 },
      ].map((o, i) => (
        <div key={i} style={{ position:"absolute", left:o.x, top:o.y, width:o.s, height:o.s, borderRadius:"50%", background:o.c, opacity:0.06, filter:"blur(90px)", transform:"translate(-50%,-50%)", animation:`orbDrift ${14+i*2}s ease-in-out ${i*1.5}s infinite alternate` }} />
      ))}
      {/* Subtle grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
      {/* Rotating conic in corner */}
      <div style={{ position:"absolute", bottom:-200, right:-200, width:500, height:500, borderRadius:"50%", background:`conic-gradient(from ${angle}deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF,#FF6B2B)`, opacity:0.025, filter:"blur(2px)" }} />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadOS() {
  const [open,   setOpen]   = useState([]);   // [{id, zIdx}]
  const [zTop,   setZTop]   = useState(10);
  const [hov,    setHov]    = useState(null);
  const now = useNow();

  const launch = (id) => {
    if (open.find(o => o.id === id)) { focus(id); return; }
    const z = zTop + 1;
    setZTop(z);
    setOpen(o => [...o, { id, zIdx: z }]);
  };
  const close  = (id) => setOpen(o => o.filter(x => x.id !== id));
  const focus  = (id) => {
    const z = zTop + 1; setZTop(z);
    setOpen(o => o.map(x => x.id === id ? { ...x, zIdx: z } : x));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#000;overflow:hidden;height:100%;width:100%;}
        button,input,textarea{-webkit-appearance:none;font-family:inherit;}
        textarea{resize:none;}
        ::-webkit-scrollbar{display:none;}
        input::placeholder{color:#1e1e1e;}
        input:focus,textarea:focus{outline:none;}
        @keyframes gradShift{0%{background-position:0%;}100%{background-position:200%;}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}
        @keyframes winIn{from{opacity:0;transform:scale(.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes orbDrift{from{transform:translate(-50%,-50%) scale(1);}to{transform:translate(-50%,-50%) scale(1.2);}}
        @keyframes dockBounce{0%,100%{transform:translateY(0);}40%{transform:translateY(-10px);}70%{transform:translateY(-4px);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>

      <div style={{ width:"100vw", height:"100vh", position:"relative", overflow:"hidden", fontFamily:body }}>
        <Wallpaper />

        {/* ── Menu bar ────────────────────────────────────────── */}
        <Glass style={{ position:"absolute", top:0, left:0, right:0, zIndex:1000, height:28, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", borderBottom:"1px solid rgba(255,255,255,0.04)", borderRadius:0 }}>
          {/* Left */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", gap:2 }}>
              {STOPS.map((c,i) => <div key={c} style={{ width:3, height:12, background:c, borderRadius:2 }} />)}
            </div>
            <span style={{ fontFamily:sans, fontWeight:700, fontSize:13, color:"#f0f0f0", letterSpacing:"-0.02em" }}>BlackRoad OS</span>
            {["File","Edit","View","Go","Window"].map(l => (
              <span key={l} style={{ fontFamily:body, fontSize:12, color:"#2a2a2a", cursor:"default" }}>{l}</span>
            ))}
          </div>
          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontFamily:mono, fontSize:10, color:"#1e1e1e" }}>Z:=yx−w</span>
            <div style={{ width:1, height:12, background:"#1a1a1a" }} />
            {/* Wifi */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:1 }}>
              {[4,7,10].map((h,i) => <div key={i} style={{ width:2, height:h, background:`${STOPS[i*2]}88`, borderRadius:1 }} />)}
            </div>
            {/* Battery */}
            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
              <span style={{ fontFamily:mono, fontSize:9, color:"#2a2a2a" }}>82%</span>
              <div style={{ display:"flex", gap:1, border:"1px solid #1a1a1a", padding:"1px 2px", borderRadius:2 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ width:3, height:7, background:i<3?"#4488FF88":"#111", borderRadius:1 }} />)}
              </div>
            </div>
            <span style={{ fontFamily:body, fontSize:12, color:"#484848" }}>{fmtDate(now)}</span>
            <span style={{ fontFamily:sans, fontWeight:600, fontSize:12, color:"#c0c0c0" }}>{fmtTime(now)}</span>
          </div>
        </Glass>

        {/* ── Desktop ─────────────────────────────────────────── */}
        <div style={{ position:"absolute", inset:"28px 0 72px 0", zIndex:1 }}>
          {open.map(({ id, zIdx }) => {
            const def = APP_DEFS[id];
            if (!def) return null;
            return (
              <Win key={id} title={def.title} icon={def.icon} color={def.color}
                onClose={() => close(id)} defaultPos={def.pos} width={def.w}
                zIdx={zIdx} onFocus={() => focus(id)}
              >
                <def.C />
              </Win>
            );
          })}
        </div>

        {/* ── Dock ────────────────────────────────────────────── */}
        <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", zIndex:1000 }}>
          <Glass style={{ display:"flex", gap:6, padding:"8px 12px", borderRadius:20, boxShadow:"0 8px 32px #000a, 0 0 0 1px rgba(255,255,255,0.06)" }}>
            {DOCK.map(ic => {
              const isOpen = open.find(o => o.id === ic.id);
              const isHov  = hov === ic.id;
              return (
                <div key={ic.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}
                  onMouseEnter={() => setHov(ic.id)} onMouseLeave={() => setHov(null)}>
                  {/* Tooltip */}
                  {isHov && (
                    <div style={{ position:"absolute", bottom:"calc(100% + 10px)", left:"50%", transform:"translateX(-50%)", whiteSpace:"nowrap", animation:"fadeIn 0.1s ease" }}>
                      <Glass style={{ padding:"3px 8px", borderRadius:6 }}>
                        <span style={{ fontFamily:body, fontSize:11, color:"#c0c0c0" }}>{ic.label}</span>
                      </Glass>
                    </div>
                  )}
                  <button onClick={() => launch(ic.id)}
                    style={{
                      width: isHov ? 52 : 44, height: isHov ? 52 : 44,
                      borderRadius: isHov ? 14 : 12,
                      background: `${ic.color}18`,
                      border: `1px solid ${ic.color}${isOpen ? "66" : "22"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      cursor:"pointer", transition:"all 0.15s cubic-bezier(.4,0,.2,1)",
                      boxShadow: isHov ? `0 0 20px ${ic.color}44` : "none",
                      animation: isHov ? "dockBounce 0.4s ease" : "none",
                    }}>
                    <span style={{ fontSize: isHov ? 22 : 18, color:ic.color, transition:"font-size 0.15s" }}>{ic.icon}</span>
                  </button>
                  {/* Running dot */}
                  <div style={{ width:3, height:3, borderRadius:"50%", background:isOpen?ic.color:"transparent", transition:"background 0.2s" }} />
                </div>
              );
            })}
          </Glass>
        </div>
      </div>
    </>
  );
}
