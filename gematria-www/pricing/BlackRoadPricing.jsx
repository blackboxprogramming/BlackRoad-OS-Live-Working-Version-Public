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
function FadeIn({ children, delay = 0 }) {
  const [ref, vis] = useVisible();
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>{children}</div>;
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
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f5f5f5", letterSpacing: "-0.03em" }}>BlackRoad</span>
        </a>
        {!mobile && <div style={{ display: "flex", gap: 32 }}>
          {[["Home","https://blackroad.io"],["AI","https://blackroadai.com"],["Agents","https://agents.blackroad.io"],["Network","https://blackroad.network"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontFamily: inter, fontSize: 13, fontWeight: 500, color: "#686868", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.target.style.color = "#f0f0f0"} onMouseLeave={e => e.target.style.color = "#686868"}>{l}</a>
          ))}
        </div>}
        <GradBtn small href="mailto:alexa@blackroad.io">Talk to Us</GradBtn>
      </nav>
    </div>
  );
}

function Hero() {
  const w = useWidth();
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 50); return () => clearInterval(id); }, []);
  const angle = (tick * 0.5) % 360;
  return (
    <section style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: w < 480 ? "120px 20px 60px" : "140px 40px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(136,68,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 24, animation: "fadeUp 0.6s ease 0.1s both" }}>Pricing</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(40px, 10vw, 80px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 8, animation: "fadeUp 0.6s ease 0.2s both" }}>Pay once.</h1>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(40px, 10vw, 80px)", letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 32, animation: "fadeUp 0.6s ease 0.25s both" }}>
        <span style={{ background: `linear-gradient(${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Own everything.</span>
      </h1>
      <p style={{ fontFamily: inter, fontSize: "clamp(15px, 3vw, 18px)", color: "#606060", lineHeight: 1.7, maxWidth: 480, animation: "fadeUp 0.6s ease 0.35s both" }}>
        Your AI on your hardware. No per-seat, no per-token, no lock-in. Sovereign compute priced honestly.
      </p>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: GRAD, opacity: 0.3 }} />
    </section>
  );
}

function PricingCards() {
  const w = useWidth();
  const plans = [
    { name: "Starter", price: "$0", cadence: "to get started", color: "#4488FF", items: [["Self-hosted cluster",true],["5 core agents",true],["50 AI skills",true],["90 CLI tools",true],["Community Slack",true],["SLA guarantee",false],["Priority support",false]], cta: "Get Started", outline: true },
    { name: "Sovereign", price: "$49", cadence: "/ month", color: "#8844FF", featured: true, items: [["Everything in Starter",true],["Full agent fleet",true],["Priority infrastructure",true],["99.9% SLA guarantee",true],["Direct support line",true],["Custom agent configs",true],["Advanced analytics",true]], cta: "Go Sovereign" },
    { name: "Enterprise", price: "Custom", cadence: "contact us", color: "#00D4FF", items: [["Everything in Sovereign",true],["White-label OS",true],["On-prem or air-gapped",true],["Dedicated success team",true],["Custom integrations",true],["Volume licensing",true],["24/7 phone support",true]], cta: "Talk to Us", outline: true },
  ];
  return (
    <section style={{ padding: w < 480 ? "0 20px 80px" : "0 40px 100px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: w >= 800 ? "repeat(3,1fr)" : w >= 520 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {plans.map((p, i) => (
            <FadeIn key={p.name} delay={i * 80}>
              <div style={{ background: p.featured ? "#080808" : "#050505", border: p.featured ? `1px solid ${p.color}44` : "1px solid #141414", padding: "32px 24px", position: "relative", boxShadow: p.featured ? `0 0 60px ${p.color}18` : "none", height: "100%", display: "flex", flexDirection: "column" }}>
                {p.featured && <>
                  <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 2, background: GRAD }} />
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontFamily: mono, fontSize: 9, color: "#f5f5f5", background: "#8844FF", padding: "3px 12px", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>
                </>}
                <div style={{ fontFamily: mono, fontSize: 9, color: "#f5f5f5", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, flexShrink: 0 }} />{p.name}
                </div>
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 42, color: "#f0f0f0", letterSpacing: "-0.04em" }}>{p.price}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#383838", marginLeft: 6 }}>{p.cadence}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1 }}>
                  {p.items.map(([item, included]) => (
                    <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontFamily: mono, fontSize: 12, color: included ? "#585858" : "#2a2a2a", flexShrink: 0, marginTop: 1 }}>{included ? "+" : "−"}</span>
                      <span style={{ fontFamily: inter, fontSize: 13, color: included ? "#585858" : "#2a2a2a", lineHeight: 1.5 }}>{item}</span>
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

function Philosophy() {
  const w = useWidth();
  const items = [
    { title: "No token tax", body: "You run the models on your hardware. We don't meter your inference. Use as much as you want." },
    { title: "No vendor lock-in", body: "Deploy on any cloud, any Pi, any laptop. Your data stays yours. Move anytime." },
    { title: "No per-seat nonsense", body: "One license, unlimited users. Bring your whole team. We don't punish growth." },
    { title: "Your hardware, your rules", body: "Sovereign infrastructure means you own the stack. No one can pull the plug." },
  ];
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>Philosophy</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 48px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0 }}>Pricing with principles.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: w >= 640 ? "repeat(2,1fr)" : "1fr", gap: 8 }}>
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 70}>
              <div style={{ background: "#060606", border: "1px solid #141414", padding: "28px 24px" }}>
                <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", marginBottom: 10 }}>{item.title}</div>
                <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7 }}>{item.body}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const w = useWidth();
  const [open, setOpen] = useState(null);
  const faqs = [
    ["Can I use BlackRoad OS offline?", "Yes. The entire stack runs on your hardware. Once deployed, you don't need an internet connection for core functionality."],
    ["What hardware do I need?", "Anything from a Raspberry Pi to a full server rack. We run on 5 Pis with 52 TOPS of AI compute. Start small, scale up."],
    ["Do I need my own API keys?", "For local models (Ollama), no. For cloud providers (Claude, GPT-4o), you bring your keys — but they flow through the tokenless gateway so agents never see them."],
    ["Can I run my own models?", "Absolutely. Ollama supports Qwen, DeepSeek, Llama, Mistral, and any GGUF model. Your hardware, your models."],
    ["What's the catch?", "No catch. We sell proprietary software that runs on your infrastructure. You own it. We support it."],
  ];
  return (
    <section style={{ padding: w < 480 ? "80px 20px" : "100px 40px", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#383838", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16 }}>FAQ</div>
            <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 48px)", color: "#f5f5f5", letterSpacing: "-0.04em" }}>Common questions.</h2>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map(([q, a], i) => (
            <FadeIn key={q} delay={i * 50}>
              <div onClick={() => setOpen(open === i ? null : i)} style={{ borderBottom: "1px solid #141414", padding: "20px 0", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 15, color: "#ebebeb" }}>{q}</div>
                  <div style={{ fontFamily: mono, fontSize: 14, color: "#383838", transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</div>
                </div>
                {open === i && <div style={{ fontFamily: inter, fontSize: 14, color: "#545454", lineHeight: 1.7, marginTop: 12 }}>{a}</div>}
              </div>
            </FadeIn>
          ))}
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
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(34px, 8vw, 68px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>Own your<br />infrastructure.</h2>
          <p style={{ fontFamily: inter, fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 44 }}>Sovereign compute, sentient agents, and a stack that's actually yours.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <GradBtn href="https://docs.blackroad.io">Get Started</GradBtn>
            <GradBtn outline href="https://docs.blackroad.io">Learn More →</GradBtn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const w = useWidth();
  const links = [["Home","https://blackroad.io"],["AI","https://blackroadai.com"],["Lucidia","https://lucidia.earth"],["Network","https://blackroad.network"],["Status","https://blackroad.systems"],["Company","https://blackroad.company"],["Brand","https://brand.blackroad.io"],["GitHub","https://github.com/blackboxprogramming"]];
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: w < 480 ? "40px 20px 32px" : "48px 40px 36px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ height: 1, background: GRAD, marginBottom: 40, opacity: 0.4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>{STOPS.map(c => <div key={c} style={{ width: 2, height: 14, background: c }} />)}</div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 16, color: "#ebebeb", letterSpacing: "-0.03em" }}>BlackRoad</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#252525" }}>Pave Tomorrow. · blackroad.io</div>
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

export default function BlackRoadPricing() {
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
      `}</style>
      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", overflowX: "hidden", width: "100%" }}>
        <Nav />
        <Hero />
        <PricingCards />
        <Philosophy />
        <FAQ />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
