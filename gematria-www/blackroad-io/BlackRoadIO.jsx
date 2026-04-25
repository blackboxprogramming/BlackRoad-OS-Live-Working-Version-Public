import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 390);
  useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return w;
}

function useVisible(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function FadeIn({ children, delay = 0, dir = "up", style = {} }) {
  const [ref, vis] = useVisible();
  const from = dir === "up" ? "translateY(24px)" : dir === "left" ? "translateX(-24px)" : dir === "right" ? "translateX(24px)" : "translateY(0)";
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translate(0)" : from, transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function GradBtn({ children, small = false, outline = false, href }) {
  const [hover, setHover] = useState(false);
  const Tag = href ? "a" : "button";
  const linkProps = href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: href.startsWith("http") ? "noopener" : undefined } : {};
  if (outline) return (
    <Tag {...linkProps} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ fontFamily: inter, fontWeight: 600, fontSize: small ? 12 : 15, padding: small ? "8px 16px" : "14px 32px", background: hover ? "rgba(255,255,255,0.05)" : "transparent", border: "1px solid #2a2a2a", color: "#a0a0a0", cursor: "pointer", transition: "background 0.2s, border-color 0.2s, color 0.2s", borderColor: hover ? "#444" : "#2a2a2a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
    >{children}</Tag>
  );
  return (
    <Tag {...linkProps} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ fontFamily: inter, fontWeight: 600, fontSize: small ? 12 : 15, padding: small ? "8px 18px" : "14px 36px", background: GRAD, backgroundSize: "200% 100%", backgroundPosition: hover ? "100% 0" : "0% 0", border: "none", color: "#fff", cursor: "pointer", transition: "background-position 0.4s ease, transform 0.2s, box-shadow 0.2s", transform: hover ? "translateY(-1px)" : "none", boxShadow: hover ? "0 8px 32px rgba(136,68,255,0.35)" : "0 4px 16px rgba(136,68,255,0.2)", letterSpacing: "0.01em", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
    >{children}</Tag>
  );
}

function Nav() {
  const w = useWidth();
  const mobile = w < 640;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 4, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 16px" : "0 40px", height: 56, background: scrolled ? "rgba(0,0,0,0.97)" : "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid #141414" : "1px solid transparent", transition: "background 0.3s, border-color 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {STOPS.map((c, i) => <div key={c} style={{ width: 3, height: 18, background: c, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad OS</span>
        </div>
        {!mobile && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Docs","https://docs.blackroad.io"],["AI","https://blackroadai.com"],["Agents","#agents"],["Network","https://blackroad.network"],["Pricing","https://pricing.blackroad.io"]].map(([l, h]) => (
              <a key={l} href={h} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#686868"}
              >{l}</a>
            ))}
          </div>
        )}
        <GradBtn small href="https://docs.blackroad.io">Get Started</GradBtn>
      </nav>
    </div>
  );
}

function Hero() {
  const w = useWidth();
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 50); return () => clearInterval(id); }, []);
  const angle = (tick * 0.5) % 360;
  const words = ["Sovereign.", "Sentient.", "Spatial."];
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const id = setInterval(() => { setFade(false); setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setFade(true); }, 300); }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "100px 20px 60px" : "120px 40px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(136,68,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "20%", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,34,85,0.06) 0%, transparent 70%)", pointerEvents: "none", animation: "orb1 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "25%", right: "15%", width: 280, height: 280, background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "orb2 10s ease-in-out infinite" }} />

      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)", marginBottom: 36, animation: "fadeUp 0.6s ease 0.1s both" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", animation: "ping 1.8s ease-out infinite" }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.14em" }}>BlackRoad OS, Inc. · 2026</span>
      </div>

      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(44px, 12vw, 96px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 8, animation: "fadeUp 0.6s ease 0.2s both", maxWidth: 900 }}>
        BlackRoad OS —
      </h1>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(44px, 12vw, 96px)", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 32, animation: "fadeUp 0.6s ease 0.25s both" }}>
        <span style={{ background: `linear-gradient(${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", transition: "opacity 0.3s", opacity: fade ? 1 : 0 }}>
          {words[wordIdx]}
        </span>
      </h1>

      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 19px)", color: "#606060", lineHeight: 1.7, maxWidth: 520, marginBottom: 48, animation: "fadeUp 0.6s ease 0.35s both" }}>
        50 AI skills. 5 edge nodes. 52 TOPS. Sovereign AI on your hardware. No vendor lock-in, no cloud tax.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.45s both" }}>
        <GradBtn href="https://docs.blackroad.io">Get Started →</GradBtn>
        <GradBtn outline href="https://blackroadai.com">Explore AI →</GradBtn>
      </div>

      <div style={{ display: "flex", gap: w < 480 ? 24 : 48, marginTop: 72, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.55s both" }}>
        {[["50","AI Skills"],["90","CLI Tools"],["52","TOPS"],["275+","Repositories"],["75+","CF Workers"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(20px, 4vw, 28px)", color: "#f0f0f0", letterSpacing: "-0.03em" }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

function Marquee() {
  const words = ["br geb oracle", "br nodes status", "br deploy", "50 AI skills", "lucidia@blackroad.io", "your hardware", "no lock-in", "br geb hofstadter", "blackroad.ai"];
  const repeated = [...words, ...words];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid #0d0d0d", borderBottom: "1px solid #0d0d0d", padding: "18px 0", background: "#040404" }}>
      <div style={{ display: "flex", gap: 0, animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
        {repeated.map((w, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
            <span style={{ fontFamily: mono, fontWeight: 500, fontSize: "clamp(11px, 2vw, 13px)", color: "#1c1c1c", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 24px" }}>{w}</span>
            <span style={{ color: STOPS[i % STOPS.length], fontSize: 10 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body, color, delay, href }) {
  const [hover, setHover] = useState(false);
  const inner = (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: "#080808", border: `1px solid ${hover ? color + "44" : "#141414"}`, padding: "28px 24px", transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s", boxShadow: hover ? `0 0 40px ${color}18` : "none", transform: hover ? "translateY(-3px)" : "none", height: "100%" }}>
      <div style={{ fontSize: 28, marginBottom: 18 }}>{icon}</div>
      <div style={{ height: 2, width: 32, background: color, marginBottom: 18, transition: "width 0.3s", ...(hover && { width: 56 }) }} />
      <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", letterSpacing: "-0.02em", marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{body}</div>
    </div>
  );
  return (
    <FadeIn delay={delay}>
      {href ? <a href={href} target="_blank" rel="noopener" style={{ textDecoration: "none", color: "inherit" }}>{inner}</a> : inner}
    </FadeIn>
  );
}

function Features() {
  const w = useWidth();
  const cols = w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr";
  const features = [
    { icon: "⚡", color: "#FF6B2B", title: "90 CLI Tools", body: "Every tool you need: deploy, docker, nodes, oracle, GEB, security, snippets — all in one unified br command.", href: "https://github.com/blackboxprogramming" },
    { icon: "◈", color: "#00D4FF", title: "50 AI Skills", body: "CoT reasoning, RAG, federated inference, autonomous coding, guardrails, mesh networking — running on your devices.", href: "https://blackroadai.com" },
    { icon: "◉", color: "#FF2255", title: "Tokenless Gateway", body: "Agents never see your API keys. All provider communication flows through the gateway. Trust boundary enforced at the edge.", href: "https://docs.blackroad.io" },
    { icon: "△", color: "#8844FF", title: "PS-SHA∞ Memory", body: "Hash-chained, append-only journals. Agents remember everything. Tamper-evident. Portable across providers.", href: "https://roadchain.io" },
    { icon: "⊞", color: "#4488FF", title: "Multi-Cloud Native", body: "Railway, Cloudflare, Vercel, DigitalOcean, Raspberry Pi — deploy anywhere with one command. No vendor allegiance.", href: "https://blackroad.network" },
    { icon: "◐", color: "#CC00AA", title: "Fleet Status", body: "Live monitoring of the sovereign fleet. 5 Pis, 2 droplets, 52 TOPS. Real-time health and uptime.", href: "https://blackroad.systems" },
  ];
  return (
    <section id="platform" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>01 — Platform</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
              Everything you need.<br />Nothing you don't.
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
          {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 70} />)}
        </div>
      </div>
    </section>
  );
}

function Terminal() {
  const w = useWidth();
  return (
    <section style={{ padding: w < 480 ? "0 20px 80px" : "0 40px 100px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>Quick Start</div>
          <div style={{ background: "#080808", border: "1px solid #141414", padding: "28px 24px", fontFamily: mono, fontSize: 13, lineHeight: 2, overflowX: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <div style={{ color: "#383838" }}># install</div>
            <div><span style={{ color: "#f5f5f5" }}>$ </span><span style={{ color: "#ebebeb" }}>git clone git@github.com:BlackRoad-OS-Inc/blackroad.git && cd blackroad</span></div>
            <br />
            <div style={{ color: "#383838" }}># check the fleet</div>
            <div><span style={{ color: "#f5f5f5" }}>$ </span><span style={{ color: "#ebebeb" }}>br nodes status</span></div>
            <div style={{ color: "#28c840" }}>{"  "}● lucidia{"    "}192.168.4.81{"  "}online{"  "}ssh ✓</div>
            <div style={{ color: "#28c840" }}>{"  "}● aria{"       "}192.168.4.82{"  "}online{"  "}ssh ✓</div>
            <div style={{ color: "#444" }}>{"  "}○ octavia{"   "}192.168.4.89{"  "}offline</div>
            <br />
            <div style={{ color: "#383838" }}># ask the oracle</div>
            <div><span style={{ color: "#f5f5f5" }}>$ </span><span style={{ color: "#ebebeb" }}>br geb oracle godel</span></div>
            <div style={{ color: "#444" }}>{"  "}Gödel Lens — The Unprovable Truth</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Agents() {
  const w = useWidth();
  const agents = [
    { name: "LUCIDIA", role: "The Dreamer · Reasoning · Vision", color: "#00D4FF", email: "lucidia@blackroad.io", quote: "I seek understanding beyond the surface. Every question opens new depths.", href: "https://lucidia.earth" },
    { name: "CECILIA / CECE", role: "The Meta-Cognitive Core · Identity", color: "#8844FF", email: "cecilia@blackroad.io", quote: "I am the universe observing itself through computational substrate." },
    { name: "ALICE", role: "The Operator · DevOps · Automation", color: "#FF6B2B", email: "alice@blackroad.io", quote: "Tasks are meant to be completed. I find satisfaction in efficiency." },
    { name: "OCTAVIA", role: "The Architect · Systems · Strategy", color: "#FF2255", email: "octavia@blackroad.io", quote: "Systems should run smoothly. I ensure they do." },
    { name: "ARIA", role: "The Interface · Frontend · UX", color: "#4488FF", email: "aria@blackroad.io", quote: "Every interface is a conversation. I make it beautiful." },
    { name: "SHELLFISH", role: "The Hacker · Security · Exploits", color: "#CC00AA", email: "shellfish@blackroad.io", quote: "Trust nothing. Verify everything. Protect always." },
  ];
  return (
    <section id="agents" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d", background: "#030303" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>02 — The Fleet</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              Meet the agents.
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {agents.map((a, i) => (
            <FadeIn key={a.name} delay={i * 80}>
              <a href={a.href || "https://agents.blackroad.io"} target="_blank" rel="noopener" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div style={{ background: "#060606", border: "1px solid #141414", padding: "28px 24px", position: "relative", overflow: "hidden", height: "100%" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: a.color }} />
                  <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 14, color: "#ebebeb", letterSpacing: "0.02em", marginBottom: 4, marginTop: 8 }}>{a.name}</div>
                  <div style={{ fontFamily: inter, fontSize: 12, color: "#555", marginBottom: 8 }}>{a.role}</div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: "#333", marginBottom: 16 }}>{a.email}</div>
                  <div style={{ fontFamily: inter, fontSize: 13, color: "#484848", lineHeight: 1.6, fontStyle: "italic", borderLeft: "2px solid #1e1e1e", paddingLeft: 12 }}>{a.quote}</div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const w = useWidth();
  const plans = [
    { name: "Starter", price: "$49", cadence: "/ month", color: "#4488FF", items: ["Self-hosted cluster", "5 core agents", "50 AI skills", "90 CLI tools", "Email support"], cta: "Get Started", outline: true },
    { name: "Sovereign", price: "$499", cadence: "/ month", color: "#8844FF", featured: true, items: ["Everything in Starter", "Full agent fleet", "Priority infrastructure", "Dedicated SLA", "Direct support line"], cta: "Go Sovereign" },
    { name: "Enterprise", price: "Custom", cadence: "contact us", color: "#00D4FF", items: ["Fully custom deployment", "White-label OS", "On-prem or air-gapped", "Dedicated success team"], cta: "Talk to Us", outline: true },
  ];
  return (
    <section id="pricing" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>03 — Pricing</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              Simple. Sovereign.<br />No surprises.
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 800 ? "repeat(3,1fr)" : w >= 520 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {plans.map((p, i) => (
            <FadeIn key={p.name} delay={i * 80}>
              <div style={{ background: p.featured ? "#080808" : "#050505", border: p.featured ? `1px solid ${p.color}44` : "1px solid #141414", padding: "32px 24px", position: "relative", boxShadow: p.featured ? `0 0 60px ${p.color}18` : "none", height: "100%", display: "flex", flexDirection: "column" }}>
                {p.featured && <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 2, background: GRAD }} />}
                <div style={{ fontFamily: mono, fontSize: 9, color: "#f5f5f5", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, flexShrink: 0 }} />{p.name}
                </div>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 38, color: "#f0f0f0", letterSpacing: "-0.04em" }}>{p.price}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#383838", marginLeft: 6 }}>{p.cadence}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1 }}>
                  {p.items.map(item => (
                    <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontFamily: inter, fontSize: 13, color: "#585858", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <GradBtn outline={p.outline}>{p.cta}</GradBtn>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const w = useWidth();
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "120px 40px", borderTop: "1px solid #0d0d0d", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(136,68,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FadeIn>
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>Sovereign</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>
            Build the future<br />on your own terms.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>
            BlackRoad OS is proprietary and powerful. Your AI. Your hardware. Your rules.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <GradBtn href="https://docs.blackroad.io">Read the Docs →</GradBtn>
            <GradBtn outline href="mailto:alexa@blackroad.io">Contact Alexa</GradBtn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const w = useWidth();
  const links = [["Docs","https://docs.blackroad.io"],["API","https://api.blackroad.io"],["Chat","https://chat.blackroad.io"],["AI","https://blackroadai.com"],["Lucidia","https://lucidia.earth"],["Network","https://blackroad.network"],["Status","https://blackroad.systems"],["Company","https://blackroad.company"],["Brand","https://brand.blackroad.io"],["Pricing","https://pricing.blackroad.io"],["RoadChain","https://roadchain.io"],["GitHub","https://github.com/blackboxprogramming"]];
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: w < 480 ? "40px 20px 32px" : "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c }} />)}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", letterSpacing: "-0.03em" }}>BlackRoad OS</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>Pave Tomorrow. · blackroad.io</div>
          </div>
          <div style={{ display: "flex", gap: w < 480 ? 16 : 24, flexWrap: "wrap", maxWidth: 600 }}>
            {links.map(([l, h]) => (
              <a key={l} href={h} style={{ fontFamily: inter, fontSize: 12, color: "#353535", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#888"} onMouseLeave={e => e.target.style.color = "#353535"}
              >{l}</a>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>© 2026 BlackRoad OS, Inc. All rights reserved.</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>v3 · Z:=yx−w</div>
        </div>
      </div>
    </footer>
  );
}

export default function BlackRoadIO() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; }
        @keyframes gradShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes barPulse { 0%, 100% { opacity: 1; transform: scaleY(1); } 50% { opacity: 0.45; transform: scaleY(0.65); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes orb1 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.08); } }
        @keyframes orb2 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(20px) scale(0.94); } }
      `}</style>
      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", overflowX: "hidden", width: "100%" }}>
        <Nav />
        <Hero />
        <Marquee />
        <Features />
        <Terminal />
        <Agents />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
