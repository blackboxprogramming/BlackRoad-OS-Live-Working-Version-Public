import { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── Brand ────────────────────────────────────────────────────────
const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Mock data ────────────────────────────────────────────────────
const revenueData = [
  { t: "Jan", v: 42 }, { t: "Feb", v: 58 }, { t: "Mar", v: 51 },
  { t: "Apr", v: 74 }, { t: "May", v: 68 }, { t: "Jun", v: 91 },
  { t: "Jul", v: 84 }, { t: "Aug", v: 109 }, { t: "Sep", v: 97 },
  { t: "Oct", v: 122 }, { t: "Nov", v: 138 }, { t: "Dec", v: 161 },
];

const requestData = [
  { t: "00h", v: 1200 }, { t: "04h", v: 800 }, { t: "08h", v: 3400 },
  { t: "12h", v: 5100 }, { t: "16h", v: 4700 }, { t: "20h", v: 2900 }, { t: "24h", v: 1600 },
];

const agentData = [
  { name: "Lucidia",   calls: 4821, success: 97.2, color: "#8844FF" },
  { name: "BlackBot",  calls: 3109, success: 94.8, color: "#FF2255" },
  { name: "Aura",      calls: 2744, success: 98.1, color: "#00D4FF" },
  { name: "Orchestr.", calls: 1882, success: 91.3, color: "#FF6B2B" },
  { name: "Sentinel",  calls: 933,  success: 99.4, color: "#4488FF" },
];

const events = [
  { time: "2m ago",  type: "deploy",  msg: "blackroad.io → v2.4.1 deployed", color: "#00D4FF" },
  { time: "8m ago",  type: "alert",   msg: "Lucidia memory threshold at 84%", color: "#FF6B2B" },
  { time: "14m ago", type: "agent",   msg: "Aura completed 500 inference batch", color: "#8844FF" },
  { time: "31m ago", type: "auth",    msg: "New API key issued — workspace prod", color: "#4488FF" },
  { time: "1h ago",  type: "deploy",  msg: "K3s node Octavia scaled up ×2", color: "#00D4FF" },
  { time: "2h ago",  type: "agent",   msg: "BlackBot session timeout — 214 active", color: "#FF2255" },
  { time: "3h ago",  type: "alert",   msg: "Edge latency spike resolved (EU-West)", color: "#FF6B2B" },
  { time: "4h ago",  type: "auth",    msg: "Admin login — workspace staging", color: "#4488FF" },
];

const METRICS = [
  { label: "API Calls Today",  value: "12,847",  delta: "+18.4%",  up: true,  color: "#4488FF",  sub: "vs yesterday" },
  { label: "Revenue MTD",      value: "$161.2K",  delta: "+23.1%",  up: true,  color: "#00D4FF",  sub: "vs last month" },
  { label: "Active Agents",    value: "5 / 5",    delta: "100%",    up: true,  color: "#8844FF",  sub: "all systems nominal" },
  { label: "Avg Latency",      value: "38ms",     delta: "−12ms",   up: true,  color: "#CC00AA",  sub: "p95 across nodes" },
  { label: "Error Rate",       value: "0.23%",    delta: "−0.08%",  up: true,  color: "#FF6B2B",  sub: "last 24h" },
  { label: "Storage Used",     value: "2.4 TB",   delta: "+340 GB", up: false, color: "#FF2255",  sub: "of 10 TB total" },
];

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

function useTick(ms = 1000) {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(x => x + 1), ms); return () => clearInterval(id); }, [ms]);
  return t;
}

function useVisible() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, vis] = useVisible();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Custom Tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #222", padding: "8px 12px" }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#555", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 13, color: "#ebebeb" }}>{prefix}{payload[0].value}{suffix}</div>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────
function Card({ children, style = {}, accent, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#0a0a0a",
        border: `1px solid ${hover && accent ? accent + "44" : "#1c1c1c"}`,
        padding: 20,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: hover && accent ? `0 0 28px ${accent}18` : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────
function Nav({ active, setActive }) {
  const w = useWidth();
  const mobile = w < 640;
  const tick = useTick(1000);
  const [time, setTime] = useState(now());
  useEffect(() => { setTime(now()); }, [tick]);

  const pages = ["Overview","Agents","Revenue","Infra","Logs"];

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, width: "100%" }}>
      <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: mobile ? "0 14px" : "0 28px",
        height: 52, gap: 12,
        background: "rgba(0,0,0,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #141414",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
            ))}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
          {!mobile && <span style={{ fontFamily: mono, fontSize: 9, color: "#252525", letterSpacing: "0.06em" }}>INTERNAL</span>}
        </div>

        {/* Page tabs */}
        <div style={{ display: "flex", gap: mobile ? 12 : 20, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", flexShrink: 1, minWidth: 0 }}>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setActive(p)}
              style={{
                fontFamily: inter, fontSize: mobile ? 11 : 12, fontWeight: 500,
                color: active === p ? "#f0f0f0" : "#555",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: active === p ? "1px solid #4488FF" : "1px solid transparent",
                paddingBottom: 2, whiteSpace: "nowrap", flexShrink: 0,
                transition: "color 0.15s",
              }}
            >{p}</button>
          ))}
        </div>

        {/* Clock */}
        {!mobile && (
          <div style={{ fontFamily: mono, fontSize: 11, color: "#2e2e2e", flexShrink: 0 }}>{time}</div>
        )}
      </nav>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────
function MetricCard({ m, delay }) {
  const [count, setCount] = useState(0);
  const numericVal = parseFloat(m.value.replace(/[^0-9.]/g, ""));
  useEffect(() => {
    let start = 0;
    const steps = 40;
    const step = numericVal / steps;
    const id = setInterval(() => {
      start += step;
      if (start >= numericVal) { setCount(numericVal); clearInterval(id); }
      else setCount(start);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <FadeIn delay={delay}>
      <Card accent={m.color} style={{ height: "100%" }}>
        {/* Top accent bar */}
        <div style={{ height: 2, background: m.color, marginBottom: 16, opacity: 0.7 }} />
        <div style={{ fontFamily: mono, fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
          {m.label}
        </div>
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(22px, 4vw, 30px)", color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 10 }}>
          {m.value}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: m.up ? "#00D4FF" : "#FF2255" }}>
            {m.up ? "↑" : "↓"} {m.delta}
          </span>
          <span style={{ fontFamily: inter, fontSize: 11, color: "#404040" }}>{m.sub}</span>
        </div>
      </Card>
    </FadeIn>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────
function Dot({ color = "#00D4FF" }) {
  return (
    <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.8s ease-out infinite", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
    </div>
  );
}

// ─── Agent Row ────────────────────────────────────────────────────
function AgentRow({ a, delay, i }) {
  const pct = (a.calls / 4821) * 100;
  return (
    <FadeIn delay={delay}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #0f0f0f" }}>
        <Dot color={a.color} />
        <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#dedede", width: 80, flexShrink: 0 }}>{a.name}</div>
        <div style={{ flex: 1, height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: a.color, borderRadius: 2, transition: "width 1s ease", animation: `barGrow 1s ease ${delay}ms both` }} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: "#555", width: 50, textAlign: "right", flexShrink: 0 }}>{a.calls.toLocaleString()}</div>
        <div style={{ fontFamily: mono, fontSize: 11, color: a.success > 96 ? "#00D4FF" : "#FF6B2B", width: 42, textAlign: "right", flexShrink: 0 }}>{a.success}%</div>
      </div>
    </FadeIn>
  );
}

// ─── Event row ────────────────────────────────────────────────────
function EventRow({ e, delay }) {
  const icons = { deploy: "⬡", alert: "△", agent: "◈", auth: "◉" };
  return (
    <FadeIn delay={delay}>
      <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #0d0d0d", alignItems: "flex-start" }}>
        <div style={{ fontFamily: mono, fontSize: 12, color: e.color, flexShrink: 0, marginTop: 1 }}>{icons[e.type] || "·"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: inter, fontSize: 12, color: "#c0c0c0", lineHeight: 1.4 }}>{e.msg}</div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#333", flexShrink: 0, marginTop: 2 }}>{e.time}</div>
      </div>
    </FadeIn>
  );
}

// ─── Section label ────────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontFamily: mono, fontSize: 9, color: "#383838", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 14 }}>{children}</div>;
}

// ─── Overview page ────────────────────────────────────────────────
function Overview() {
  const w = useWidth();
  const cols = w >= 900 ? "repeat(3, 1fr)" : w >= 580 ? "repeat(2, 1fr)" : "1fr";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Metric cards */}
      <div>
        <Label>Key Metrics</Label>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
          {METRICS.map((m, i) => <MetricCard key={m.label} m={m} delay={i * 60} />)}
        </div>
      </div>

      {/* Revenue chart */}
      <FadeIn delay={100}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "18px 20px 10px" }}>
            <Label>Revenue · 12-Month</Label>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 26, color: "#f0f0f0", letterSpacing: "-0.03em" }}>$161.2K <span style={{ fontFamily: mono, fontSize: 12, color: "#00D4FF", fontWeight: 400 }}>↑ 23.1%</span></div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4488FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4488FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontFamily: mono, fontSize: 9, fill: "#333" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: mono, fontSize: 9, fill: "#333" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="$" suffix="K" />} />
              <Area type="monotone" dataKey="v" stroke="#4488FF" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#4488FF", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </FadeIn>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: w >= 720 ? "1fr 1fr" : "1fr", gap: 8 }}>

        {/* API requests */}
        <FadeIn delay={80}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: "18px 20px 10px" }}>
              <Label>API Requests · Today</Label>
              <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 22, color: "#f0f0f0", letterSpacing: "-0.03em" }}>12,847 <span style={{ fontFamily: mono, fontSize: 11, color: "#8844FF", fontWeight: 400 }}>↑ 18.4%</span></div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={requestData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="t" tick={{ fontFamily: mono, fontSize: 9, fill: "#333" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: mono, fontSize: 9, fill: "#333" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="v" fill="#8844FF" opacity={0.7} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>

        {/* Activity feed */}
        <FadeIn delay={120}>
          <Card>
            <Label>Live Activity</Label>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {events.slice(0, 5).map((e, i) => <EventRow key={i} e={e} delay={i * 40} />)}
            </div>
          </Card>
        </FadeIn>

      </div>

      {/* Agents */}
      <FadeIn delay={60}>
        <Card>
          <Label>Agent Performance</Label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 12, padding: "0 0 8px", borderBottom: "1px solid #111", marginBottom: 4 }}>
              <div style={{ width: 8, flexShrink: 0 }} />
              <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", width: 80, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Agent</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", width: 50, textAlign: "right", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Calls</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", width: 42, textAlign: "right", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>OK%</div>
            </div>
            {agentData.map((a, i) => <AgentRow key={a.name} a={a} delay={i * 60} i={i} />)}
          </div>
        </Card>
      </FadeIn>

    </div>
  );
}

// ─── Placeholder pages ────────────────────────────────────────────
function PlaceholderPage({ name, color }) {
  return (
    <FadeIn delay={0}>
      <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ height: 2, width: 60, background: color, borderRadius: 2 }} />
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#1e1e1e", letterSpacing: "-0.03em" }}>{name}</div>
        <div style={{ fontFamily: mono, fontSize: 11, color: "#252525" }}>— coming soon —</div>
      </Card>
    </FadeIn>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadDashboard() {
  const [active, setActive] = useState("Overview");
  const w = useWidth();
  const pad = w < 480 ? "0 14px" : w < 768 ? "0 20px" : "0 28px";

  const pageMap = {
    Overview: <Overview />,
    Agents:   <PlaceholderPage name="Agents" color="#8844FF" />,
    Revenue:  <PlaceholderPage name="Revenue" color="#00D4FF" />,
    Infra:    <PlaceholderPage name="Infrastructure" color="#FF6B2B" />,
    Logs:     <PlaceholderPage name="Logs" color="#FF2255" />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        button { appearance: none; }

        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.45; transform: scaleY(0.65); }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>
        <Nav active={active} setActive={setActive} />

        {/* Page header */}
        <div style={{ borderBottom: "1px solid #0f0f0f", padding: w < 480 ? "20px 14px 16px" : "24px 28px 18px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
              BlackRoad OS · Internal
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(20px, 5vw, 28px)", color: "#f0f0f0", letterSpacing: "-0.03em" }}>{active}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Dot color="#00D4FF" />
                <span style={{ fontFamily: mono, fontSize: 10, color: "#2e2e2e" }}>All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `24px ${w < 480 ? "14px" : w < 768 ? "20px" : "28px"}`, width: "100%" }}>
          {pageMap[active]}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #0d0d0d", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>BlackRoad OS · Internal Dashboard · Z:=yx−w</div>
          <div style={{ height: 1, width: 40, background: GRAD, opacity: 0.5 }} />
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>v2 · 2026</div>
        </div>
      </div>
    </>
  );
}
