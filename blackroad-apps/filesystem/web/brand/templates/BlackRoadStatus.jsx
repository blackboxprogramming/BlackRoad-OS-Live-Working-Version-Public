import { useState, useEffect } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Status types ─────────────────────────────────────────────────
const STATUS = {
  operational:  { label: "Operational",       color: "#00D4FF", dot: "#00D4FF" },
  degraded:     { label: "Degraded",          color: "#FF6B2B", dot: "#FF6B2B" },
  partial:      { label: "Partial Outage",    color: "#FF2255", dot: "#FF2255" },
  maintenance:  { label: "Maintenance",       color: "#8844FF", dot: "#8844FF" },
  outage:       { label: "Major Outage",      color: "#FF2255", dot: "#FF2255" },
};

// ─── Services ────────────────────────────────────────────────────
const SERVICES = [
  {
    group: "Core Infrastructure",
    items: [
      { id: "k3s",       name: "K3s Cluster",        status: "operational",  uptime: 99.98, latency: "12ms"  },
      { id: "alice",     name: "Alice · Gateway",    status: "operational",  uptime: 99.97, latency: "4ms"   },
      { id: "octavia",   name: "Octavia · Hailo AI", status: "operational",  uptime: 99.91, latency: "38ms"  },
      { id: "traefik",   name: "Traefik Ingress",    status: "operational",  uptime: 99.99, latency: "2ms"   },
    ],
  },
  {
    group: "Agent Fleet",
    items: [
      { id: "lucidia",   name: "Lucidia",            status: "operational",  uptime: 99.95, latency: "22ms"  },
      { id: "blackbot",  name: "BlackBot",           status: "degraded",     uptime: 97.40, latency: "210ms" },
      { id: "aura",      name: "Aura",               status: "operational",  uptime: 99.88, latency: "41ms"  },
      { id: "sentinel",  name: "Sentinel",           status: "operational",  uptime: 100.0, latency: "8ms"   },
    ],
  },
  {
    group: "API & Edge",
    items: [
      { id: "rest",      name: "REST API",           status: "operational",  uptime: 99.99, latency: "18ms"  },
      { id: "webhooks",  name: "Webhooks",           status: "operational",  uptime: 99.82, latency: "55ms"  },
      { id: "edge",      name: "Edge Workers",       status: "operational",  uptime: 99.97, latency: "6ms"   },
      { id: "ws",        name: "WebSocket",          status: "maintenance",  uptime: 99.60, latency: "—"     },
    ],
  },
  {
    group: "Data Layer",
    items: [
      { id: "redis",     name: "Redis",              status: "operational",  uptime: 99.99, latency: "1ms"   },
      { id: "storage",   name: "Object Storage",     status: "operational",  uptime: 99.96, latency: "28ms"  },
      { id: "memory",    name: "Memory Journal",     status: "operational",  uptime: 99.94, latency: "15ms"  },
      { id: "logs",      name: "Log Pipeline",       status: "operational",  uptime: 99.89, latency: "44ms"  },
    ],
  },
];

// ─── Incidents ───────────────────────────────────────────────────
const INCIDENTS = [
  {
    id: "INC-0041",
    title: "BlackBot elevated response latency",
    status: "investigating",
    statusColor: "#FF6B2B",
    date: "Mar 08, 2026",
    time: "02:14 UTC",
    updates: [
      { time: "03:01 UTC", text: "We have identified the root cause — a memory journal lock during a high-concurrency task burst. A fix is being deployed to the Octavia node." },
      { time: "02:31 UTC", text: "Investigation ongoing. BlackBot remains functional but response times are elevated (avg 210ms vs 40ms baseline). Other agents unaffected." },
      { time: "02:14 UTC", text: "We are investigating reports of increased latency on the BlackBot agent. All other services are operating normally." },
    ],
  },
  {
    id: "INC-0040",
    title: "WebSocket connections temporarily unavailable",
    status: "scheduled maintenance",
    statusColor: "#8844FF",
    date: "Mar 08, 2026",
    time: "00:00 UTC",
    updates: [
      { time: "00:00 UTC", text: "Scheduled maintenance window for WebSocket infrastructure upgrade. Expected duration: 4 hours. REST API and all agents remain fully operational." },
    ],
  },
  {
    id: "INC-0039",
    title: "Intermittent Edge Worker timeouts — resolved",
    status: "resolved",
    statusColor: "#00D4FF",
    date: "Mar 06, 2026",
    time: "14:22 UTC",
    updates: [
      { time: "16:08 UTC", text: "Issue fully resolved. Edge Worker response times have returned to baseline (<8ms). Root cause: stale Cloudflare routing table entry, now cleared." },
      { time: "15:41 UTC", text: "Cloudflare cache purge complete. Monitoring for recurrence." },
      { time: "14:22 UTC", text: "Investigating intermittent timeouts affecting ~2% of Edge Worker requests in the EU-West region." },
    ],
  },
];

// ─── Uptime bar data (90 days, 1 bar = 1 day) ────────────────────
function generateUptimeBars(uptime) {
  return Array.from({ length: 90 }, (_, i) => {
    const r = Math.random();
    const threshold = uptime / 100;
    if (r > threshold + 0.01) return "outage";
    if (r > threshold + 0.005) return "degraded";
    return "ok";
  });
}

const UPTIME_BARS = {};
SERVICES.forEach(g => g.items.forEach(s => {
  UPTIME_BARS[s.id] = generateUptimeBars(s.uptime);
}));

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => r <= 1 ? seconds : r - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  return remaining;
}

// ─── Overall system health ────────────────────────────────────────
function getOverallStatus(services) {
  const all = services.flatMap(g => g.items);
  if (all.some(s => s.status === "outage"))     return { label: "Major Outage",         color: "#FF2255", bg: "#FF225509" };
  if (all.some(s => s.status === "partial"))    return { label: "Partial Outage",        color: "#FF2255", bg: "#FF225509" };
  if (all.some(s => s.status === "degraded"))   return { label: "Degraded Performance",  color: "#FF6B2B", bg: "#FF6B2B09" };
  if (all.some(s => s.status === "maintenance"))return { label: "Scheduled Maintenance", color: "#8844FF", bg: "#8844FF09" };
  return { label: "All Systems Operational", color: "#00D4FF", bg: "#00D4FF09" };
}

// ─── UptimeBar ────────────────────────────────────────────────────
function UptimeBar({ bars }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 1, height: 20 }}>
        {bars.map((state, i) => {
          const color = state === "ok" ? "#00D4FF22" : state === "degraded" ? "#FF6B2B" : "#FF2255";
          const hColor = state === "ok" ? "#00D4FF55" : state === "degraded" ? "#FF8844" : "#FF4466";
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ flex: 1, background: hovered === i ? hColor : color, borderRadius: 1, transition: "background 0.1s", cursor: "default" }}
            />
          );
        })}
      </div>
      {hovered !== null && (
        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: `${(hovered / bars.length) * 100}%`, transform: "translateX(-50%)", background: "#0d0d0d", border: "1px solid #1a1a1a", padding: "4px 8px", whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none" }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#666" }}>
            {90 - hovered}d ago · {bars[hovered] === "ok" ? "Operational" : bars[hovered] === "degraded" ? "Degraded" : "Outage"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Service row ─────────────────────────────────────────────────
function ServiceRow({ item }) {
  const st = STATUS[item.status] || STATUS.operational;
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", transition: "background 0.1s", borderBottom: "1px solid #0d0d0d" }}
        onMouseEnter={e => e.currentTarget.style.background = "#080808"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Status dot */}
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0, animation: item.status !== "operational" ? "dotBounce 1.5s ease-in-out infinite" : "none" }} />
        {/* Name */}
        <span style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0", flex: 1 }}>{item.name}</span>
        {/* Latency */}
        <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", width: 52, textAlign: "right" }}>{item.latency}</span>
        {/* Status label */}
        <span style={{ fontFamily: mono, fontSize: 9, color: st.color, width: 110, textAlign: "right", letterSpacing: "0.04em" }}>{st.label}</span>
        {/* Uptime */}
        <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", width: 52, textAlign: "right" }}>{item.uptime.toFixed(2)}%</span>
        {/* Expand */}
        <span style={{ fontFamily: mono, fontSize: 9, color: "#242424", width: 12, textAlign: "right", transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </div>
      {expanded && (
        <div style={{ padding: "12px 16px 16px 36px", background: "#050505", borderBottom: "1px solid #0d0d0d" }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#242424", textTransform: "uppercase", letterSpacing: "0.1em" }}>90-day uptime</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#242424" }}>Today</span>
          </div>
          <UptimeBar bars={UPTIME_BARS[item.id]} />
        </div>
      )}
    </div>
  );
}

// ─── Service group ────────────────────────────────────────────────
function ServiceGroup({ group }) {
  const allOk = group.items.every(i => i.status === "operational");
  return (
    <div style={{ background: "#080808", border: "1px solid #111", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #0d0d0d" }}>
        <span style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#888", letterSpacing: "-0.01em" }}>{group.group}</span>
        <span style={{ fontFamily: mono, fontSize: 9, color: allOk ? "#00D4FF44" : "#FF6B2B", letterSpacing: "0.06em" }}>
          {allOk ? "All Operational" : "Issues Detected"}
        </span>
      </div>
      {group.items.map(item => <ServiceRow key={item.id} item={item} />)}
    </div>
  );
}

// ─── Incident card ────────────────────────────────────────────────
function IncidentCard({ inc }) {
  const [expanded, setExpanded] = useState(inc.status !== "resolved");
  return (
    <div style={{ background: "#080808", border: "1px solid #111", marginBottom: 8, overflow: "hidden" }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = "#0a0a0a"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: inc.statusColor, flexShrink: 0, marginTop: 5 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0", marginBottom: 4 }}>{inc.title}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: inc.statusColor, letterSpacing: "0.04em", textTransform: "uppercase" }}>{inc.status}</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#242424" }}>{inc.id}</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#242424" }}>{inc.date} · {inc.time}</span>
          </div>
        </div>
        <span style={{ fontFamily: mono, fontSize: 9, color: "#242424", transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, marginTop: 2 }}>▾</span>
      </div>
      {expanded && (
        <div style={{ padding: "0 16px 16px 36px", borderTop: "1px solid #0d0d0d" }}>
          {inc.updates.map((u, i) => (
            <div key={i} style={{ display: "flex", gap: 14, paddingTop: 14 }}>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? inc.statusColor : "#1a1a1a", marginTop: 4 }} />
                {i < inc.updates.length - 1 && <div style={{ width: 1, flex: 1, background: "#111", minHeight: 20 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", marginBottom: 6 }}>{u.time}</div>
                <p style={{ fontFamily: inter, fontSize: 12, color: "#565656", lineHeight: 1.7 }}>{u.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Metric pill ─────────────────────────────────────────────────
function MetricPill({ label, value, color }) {
  return (
    <div style={{ background: "#080808", border: "1px solid #111", padding: "16px 20px", flex: 1, minWidth: 120 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 22, color: color || "#e0e0e0", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadStatus() {
  const w          = useWidth();
  const clock      = useClock();
  const countdown  = useCountdown(30);
  const mobile     = w < 640;
  const overall    = getOverallStatus(SERVICES);
  const [tab, setTab] = useState("services");

  const utc = clock.toUTCString().replace("GMT", "UTC").slice(0, -4);

  // Aggregate uptime
  const allItems = SERVICES.flatMap(g => g.items);
  const avgUptime = (allItems.reduce((a, b) => a + b.uptime, 0) / allItems.length).toFixed(3);
  const activeIncidents = INCIDENTS.filter(i => i.status !== "resolved").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        button { appearance: none; }
        ::-webkit-scrollbar { width: 3px; }
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
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(1);    opacity: 1;   }
          40%            { transform: scale(1.5);  opacity: 0.7; }
        }
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, background: "rgba(0,0,0,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => (
                  <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
                ))}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#252525" }}>· Status</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {!mobile && (
                <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{utc}</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a" }}>refresh in {countdown}s</span>
              </div>
            </div>
          </nav>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: mobile ? "32px 14px 60px" : "48px 24px 80px" }}>

          {/* ── Overall status banner ────────────────────────── */}
          <div style={{ background: overall.bg, border: `1px solid ${overall.color}22`, padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 14, animation: "fadeUp 0.4s ease both" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: overall.color }} />
              {overall.label !== "All Systems Operational" && (
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: overall.color, animation: "ping 1.4s ease-out infinite" }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: mobile ? 18 : 22, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{overall.label}</div>
              {activeIncidents > 0 && (
                <div style={{ fontFamily: inter, fontSize: 12, color: "#484848", marginTop: 2 }}>
                  {activeIncidents} active incident{activeIncidents > 1 ? "s" : ""} · check below for details
                </div>
              )}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", flexShrink: 0 }}>Mar 08, 2026</div>
          </div>

          {/* ── Metrics ─────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            <MetricPill label="Avg Uptime · 90d"   value={`${avgUptime}%`}      color="#00D4FF" />
            <MetricPill label="Active Incidents"    value={`${activeIncidents}`} color={activeIncidents > 0 ? "#FF6B2B" : "#00D4FF"} />
            <MetricPill label="Services Monitored"  value={`${allItems.length}`} color="#8844FF" />
            <MetricPill label="Edge Latency · p50"  value="6ms"                  color="#4488FF" />
          </div>

          {/* ── Tabs ─────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #111" }}>
            {["services","incidents"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ fontFamily: mono, fontSize: 10, color: tab === t ? "#d0d0d0" : "#2e2e2e", background: "none", border: "none", borderBottom: tab === t ? "1px solid #4488FF" : "1px solid transparent", padding: "10px 18px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: -1, transition: "color 0.15s, border-color 0.15s" }}
              >{t}</button>
            ))}
          </div>

          {/* ── Services ─────────────────────────────────────── */}
          {tab === "services" && (
            <div style={{ animation: "fadeUp 0.3s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px 10px", borderBottom: "1px solid #0a0a0a", marginBottom: 2 }}>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: mono, fontSize: 9, color: "#1c1c1c", width: 52, textAlign: "right" }}>Latency</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: "#1c1c1c", width: 110, textAlign: "right" }}>Status</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: "#1c1c1c", width: 52, textAlign: "right" }}>Uptime</span>
                <span style={{ width: 12 }} />
              </div>
              {SERVICES.map(g => <ServiceGroup key={g.group} group={g} />)}
              <div style={{ marginTop: 12, padding: "0 4px" }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Click any service to expand 90-day uptime history · auto-refreshes every 30s</span>
              </div>
            </div>
          )}

          {/* ── Incidents ────────────────────────────────────── */}
          {tab === "incidents" && (
            <div style={{ animation: "fadeUp 0.3s ease both" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontFamily: inter, fontSize: 13, color: "#484848" }}>Last 30 days · {INCIDENTS.length} incidents</span>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["#FF2255","Outage"],["#FF6B2B","Degraded"],["#8844FF","Maintenance"],["#00D4FF","Resolved"]].map(([c,l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                      <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              {INCIDENTS.map(inc => <IncidentCard key={inc.id} inc={inc} />)}
            </div>
          )}

          {/* ── Subscribe ────────────────────────────────────── */}
          <div style={{ marginTop: 40, background: "#080808", border: "1px solid #111", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: "#c0c0c0", marginBottom: 4 }}>Subscribe to updates</div>
              <div style={{ fontFamily: inter, fontSize: 12, color: "#383838" }}>Get notified for incidents, maintenance, and resolutions.</div>
            </div>
            <button style={{ fontFamily: mono, fontSize: 10, color: "#f0f0f0", background: GRAD, backgroundSize: "200% 100%", border: "none", padding: "10px 20px", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", animation: "gradShift 4s linear infinite", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >Subscribe</button>
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid #0a0a0a", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>BlackRoad OS · Status · Z:=yx−w</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>v2.4.1 · 2026</span>
          </div>

        </div>
      </div>
    </>
  );
}
