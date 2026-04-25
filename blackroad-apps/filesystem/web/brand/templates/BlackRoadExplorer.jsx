import { useState, useEffect, useMemo, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Mock data generator ─────────────────────────────────────────
const AGENTS    = ["Lucidia","BlackBot","Aura","Sentinel","Orchestr."];
const METHODS   = ["POST","GET","DELETE","PATCH","PUT"];
const ROUTES    = ["/v1/agents/spawn","/v1/events/publish","/v1/memory/read","/v1/agents/chat","/v1/tasks/create","/v1/webhooks/trigger","/v1/agents/list","/v1/memory/commit"];
const STATUSES  = [200,200,200,200,201,204,400,401,429,500];
const REGIONS   = ["us-central","eu-west","ap-south"];
const EVENTS    = ["agent.spawned","task.created","memory.commit","event.published","webhook.triggered","auth.success","auth.failure","agent.error","task.completed","rate.limited"];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function genRow(id) {
  const status  = rnd(STATUSES);
  const method  = rnd(METHODS);
  const agent   = rnd(AGENTS);
  const ms      = rndInt(2, 480);
  const ts      = new Date(Date.now() - rndInt(0, 86400000 * 7));
  return {
    id: `evt_${(id + 1000).toString(36)}`,
    timestamp: ts,
    agent,
    event: rnd(EVENTS),
    method,
    route: rnd(ROUTES),
    status,
    latency: ms,
    region: rnd(REGIONS),
    tokens: rndInt(40, 4200),
    size: rndInt(128, 32768),
  };
}

const ALL_ROWS = Array.from({ length: 400 }, (_, i) => genRow(i))
  .sort((a, b) => b.timestamp - a.timestamp);

// ─── Column definitions ──────────────────────────────────────────
const COLS = [
  { id: "id",        label: "ID",         width: 96,  sortable: true,  mono: true  },
  { id: "timestamp", label: "Timestamp",  width: 148, sortable: true,  mono: true  },
  { id: "agent",     label: "Agent",      width: 100, sortable: true,  mono: false },
  { id: "event",     label: "Event",      width: 160, sortable: true,  mono: true  },
  { id: "method",    label: "Method",     width: 68,  sortable: true,  mono: true  },
  { id: "route",     label: "Route",      width: 200, sortable: false, mono: true  },
  { id: "status",    label: "Status",     width: 64,  sortable: true,  mono: true  },
  { id: "latency",   label: "Latency",    width: 76,  sortable: true,  mono: true  },
  { id: "region",    label: "Region",     width: 96,  sortable: true,  mono: true  },
  { id: "tokens",    label: "Tokens",     width: 76,  sortable: true,  mono: true  },
  { id: "size",      label: "Size",       width: 76,  sortable: true,  mono: true  },
];

const PAGE_SIZE = 50;

// ─── Formatters ──────────────────────────────────────────────────
function fmtTs(d) {
  return d.toISOString().replace("T"," ").slice(0,19);
}
function fmtSize(b) {
  return b >= 1024 ? (b/1024).toFixed(1)+"KB" : b+"B";
}
function statusColor(s) {
  if (s >= 500) return "#FF2255";
  if (s >= 400) return "#FF6B2B";
  if (s >= 200) return "#00D4FF";
  return "#525252";
}
function methodColor(m) {
  const map = { POST:"#8844FF", GET:"#4488FF", DELETE:"#FF2255", PATCH:"#FF6B2B", PUT:"#CC00AA" };
  return map[m] || "#525252";
}
function agentColor(a) {
  const map = { Lucidia:"#8844FF", BlackBot:"#4488FF", Aura:"#00D4FF", Sentinel:"#FF2255", "Orchestr.":"#FF6B2B" };
  return map[a] || "#525252";
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

function useCopy(val) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(val).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return [copied, copy];
}

// ─── Detail drawer ────────────────────────────────────────────────
function DetailDrawer({ row, onClose }) {
  if (!row) return null;
  const pairs = [
    ["ID",        row.id],
    ["Timestamp", fmtTs(row.timestamp)],
    ["Agent",     row.agent],
    ["Event",     row.event],
    ["Method",    row.method],
    ["Route",     row.route],
    ["Status",    row.status],
    ["Latency",   row.latency + "ms"],
    ["Region",    row.region],
    ["Tokens",    row.tokens.toLocaleString()],
    ["Size",      fmtSize(row.size)],
  ];
  const [copied, copy] = useCopy(JSON.stringify(row, null, 2));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 340, zIndex: 201, background: "#050505", borderLeft: "1px solid #141414", display: "flex", flexDirection: "column", animation: "drawerIn 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #0d0d0d", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Event detail</div>
            <div style={{ fontFamily: mono, fontSize: 13, color: "#888" }}>{row.id}</div>
          </div>
          <button onClick={onClose} style={{ fontFamily: mono, fontSize: 14, color: "#333", background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}
          >✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {pairs.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #0a0a0a" }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", width: 72, flexShrink: 0, paddingTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: "#888", wordBreak: "break-all", lineHeight: 1.5 }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Raw JSON</div>
            <pre style={{ fontFamily: mono, fontSize: 10, color: "#404040", background: "#030303", border: "1px solid #0d0d0d", padding: "12px", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify({ ...row, timestamp: fmtTs(row.timestamp) }, null, 2)}
            </pre>
          </div>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #0d0d0d", flexShrink: 0 }}>
          <button onClick={copy} style={{ width: "100%", fontFamily: mono, fontSize: 9, color: copied ? "#00D4FF" : "#484848", background: "none", border: `1px solid ${copied ? "#00D4FF33" : "#1a1a1a"}`, padding: "9px 0", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}>
            {copied ? "✓ JSON copied" : "Copy JSON"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────
function FilterChip({ label, value, onClear, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 9, color: color || "#888", background: (color || "#888") + "12", border: `1px solid ${(color || "#888")}28`, padding: "4px 8px 4px 10px", flexShrink: 0 }}>
      <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}: {value}</span>
      <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: color || "#888", fontSize: 10, padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────
function StatsBar({ rows }) {
  const total    = rows.length;
  const errors   = rows.filter(r => r.status >= 400).length;
  const avgLat   = total ? Math.round(rows.reduce((a,b) => a + b.latency, 0) / total) : 0;
  const p99      = total ? [...rows].sort((a,b) => b.latency-a.latency)[Math.floor(total*0.01)]?.latency || 0 : 0;
  const tokens   = rows.reduce((a,b) => a + b.tokens, 0);

  const stats = [
    { label: "Events",    value: total.toLocaleString(),           color: "#4488FF" },
    { label: "Errors",    value: errors.toLocaleString(),          color: errors > 0 ? "#FF2255" : "#1e1e1e" },
    { label: "Err rate",  value: total ? (errors/total*100).toFixed(1)+"%" : "—", color: errors > 0 ? "#FF6B2B" : "#1e1e1e" },
    { label: "Avg lat",   value: avgLat + "ms",                    color: avgLat > 200 ? "#FF6B2B" : "#00D4FF" },
    { label: "P99 lat",   value: p99 + "ms",                       color: "#2a2a2a" },
    { label: "Tokens",    value: tokens.toLocaleString(),          color: "#8844FF" },
  ];

  return (
    <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: "1 1 80px", background: "#080808", border: "1px solid #0d0d0d", padding: "10px 14px" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{s.label}</div>
          <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: s.color, letterSpacing: "-0.02em", transition: "color 0.3s" }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Column visibility picker ─────────────────────────────────────
function ColPicker({ visible, setVisible, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#080808", border: "1px solid #1a1a1a", zIndex: 50, minWidth: 180, padding: "8px 0" }}>
      {COLS.map(c => {
        const on = visible.includes(c.id);
        return (
          <button key={c.id} onClick={() => setVisible(v => on ? v.filter(x => x !== c.id) : [...v, c.id])}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", background: "none", border: "none", cursor: "pointer", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <div style={{ width: 12, height: 12, border: `1px solid ${on ? "#4488FF" : "#1a1a1a"}`, background: on ? "#4488FF22" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              {on && <span style={{ fontFamily: mono, fontSize: 8, color: "#4488FF" }}>✓</span>}
            </div>
            <span style={{ fontFamily: inter, fontSize: 12, color: on ? "#c0c0c0" : "#484848" }}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadExplorer() {
  const [search,      setSearch]      = useState("");
  const [sortCol,     setSortCol]     = useState("timestamp");
  const [sortDir,     setSortDir]     = useState("desc");
  const [page,        setPage]        = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [filterAgent, setFilterAgent] = useState("");
  const [filterStatus,setFilterStatus]= useState("");
  const [filterMethod,setFilterMethod]= useState("");
  const [filterRegion,setFilterRegion]= useState("");
  const [visibleCols, setVisibleCols] = useState(COLS.map(c => c.id));
  const [showColPick, setShowColPick] = useState(false);
  const [liveRefresh, setLiveRefresh] = useState(false);
  const [tick,        setTick]        = useState(0);

  const w      = useWidth();
  const mobile = w < 720;

  // Live refresh sim
  useEffect(() => {
    if (!liveRefresh) return;
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, [liveRefresh]);

  // Filter + sort
  const filtered = useMemo(() => {
    let rows = ALL_ROWS;
    if (search)       rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
    if (filterAgent)  rows = rows.filter(r => r.agent === filterAgent);
    if (filterStatus) rows = rows.filter(r => String(r.status).startsWith(filterStatus));
    if (filterMethod) rows = rows.filter(r => r.method === filterMethod);
    if (filterRegion) rows = rows.filter(r => r.region === filterRegion);

    rows = [...rows].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (av instanceof Date) { av = av.getTime(); bv = bv.getTime(); }
      if (typeof av === "string") av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return rows;
  }, [search, filterAgent, filterStatus, filterMethod, filterRegion, sortCol, sortDir, tick]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const activeCols = COLS.filter(c => visibleCols.includes(c.id));

  const setSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
    setPage(0);
  };

  const clearFilters = () => { setFilterAgent(""); setFilterStatus(""); setFilterMethod(""); setFilterRegion(""); setSearch(""); setPage(0); };
  const hasFilters = filterAgent || filterStatus || filterMethod || filterRegion || search;

  const activeFilters = [
    filterAgent  && { label: "Agent",  value: filterAgent,  clear: () => setFilterAgent(""),  color: agentColor(filterAgent) },
    filterStatus && { label: "Status", value: filterStatus + "xx", clear: () => setFilterStatus(""), color: "#FF6B2B" },
    filterMethod && { label: "Method", value: filterMethod, clear: () => setFilterMethod(""), color: methodColor(filterMethod) },
    filterRegion && { label: "Region", value: filterRegion, clear: () => setFilterRegion(""), color: "#2a2a2a" },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; }
        button { appearance: none; font-family: inherit; }
        input, select { appearance: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);    }
          50%       { opacity: 0.45; transform: scaleY(0.6); }
        }
        @keyframes drawerIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        tr:hover td { background: #080808 !important; }
        input::placeholder { color: #242424; }
        select option { background: #080808; color: #c0c0c0; }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", display: "flex", flexDirection: "column" }}>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 48, background: "#000", borderBottom: "1px solid #0d0d0d" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 13, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 13, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              <span style={{ fontFamily: mono, fontSize: 8, color: "#1c1c1c" }}>· Explorer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Live toggle */}
              <button onClick={() => setLiveRefresh(l => !l)}
                style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 9, color: liveRefresh ? "#00D4FF" : "#2a2a2a", background: "none", border: `1px solid ${liveRefresh ? "#00D4FF33" : "#1a1a1a"}`, padding: "5px 10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: liveRefresh ? "#00D4FF" : "#1a1a1a", animation: liveRefresh ? "barPulse 1s infinite" : "none" }} />
                {liveRefresh ? "Live" : "Live"}
              </button>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>{filtered.length.toLocaleString()} rows</span>
            </div>
          </nav>
        </div>

        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, padding: "12px 20px", borderBottom: "1px solid #0a0a0a", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ flex: "1 1 200px", position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontFamily: mono, fontSize: 10, color: "#242424" }}>⌕</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search events, routes, IDs…"
              style={{ width: "100%", background: "#080808", border: "1px solid #141414", outline: "none", padding: "8px 12px 8px 28px", fontFamily: inter, fontSize: 13, color: "#c0c0c0", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#2a2a2a"}
              onBlur={e => e.target.style.borderColor = "#141414"}
            />
          </div>

          {/* Filter dropdowns */}
          {[
            { label: "Agent",  val: filterAgent,  set: setFilterAgent,  opts: AGENTS,   colors: true  },
            { label: "Status", val: filterStatus, set: setFilterStatus, opts: ["2","4","5"], map: {"2":"2xx","4":"4xx","5":"5xx"} },
            { label: "Method", val: filterMethod, set: setFilterMethod, opts: METHODS,   colors: true  },
            { label: "Region", val: filterRegion, set: setFilterRegion, opts: REGIONS               },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e => { f.set(e.target.value); setPage(0); }}
              style={{ fontFamily: mono, fontSize: 9, color: f.val ? "#c0c0c0" : "#2a2a2a", background: "#080808", border: `1px solid ${f.val ? "#2a2a2a" : "#141414"}`, padding: "8px 12px", cursor: "pointer", outline: "none", transition: "border-color 0.15s", minWidth: 90 }}
            >
              <option value="">{f.label}</option>
              {f.opts.map(o => <option key={o} value={o}>{f.map ? f.map[o] : o}</option>)}
            </select>
          ))}

          {hasFilters && (
            <button onClick={clearFilters} style={{ fontFamily: mono, fontSize: 9, color: "#FF2255", background: "none", border: "1px solid #FF225522", padding: "8px 12px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FF22550d"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >Clear</button>
          )}

          {/* Column picker */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <button onClick={() => setShowColPick(o => !o)}
              style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "8px 12px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#888"}
              onMouseLeave={e => e.currentTarget.style.color = "#333"}
            >Columns ▾</button>
            {showColPick && <ColPicker visible={visibleCols} setVisible={setVisibleCols} onClose={() => setShowColPick(false)} />}
          </div>
        </div>

        {/* ── Active filter chips ───────────────────────────────── */}
        {activeFilters.length > 0 && (
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #0a0a0a", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {activeFilters.map(f => (
              <FilterChip key={f.label} label={f.label} value={f.value} onClear={f.clear} color={f.color} />
            ))}
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────── */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #0a0a0a", flexShrink: 0 }}>
          <StatsBar rows={filtered} />
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: mobile ? "auto" : activeCols.reduce((a,c) => a+c.width, 0) }}>
            {/* Head */}
            <thead>
              <tr style={{ borderBottom: "1px solid #0d0d0d" }}>
                {activeCols.map(c => (
                  <th key={c.id}
                    onClick={() => c.sortable && setSort(c.id)}
                    style={{
                      width: c.width, minWidth: c.width,
                      padding: "8px 14px",
                      fontFamily: mono, fontSize: 9, color: sortCol === c.id ? "#c0c0c0" : "#242424",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      textAlign: "left", background: "#000",
                      cursor: c.sortable ? "pointer" : "default",
                      userSelect: "none",
                      borderBottom: sortCol === c.id ? "1px solid #4488FF44" : "none",
                      transition: "color 0.15s",
                      whiteSpace: "nowrap",
                      position: "sticky", top: 0, zIndex: 10,
                    }}
                  >
                    {c.label}
                    {c.sortable && sortCol === c.id && (
                      <span style={{ marginLeft: 4, color: "#4488FF" }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {pageRows.map((row, ri) => (
                <tr key={row.id} onClick={() => setSelected(row)}
                  style={{ borderBottom: "1px solid #060606", cursor: "pointer", animation: `fadeUp 0.15s ease ${(ri % 20) * 0.01}s both` }}
                >
                  {activeCols.map(c => {
                    let cell;
                    let cellColor = "#484848";

                    if (c.id === "id")        { cell = row.id;                    cellColor = "#2e2e2e"; }
                    else if (c.id === "timestamp") { cell = fmtTs(row.timestamp); cellColor = "#2a2a2a"; }
                    else if (c.id === "agent") {
                      cellColor = agentColor(row.agent);
                      cell = (
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: cellColor, flexShrink: 0, display: "inline-block" }} />
                          <span style={{ color: cellColor, fontFamily: inter, fontSize: 12 }}>{row.agent}</span>
                        </span>
                      );
                    }
                    else if (c.id === "event") { cell = row.event; cellColor = "#3e3e3e"; }
                    else if (c.id === "method") {
                      cellColor = methodColor(row.method);
                      cell = <span style={{ color: cellColor }}>{row.method}</span>;
                    }
                    else if (c.id === "route")  { cell = row.route;  cellColor = "#383838"; }
                    else if (c.id === "status") {
                      cellColor = statusColor(row.status);
                      cell = <span style={{ color: cellColor }}>{row.status}</span>;
                    }
                    else if (c.id === "latency") {
                      cellColor = row.latency > 200 ? "#FF6B2B" : row.latency > 100 ? "#888" : "#2e2e2e";
                      cell = <span style={{ color: cellColor }}>{row.latency}ms</span>;
                    }
                    else if (c.id === "region") { cell = row.region; cellColor = "#2a2a2a"; }
                    else if (c.id === "tokens") { cell = row.tokens.toLocaleString(); cellColor = "#2e2e2e"; }
                    else if (c.id === "size")   { cell = fmtSize(row.size); cellColor = "#2a2a2a"; }

                    return (
                      <td key={c.id} style={{
                        padding: "7px 14px",
                        fontFamily: c.mono ? mono : inter,
                        fontSize: c.mono ? 11 : 12,
                        color: cellColor,
                        background: "#000",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: c.width,
                        transition: "background 0.1s",
                      }}>
                        {cell || (typeof cell === "string" ? cell : null)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.12em" }}>No results</div>
            </div>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderTop: "1px solid #0a0a0a", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>
              {page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(0)} disabled={page === 0}
              style={{ fontFamily: mono, fontSize: 9, color: page > 0 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page > 0 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>«</button>
            <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page === 0}
              style={{ fontFamily: mono, fontSize: 9, color: page > 0 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page > 0 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>‹</button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const pg = Math.max(0, Math.min(totalPages - 7, page - 3)) + i;
              const active = pg === page;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  style={{ fontFamily: mono, fontSize: 9, color: active ? "#f0f0f0" : "#333", background: active ? "#4488FF22" : "none", border: `1px solid ${active ? "#4488FF44" : "#0d0d0d"}`, padding: "5px 10px", cursor: "pointer", minWidth: 28, transition: "all 0.15s" }}>
                  {pg + 1}
                </button>
              );
            })}

            <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page >= totalPages-1}
              style={{ fontFamily: mono, fontSize: 9, color: page < totalPages-1 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page < totalPages-1 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>›</button>
            <button onClick={() => setPage(totalPages-1)} disabled={page >= totalPages-1}
              style={{ fontFamily: mono, fontSize: 9, color: page < totalPages-1 ? "#484848" : "#1a1a1a", background: "none", border: "1px solid #0d0d0d", padding: "5px 10px", cursor: page < totalPages-1 ? "pointer" : "not-allowed", transition: "color 0.15s" }}>»</button>
          </div>
        </div>

      </div>

      {/* ── Detail drawer ────────────────────────────────────────── */}
      <DetailDrawer row={selected} onClose={() => setSelected(null)} />
    </>
  );
}
