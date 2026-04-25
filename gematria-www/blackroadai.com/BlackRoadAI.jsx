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
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []);
  return [ref, vis];
}
function FadeIn({ children, delay = 0, dir = "up" }) {
  const [ref, vis] = useVisible();
  const from = dir === "left" ? "translateX(-24px)" : dir === "right" ? "translateX(24px)" : "translateY(24px)";
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translate(0)" : from, transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>{children}</div>;
}
function GradBtn({ children, small = false, outline = false, href }) {
  const [hover, setHover] = useState(false);
  const Tag = href ? "a" : "button";
  const lp = href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: href.startsWith("http") ? "noopener" : undefined } : {};
  if (outline) return <Tag {...lp} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ fontFamily: inter, fontWeight: 600, fontSize: small ? 12 : 15, padding: small ? "8px 16px" : "14px 32px", background: hover ? "rgba(255,255,255,0.05)" : "transparent", border: "1px solid #2a2a2a", color: "#a0a0a0", cursor: "pointer", transition: "all 0.2s", borderColor: hover ? "#444" : "#2a2a2a", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>{children}</Tag>;
  return <Tag {...lp} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ fontFamily: inter, fontWeight: 600, fontSize: small ? 12 : 15, padding: small ? "8px 18px" : "14px 36px", background: GRAD, backgroundSize: "200% 100%", backgroundPosition: hover ? "100% 0" : "0% 0", border: "none", color: "#fff", cursor: "pointer", transition: "background-position 0.4s ease, transform 0.2s, box-shadow 0.2s", transform: hover ? "translateY(-1px)" : "none", boxShadow: hover ? "0 8px 32px rgba(136,68,255,0.35)" : "0 4px 16px rgba(136,68,255,0.2)", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>{children}</Tag>;
}

function Nav() {
  const w = useWidth();
  const mobile = w < 640;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <div style={{ height: 4, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 16px" : "0 40px", height: 56, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
        <a href="https://blackroad.io" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", gap: 2 }}>{STOPS.map((c, i) => <div key={c} style={{ width: 3, height: 18, background: c, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}</div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>blackroad.ai</span>
        </a>
        {!mobile && <div style={{ display: "flex", gap: 32 }}>
          {[["Models","#models"],["Gateway","#gateway"],["Skills","#skills"],["Pricing","#pricing"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#686868"}>{l}</a>
          ))}
        </div>}
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
  const words = ["Sovereign.", "Local.", "Sentient."];
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => { const id = setInterval(() => { setFade(false); setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setFade(true); }, 300); }, 2200); return () => clearInterval(id); }, []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "100px 20px 60px" : "120px 40px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(136,68,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid #1e1e1e", marginBottom: 36, animation: "fadeUp 0.6s ease 0.1s both" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", animation: "ping 1.8s ease-out infinite" }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.14em" }}>The AI Platform for Builders</span>
      </div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(44px, 12vw, 96px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 8, animation: "fadeUp 0.6s ease 0.2s both" }}>AI.</h1>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(44px, 12vw, 96px)", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 32, animation: "fadeUp 0.6s ease 0.25s both" }}>
        <span style={{ background: `linear-gradient(${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", transition: "opacity 0.3s", opacity: fade ? 1 : 0 }}>{words[wordIdx]}</span>
      </h1>
      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 19px)", color: "#606060", lineHeight: 1.7, maxWidth: 520, marginBottom: 48, animation: "fadeUp 0.6s ease 0.35s both" }}>
        Run Qwen, DeepSeek, Llama locally or at scale. Tokenless gateway. 50 AI skills. No cloud tax.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.45s both" }}>
        <GradBtn href="https://docs.blackroad.io">Deploy Now →</GradBtn>
        <GradBtn outline href="#models">View Models →</GradBtn>
      </div>
      <div style={{ display: "flex", gap: w < 480 ? 24 : 48, marginTop: 72, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s ease 0.55s both" }}>
        {[["16+","Local Models"],["50","AI Skills"],["52","TOPS"],["<40ms","Avg Latency"]].map(([v, l]) => (
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

function Models() {
  const w = useWidth();
  const models = [
    { name: "Qwen 2.5", tag: "local", tagColor: "#FF6B2B", desc: "32B reasoning model. Code, math, multilingual." },
    { name: "DeepSeek R1", tag: "local", tagColor: "#FF6B2B", desc: "Advanced reasoning with chain-of-thought. 14B distilled." },
    { name: "Llama 3.3", tag: "local", tagColor: "#FF6B2B", desc: "Meta's flagship. 70B quality in 8B footprint." },
    { name: "Claude 3.5", tag: "cloud", tagColor: "#4488FF", desc: "Anthropic's best. Via tokenless gateway." },
    { name: "GPT-4o", tag: "cloud", tagColor: "#4488FF", desc: "OpenAI multimodal. Routed through gateway." },
    { name: "Mistral", tag: "local", tagColor: "#FF6B2B", desc: "Fast European model. Great for tool use." },
    { name: "Whisper", tag: "local", tagColor: "#CC00AA", desc: "Speech-to-text. Runs on Hailo-8 NPU." },
    { name: "Custom GGUF", tag: "local", tagColor: "#FF6B2B", desc: "Bring any model. Ollama runs it." },
  ];
  return (
    <section id="models" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>01 — Models</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>Self-hosted AI.<br />Your hardware.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 900 ? "repeat(4,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {models.map((m, i) => (
            <FadeIn key={m.name} delay={i * 50}>
              <div style={{ background: "#080808", border: "1px solid #141414", padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: "#f5f5f5", border: `1px solid ${m.tagColor}44`, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.tag}</span>
                </div>
                <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", marginBottom: 8 }}>{m.name}</div>
                <div style={{ fontFamily: inter, fontSize: 13, color: "#545454", lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gateway() {
  const w = useWidth();
  return (
    <section id="gateway" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: w >= 800 ? "1fr 1fr" : "1fr", gap: 80, alignItems: "center" }}>
          <FadeIn dir="left">
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>02 — Gateway</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(30px, 6vw, 54px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 28 }}>Tokenless<br />architecture.</h2>
            <p style={{ fontFamily: inter, fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 24 }}>Agents never embed API keys. All LLM provider communication flows through the gateway. Trust boundary enforced at the edge.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Zero tokens in agent code", "Route to any provider dynamically", "Permission matrix per agent", "Sub-40ms local inference"].map((item, i) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: STOPS[i], flexShrink: 0 }} />
                  <span style={{ fontFamily: inter, fontSize: 13, color: "#888" }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn dir="right" delay={120}>
            <div style={{ background: "#080808", border: "1px solid #141414", padding: "28px 24px", fontFamily: mono, fontSize: 12, lineHeight: 2 }}>
              <div style={{ color: "#383838", marginBottom: 8 }}>// tokenless gateway flow</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ border: "1px solid #8844FF44", padding: "4px 12px", color: "#ebebeb", fontSize: 11 }}>Skills</span>
                <span style={{ color: "#383838" }}>→</span>
                <span style={{ background: GRAD, backgroundSize: "200% 100%", padding: "4px 12px", color: "#fff", fontSize: 11, fontWeight: 700 }}>Gateway :8787</span>
                <span style={{ color: "#383838" }}>→</span>
                <span style={{ border: "1px solid #4488FF44", padding: "4px 12px", color: "#ebebeb", fontSize: 11 }}>Providers</span>
              </div>
              <br />
              <div style={{ color: "#383838" }}>$ curl localhost:8787/v1/health</div>
              <div style={{ color: "#545454" }}>{'  '}{"{"} "status": "ok", "agents": 6 {"}"}</div>
              <br />
              <div style={{ color: "#383838" }}>$ curl -X POST localhost:8787/v1/invoke \\</div>
              <div style={{ color: "#545454" }}>{'  '}-d '{"{"}"agent":"lucidia","task":"analyze"{"}"}'</div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  const w = useWidth();
  const skills = [
    { icon: "◈", color: "#00D4FF", title: "Memory & RAG", body: "Qdrant vector store, PS-SHA∞ hash chains, semantic search across all agent memory." },
    { icon: "⚡", color: "#FF6B2B", title: "Code Generation", body: "Autonomous coding, pair programming, code review. Context-aware across your entire codebase." },
    { icon: "△", color: "#8844FF", title: "Orchestration", body: "Multi-agent coordination, task delegation, event-bus routing. The conductor of the fleet." },
    { icon: "◉", color: "#FF2255", title: "Speech & Vision", body: "Whisper STT on Hailo-8 NPU. Image analysis. Multimodal inference at the edge." },
    { icon: "⊞", color: "#4488FF", title: "Research", body: "Web search, document synthesis, citation extraction. Always-on analyst for your org." },
    { icon: "◐", color: "#CC00AA", title: "Security", body: "Auth, audit logs, anomaly detection, guardrails. Zero-trust across the entire stack." },
  ];
  return (
    <section id="skills" style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d", background: "#030303" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>03 — Skills</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(32px, 7vw, 60px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>50 skills.<br />One fleet.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 900 ? "repeat(3,1fr)" : w >= 580 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {skills.map((s, i) => {
            const [hover, setHover] = useState(false);
            return (
              <FadeIn key={s.title} delay={i * 70}>
                <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                  style={{ background: "#060606", border: `1px solid ${hover ? s.color + "44" : "#141414"}`, padding: "28px 24px", transition: "border-color 0.25s, box-shadow 0.25s", boxShadow: hover ? `0 0 40px ${s.color}18` : "none" }}>
                  <div style={{ fontSize: 28, marginBottom: 18 }}>{s.icon}</div>
                  <div style={{ height: 2, width: 32, background: s.color, marginBottom: 18 }} />
                  <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", marginBottom: 10 }}>{s.title}</div>
                  <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{s.body}</div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const w = useWidth();
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "120px 40px", borderTop: "1px solid #0d0d0d", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(136,68,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FadeIn>
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>Own your<br />intelligence layer.</h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>Deploy sovereign AI on your hardware. No cloud tax. No vendor lock-in.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <GradBtn href="https://docs.blackroad.io">Request Access</GradBtn>
            <GradBtn outline href="https://blackroad.io">Back to BlackRoad →</GradBtn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const w = useWidth();
  const links = [["Home","https://blackroad.io"],["Lucidia","https://lucidia.earth"],["Network","https://blackroad.network"],["Status","https://blackroad.systems"],["Company","https://blackroad.company"],["Pricing","https://pricing.blackroad.io"],["Brand","https://brand.blackroad.io"],["GitHub","https://github.com/blackboxprogramming"]];
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: w < 480 ? "40px 20px 32px" : "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>{STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c }} />)}</div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", letterSpacing: "-0.03em" }}>blackroad.ai</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>The AI Platform for Builders. · Pave Tomorrow.</div>
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

export default function BlackRoadAI() {
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
      `}</style>
      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", overflowX: "hidden", width: "100%" }}>
        <Nav />
        <Hero />
        <Models />
        <Gateway />
        <Skills />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
