import { useState, useEffect, useRef, useCallback } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD  = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono  = "'JetBrains Mono', monospace";
const sans  = "'Space Grotesk', sans-serif";
const body  = "'Inter', sans-serif";

const CATS = ["All","Loaders","Particles","Text","Buttons","Cards","Data","Ambient"];

// ─── useCopy ─────────────────────────────────────────────────────
function useCopy(val) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(val); setOk(true); setTimeout(() => setOk(false), 1500); };
  return [ok, copy];
}

// ─── CodeBlock ───────────────────────────────────────────────────
function CodeBlock({ code }) {
  const [ok, copy] = useCopy(code);
  return (
    <div style={{ position: "relative", background: "#050505", border: "1px solid #111", borderRadius: 6, marginTop: 12 }}>
      <button onClick={copy} style={{ position: "absolute", top: 8, right: 8, fontFamily: mono, fontSize: 9, color: ok ? "#00D4FF" : "#2a2a2a", background: "none", border: "none", cursor: "pointer" }}>
        {ok ? "copied ✓" : "copy"}
      </button>
      <pre style={{ fontFamily: mono, fontSize: 10, color: "#333", lineHeight: 1.7, padding: "14px 16px", overflowX: "auto", margin: 0 }}>{code}</pre>
    </div>
  );
}

// ─── AnimCard ────────────────────────────────────────────────────
function AnimCard({ title, tag, children, code, accent = "#8844FF" }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#888" }}>{title}</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: accent, border: `1px solid ${accent}33`, padding: "2px 8px", borderRadius: 3 }}>{tag}</span>
        </div>
      </div>
      <div style={{ padding: "28px 20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
        {children}
      </div>
      <div style={{ borderTop: "1px solid #0d0d0d", padding: "8px 16px" }}>
        <button onClick={() => setShow(s => !s)} style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", background: "none", border: "none", cursor: "pointer" }}>
          {show ? "▲ hide code" : "▼ show code"}
        </button>
        {show && <CodeBlock code={code} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// LOADERS
// ══════════════════════════════════════════════════════════════════

function SpectrumSpinner() {
  return (
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `conic-gradient(from 0deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF, #FF6B2B)`, animation: "spin 1.2s linear infinite", position: "relative" }}>
      <div style={{ position: "absolute", inset: 5, borderRadius: "50%", background: "#0a0a0a" }} />
    </div>
  );
}

function DotPulse() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {STOPS.map((c, i) => (
        <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, animation: `dotBounce 1.2s ease-in-out ${i * 0.12}s infinite` }} />
      ))}
    </div>
  );
}

function BarLoader() {
  return (
    <div style={{ width: 180, height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", background: GRAD, backgroundSize: "200%", animation: "barSlide 1.8s ease-in-out infinite" }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ width: 200, background: "#0d0d0d", border: "1px solid #111", borderRadius: 8, padding: "14px", gap: 10, display: "flex", flexDirection: "column" }}>
      {[100, 80, 60].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 14 : 10, width: `${w}%`, background: "#111", borderRadius: 3, animation: `shimmer 1.8s ease-in-out ${i * 0.15}s infinite`, backgroundImage: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)", backgroundSize: "200% 100%" }} />
      ))}
    </div>
  );
}

function RingStack() {
  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      {STOPS.map((c, i) => (
        <div key={c} style={{ position: "absolute", inset: i * 4, borderRadius: "50%", border: `1.5px solid ${c}`, opacity: 0.7, animation: `ringPulse 2s ease-in-out ${i * 0.18}s infinite alternate` }} />
      ))}
    </div>
  );
}

function TypewriterLoader() {
  const words = ["Routing…","Witnessing…","Remembering…","Executing…"];
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    const word = words[idx];
    if (chars < word.length) {
      const t = setTimeout(() => setChars(c => c + 1), 60);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setIdx(i => (i + 1) % words.length); setChars(0); }, 900);
      return () => clearTimeout(t);
    }
  }, [chars, idx]);
  return (
    <span style={{ fontFamily: mono, fontSize: 14, color: STOPS[idx], letterSpacing: "0.04em" }}>
      {words[idx].slice(0, chars)}<span style={{ animation: "blink 0.8s step-end infinite" }}>▌</span>
    </span>
  );
}

function MorphLoader() {
  return (
    <div style={{ width: 40, height: 40, background: STOPS[3], borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", animation: "morph 3s ease-in-out infinite" }} />
  );
}

function GridPulseLoader() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: STOPS[i % 6], animation: `gridFade 1.5s ease-in-out ${i * 0.1}s infinite alternate` }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PARTICLES
// ══════════════════════════════════════════════════════════════════

function FloatingOrbs() {
  const orbs = STOPS.map((c, i) => ({ c, x: 10 + i * 14, y: 50, s: 16 + i * 3, d: 2 + i * 0.5 }));
  return (
    <div style={{ position: "relative", width: 200, height: 80, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{ position: "absolute", left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s, borderRadius: "50%", background: o.c, opacity: 0.5, filter: "blur(4px)", transform: "translate(-50%,-50%)", animation: `orbFloat ${o.d}s ease-in-out ${i * 0.3}s infinite alternate` }} />
      ))}
    </div>
  );
}

function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 2 + 1, d: Math.random() * 3 + 1,
    c: STOPS[i % 6], delay: Math.random() * 2,
  }));
  return (
    <div style={{ position: "relative", width: 200, height: 100, background: "#050505", borderRadius: 8, overflow: "hidden" }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: "50%", background: s.c, animation: `starTwinkle ${s.d}s ease-in-out ${s.delay}s infinite alternate` }} />
      ))}
    </div>
  );
}

function ParticleEmitter() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * 360, c: STOPS[i % 6], d: 1.5 + Math.random(),
  }));
  return (
    <div style={{ position: "relative", width: 80, height: 80 }}>
      <div style={{ position: "absolute", inset: "50%", width: 6, height: 6, marginTop: -3, marginLeft: -3, borderRadius: "50%", background: "#fff", zIndex: 2 }} />
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 4, height: 4, borderRadius: "50%", background: p.c,
          transformOrigin: "0 0",
          animation: `emit ${p.d}s ease-out ${i * 0.08}s infinite`,
        }} />
      ))}
    </div>
  );
}

function AuroraWave() {
  return (
    <div style={{ width: 220, height: 70, position: "relative", overflow: "hidden", borderRadius: 8 }}>
      {STOPS.map((c, i) => (
        <div key={c} style={{
          position: "absolute", bottom: -20, left: `-${i * 10}%`, right: `-${i * 10}%`,
          height: 60, background: c, opacity: 0.15, borderRadius: "50%",
          filter: "blur(12px)",
          animation: `auroraWave ${2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function ConstellationMap() {
  const nodes = [
    { x: 20, y: 30, c: "#FF6B2B" }, { x: 50, y: 15, c: "#FF2255" },
    { x: 80, y: 30, c: "#CC00AA" }, { x: 70, y: 65, c: "#8844FF" },
    { x: 35, y: 70, c: "#4488FF" }, { x: 55, y: 45, c: "#00D4FF" },
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,0],[5,1],[5,3]];
  return (
    <svg width={180} height={90} viewBox="0 0 180 90">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x * 1.8} y1={nodes[a].y * 0.9} x2={nodes[b].x * 1.8} y2={nodes[b].y * 0.9}
          stroke="#1a1a1a" strokeWidth={1} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x * 1.8} cy={n.y * 0.9} r={4} fill={n.c} opacity={0.8}
          style={{ animation: `starTwinkle 2s ease-in-out ${i * 0.3}s infinite alternate` }} />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// TEXT ANIMATIONS
// ══════════════════════════════════════════════════════════════════

function GradientText({ text = "BlackRoad OS", size = 32 }) {
  return (
    <span style={{ fontFamily: sans, fontWeight: 700, fontSize: size, background: GRAD, backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradShift 3s linear infinite", letterSpacing: "-0.03em" }}>
      {text}
    </span>
  );
}

function GlitchText() {
  return (
    <div style={{ position: "relative", fontFamily: mono, fontSize: 22, fontWeight: 700, color: "#f0f0f0", letterSpacing: "0.1em" }}>
      <span style={{ position: "relative", zIndex: 2 }}>BLACKROAD</span>
      <span style={{ position: "absolute", top: 0, left: 0, color: "#FF2255", opacity: 0.8, animation: "glitchR 3s step-end infinite", clipPath: "inset(0 0 60% 0)" }}>BLACKROAD</span>
      <span style={{ position: "absolute", top: 0, left: 0, color: "#4488FF", opacity: 0.8, animation: "glitchB 3s step-end 0.1s infinite", clipPath: "inset(40% 0 0 0)" }}>BLACKROAD</span>
    </div>
  );
}

function CountUp({ end = 30000, label = "agents" }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let frame, start, dur = 1800;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(ease * end));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, end]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, color: "#f0f0f0", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
        {val.toLocaleString()}
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StaggerWords() {
  const words = ["Sovereign.", "Sentient.", "Spatial."];
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive(a => (a + 1) % words.length), 1600); return () => clearInterval(id); }, []);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", marginBottom: 10 }}>BlackRoad OS is</div>
      <div key={active} style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: STOPS[active * 2], letterSpacing: "-0.03em", animation: "wordFade 0.4s ease" }}>
        {words[active]}
      </div>
    </div>
  );
}

function ScrambleText() {
  const target = "Z := yx − w";
  const chars  = "01ABXYZΨΩΦΓΔαβγδ∞≈≠±∑∫";
  const [disp, setDisp] = useState(target);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!hover) { setDisp(target); return; }
    let iter = 0;
    const id = setInterval(() => {
      setDisp(target.split("").map((c, i) => i < iter ? c : c === " " ? " " : chars[Math.floor(Math.random() * chars.length)]).join(""));
      if (iter >= target.length) clearInterval(id);
      iter += 0.4;
    }, 40);
    return () => clearInterval(id);
  }, [hover]);
  return (
    <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ fontFamily: mono, fontSize: 22, color: "#8844FF", letterSpacing: "0.04em", cursor: "default", userSelect: "none" }}>
      {disp}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════
// BUTTONS
// ══════════════════════════════════════════════════════════════════

function GradientButton() {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: "#fff", background: GRAD, backgroundSize: "200%", animation: "gradShift 3s linear infinite", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? "0 8px 24px rgba(136,68,255,0.3)" : "none", transition: "transform 0.15s, box-shadow 0.15s" }}>
      Start building →
    </button>
  );
}

function PulseButton() {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {hov && <div style={{ position: "absolute", inset: -4, borderRadius: 10, background: "#FF225522", animation: "rippleOut 0.6s ease-out forwards" }} />}
      <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ fontFamily: mono, fontSize: 12, color: "#FF2255", background: "transparent", border: "1px solid #FF225544", padding: "9px 22px", borderRadius: 6, cursor: "pointer", transition: "all 0.15s", borderColor: hov ? "#FF2255" : "#FF225544" }}>
        Explore chain →
      </button>
    </div>
  );
}

function MagneticButton() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handle = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    setPos({ x, y });
  };
  return (
    <button ref={ref} onMouseMove={handle} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#00D4FF", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", padding: "10px 22px", borderRadius: 6, cursor: "pointer", transform: `translate(${pos.x}px,${pos.y}px)`, transition: "transform 0.15s ease" }}>
      ◎ Magnetic
    </button>
  );
}

function ShimmerButton() {
  return (
    <button style={{ fontFamily: mono, fontSize: 12, color: "#f0f0f0", background: "#0d0d0d", border: "1px solid #1a1a1a", padding: "10px 22px", borderRadius: 6, cursor: "pointer", position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", animation: "shimmerPass 2s ease-in-out infinite" }} />
      Read Protocol
    </button>
  );
}

function RippleButton() {
  const [ripples, setRipples] = useState([]);
  const handleClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const id = Date.now();
    setRipples(rs => [...rs, { x, y, id }]);
    setTimeout(() => setRipples(rs => rs.filter(r => r.id !== id)), 600);
  };
  return (
    <button onClick={handleClick}
      style={{ fontFamily: sans, fontWeight: 600, fontSize: 13, color: "#f0f0f0", background: "#8844FF22", border: "1px solid #8844FF44", padding: "10px 22px", borderRadius: 6, cursor: "pointer", position: "relative", overflow: "hidden" }}>
      {ripples.map(r => <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 4, height: 4, marginLeft: -2, marginTop: -2, borderRadius: "50%", background: "#8844FF66", animation: "rippleGrow 0.6s ease-out forwards", pointerEvents: "none" }} />)}
      Click for ripple
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
// CARDS
// ══════════════════════════════════════════════════════════════════

function HoverGlowCard() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const handle = (e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <div ref={ref} onMouseMove={handle} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 200, background: "#0a0a0a", border: "1px solid #161616", borderRadius: 10, padding: "20px", cursor: "default", position: "relative", overflow: "hidden", transition: "border-color 0.2s", borderColor: hov ? "#2a2a2a" : "#111" }}>
      {hov && <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(136,68,255,0.15) 0%, transparent 70%)", left: pos.x - 60, top: pos.y - 60, pointerEvents: "none" }} />}
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: "#888", marginBottom: 6 }}>Agent Status</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>Lucidia · PS-SHA∞</div>
    </div>
  );
}

function FlipCard() {
  const [flip, setFlip] = useState(false);
  return (
    <div onMouseEnter={() => setFlip(true)} onMouseLeave={() => setFlip(false)}
      style={{ width: 160, height: 90, perspective: 600, cursor: "pointer" }}>
      <div style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", transform: flip ? "rotateY(180deg)" : "none", transition: "transform 0.5s ease" }}>
        <div style={{ position: "absolute", inset: 0, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backfaceVisibility: "hidden" }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: "#f0f0f0" }}>BlackRoad</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "#0d0d0d", border: "1px solid #8844FF44", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: "#8844FF" }}>Z := yx − w</span>
        </div>
      </div>
    </div>
  );
}

function TiltCard() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const handle = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -y * 14, ry: x * 14 });
  };
  return (
    <div ref={ref} onMouseMove={handle} onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{ width: 160, height: 90, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", transform: `perspective(600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: "transform 0.1s ease" }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 15, color: "#f0f0f0" }}>◉ Tilt me</div>
    </div>
  );
}

function BorderBeam() {
  return (
    <div style={{ width: 180, height: 80, position: "relative", borderRadius: 10 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 10, padding: 1, background: GRAD, backgroundSize: "300% 300%", animation: "borderRotate 2s linear infinite", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor" }} />
      <div style={{ position: "absolute", inset: 1, background: "#0a0a0a", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 12, color: "#333" }}>Beam border</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// DATA VISUALIZATIONS
// ══════════════════════════════════════════════════════════════════

function AnimatedBars() {
  const data = [65, 82, 45, 90, 58, 75];
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
      {data.map((v, i) => (
        <div key={i} style={{ width: 18, height: mounted ? `${v}%` : 0, background: STOPS[i], borderRadius: "2px 2px 0 0", transition: `height 0.8s cubic-bezier(.34,1.56,.64,1) ${i * 0.08}s`, minHeight: 0 }} />
      ))}
    </div>
  );
}

function Waveform() {
  const bars = Array.from({ length: 24 }, (_, i) => ({ h: 20 + Math.random() * 60, c: STOPS[i % 6] }));
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", height: 60 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ width: 3, height: b.h, background: b.c, borderRadius: 2, opacity: 0.7, animation: `waveBar ${0.6 + Math.random() * 0.8}s ease-in-out ${i * 0.03}s infinite alternate` }} />
      ))}
    </div>
  );
}

function RadialProgress({ value = 72, color = "#8844FF" }) {
  const r = 36, c = 2 * Math.PI * r;
  const [prog, setProg] = useState(0);
  useEffect(() => { setTimeout(() => setProg(value), 200); }, [value]);
  return (
    <div style={{ position: "relative", width: 90, height: 90 }}>
      <svg width={90} height={90} viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="#111" strokeWidth={5} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (prog / 100) * c}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1) 0.2s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 18, color: "#f0f0f0" }}>{prog}%</span>
      </div>
    </div>
  );
}

function NetworkGraph() {
  const nodes = [
    { x: 50, y: 50, r: 8, c: "#8844FF", label: "Core" },
    { x: 20, y: 20, r: 5, c: "#FF6B2B", label: "A" },
    { x: 80, y: 20, r: 5, c: "#FF2255", label: "B" },
    { x: 80, y: 80, r: 5, c: "#4488FF", label: "C" },
    { x: 20, y: 80, r: 5, c: "#00D4FF", label: "D" },
    { x: 50, y: 15, r: 4, c: "#CC00AA", label: "E" },
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[2,5]];
  return (
    <svg width={160} height={100} viewBox="0 0 100 100">
      {edges.map(([a,b],i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#1a1a1a" strokeWidth={0.8}
          style={{ animation: `edgeFade 2s ease-in-out ${i*0.2}s infinite alternate` }} />
      ))}
      {nodes.map((n,i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.c} opacity={0.85}
          style={{ animation: `nodeGlow 2s ease-in-out ${i*0.3}s infinite alternate` }} />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// AMBIENT
// ══════════════════════════════════════════════════════════════════

function ConicRing() {
  const [a, setA] = useState(0);
  useEffect(() => { const id = setInterval(() => setA(x => (x + 0.5) % 360), 20); return () => clearInterval(id); }, []);
  return (
    <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(from ${a}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF, #FF6B2B)`, position: "relative" }}>
      <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 8, color: "#2a2a2a" }}>Z:=yx−w</span>
      </div>
    </div>
  );
}

function NoisePlane() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d");
    let frame, t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 200, 80);
      for (let x = 0; x < 200; x += 6) {
        const y = 40 + Math.sin(x * 0.04 + t) * 15 + Math.sin(x * 0.09 + t * 1.5) * 8;
        const pct = x / 200;
        const r = Math.round(255 * (1 - pct) * 0.7 + 68 * pct);
        const g = Math.round(34 + pct * 68);
        const b = Math.round(43 + pct * 212);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }
      t += 0.04;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvas} width={200} height={80} style={{ borderRadius: 8, background: "#050505" }} />;
}

function MatrixRain() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d");
    const cols = Math.floor(120 / 10);
    const drops = Array(cols).fill(0);
    const chars = "01ZΨ∞XYW";
    let frame;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, 120, 100);
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const c2 = STOPS[i % 6];
        ctx.fillStyle = c2;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.globalAlpha = 0.7;
        ctx.fillText(ch, i * 10, y * 10);
        drops[i] = y > 10 + Math.random() * 10 ? 0 : y + 1;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvas} width={120} height={100} style={{ borderRadius: 6, background: "#000" }} />;
}

function SpectrumEqualizer() {
  const [bars, setBars] = useState(Array(16).fill(20));
  useEffect(() => {
    const id = setInterval(() => {
      setBars(bs => bs.map(() => 10 + Math.random() * 80));
    }, 120);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 8, height: h, background: STOPS[i % 6], borderRadius: "2px 2px 0 0", transition: "height 0.1s ease" }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

const ALL_ANIMS = [
  // Loaders
  { title:"Spectrum Spinner",   tag:"Loader",   cat:"Loaders",   accent:"#8844FF", el:<SpectrumSpinner />,   code:`// Conic gradient spinner\n<div style={{\n  width:48, height:48, borderRadius:"50%",\n  background:"conic-gradient(from 0deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF,#FF6B2B)",\n  animation:"spin 1.2s linear infinite",\n  position:"relative"\n}}>\n  <div style={{ position:"absolute", inset:5, borderRadius:"50%", background:"#0a0a0a" }} />\n</div>\n// @keyframes spin { to { transform: rotate(360deg); } }` },
  { title:"Dot Pulse",          tag:"Loader",   cat:"Loaders",   accent:"#FF2255", el:<DotPulse />,          code:`// 6-stop bouncing dots\n{STOPS.map((c,i) => (\n  <div key={c} style={{\n    width:8, height:8, borderRadius:"50%",\n    background:c,\n    animation:\`dotBounce 1.2s ease-in-out \${i*0.12}s infinite\`\n  }}/>\n))}\n// @keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }` },
  { title:"Bar Loader",         tag:"Loader",   cat:"Loaders",   accent:"#FF6B2B", el:<BarLoader />,         code:`<div style={{ width:180, height:3, background:"#111", borderRadius:2, overflow:"hidden" }}>\n  <div style={{\n    height:"100%",\n    background:"linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)",\n    backgroundSize:"200%",\n    animation:"barSlide 1.8s ease-in-out infinite"\n  }}/>\n</div>\n// @keyframes barSlide { 0%{background-position:0%} 100%{background-position:200%} }` },
  { title:"Skeleton Card",      tag:"Loader",   cat:"Loaders",   accent:"#333",    el:<SkeletonCard />,      code:`// Shimmer skeleton\n{[100,80,60].map((w,i) => (\n  <div style={{\n    height: i===0?14:10, width:\`\${w}%\`,\n    background:"#111", borderRadius:3,\n    backgroundImage:"linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)",\n    backgroundSize:"200% 100%",\n    animation:\`shimmer 1.8s ease-in-out \${i*0.15}s infinite\`\n  }}/>\n))}` },
  { title:"Ring Stack",         tag:"Loader",   cat:"Loaders",   accent:"#CC00AA", el:<RingStack />,         code:`// Concentric animated rings\n{STOPS.map((c,i) => (\n  <div style={{\n    position:"absolute", inset:i*4,\n    borderRadius:"50%", border:\`1.5px solid \${c}\`,\n    animation:\`ringPulse 2s ease-in-out \${i*0.18}s infinite alternate\`\n  }}/>\n))}\n// @keyframes ringPulse { from{opacity:.2;transform:scale(.95)} to{opacity:.8;transform:scale(1)} }` },
  { title:"Typewriter",         tag:"Loader",   cat:"Loaders",   accent:"#4488FF", el:<TypewriterLoader />,  code:`// Typewriter loader\nconst words = ["Routing…","Witnessing…","Remembering…","Executing…"];\n// Advance chars with setInterval, reset on word completion\n<span style={{ fontFamily:mono, color:STOPS[idx] }}>\n  {words[idx].slice(0,chars)}<span style={{ animation:"blink 0.8s step-end infinite" }}>▌</span>\n</span>` },
  { title:"Morph Shape",        tag:"Loader",   cat:"Loaders",   accent:"#8844FF", el:<MorphLoader />,       code:`<div style={{\n  width:40, height:40, background:"#8844FF",\n  borderRadius:"30% 70% 70% 30% / 30% 30% 70% 70%",\n  animation:"morph 3s ease-in-out infinite"\n}}/>\n// @keyframes morph {\n//   0%{border-radius:30% 70% 70% 30% / 30% 30% 70% 70%}\n//   50%{border-radius:70% 30% 30% 70% / 70% 70% 30% 30%}\n//   100%{border-radius:30% 70% 70% 30% / 30% 30% 70% 70%}\n// }` },
  { title:"Grid Pulse",         tag:"Loader",   cat:"Loaders",   accent:"#00D4FF", el:<GridPulseLoader />,   code:`// 3x3 staggered grid\n{Array.from({length:9}).map((_,i) => (\n  <div style={{\n    width:10, height:10, borderRadius:2,\n    background:STOPS[i%6],\n    animation:\`gridFade 1.5s ease-in-out \${i*0.1}s infinite alternate\`\n  }}/>\n))}` },

  // Particles
  { title:"Floating Orbs",      tag:"Particle", cat:"Particles", accent:"#CC00AA", el:<FloatingOrbs />,      code:`// Gaussian blur orbs\n{STOPS.map((c,i) => (\n  <div style={{\n    position:"absolute",\n    background:c, opacity:.5,\n    filter:"blur(4px)", borderRadius:"50%",\n    animation:\`orbFloat \${2+i*.5}s ease-in-out \${i*.3}s infinite alternate\`\n  }}/>\n))}\n// @keyframes orbFloat { from{transform:translateY(0)} to{transform:translateY(-12px)} }` },
  { title:"Star Field",         tag:"Particle", cat:"Particles", accent:"#4488FF", el:<StarField />,          code:`// Twinkling random stars\n{stars.map((s,i) => (\n  <div style={{\n    position:"absolute", left:\`\${s.x}%\`, top:\`\${s.y}%\`,\n    width:s.size, height:s.size,\n    borderRadius:"50%", background:s.color,\n    animation:\`starTwinkle \${s.d}s ease-in-out \${s.delay}s infinite alternate\`\n  }}/>\n))}` },
  { title:"Particle Emitter",   tag:"Particle", cat:"Particles", accent:"#FF2255", el:<ParticleEmitter />,   code:`// Radial particle burst\n{particles.map((p,i) => (\n  <div style={{\n    position:"absolute", top:"50%", left:"50%",\n    width:4, height:4, borderRadius:"50%",\n    background:p.color, transformOrigin:"0 0",\n    animation:\`emit \${p.dur}s ease-out \${i*.08}s infinite\`\n  }}/>\n))}` },
  { title:"Aurora Wave",        tag:"Particle", cat:"Particles", accent:"#8844FF", el:<AuroraWave />,        code:`// Layered aurora effect\n{STOPS.map((c,i) => (\n  <div style={{\n    position:"absolute", bottom:-20,\n    height:60, background:c, opacity:.15,\n    borderRadius:"50%", filter:"blur(12px)",\n    animation:\`auroraWave \${2+i*.4}s ease-in-out \${i*.3}s infinite alternate\`\n  }}/>\n))}` },
  { title:"Constellation",      tag:"Particle", cat:"Particles", accent:"#00D4FF", el:<ConstellationMap />,  code:`// SVG node graph\n<svg viewBox="0 0 100 100">\n  {edges.map(([a,b],i) => <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#1a1a1a" strokeWidth={1}/>)}\n  {nodes.map((n,i) => <circle cx={n.x} cy={n.y} r={4} fill={n.color} style={{animation:\`starTwinkle 2s ease-in-out \${i*.3}s infinite alternate\`}}/>)}\n</svg>` },

  // Text
  { title:"Gradient Text",      tag:"Text",     cat:"Text",      accent:"#FF6B2B", el:<GradientText />,      code:`<span style={{\n  background:"linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)",\n  backgroundSize:"200%",\n  WebkitBackgroundClip:"text",\n  WebkitTextFillColor:"transparent",\n  animation:"gradShift 3s linear infinite"\n}}>BlackRoad OS</span>\n// @keyframes gradShift { 0%{background-position:0%} 100%{background-position:200%} }` },
  { title:"Glitch Text",        tag:"Text",     cat:"Text",      accent:"#FF2255", el:<GlitchText />,        code:`// Layered color ghost glitch\n<div style={{ position:"relative" }}>\n  <span style={{ position:"relative", zIndex:2 }}>BLACKROAD</span>\n  <span style={{ position:"absolute", top:0, left:0, color:"#FF2255", animation:"glitchR 3s step-end infinite", clipPath:"inset(0 0 60% 0)" }}>BLACKROAD</span>\n  <span style={{ position:"absolute", top:0, left:0, color:"#4488FF", animation:"glitchB 3s step-end .1s infinite", clipPath:"inset(40% 0 0 0)" }}>BLACKROAD</span>\n</div>` },
  { title:"Count Up",           tag:"Text",     cat:"Text",      accent:"#8844FF", el:<CountUp end={30000} label="agents" />, code:`// IntersectionObserver + requestAnimationFrame\nuseEffect(() => {\n  let frame, start;\n  const tick = (ts) => {\n    if(!start) start = ts;\n    const p = Math.min((ts-start)/1800, 1);\n    const ease = 1 - Math.pow(1-p, 4);\n    setValue(Math.floor(ease * target));\n    if(p<1) frame = requestAnimationFrame(tick);\n  };\n  frame = requestAnimationFrame(tick);\n  return () => cancelAnimationFrame(frame);\n}, [started]);` },
  { title:"Stagger Words",      tag:"Text",     cat:"Text",      accent:"#CC00AA", el:<StaggerWords />,      code:`// Cycling word reveal\nconst words = ["Sovereign.", "Sentient.", "Spatial."];\n<div key={active} style={{\n  fontFamily:sans, color:STOPS[active*2],\n  animation:"wordFade 0.4s ease"\n}}>{words[active]}</div>\n// @keyframes wordFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }` },
  { title:"Scramble Text",      tag:"Text",     cat:"Text",      accent:"#4488FF", el:<ScrambleText />,      code:`// Hover to scramble and resolve\nconst chars = "01ABXYZΨΩΦΓΔαβγδ∞";\nconst handle = () => {\n  let iter = 0;\n  const id = setInterval(() => {\n    setDisplay(target.split("").map((c,i) =>\n      i < iter ? c : chars[Math.floor(Math.random()*chars.length)]\n    ).join(""));\n    if(iter >= target.length) clearInterval(id);\n    iter += 0.4;\n  }, 40);\n};` },

  // Buttons
  { title:"Gradient Button",    tag:"Button",   cat:"Buttons",   accent:"#8844FF", el:<GradientButton />,   code:`<button style={{\n  background:"linear-gradient(90deg,...)", backgroundSize:"200%",\n  animation:"gradShift 3s linear infinite",\n  transform: hovered ? "translateY(-2px)" : "none",\n  boxShadow: hovered ? "0 8px 24px rgba(136,68,255,.3)" : "none",\n  transition:"transform .15s, box-shadow .15s"\n}}>Start building →</button>` },
  { title:"Pulse Border",       tag:"Button",   cat:"Buttons",   accent:"#FF2255", el:<PulseButton />,      code:`// Hover triggers ripple div\n{hovered && <div style={{\n  position:"absolute", inset:-4,\n  borderRadius:10, background:"#FF225522",\n  animation:"rippleOut .6s ease-out forwards"\n}}/>}\n// @keyframes rippleOut { to{transform:scale(1.3);opacity:0} }` },
  { title:"Magnetic",           tag:"Button",   cat:"Buttons",   accent:"#00D4FF", el:<MagneticButton />,   code:`// Mouse-tracking transform\nconst handle = (e) => {\n  const r = ref.current.getBoundingClientRect();\n  const x = (e.clientX - r.left - r.width/2) * .25;\n  const y = (e.clientY - r.top - r.height/2) * .25;\n  setPos({x, y});\n};\n<button style={{ transform:\`translate(\${pos.x}px,\${pos.y}px)\`, transition:"transform .15s ease" }}>` },
  { title:"Shimmer",            tag:"Button",   cat:"Buttons",   accent:"#333",    el:<ShimmerButton />,    code:`// Shimmer pass on button\n<button style={{ position:"relative", overflow:"hidden" }}>\n  <span style={{\n    position:"absolute", top:0, left:"-100%", width:"60%",\n    background:"linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent)",\n    animation:"shimmerPass 2s ease-in-out infinite"\n  }}/>\n  Read Protocol\n</button>` },
  { title:"Ripple Click",       tag:"Button",   cat:"Buttons",   accent:"#8844FF", el:<RippleButton />,     code:`// Click-position ripple\nconst handleClick = (e) => {\n  const {left,top} = e.currentTarget.getBoundingClientRect();\n  const x = e.clientX - left, y = e.clientY - top;\n  setRipples(rs => [...rs, {x,y,id:Date.now()}]);\n};\n{ripples.map(r => <span style={{\n  position:"absolute", left:r.x, top:r.y,\n  animation:"rippleGrow .6s ease-out forwards"\n}}/>)}` },

  // Cards
  { title:"Glow Follow",        tag:"Card",     cat:"Cards",     accent:"#8844FF", el:<HoverGlowCard />,    code:`// Radial glow follows cursor\nconst handle = (e) => {\n  const r = ref.current.getBoundingClientRect();\n  setPos({x:e.clientX-r.left, y:e.clientY-r.top});\n};\n{hovered && <div style={{\n  position:"absolute", width:120, height:120, borderRadius:"50%",\n  background:"radial-gradient(circle,rgba(136,68,255,.15) 0%,transparent 70%)",\n  left:pos.x-60, top:pos.y-60\n}}/>}` },
  { title:"Flip Card",          tag:"Card",     cat:"Cards",     accent:"#4488FF", el:<FlipCard />,         code:`// CSS 3D flip\n<div style={{ perspective:600 }}>\n  <div style={{\n    transformStyle:"preserve-3d",\n    transform: flip ? "rotateY(180deg)" : "none",\n    transition:"transform .5s ease"\n  }}>\n    <div style={{ backfaceVisibility:"hidden" }}>{/* front */}</div>\n    <div style={{ backfaceVisibility:"hidden", transform:"rotateY(180deg)" }}>{/* back */}</div>\n  </div>\n</div>` },
  { title:"3D Tilt",            tag:"Card",     cat:"Cards",     accent:"#CC00AA", el:<TiltCard />,         code:`// Perspective tilt on mouse\nconst handle = (e) => {\n  const r = ref.current.getBoundingClientRect();\n  const x = (e.clientX-r.left)/r.width - .5;\n  const y = (e.clientY-r.top)/r.height - .5;\n  setTilt({rx:-y*14, ry:x*14});\n};\n<div style={{ transform:\`perspective(600px) rotateX(\${rx}deg) rotateY(\${ry}deg)\` }}>` },
  { title:"Border Beam",        tag:"Card",     cat:"Cards",     accent:"#FF6B2B", el:<BorderBeam />,       code:`// Rotating gradient border (mask trick)\n<div style={{ position:"relative", borderRadius:10 }}>\n  <div style={{\n    position:"absolute", inset:0, borderRadius:10, padding:1,\n    background:GRAD, backgroundSize:"300% 300%",\n    animation:"borderRotate 2s linear infinite",\n    WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",\n    WebkitMaskComposite:"xor"\n  }}/>\n  <div style={{ position:"absolute", inset:1, background:"#0a0a0a", borderRadius:9 }}/>\n</div>` },

  // Data
  { title:"Animated Bars",      tag:"Data",     cat:"Data",      accent:"#4488FF", el:<AnimatedBars />,     code:`// Staggered mount animation\n{data.map((v,i) => (\n  <div style={{\n    height: mounted ? \`\${v}%\` : 0,\n    background:STOPS[i],\n    transition:\`height .8s cubic-bezier(.34,1.56,.64,1) \${i*.08}s\`\n  }}/>\n))}` },
  { title:"Waveform",           tag:"Data",     cat:"Data",      accent:"#FF6B2B", el:<Waveform />,         code:`// Live waveform bars\n{bars.map((b,i) => (\n  <div style={{\n    width:3, height:b.height, background:STOPS[i%6],\n    borderRadius:2, animation:\`waveBar \${0.6+Math.random()*.8}s ease-in-out \${i*.03}s infinite alternate\`\n  }}/>\n))}\n// @keyframes waveBar { from{transform:scaleY(.3)} to{transform:scaleY(1)} }` },
  { title:"Radial Progress",    tag:"Data",     cat:"Data",      accent:"#8844FF", el:<RadialProgress />,   code:`// SVG stroke-dashoffset progress ring\n<circle\n  r={36} strokeDasharray={2*Math.PI*36}\n  strokeDashoffset={circumference - (value/100)*circumference}\n  style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1) .2s" }}\n/>` },
  { title:"Network Graph",      tag:"Data",     cat:"Data",      accent:"#00D4FF", el:<NetworkGraph />,     code:`// Animated SVG node graph\n<svg>\n  {edges.map(([a,b],i) => <line\n    stroke="#1a1a1a"\n    style={{animation:\`edgeFade 2s ease-in-out \${i*.2}s infinite alternate\`}}\n  />)}\n  {nodes.map((n,i) => <circle\n    fill={n.color}\n    style={{animation:\`nodeGlow 2s ease-in-out \${i*.3}s infinite alternate\`}}\n  />)}\n</svg>` },

  // Ambient
  { title:"Conic Ring",         tag:"Ambient",  cat:"Ambient",   accent:"#FF2255", el:<ConicRing />,        code:`// Rotating conic gradient ring\nconst [angle, setAngle] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => setAngle(a => (a+.5)%360), 20);\n  return () => clearInterval(id);\n}, []);\n<div style={{ background:\`conic-gradient(from \${angle}deg,...)\` }}>` },
  { title:"Noise Plane",        tag:"Ambient",  cat:"Ambient",   accent:"#CC00AA", el:<NoisePlane />,       code:`// Canvas wave + colored dots\nconst draw = () => {\n  for(let x=0; x<200; x+=6) {\n    const y = 40 + Math.sin(x*.04+t)*15 + Math.sin(x*.09+t*1.5)*8;\n    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();\n  }\n  t += 0.04;\n  frame = requestAnimationFrame(draw);\n};` },
  { title:"Matrix Rain",        tag:"Ambient",  cat:"Ambient",   accent:"#4488FF", el:<MatrixRain />,       code:`// Canvas character rain\nconst chars = "01ZΨ∞XYW";\nconst draw = () => {\n  ctx.fillStyle = "rgba(0,0,0,.05)";\n  ctx.fillRect(0,0,w,h);\n  drops.forEach((y,i) => {\n    ctx.fillStyle = STOPS[i%6];\n    ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*10, y*10);\n    drops[i] = y > 10+Math.random()*10 ? 0 : y+1;\n  });\n};` },
  { title:"Spectrum EQ",        tag:"Ambient",  cat:"Ambient",   accent:"#FF6B2B", el:<SpectrumEqualizer />,code:`// Real-time bar equalizer\nconst [bars, setBars] = useState(Array(16).fill(20));\nuseEffect(() => {\n  const id = setInterval(() => {\n    setBars(bs => bs.map(() => 10+Math.random()*80));\n  }, 120);\n  return () => clearInterval(id);\n}, []);` },
];

export default function AnimationLibrary() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = ALL_ANIMS.filter(a =>
    (cat === "All" || a.cat === cat) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || a.tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#000;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#000;}::-webkit-scrollbar-thumb{background:#111;border-radius:2px;}
        input{background:#0a0a0a;border:1px solid #111;border-radius:6px;color:#888;padding:7px 14px;width:200px;font-size:12px;outline:none;}
        input:focus{border-color:#2a2a2a;}
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes gradShift   { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes dotBounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes barSlide    { 0%{background-position:0%} 50%{background-position:100%} 100%{background-position:0%} }
        @keyframes shimmer     { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes shimmerPass { 0%{left:-100%} 100%{left:200%} }
        @keyframes ringPulse   { from{opacity:.15;transform:scale(.9)} to{opacity:.7;transform:scale(1)} }
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes morph       { 0%,100%{border-radius:30% 70% 70% 30% / 30% 30% 70% 70%} 50%{border-radius:70% 30% 30% 70% / 70% 70% 30% 30%} }
        @keyframes gridFade    { from{opacity:.15;transform:scale(.7)} to{opacity:.9;transform:scale(1)} }
        @keyframes orbFloat    { from{transform:translate(-50%,-50%) translateY(0)} to{transform:translate(-50%,-50%) translateY(-14px)} }
        @keyframes starTwinkle { from{opacity:.2;transform:scale(.7)} to{opacity:1;transform:scale(1.2)} }
        @keyframes wordFade    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rippleOut   { to{transform:scale(1.4);opacity:0} }
        @keyframes rippleGrow  { from{width:4px;height:4px;opacity:.6} to{width:80px;height:80px;margin-left:-40px;margin-top:-40px;opacity:0} }
        @keyframes waveBar     { from{transform:scaleY(.25)} to{transform:scaleY(1)} }
        @keyframes nodeGlow    { from{opacity:.3;r:3} to{opacity:1;r:5} }
        @keyframes edgeFade    { from{opacity:.05} to{opacity:.5} }
        @keyframes auroraWave  { from{transform:translateX(-8px) scaleX(.9)} to{transform:translateX(8px) scaleX(1.1)} }
        @keyframes borderRotate{ 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes glitchR     { 0%,90%,100%{transform:none;opacity:0} 91%{transform:translate(-2px,1px);opacity:.8} 93%{transform:translate(2px,-1px);opacity:.8} 95%{transform:none;opacity:0} }
        @keyframes glitchB     { 0%,85%,100%{transform:none;opacity:0} 86%{transform:translate(2px,-1px);opacity:.8} 88%{transform:translate(-2px,1px);opacity:.8} 90%{transform:none;opacity:0} }
        @keyframes emit        { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(calc(cos(var(--a))*30px),calc(sin(var(--a))*30px)) scale(0);opacity:0} }
        @keyframes pulse       { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.5)} }
        @keyframes fadeIn      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", fontFamily: body }}>
        {/* Top spectrum bar */}
        <div style={{ height: 2, background: "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)", backgroundSize: "200%", animation: "gradShift 4s linear infinite" }} />

        {/* Nav */}
        <nav style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid #0d0d0d", position: "sticky", top: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {STOPS.map(c => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
            </div>
            <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 16, color: "#f0f0f0", letterSpacing: "-0.02em" }}>BlackRoad</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e" }}>Animations</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ fontFamily: mono }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{filtered.length} components</span>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ padding: "60px 28px 40px", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 16 }}>
            BlackRoad · Animation Library · v1.0
          </div>
          <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: "clamp(36px,6vw,64px)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16 }}>
            <span style={{ background: GRAD, backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradShift 3s linear infinite" }}>
              Motion.
            </span>{" "}
            <span style={{ color: "#f0f0f0" }}>Built into the brand.</span>
          </h1>
          <p style={{ fontFamily: body, fontSize: 15, color: "#2a2a2a", lineHeight: 1.8 }}>
            {ALL_ANIMS.length} copy-paste animations. Click any card to reveal the code.
          </p>
        </div>

        {/* Category pills */}
        <div style={{ padding: "0 28px 40px", display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ fontFamily: mono, fontSize: 10, color: cat === c ? "#f0f0f0" : "#2a2a2a", background: cat === c ? "#141414" : "none", border: `1px solid ${cat === c ? "#2a2a2a" : "#0d0d0d"}`, padding: "5px 14px", borderRadius: 20, cursor: "pointer", transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ padding: "0 28px 100px", maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8 }}>
          {filtered.map((a, i) => (
            <div key={a.title} style={{ animation: `fadeIn 0.3s ease ${i * 0.03}s both` }}>
              <AnimCard title={a.title} tag={a.tag} accent={a.accent} code={a.code}>
                {a.el}
              </AnimCard>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #0a0a0a", padding: "24px 28px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>BlackRoad OS · Animation Library</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#0d0d0d" }}>Z:=yx−w · 2026</span>
        </div>
      </div>
    </>
  );
}
