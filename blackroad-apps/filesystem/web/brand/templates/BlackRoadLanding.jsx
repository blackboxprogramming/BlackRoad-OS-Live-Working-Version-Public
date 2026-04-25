import { useState, useEffect, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

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

// ─── Nav ──────────────────────────────────────────────────────────
function Nav() {
  const w = useWidth();
  const mobile = w < 640;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: mobile ? "0 16px" : "0 40px",
        height: 56,
        background: scrolled ? "rgba(0,0,0,0.97)" : "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #141414" : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: 3, height: 18, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
            ))}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad</span>
        </div>

        {/* Links */}
        {!mobile && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Product","Vision","Agents","Pricing"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#f0f0f0"}
                onMouseLeave={e => e.target.style.color = "#686868"}
              >{l}</a>
            ))}
          </div>
        )}

        {/* CTA */}
        <GradBtn small>Request Access</GradBtn>
      </nav>
    </div>
  );
}

// ─── Gradient button ──────────────────────────────────────────────
function GradBtn({ children, small = false, outline = false }) {
  const [hover, setHover] = useState(false);
  if (outline) return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: inter, fontWeight: 600, fontSize: small ? 12 : 15,
        padding: small ? "8px 16px" : "14px 32px",
        background: hover ? "rgba(255,255,255,0.05)" : "transparent",
        border: "1px solid #2a2a2a",
        color: "#a0a0a0",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s, color 0.2s",
        borderColor: hover ? "#444" : "#2a2a2a",
      }}
    >{children}</button>
  );
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: inter, fontWeight: 600, fontSize: small ? 12 : 15,
        padding: small ? "8px 18px" : "14px 36px",
        background: GRAD,
        backgroundSize: "200% 100%",
        backgroundPosition: hover ? "100% 0" : "0% 0",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        transition: "background-position 0.4s ease, transform 0.2s, box-shadow 0.2s",
        transform: hover ? "translateY(-1px)" : "none",
        boxShadow: hover ? "0 8px 32px rgba(136,68,255,0.35)" : "0 4px 16px rgba(136,68,255,0.2)",
        letterSpacing: "0.01em",
      }}
    >{children}</button>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const w = useWidth();
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 50); return () => clearInterval(id); }, []);
  const angle = (tick * 0.5) % 360;

  const words = ["Sovereign.", "Spatial.", "Sentient."];
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setFade(true); }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "100px 20px 60px" : "120px 40px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>

      {/* Background glow orbs */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(136,68,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "20%", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,34,85,0.06) 0%, transparent 70%)", pointerEvents: "none", animation: "orb1 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "25%", right: "15%", width: 280, height: 280, background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", pointerEvents: "none", animation: "orb2 10s ease-in-out infinite" }} />

      {/* Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid #1e1e1e", background: "rgba(255,255,255,0.02)", marginBottom: 36, animation: "fadeUp 0.6s ease 0.1s both" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", animation: "ping 1.8s ease-out infinite" }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.14em" }}>Now in private beta</span>
      </div>

      {/* Headline */}
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(44px, 12vw, 96px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 8, animation: "fadeUp 0.6s ease 0.2s both", maxWidth: 900 }}>
        Computing
      </h1>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(44px, 12vw, 96px)", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 32, animation: "fadeUp 0.6s ease 0.25s both" }}>
        <span style={{ background: `linear-gradient(${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", transition: "opacity 0.3s", opacity: fade ? 1 : 0 }}>
          {words[wordIdx]}
        </span>
      </h1>

      {/* Sub */}
      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 19px)", color: "#606060", lineHeight: 1.7, maxWidth: 520, marginBottom: 48, animation: "fadeUp 0.6s ease 0.35s both" }}>
        BlackRoad OS is the operating system for AI-native organizations — sovereign infrastructure, spatial interfaces, and sentient agents. All under one roof.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.45s both" }}>
        <GradBtn>Get Early Access</GradBtn>
        <GradBtn outline>Watch Demo →</GradBtn>
      </div>

      {/* Stat row */}
      <div style={{ display: "flex", gap: w < 480 ? 24 : 48, marginTop: 72, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.55s both" }}>
        {[["12K+","API calls/day"],["5","Active agents"],["38ms","Avg latency"],["99.9%","Uptime"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(20px, 4vw, 28px)", color: "#f0f0f0", letterSpacing: "-0.03em" }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Bottom gradient bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

// ─── Feature card ─────────────────────────────────────────────────
function FeatureCard({ icon, title, body, color, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#080808",
          border: `1px solid ${hover ? color + "44" : "#141414"}`,
          padding: "28px 24px",
          transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
          boxShadow: hover ? `0 0 40px ${color}18` : "none",
          transform: hover ? "translateY(-3px)" : "none",
          height: "100%",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 18 }}>{icon}</div>
        <div style={{ height: 2, width: 32, background: color, marginBottom: 18, transition: "width 0.3s", ...(hover && { width: 56 }) }} />
        <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", letterSpacing: "-0.02em", marginBottom: 10 }}>{title}</div>
        <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{body}</div>
      </div>
    </FadeIn>
  );
}

// ─── Product section ──────────────────────────────────────────────
function Product() {
  const w = useWidth();
  const cols = w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr";

  const features = [
    { icon: "⬡", color: "#8844FF", title: "Sovereign Infrastructure", body: "Own your stack. K3s cluster with Alice and Octavia nodes — zero vendor lock-in, full data sovereignty from day one." },
    { icon: "◈", color: "#00D4FF", title: "Sentient Agents", body: "Lucidia, BlackBot, Aura — a fleet of AI agents with persistent memory, real-time orchestration, and self-healing loops." },
    { icon: "◉", color: "#FF2255", title: "Spatial Interfaces", body: "UIs that adapt to context, not the other way around. Render-on-demand, gesture-aware, and designed for the post-screen era." },
    { icon: "△", color: "#FF6B2B", title: "Z-Framework Core", body: "Every system is modeled on Z:=yx−w. A unified feedback primitive that makes your infrastructure composable and predictable." },
    { icon: "⊞", color: "#4488FF", title: "Edge-First Compute", body: "Traefik routing, sub-40ms global latency, Cloudflare Workers at the edge. Your compute meets users where they are." },
    { icon: "◐", color: "#CC00AA", title: "Unified Data Layer", body: "R2, D1, KV — one coherent data model across storage types. Query it the same way whether it's at rest or in motion." },
  ];

  return (
    <section id="product" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn delay={0}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>01 — Product</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
              Everything.<br />One OS.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 16, color: "#555", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Six primitives. One coherent stack. BlackRoad OS replaces your patchwork of tools with a single sovereign operating layer.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
          {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 70} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Vision / marquee ─────────────────────────────────────────────
function Marquee() {
  const words = ["Sovereign", "Spatial", "Sentient", "Z:=yx−w", "BlackRoad OS", "Edge-first", "Agent-native", "Post-cloud"];
  const repeated = [...words, ...words];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid #0d0d0d", borderBottom: "1px solid #0d0d0d", padding: "18px 0", background: "#040404" }}>
      <div style={{ display: "flex", gap: 0, animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
        {repeated.map((w, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
            <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(14px, 3vw, 18px)", color: i % 2 === 0 ? "#1c1c1c" : "#161616", letterSpacing: "-0.02em", padding: "0 24px" }}>
              {w}
            </span>
            <span style={{ color: STOPS[i % STOPS.length], fontSize: 10 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Vision section ───────────────────────────────────────────────
function Vision() {
  const w = useWidth();
  return (
    <section id="vision" style={{ padding: w < 480 ? "80px 20px" : "120px 40px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: w >= 800 ? "1fr 1fr" : "1fr", gap: w < 800 ? 48 : 80, alignItems: "center" }}>
          <FadeIn delay={0} dir="left">
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>02 — Vision</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(30px, 6vw, 54px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 28 }}>
              The OS for<br />what comes<br />after the cloud.
            </h2>
            <p style={{ fontFamily: inter, fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 24 }}>
              The cloud era optimized for scale. We're building for sovereignty — where organizations own their compute, their data, and their intelligence layer outright.
            </p>
            <p style={{ fontFamily: inter, fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 36 }}>
              BlackRoad OS is the foundation for that future. Not a SaaS. Not a platform. An operating system for AI-native organizations.
            </p>
            <GradBtn>Read the Manifesto →</GradBtn>
          </FadeIn>

          <FadeIn delay={120} dir="right">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Traditional Cloud",  items: ["Vendor dependency", "Shared infrastructure", "Opaque data flows", "Per-seat pricing treadmill"] },
                { label: "BlackRoad OS",        items: ["Full sovereignty", "Your own cluster", "Z-framework coherence", "One flat operator tier"], color: true },
              ].map(col => (
                <div key={col.label} style={{ background: col.color ? "#070707" : "#040404", border: `1px solid ${col.color ? "#1e1e1e" : "#0d0d0d"}`, padding: "24px 24px" }}>
                  <div style={{ fontFamily: mono, fontSize: 10, color: col.color ? "#444" : "#252525", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>
                    {col.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {col.items.map((item, i) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 16, height: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {col.color
                            ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: STOPS[i] }} />
                            : <div style={{ width: 6, height: 1, background: "#252525" }} />
                          }
                        </div>
                        <span style={{ fontFamily: inter, fontSize: 13, color: col.color ? "#c0c0c0" : "#2a2a2a" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Agents section ───────────────────────────────────────────────
function Agents() {
  const w = useWidth();
  const agents = [
    { name: "Lucidia",    role: "Memory & Cognition",    color: "#8844FF", stat: "4.8K calls/day", desc: "Persistent memory, truth-state commits, recursive self-modeling. The cognitive core of BlackRoad OS." },
    { name: "BlackBot",   role: "Orchestration",          color: "#FF2255", stat: "3.1K calls/day", desc: "Event-bus routing, agent-to-agent messaging, task delegation. The conductor of the system." },
    { name: "Aura",       role: "Intelligence",            color: "#00D4FF", stat: "2.7K calls/day", desc: "Research synthesis, market intelligence, real-time web integration. Your always-on analyst." },
    { name: "Sentinel",   role: "Security & Compliance",  color: "#4488FF", stat: "930 calls/day",  desc: "Auth, audit logs, anomaly detection. The guardian layer across the entire stack." },
  ];

  return (
    <section id="agents" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d", background: "#030303" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>03 — Agents</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              Your fleet.<br />Always on.
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: w >= 760 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {agents.map((a, i) => (
            <FadeIn key={a.name} delay={i * 80}>
              <div style={{ background: "#060606", border: "1px solid #141414", padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                {/* Accent corner */}
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: a.color }} />
                <div style={{ paddingLeft: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#ebebeb", letterSpacing: "-0.02em" }}>{a.name}</div>
                      <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{a.role}</div>
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: a.color, background: a.color + "14", padding: "4px 10px", border: `1px solid ${a.color}22` }}>
                      {a.stat}
                    </div>
                  </div>
                  <div style={{ fontFamily: inter, fontSize: 14, color: "#505050", lineHeight: 1.7 }}>{a.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────
function Pricing() {
  const w = useWidth();
  const plans = [
    {
      name: "Operator",
      price: "$0",
      cadence: "open source core",
      color: "#4488FF",
      items: ["Self-hosted K3s cluster", "Lucidia base agent", "Z-framework SDK", "Community support"],
      cta: "Deploy Free",
      outline: true,
    },
    {
      name: "Sovereign",
      price: "$499",
      cadence: "/ month",
      color: "#8844FF",
      featured: true,
      items: ["Everything in Operator", "Full agent fleet (5 agents)", "Aura intelligence layer", "Dedicated infra + SLA", "Priority support"],
      cta: "Get Sovereign",
    },
    {
      name: "Enterprise",
      price: "Custom",
      cadence: "contact us",
      color: "#00D4FF",
      items: ["Fully custom deployment", "White-label OS", "On-prem or air-gapped", "Dedicated success team"],
      cta: "Talk to Us",
      outline: true,
    },
  ];

  return (
    <section id="pricing" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>04 — Pricing</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>
              Simple. Sovereign.<br />No surprises.
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: w >= 800 ? "repeat(3,1fr)" : w >= 520 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {plans.map((p, i) => (
            <FadeIn key={p.name} delay={i * 80}>
              <div style={{
                background: p.featured ? "#080808" : "#050505",
                border: p.featured ? `1px solid ${p.color}44` : "1px solid #141414",
                padding: "32px 24px",
                position: "relative",
                boxShadow: p.featured ? `0 0 60px ${p.color}18` : "none",
                height: "100%",
                display: "flex", flexDirection: "column",
              }}>
                {p.featured && (
                  <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 2, background: GRAD }} />
                )}
                <div style={{ fontFamily: mono, fontSize: 9, color: p.color, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>{p.name}</div>
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

// ─── CTA Section ──────────────────────────────────────────────────
function CTA() {
  const w = useWidth();
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "120px 40px", borderTop: "1px solid #0d0d0d", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(136,68,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FadeIn>
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>Join the Beta</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>
            Own your<br />infrastructure.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>
            Request early access to BlackRoad OS. Sovereign compute, sentient agents, and a stack that's actually yours.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <GradBtn>Request Early Access</GradBtn>
            <GradBtn outline>Read the Docs →</GradBtn>
          </div>
          <div style={{ marginTop: 40, fontFamily: mono, fontSize: 10, color: "#252525" }}>
            Z:=yx−w · blackroad.io · All systems operational
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  const w = useWidth();
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: w < 480 ? "40px 20px 32px" : "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c, borderRadius: 2 }} />)}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", letterSpacing: "-0.03em" }}>BlackRoad</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>The OS for AI-native organizations.</div>
          </div>
          <div style={{ display: "flex", gap: w < 480 ? 20 : 40, flexWrap: "wrap" }}>
            {["Product","Vision","Agents","Docs","Manifesto","Contact"].map(l => (
              <a key={l} href="#" style={{ fontFamily: inter, fontSize: 12, color: "#353535", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "#888"}
                onMouseLeave={e => e.target.style.color = "#353535"}
              >{l}</a>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>© 2026 BlackRoad OS, Inc. All rights reserved.</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>v2 · Z:=yx−w</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadLanding() {
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

        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.45; transform: scaleY(0.65); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-30px) scale(1.08); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(20px) scale(0.94); }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", overflowX: "hidden", width: "100%" }}>
        <Nav />
        <Hero />
        <Marquee />
        <Product />
        <Vision />
        <Agents />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
