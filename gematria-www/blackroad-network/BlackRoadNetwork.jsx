import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

function useWidth() { const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390); useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []); return w; }
function useVisible(t = 0.12) { const ref = useRef(null); const [vis, setVis] = useState(false); useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: t }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []); return [ref, vis]; }
function FadeIn({ children, delay = 0, dir = "up" }) { const [ref, vis] = useVisible(); const from = dir === "left" ? "translateX(-24px)" : dir === "right" ? "translateX(24px)" : "translateY(24px)"; return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translate(0)" : from, transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>{children}</div>; }
function GradBtn({ children, outline = false, href }) { const [h, setH] = useState(false); const Tag = href ? "a" : "button"; const lp = href ? { href, target: href.startsWith("http") ? "_blank" : undefined } : {}; if (outline) return <Tag {...lp} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: inter, fontWeight: 600, fontSize: 15, padding: "14px 32px", background: h ? "rgba(255,255,255,0.05)" : "transparent", border: "1px solid #2a2a2a", color: "#a0a0a0", cursor: "pointer", transition: "all 0.2s", textDecoration: "none", display: "inline-flex" }}>{children}</Tag>; return <Tag {...lp} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: inter, fontWeight: 600, fontSize: 15, padding: "14px 36px", background: GRAD, backgroundSize: "200% 100%", backgroundPosition: h ? "100% 0" : "0% 0", border: "none", color: "#fff", cursor: "pointer", transition: "background-position 0.4s, transform 0.2s", transform: h ? "translateY(-1px)" : "none", boxShadow: "0 4px 16px rgba(136,68,255,0.2)", textDecoration: "none", display: "inline-flex" }}>{children}</Tag>; }

function Nav() {
  const w = useWidth(); const mobile = w < 640;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 4, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 16px" : "0 40px", height: 56, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
        <a href="https://blackroad.io" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 2 }}>{STOPS.map((c, i) => <div key={c} style={{ width: 3, height: 18, background: c, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}</div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad Network</span>
        </a>
        {!mobile && <div style={{ display: "flex", gap: 32 }}>
          {[["Architecture","#arch"],["RoadNet","#roadnet"],["WireGuard","#wireguard"],["Topology","#topology"]].map(([l,h]) => (
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
    <section style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "120px 20px 60px" : "140px 40px 80px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(68,136,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 24, animation: "fadeUp 0.6s ease 0.1s both" }}>Network</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(40px, 10vw, 80px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 32, animation: "fadeUp 0.6s ease 0.2s both" }}>Sovereign Mesh.</h1>
      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 18px)", color: "#606060", lineHeight: 1.7, maxWidth: 520, animation: "fadeUp 0.6s ease 0.3s both" }}>
        Two-tier compute. Permanent Pi backbone meets elastic browser nodes. Every link is a compute node.
      </p>
      <div style={{ display: "flex", gap: 48, marginTop: 56, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.4s both" }}>
        {[["5","Pi Nodes"],["52","TOPS"],["7","WG Peers"],["18","Tunnels"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0" }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

function Architecture() {
  const w = useWidth();
  const items = [
    { icon: "◈", color: "#FF6B2B", title: "Pi Fleet Backbone", body: "Five Raspberry Pi 5 nodes form the permanent compute backbone. Two Hailo-8 AI accelerators deliver 52 TOPS of dedicated neural inference.", detail: "5x Pi 5 / 2x Hailo-8 / 26 TOPS each" },
    { icon: "◉", color: "#4488FF", title: "Browser Compute Layer", body: "Every browser tab becomes a compute node. WebGPU handles matrix operations, WASM runs model shards, WebRTC coordinates peer-to-peer inference.", detail: "WebGPU + WASM + WebRTC" },
    { icon: "△", color: "#CC00AA", title: "Elastic Federation", body: "The Pi fleet handles routing, model hosting, and consensus. Browser nodes provide GPU cycles during inference peaks.", detail: "Auto-scale / 70-30 compute split" },
  ];
  return (
    <section id="arch" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn><div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>01 — Architecture</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em" }}>Two-Tier Compute</h2>
        </div></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 900 ? "repeat(3,1fr)" : "1fr", gap: 8 }}>
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 80}>
              <div style={{ background: "#080808", border: "1px solid #141414", padding: "28px 24px", height: "100%" }}>
                <div style={{ fontSize: 28, marginBottom: 18 }}>{item.icon}</div>
                <div style={{ height: 2, width: 32, background: item.color, marginBottom: 18 }} />
                <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", marginBottom: 10 }}>{item.title}</div>
                <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7, marginBottom: 16 }}>{item.body}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.detail}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoadNet() {
  const w = useWidth();
  const nodes = [
    { name: "Alice", ip: "192.168.4.49 / Pi 400", channel: "Channel 1 / 10.10.1.0/24", services: "Gateway + DNS + PostgreSQL", online: true, color: "#FF6B2B" },
    { name: "Cecilia", ip: "192.168.4.96 / Pi 5", channel: "Channel 6 / 10.10.2.0/24", services: "CECE API + TTS + Hailo-8", online: true, color: "#8844FF" },
    { name: "Octavia", ip: "192.168.4.100 / Pi 5", channel: "Channel 11 / 10.10.3.0/24", services: "1TB NVMe + Hailo-8 + Gitea", online: false, color: "#FF2255" },
    { name: "Aria", ip: "192.168.4.98 / Pi 5", channel: "Channel 1 / 10.10.4.0/24", services: "Portainer + Headscale", online: false, color: "#4488FF" },
    { name: "Lucidia", ip: "192.168.4.38 / Pi 5", channel: "Channel 11 / 10.10.5.0/24", services: "FastAPI + Ollama Bridge", online: true, color: "#00D4FF" },
  ];
  return (
    <section id="roadnet" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d", background: "#030303" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn><div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>02 — RoadNet</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em" }}>WiFi Mesh Overlay</h2>
        </div></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 760 ? "repeat(3,1fr)" : w >= 480 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {nodes.map((n, i) => (
            <FadeIn key={n.name} delay={i * 60}>
              <div style={{ background: "#060606", border: "1px solid #141414", padding: "24px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: n.color }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 }}>
                  <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb" }}>{n.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.online ? "#00D4FF" : "#ef4444" }} />
                    <span style={{ fontFamily: mono, fontSize: 10, color: n.online ? "#545454" : "#444" }}>{n.online ? "Online" : "Offline"}</span>
                  </div>
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#444", marginBottom: 4 }}>{n.ip}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#333", marginBottom: 8 }}>{n.channel}</div>
                <div style={{ fontFamily: inter, fontSize: 12, color: "#545454" }}>{n.services}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function WireGuard() {
  const w = useWidth();
  const peers = [
    { name: "Anastasia (Hub)", ip: "10.8.0.1 / DO NYC1" },
    { name: "Alice", ip: "10.8.0.6" },
    { name: "Cecilia", ip: "10.8.0.3" },
    { name: "Octavia", ip: "10.8.0.4" },
    { name: "Aria", ip: "10.8.0.7" },
    { name: "Gematria", ip: "10.8.0.8 / DO NYC3" },
  ];
  return (
    <section id="wireguard" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ border: "1px solid #141414", padding: "32px 28px" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#ebebeb", marginBottom: 12 }}>WireGuard Mesh</div>
            <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7, marginBottom: 24 }}>
              Encrypted WireGuard tunnels connect every node through the Anastasia hub on 10.8.0.x. Traffic between nodes is encrypted end-to-end.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: w >= 500 ? "repeat(3,1fr)" : "repeat(2,1fr)", gap: 8 }}>
              {peers.map((p, i) => (
                <div key={p.name} style={{ border: "1px solid #1a1a1a", padding: "12px 14px" }}>
                  <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#ebebeb", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: "#444" }}>{p.ip}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "120px 40px", borderTop: "1px solid #0d0d0d", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(68,136,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FadeIn>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>Every link<br />is a node.</h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>Sovereign mesh networking. Your hardware, your network, your rules.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <GradBtn href="https://blackroad.io">Back to BlackRoad</GradBtn>
            <GradBtn outline href="https://blackroad.systems">View Status →</GradBtn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const links = [["Home","https://blackroad.io"],["AI","https://blackroadai.com"],["Lucidia","https://lucidia.earth"],["Status","https://blackroad.systems"],["Company","https://blackroad.company"],["Pricing","https://pricing.blackroad.io"],["GitHub","https://github.com/blackboxprogramming"]];
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>{STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c }} />)}</div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb" }}>BlackRoad Network</span>
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

export default function BlackRoadNetwork() {
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
        <Architecture />
        <RoadNet />
        <WireGuard />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
