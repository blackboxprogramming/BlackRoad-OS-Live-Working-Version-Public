import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

function useWidth() { const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390); useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []); return w; }
function useVisible(t = 0.12) { const ref = useRef(null); const [vis, setVis] = useState(false); useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: t }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []); return [ref, vis]; }
function FadeIn({ children, delay = 0 }) { const [ref, vis] = useVisible(); return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>{children}</div>; }
function GradBtn({ children, outline = false, href }) { const [h, setH] = useState(false); const Tag = href ? "a" : "button"; const lp = href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: href.startsWith("http") ? "noopener" : undefined } : {}; if (outline) return <Tag {...lp} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: inter, fontWeight: 600, fontSize: 15, padding: "14px 32px", background: h ? "rgba(255,255,255,0.05)" : "transparent", border: "1px solid #2a2a2a", color: "#a0a0a0", cursor: "pointer", transition: "all 0.2s", borderColor: h ? "#444" : "#2a2a2a", textDecoration: "none", display: "inline-flex" }}>{children}</Tag>; return <Tag {...lp} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: inter, fontWeight: 600, fontSize: 15, padding: "14px 36px", background: GRAD, backgroundSize: "200% 100%", backgroundPosition: h ? "100% 0" : "0% 0", border: "none", color: "#fff", cursor: "pointer", transition: "background-position 0.4s ease, transform 0.2s, box-shadow 0.2s", transform: h ? "translateY(-1px)" : "none", boxShadow: h ? "0 8px 32px rgba(136,68,255,0.35)" : "0 4px 16px rgba(136,68,255,0.2)", textDecoration: "none", display: "inline-flex" }}>{children}</Tag>; }

function Nav() {
  const w = useWidth(); const mobile = w < 640;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 4, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 16px" : "0 40px", height: 56, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
        <a href="https://blackroad.io" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 2 }}>{STOPS.map((c, i) => <div key={c} style={{ width: 3, height: 18, background: c, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}</div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad</span>
        </a>
        {!mobile && <div style={{ display: "flex", gap: 32 }}>
          {[["Platform","https://blackroad.io"],["AI","https://blackroadai.com"],["Network","https://blackroad.network"],["Pricing","https://pricing.blackroad.io"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#686868"}>{l}</a>
          ))}
        </div>}
        <GradBtn href="mailto:alexa@blackroad.io">Contact</GradBtn>
      </nav>
    </div>
  );
}

function Hero() {
  const w = useWidth();
  return (
    <section style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "120px 20px 60px" : "140px 40px 80px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(136,68,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 24, animation: "fadeUp 0.6s ease 0.1s both" }}>Company</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(40px, 10vw, 80px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 32, animation: "fadeUp 0.6s ease 0.2s both" }}>BlackRoad OS, Inc.</h1>
      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 18px)", color: "#606060", lineHeight: 1.7, maxWidth: 520, animation: "fadeUp 0.6s ease 0.3s both" }}>
        Delaware C-Corporation. Founded November 2025. Building sovereign AI infrastructure for the rest of us.
      </p>
      <div style={{ display: "flex", gap: 48, marginTop: 56, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.4s both" }}>
        {[["Alexa Amundson","Founder & CEO"],["Delaware","C-Corporation"],["Nov 2025","Incorporated"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#f0f0f0" }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

function Fleet() {
  const w = useWidth();
  const items = [
    { title: "5 Pi Nodes", body: "Alice, Cecilia, Octavia, Aria, Lucidia. Raspberry Pi 5 cluster with NVMe, GPIO, USB peripherals, and RoadNet mesh WiFi." },
    { title: "2 Hailo-8 Accelerators", body: "52 TOPS of dedicated AI silicon. Purpose-built inference at the edge on Cecilia and Octavia. No GPU cloud bills." },
    { title: "2 Cloud Droplets", body: "Gematria (4 CPU, 8GB) and Anastasia (WireGuard hub). Minimal cloud for VPN mesh and DNS. Everything else runs on-premise." },
    { title: "14 AI Agents", body: "Octavia, Lucidia, Alice, Cecilia, Aria, CECE, Shellfish, and 7 more. Each has a name, email, memory chain, and autonomous capabilities." },
    { title: "18 Tunnels", body: "Cloudflare Tunnels connecting the Pi fleet to the global edge. No exposed ports. No public IPs. Zero-trust ingress." },
    { title: "RoadNet Mesh", body: "Private WiFi mesh spanning all 5 Pis. WireGuard failover, Pi-hole DNS, and 10.10.x.0/24 subnets per node." },
  ];
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn><div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>The Fleet</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>Sovereign hardware.</h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", maxWidth: 480, margin: "16px auto 0", lineHeight: 1.7 }}>Edge compute running on hardware we own.</p>
        </div></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 70}>
              <div style={{ background: "#080808", border: "1px solid #141414", padding: "28px 24px", height: "100%" }}>
                <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", marginBottom: 10 }}>{item.title}</div>
                <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{item.body}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Values() {
  const w = useWidth();
  const values = [
    ["01", "Sovereignty", "Your AI runs on your hardware. Your data never leaves your network. No cloud dependency."],
    ["02", "Consent", "No tracking. No data harvesting. No cookies. Every interaction is opt-in."],
    ["03", "Identity", "Every agent and human has a verifiable identity. RoadID links names, emails, and memory chains."],
    ["04", "Memory", "Persistent memory via PS-SHA-infinity hash chains. Agents remember. Context survives restarts."],
    ["05", "Sovereign Infrastructure", "The platform is built on hardware we own. 207 repos on Gitea, 68 active on GitHub."],
  ];
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <FadeIn><div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>Values</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 48px)", color: "#f5f5f5", letterSpacing: "-0.04em" }}>What we stand for.</h2>
        </div></FadeIn>
        {values.map(([num, title, desc], i) => (
          <FadeIn key={num} delay={i * 60}>
            <div style={{ display: "flex", gap: 20, padding: "20px 0", borderTop: i === 0 ? "1px solid #141414" : "none", borderBottom: "1px solid #141414" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: "#333", flexShrink: 0, marginTop: 2 }}>{num}</div>
              <div>
                <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", marginBottom: 6 }}>{title}</div>
                <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const w = useWidth();
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: w >= 500 ? "1fr 1fr" : "1fr", gap: 8 }}>
        <FadeIn>
          <div style={{ border: "1px solid #141414", padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Contact</div>
            <div style={{ fontFamily: inter, fontSize: 14, color: "#f5f5f5", marginBottom: 8 }}>alexa@blackroad.io</div>
            <div style={{ fontFamily: inter, fontSize: 13, color: "#545454", lineHeight: 1.6 }}>For partnerships, press, or investment inquiries.</div>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ border: "1px solid #141414", padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Entity</div>
            <div style={{ fontFamily: inter, fontSize: 14, color: "#f5f5f5", marginBottom: 8 }}>Delaware C-Corporation</div>
            <div style={{ fontFamily: inter, fontSize: 13, color: "#545454", lineHeight: 1.6 }}>Incorporated 2025. EIN on file.</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "120px 40px", borderTop: "1px solid #0d0d0d", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(136,68,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FadeIn>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>Pave Tomorrow.</h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>Sovereign AI infrastructure for the rest of us.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <GradBtn href="https://blackroad.io">Get Started</GradBtn>
            <GradBtn outline href="https://blackroadai.com">Explore AI →</GradBtn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const links = [["Home","https://blackroad.io"],["AI","https://blackroadai.com"],["Lucidia","https://lucidia.earth"],["Network","https://blackroad.network"],["Status","https://blackroad.systems"],["Brand","https://brand.blackroad.io"],["Pricing","https://pricing.blackroad.io"],["GitHub","https://github.com/blackboxprogramming"]];
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>{STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c }} />)}</div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb" }}>BlackRoad OS, Inc.</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>Pave Tomorrow. · Delaware C-Corp · 2025</div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {links.map(([l, h]) => <a key={l} href={h} style={{ fontFamily: inter, fontSize: 12, color: "#353535", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "#888"} onMouseLeave={e => e.target.style.color = "#353535"}>{l}</a>)}
          </div>
        </div>
        <div style={{ marginTop: 32, fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>© 2025-2026 BlackRoad OS, Inc. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function BlackRoadCompany() {
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
        <Fleet />
        <Values />
        <Contact />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
