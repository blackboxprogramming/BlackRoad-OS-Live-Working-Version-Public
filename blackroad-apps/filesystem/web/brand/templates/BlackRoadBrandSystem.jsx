import { useState, useEffect, useRef } from "react";

const SPECTRUM = [
  { name: "Ember",   hex: "#FF6B2B" },
  { name: "Flare",   hex: "#FF2255" },
  { name: "Magenta", hex: "#CC00AA" },
  { name: "Orchid",  hex: "#8844FF" },
  { name: "Arc",     hex: "#4488FF" },
  { name: "Cyan",    hex: "#00D4FF" },
];

const GRADIENTS = [
  { name: "Full Spectrum", css: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)", stops: "#FF6B2B → #FF2255 → #CC00AA → #8844FF → #4488FF → #00D4FF" },
  { name: "Warm → Cool",   css: "linear-gradient(135deg, #FF6B2B, #FF2255, #8844FF, #00D4FF)",                  stops: "#FF6B2B → #FF2255 → #8844FF → #00D4FF" },
  { name: "Pulse",         css: "linear-gradient(90deg, #CC00AA, #8844FF, #4488FF)",                             stops: "#CC00AA → #8844FF → #4488FF" },
  { name: "Fire",          css: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA)",                             stops: "#FF6B2B → #FF2255 → #CC00AA" },
  { name: "Ice",           css: "linear-gradient(90deg, #8844FF, #4488FF, #00D4FF)",                             stops: "#8844FF → #4488FF → #00D4FF" },
  { name: "Radial Burst",  css: "radial-gradient(circle at 30% 50%, #FF6B2B, #CC00AA, #00D4FF)",                 stops: "radial · #FF6B2B → #CC00AA → #00D4FF" },
];

const TYPOGRAPHY = [
  { role: "Display",  family: "Space Grotesk",  weight: "700", size: "48–80px", use: "Hero headlines" },
  { role: "Heading",  family: "Space Grotesk",  weight: "600", size: "24–40px", use: "Section titles" },
  { role: "Body",     family: "Inter",           weight: "400", size: "14–16px", use: "Paragraphs" },
  { role: "Label",    family: "Inter",           weight: "500", size: "12–13px", use: "UI labels, nav" },
  { role: "Code",     family: "JetBrains Mono",  weight: "400", size: "11–13px", use: "Code, tokens" },
  { role: "Micro",    family: "JetBrains Mono",  weight: "500", size: "9–10px",  use: "Timestamps" },
];

const SURFACES = [
  { name: "Base",      hex: "#000000", label: "Page background" },
  { name: "Card",      hex: "#0d0d0d", label: "Card surface" },
  { name: "Elevated",  hex: "#111111", label: "Elevated surface" },
  { name: "Hover",     hex: "#181818", label: "Hover state" },
  { name: "Border",    hex: "#222222", label: "Default border" },
  { name: "Muted",     hex: "#444444", label: "Subtle text / dividers" },
  { name: "Secondary", hex: "#737373", label: "Secondary text" },
  { name: "Primary",   hex: "#f5f5f5", label: "Primary text" },
];

const CSS_TOKENS = `:root {
  /* Backgrounds */
  --br-bg:       #000000;
  --br-card:     #0d0d0d;
  --br-hover:    #181818;

  /* Text */
  --br-text:     #f5f5f5;
  --br-sub:      #737373;
  --br-muted:    #444444;

  /* Borders */
  --br-border:   #222222;

  /* Accents — shapes only */
  --br-ember:    #FF6B2B;
  --br-flare:    #FF2255;
  --br-magenta:  #CC00AA;
  --br-orchid:   #8844FF;
  --br-arc:      #4488FF;
  --br-cyan:     #00D4FF;

  /* Gradient */
  --br-gradient: linear-gradient(
    90deg, #FF6B2B, #FF2255,
    #CC00AA, #8844FF, #4488FF, #00D4FF
  );
}`;

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const FULL_GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

function useCopy(value) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return [copied, copy];
}

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 400);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// Fade-in on scroll
function useVisible() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function FadeIn({ children, delay = 0 }) {
  const [ref, vis] = useVisible();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Animated gradient border card ───────────────────────────────
function GlowCard({ children, glowColor = "#8844FF", onClick, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "#0d0d0d",
        border: `1px solid ${hover ? glowColor + "55" : "#1c1c1c"}`,
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        transition: "border-color 0.25s, box-shadow 0.25s",
        boxShadow: hover ? `0 0 24px ${glowColor}22` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────
function Nav() {
  const w = useWidth();
  const mobile = w < 600;
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, width: "100%" }}>
      <div style={{ height: 2, background: FULL_GRAD, backgroundSize: "200% 100%", animation: "gradshift 4s linear infinite" }} />
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: mobile ? "0 16px" : "0 32px",
        height: 52,
        background: "rgba(0,0,0,0.97)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a1a1a",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: mobile ? 2 : 3, height: 16, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: mobile ? 15 : 17, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
          {!mobile && <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>Brand</span>}
        </div>
        <div style={{ display: "flex", gap: mobile ? 14 : 24, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", flexShrink: 1, minWidth: 0 }}>
          {["Colors","Gradients","Typography","Surfaces","Tokens"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: inter, fontSize: mobile ? 12 : 13, fontWeight: 500, color: "#686868", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#d8d8d8"}
              onMouseLeave={e => e.target.style.color = "#686868"}
            >{l}</a>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 60); return () => clearInterval(t); }, []);
  const angle = (tick * 0.6) % 360;

  return (
    <section style={{ padding: "72px 0 60px", borderBottom: "1px solid #111" }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 20, animation: "fadeUp 0.6s ease both" }}>
        Brand Identity System · v2
      </div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(38px, 10vw, 80px)", color: "#f5f5f5", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24, animation: "fadeUp 0.6s ease 0.1s both" }}>
        BlackRoad<br />Brand System.
      </h1>
      <p style={{ fontFamily: inter, fontSize: 15, color: "#737373", lineHeight: 1.75, maxWidth: 400, marginBottom: 44, animation: "fadeUp 0.6s ease 0.2s both" }}>
        Six chromatic stops. Three typefaces. One coherent language.
        Tap any element to copy its token.
      </p>
      {/* Animated gradient bar */}
      <div style={{ height: 5, background: `linear-gradient(${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)`, maxWidth: 280, borderRadius: 3, animation: "fadeUp 0.6s ease 0.3s both" }} />
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────────────
function SectionHead({ label, sub }) {
  return (
    <div style={{ padding: "48px 0 22px" }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 10 }}>{label}</div>
      {sub && <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(22px, 6vw, 38px)", color: "#ebebeb", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{sub}</div>}
    </div>
  );
}

function Subtext({ children }) {
  return <p style={{ fontFamily: inter, fontSize: 14, color: "#646464", marginBottom: 18, lineHeight: 1.65 }}>{children}</p>;
}

function Divider() {
  return <div style={{ height: 1, background: "#111", margin: "6px 0" }} />;
}

// ─── Swatch ───────────────────────────────────────────────────────
function Swatch({ color, delay = 0 }) {
  const [copied, copy] = useCopy(color.hex);
  const [hover, setHover] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onClick={copy}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#0d0d0d",
          border: `1px solid ${hover ? color.hex + "66" : "#1c1c1c"}`,
          cursor: "pointer",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hover ? `0 8px 32px ${color.hex}33` : "none",
        }}
      >
        <div style={{ height: 100, background: color.hex, transition: "filter 0.2s", filter: hover ? "brightness(1.1)" : "brightness(1)" }} />
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: "#ebebeb", marginBottom: 4 }}>{color.name}</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: copied ? "#a0a0a0" : "#555" }}>{copied ? "✓ copied" : color.hex}</div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Gradient Card ────────────────────────────────────────────────
function GradCard({ grad, delay = 0 }) {
  const [copied, copy] = useCopy(grad.css);
  const [hover, setHover] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onClick={copy}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#0d0d0d",
          border: "1px solid #1c1c1c",
          cursor: "pointer",
          overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hover ? "0 10px 40px rgba(136,68,255,0.18)" : "none",
        }}
      >
        <div style={{ height: 96, background: grad.css, transition: "filter 0.2s", filter: hover ? "brightness(1.08) saturate(1.1)" : "brightness(1)" }} />
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: "#ebebeb", marginBottom: 5 }}>{grad.name}</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: copied ? "#a0a0a0" : "#505050", lineHeight: 1.5, wordBreak: "break-all" }}>
            {copied ? "✓ CSS copied" : grad.stops}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Surface Chip ─────────────────────────────────────────────────
function SurfaceChip({ s, delay = 0 }) {
  const [copied, copy] = useCopy(s.hex);
  const [hover, setHover] = useState(false);
  const isLight = s.hex === "#f5f5f5";
  return (
    <FadeIn delay={delay}>
      <div
        onClick={copy}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 14px",
          background: hover ? "#111" : "#0d0d0d",
          border: `1px solid ${hover ? "#2a2a2a" : "#1c1c1c"}`,
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <div style={{ width: 36, height: 36, flexShrink: 0, background: s.hex, border: isLight ? "1px solid #222" : "1px solid rgba(255,255,255,0.04)", transition: "transform 0.2s", transform: hover ? "scale(1.05)" : "scale(1)" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 13, color: "#dedede", marginBottom: 2 }}>{s.name}</div>
          <div style={{ fontFamily: inter, fontSize: 12, color: "#595959" }}>{s.label}</div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: copied ? "#a0a0a0" : "#454545", flexShrink: 0 }}>
          {copied ? "✓" : s.hex}
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Type Card ────────────────────────────────────────────────────
function TypeCard({ t, delay = 0 }) {
  const [hover, setHover] = useState(false);
  const fontMap = { "Space Grotesk": grotesk, "Inter": inter, "JetBrains Mono": mono };
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: "16px",
          background: "#0d0d0d",
          border: `1px solid ${hover ? "#2a2a2a" : "#1c1c1c"}`,
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: hover ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
          display: "flex", flexDirection: "column", gap: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#454545", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.role}</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#454545" }}>{t.size}</div>
        </div>
        <div style={{ fontFamily: fontMap[t.family], fontWeight: t.weight, fontSize: 22, color: "#ebebeb", letterSpacing: "-0.02em", transition: "letter-spacing 0.2s", ...(hover && { letterSpacing: "-0.01em" }) }}>
          BlackRoad OS
        </div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "#595959" }}>{t.use} · {t.family}</div>
      </div>
    </FadeIn>
  );
}

// ─── Code Block ───────────────────────────────────────────────────
function CodeBlock({ value, label }) {
  const [copied, copy] = useCopy(value);
  return (
    <div style={{ background: "#050505", border: "1px solid #1c1c1c", overflow: "hidden", marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #111" }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#454545", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
        <button
          onClick={copy}
          style={{
            fontFamily: mono, fontSize: 9,
            color: copied ? "#00D4FF" : "#555",
            background: "none", border: "none", cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.08em",
            transition: "color 0.2s",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{ fontFamily: mono, fontSize: 11, color: "#555", lineHeight: 1.8, margin: 0, padding: "16px", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "hidden" }}>
        {value}
      </pre>
    </div>
  );
}

// ─── Animated spectrum bar (hero decoration) ──────────────────────
function SpectrumBar() {
  return (
    <div style={{ overflow: "hidden", height: 3, background: FULL_GRAD, backgroundSize: "200% 100%", animation: "gradshift 3s linear infinite", borderRadius: 2 }} />
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadBrandSystem() {
  const w = useWidth();
  const pad = w < 480 ? "0 16px" : w < 768 ? "0 24px" : "0 32px";
  const cols2 = w >= 500 ? "1fr 1fr" : "1fr";
  const cols3 = w >= 720 ? "1fr 1fr 1fr" : w >= 480 ? "1fr 1fr" : "1fr";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }

        @keyframes gradshift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.5; transform: scaleY(0.7); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>
        <Nav />

        <div style={{ maxWidth: 960, margin: "0 auto", padding: pad, width: "100%" }}>

          <Hero />

          {/* 01 — Colors */}
          <div id="colors">
            <SectionHead label="01 — Accent Colors" sub="Six chromatic stops." />
            <Subtext>From warm Ember through cool Cyan. Tap any swatch to copy hex.</Subtext>
            <div style={{ display: "grid", gridTemplateColumns: cols3, gap: 6 }}>
              {SPECTRUM.map((c, i) => <Swatch key={c.hex} color={c} delay={i * 60} />)}
            </div>
          </div>

          <Divider />

          {/* 02 — Gradients */}
          <div id="gradients">
            <SectionHead label="02 — Gradients" sub="Approved pairings." />
            <Subtext>For backgrounds, borders, and emphasis. Tap to copy CSS.</Subtext>
            <div style={{ display: "grid", gridTemplateColumns: cols2, gap: 6 }}>
              {GRADIENTS.map((g, i) => <GradCard key={g.name} grad={g} delay={i * 60} />)}
            </div>
          </div>

          <Divider />

          {/* 03 — Typography */}
          <div id="typography">
            <SectionHead label="03 — Typography" sub="Three typefaces." />
            <Subtext>Space Grotesk for display. Inter for body. JetBrains Mono for code.</Subtext>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TYPOGRAPHY.map((t, i) => <TypeCard key={t.role} t={t} delay={i * 50} />)}
            </div>
            <CodeBlock value={FONT_IMPORT} label="Google Fonts Import" />
          </div>

          <Divider />

          {/* 04 — Surfaces */}
          <div id="surfaces">
            <SectionHead label="04 — Surfaces" sub="Background layers." />
            <Subtext>Eight levels from base to primary text. Tap to copy.</Subtext>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SURFACES.map((s, i) => <SurfaceChip key={s.name} s={s} delay={i * 40} />)}
            </div>
          </div>

          {/* 05 — Tokens */}
          <div id="tokens">
            <SectionHead label="05 — CSS Tokens" sub="Copy-paste variables." />
            <CodeBlock value={CSS_TOKENS} label="CSS Custom Properties" />
          </div>

          {/* Footer */}
          <div style={{ padding: "56px 0 40px" }}>
            <div style={{ height: 1, background: FULL_GRAD, backgroundSize: "200% 100%", animation: "gradshift 4s linear infinite", marginBottom: 28 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#ebebeb", letterSpacing: "-0.03em", marginBottom: 5 }}>BlackRoad</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#333" }}>Brand System · blackroad.io · Z:=yx−w</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#282828" }}>v2 · 2026</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
