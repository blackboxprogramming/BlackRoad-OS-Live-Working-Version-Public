import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

function useWidth() { const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390); useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []); return w; }
function useVisible(t = 0.12) { const ref = useRef(null); const [vis, setVis] = useState(false); useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: t }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []); return [ref, vis]; }
function FadeIn({ children, delay = 0 }) { const [ref, vis] = useVisible(); return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>{children}</div>; }

function Nav() {
  const w = useWidth(); const mobile = w < 640;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 4, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 16px" : "0 40px", height: 56, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
        <a href="https://blackroad.io" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 2 }}>{STOPS.map((c, i) => <div key={c} style={{ width: 3, height: 18, background: c, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}</div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad Systems</span>
        </a>
        {!mobile && <div style={{ display: "flex", gap: 32 }}>
          {[["Platform","https://blackroad.io"],["Network","https://blackroad.network"],["Company","https://blackroad.company"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#686868"}>{l}</a>
          ))}
        </div>}
      </nav>
    </div>
  );
}

function Hero() {
  const w = useWidth();
  return (
    <section style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "120px 20px 40px" : "140px 40px 60px", textAlign: "center", position: "relative" }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 24, animation: "fadeUp 0.6s ease 0.1s both" }}>Infrastructure</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(40px, 10vw, 80px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 20, animation: "fadeUp 0.6s ease 0.2s both" }}>Node Status</h1>
      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 18px)", color: "#606060", lineHeight: 1.7, maxWidth: 480, animation: "fadeUp 0.6s ease 0.3s both" }}>Live status of every node in the BlackRoad fleet.</p>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

function NodeCard({ node, delay }) {
  const [hover, setHover] = useState(false);
  const statusColor = node.status === "online" ? "#00D4FF" : node.status === "degraded" ? "#facc15" : "#ef4444";
  const statusLabel = node.status === "online" ? "Online" : node.status === "degraded" ? "Degraded" : "Offline";
  return (
    <FadeIn delay={delay}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ background: "#060606", border: `1px solid ${hover ? "#222" : "#141414"}`, padding: "24px 20px", transition: "border-color 0.25s", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: node.color }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, marginTop: 8 }}>
          <div>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#ebebeb" }}>{node.name}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: "#444", marginTop: 2 }}>{node.type}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "#545454" }}>{statusLabel}</span>
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: "#444", marginBottom: 12 }}>{node.ip}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
          {node.services.map(s => (
            <span key={s} style={{ fontFamily: mono, fontSize: 10, color: "#545454", border: "1px solid #1a1a1a", padding: "3px 8px" }}>{s}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {node.specs.map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#333" }}>{label}</span>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#545454" }}>{val}</span>
            </div>
          ))}
        </div>
        {node.diskPct > 0 && (
          <div style={{ marginTop: 12, height: 3, background: "#141414" }}>
            <div style={{ height: "100%", width: `${node.diskPct}%`, background: node.diskPct > 90 ? "#facc15" : GRAD, backgroundSize: "200% 100%" }} />
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function Nodes() {
  const w = useWidth();
  const nodes = [
    { name: "Alice", type: "Raspberry Pi 400", ip: "192.168.4.49 / 10.8.0.6", color: "#FF6B2B", status: "online", services: ["Gateway","Pi-hole DNS","PostgreSQL","Qdrant","CF Tunnel","Nginx"], specs: [["Role","Main Ingress"],["Domains","48+"],["Tunnel","65+ hostnames"],["Disk","77% used"]], diskPct: 77 },
    { name: "Cecilia", type: "Raspberry Pi 5", ip: "192.168.4.96 / 10.8.0.3", color: "#8844FF", status: "online", services: ["CECE API","TTS API","Hailo-8","Ollama (16 models)","MinIO","PostgreSQL"], specs: [["Hailo-8","HLLWM2B233704667"],["TOPS","26"],["Models","16 (4 custom)"],["Tunnel","22 hostnames"]], diskPct: 60 },
    { name: "Octavia", type: "Raspberry Pi 5", ip: "192.168.4.101 / 10.8.0.4", color: "#FF2255", status: "online", services: ["1TB NVMe","Hailo-8","Gitea (207 repos)","NATS","Docker Swarm","Ollama"], specs: [["Hailo-8","HLLWM2B233704606"],["TOPS","26"],["Storage","1TB NVMe"],["CPU Cap","1500MHz (power save)"]], diskPct: 15 },
    { name: "Aria", type: "Raspberry Pi 5", ip: "192.168.4.98 / 10.8.0.7", color: "#4488FF", status: "offline", services: ["Portainer v2.33.6","Headscale v0.23.0","Pironman5","Magic Keyboard BT"], specs: [["Role","Container Mgmt"],["Tunnel","N/A"],["Issue","Needs Reboot"],["Since","2026-03-10"]], diskPct: 0 },
    { name: "Lucidia", type: "Raspberry Pi 5", ip: "192.168.4.38", color: "#00D4FF", status: "online", services: ["FastAPI","Ollama Bridge","334 Web Apps","GH Actions Runner","CarPool","PowerDNS"], specs: [["Storage","238GB SD"],["Docker","11 containers"],["Tunnel","4 hostnames"],["Warning","SD degrading"]], diskPct: 65 },
    { name: "Anastasia", type: "DigitalOcean NYC1", ip: "1 vCPU / 1GB RAM / NYC1", color: "#CC00AA", status: "degraded", services: ["WireGuard Hub","Headscale","Nginx","uvicorn API","WebSockets"], specs: [["Role","WG Hub"],["WG IP","10.8.0.1"],["Disk","94% used"],["Issue","Disk full"]], diskPct: 94 },
    { name: "Gematria", type: "DigitalOcean NYC3", ip: "4 vCPU / 8GB RAM / NYC3", color: "#FF6B2B", status: "degraded", services: ["Edge Gateway","WireGuard Peer"], specs: [["Role","Edge Compute"],["WG IP","10.8.0.8"]], diskPct: 45 },
  ];
  return (
    <section style={{ padding: w < 480 ? "40px 20px 80px" : "40px 40px 100px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {nodes.map((n, i) => <NodeCard key={n.name} node={n} delay={i * 60} />)}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const links = [["Home","https://blackroad.io"],["AI","https://blackroadai.com"],["Network","https://blackroad.network"],["Company","https://blackroad.company"],["Pricing","https://pricing.blackroad.io"],["GitHub","https://github.com/blackboxprogramming"]];
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>{STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c }} />)}</div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb" }}>BlackRoad Systems</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>Pave Tomorrow.</div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {links.map(([l, h]) => <a key={l} href={h} style={{ fontFamily: inter, fontSize: 12, color: "#353535", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "#888"} onMouseLeave={e => e.target.style.color = "#353535"}>{l}</a>)}
          </div>
        </div>
        <div style={{ marginTop: 32, fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>© 2026 BlackRoad OS, Inc. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function BlackRoadSystems() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: #000; } ::-webkit-scrollbar-thumb { background: #1c1c1c; }
        @keyframes gradShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes barPulse { 0%, 100% { opacity: 1; transform: scaleY(1); } 50% { opacity: 0.45; transform: scaleY(0.65); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", overflowX: "hidden", width: "100%" }}>
        <Nav />
        <Hero />
        <Nodes />
        <Footer />
      </div>
    </>
  );
}
