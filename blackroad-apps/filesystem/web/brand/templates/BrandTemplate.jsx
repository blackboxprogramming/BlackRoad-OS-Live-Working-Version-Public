import { useState, useEffect } from "react";

const COLORS = [
  { hex: "#FF6B2B", name: "Ember",  token: "--accent-1", stop: 0   },
  { hex: "#FF2255", name: "Fuse",   token: "--accent-2", stop: 20  },
  { hex: "#CC00AA", name: "Pulse",  token: "--accent-3", stop: 40  },
  { hex: "#8844FF", name: "Drift",  token: "--accent-4", stop: 60  },
  { hex: "#4488FF", name: "Signal", token: "--accent-5", stop: 80  },
  { hex: "#00D4FF", name: "Arc",    token: "--accent-6", stop: 100 },
];

const GRAYS = [
  { hex: "#0a0a1a", name: "Void",    label: "950" },
  { hex: "#10102a", name: "Abyss",   label: "900" },
  { hex: "#16163a", name: "Deep",    label: "800" },
  { hex: "#252545", name: "Dusk",    label: "700" },
  { hex: "#40406a", name: "Mid",     label: "500" },
  { hex: "#7070a0", name: "Mist",    label: "400" },
  { hex: "#a8a8c8", name: "Haze",    label: "300" },
  { hex: "#e8e8f0", name: "Frost",   label: "100" },
];

const TYPE_SAMPLES = [
  { label: "Display",  font: "'Space Grotesk', sans-serif", weight: 700, size: 40, text: "BlackRoad OS" },
  { label: "Heading",  font: "'Space Grotesk', sans-serif", weight: 600, size: 28, text: "Agent Infrastructure" },
  { label: "Body",     font: "'Inter', sans-serif",         weight: 400, size: 16, text: "A distributed AI operating system built for the next generation of intelligent products." },
  { label: "Label",    font: "'Inter', sans-serif",         weight: 600, size: 12, text: "SYSTEM STATUS · ACTIVE" },
  { label: "Code",     font: "'JetBrains Mono', monospace", weight: 400, size: 13, text: "Z := yx − w  →  equilibrium reached" },
  { label: "Mono",     font: "'JetBrains Mono', monospace", weight: 500, size: 11, text: "RC:0x4200 · PS-SHA∞ · QBFT-4200" },
];

const GRADIENT = `linear-gradient(90deg, ${COLORS.map(c => c.hex).join(", ")})`;

function GradientBar({ height = 2, glow = false }) {
  return (
    <div style={{
      height,
      background: GRADIENT,
      ...(glow ? { boxShadow: "0 0 24px rgba(255,100,40,0.5), 0 0 48px rgba(136,68,255,0.3)" } : {}),
    }} />
  );
}

function SectionTab({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        background: active ? "rgba(136,68,255,0.15)" : "transparent",
        border: active ? "1px solid rgba(136,68,255,0.4)" : "1px solid rgba(100,140,255,0.08)",
        color: active ? "#e8e8f0" : "#7070a0",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "8px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
        ...(active ? { boxShadow: "0 0 16px rgba(136,68,255,0.2)" } : {}),
      }}
    >
      {label}
    </button>
  );
}

function ColorChip({ color, mono = false }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(color.hex).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const isLight = parseInt(color.hex.slice(1, 3), 16) > 180;

  return (
    <div
      onClick={copy}
      style={{
        background: color.hex,
        minWidth: 130,
        padding: "20px 16px",
        cursor: "pointer",
        position: "relative",
        transition: "transform 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        ...(mono ? {} : { boxShadow: `0 0 20px ${color.hex}55` }),
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: isLight ? "#0a0a1a" : "#e8e8f0" }}>
        {color.name}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isLight ? "#25254580" : "#e8e8f080" }}>
        {color.hex.toUpperCase()}
      </div>
      {color.token && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: isLight ? "#25254560" : "#e8e8f060", marginTop: 2 }}>
          {color.token}
        </div>
      )}
      {copied && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: color.hex + "ee", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
          color: isLight ? "#0a0a1a" : "#e8e8f0",
        }}>
          COPIED
        </div>
      )}
    </div>
  );
}

function PaletteSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#e8e8f0" }}>Accent Spectrum</span>
          <div style={{ flex: 1, height: 1, background: "rgba(100,140,255,0.08)" }} />
        </div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {COLORS.map(c => <ColorChip key={c.hex} color={c} />)}
        </div>
        <div style={{ marginTop: 16, height: 6, background: GRADIENT, boxShadow: "0 0 32px rgba(136,68,255,0.4)" }} />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#e8e8f0" }}>Surface Scale</span>
          <div style={{ flex: 1, height: 1, background: "rgba(100,140,255,0.08)" }} />
        </div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {GRAYS.map(c => (
            <ColorChip key={c.hex} color={{ ...c, name: `${c.name} · ${c.label}` }} mono />
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#e8e8f0" }}>Gradient Stops</span>
          <div style={{ flex: 1, height: 1, background: "rgba(100,140,255,0.08)" }} />
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {COLORS.map((c, i) => (
            <div key={c.hex} style={{
              flex: 1,
              background: `linear-gradient(90deg, ${c.hex}, ${COLORS[i + 1]?.hex ?? c.hex})`,
              height: 64,
              display: "flex", alignItems: "flex-end", padding: "8px 10px",
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#e8e8f0cc", fontWeight: 500 }}>
                {c.stop}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypeSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {TYPE_SAMPLES.map((s, i) => (
        <div key={i} style={{
          background: "#10102a",
          border: "1px solid rgba(100,140,255,0.08)",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}>
          <div style={{ minWidth: 72 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#40406a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#40406a", marginTop: 4 }}>
              {s.size}px / {s.weight}
            </div>
          </div>
          <div style={{ flex: 1, height: 1, background: "rgba(100,140,255,0.06)" }} />
          <div style={{ flex: 4, fontFamily: s.font, fontWeight: s.weight, fontSize: s.size, color: "#e8e8f0", lineHeight: 1.3 }}>
            {s.text}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 32, padding: "24px 32px", background: "#10102a", border: "1px solid rgba(100,140,255,0.08)" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#40406a", letterSpacing: "0.08em", marginBottom: 16 }}>
          FONT IMPORT · GOOGLE FONTS
        </div>
        <pre style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7070a0", margin: 0,
          background: "#08081a", padding: 20, overflowX: "auto", lineHeight: 1.7,
          border: "1px solid rgba(100,140,255,0.06)",
        }}>
{`@import url('https://fonts.googleapis.com/css2?
  family=Space+Grotesk:wght@600;700&
  family=Inter:wght@400;500;600&
  family=JetBrains+Mono:wght@400;500&
  display=swap');`}
        </pre>
      </div>
    </div>
  );
}

function TokenSection() {
  const tokens = [
    { group: "Background",  rows: [
      ["--bg-base",   "#0a0a1a", "Root surface"],
      ["--bg-card",   "#10102a", "Card/panel surface"],
      ["--bg-code",   "#08081a", "Code block surface"],
      ["--bg-hover",  "#16163a", "Hover state"],
    ]},
    { group: "Text",  rows: [
      ["--text-primary",   "#e8e8f0", "Primary content"],
      ["--text-secondary", "#a8a8c8", "Supporting content"],
      ["--text-muted",     "#7070a0", "Labels / meta"],
      ["--text-disabled",  "#40406a", "Disabled states"],
    ]},
    { group: "Border", rows: [
      ["--border-default", "rgba(100,140,255,0.08)", "Default border"],
      ["--border-active",  "rgba(255,100,40,0.2)",   "Active/focused border"],
      ["--border-glow",    "rgba(136,68,255,0.4)",   "Glow border"],
    ]},
    { group: "Accent", rows: COLORS.map(c => [c.token, c.hex, c.name]) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {tokens.map(g => (
        <div key={g.group}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#e8e8f0", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            {g.group}
          </div>
          <div style={{ border: "1px solid rgba(100,140,255,0.08)" }}>
            {g.rows.map(([token, value, desc], i) => (
              <div key={token} style={{
                display: "grid", gridTemplateColumns: "200px 1fr 1fr",
                alignItems: "center",
                padding: "12px 20px",
                borderBottom: i < g.rows.length - 1 ? "1px solid rgba(100,140,255,0.06)" : "none",
                background: i % 2 === 0 ? "#10102a" : "#0a0a1a",
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#4488FF" }}>{token}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, background: value, border: "1px solid rgba(255,255,255,0.1)" }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7070a0" }}>{value}</span>
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#40406a" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComponentSection() {
  const [toggled, setToggled] = useState(false);
  const agents = [
    { name: "Alice",    role: "Gateway",    color: "#FF6B2B", status: "active" },
    { name: "Lucidia",  role: "Companion",  color: "#CC00AA", status: "active" },
    { name: "Cecilia",  role: "Governance", color: "#8844FF", status: "active" },
    { name: "Meridian", role: "Architect",  color: "#4488FF", status: "idle"   },
    { name: "Eve",      role: "Security",   color: "#FF2255", status: "alert"  },
    { name: "Radius",   role: "Math/Phys",  color: "#00D4FF", status: "idle"   },
  ];

  const statusColor = { active: "#00D4FF", idle: "#40406a", alert: "#FF2255" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Buttons */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#40406a", letterSpacing: "0.1em", marginBottom: 16 }}>BUTTONS</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["Primary", "Ghost", "Danger", "Arc"].map((label, i) => {
            const styles = [
              { background: "#e8e8f0", color: "#0a0a1a", border: "1px solid transparent" },
              { background: "transparent", color: "#a8a8c8", border: "1px solid rgba(100,140,255,0.2)" },
              { background: "rgba(255,34,85,0.12)", color: "#FF2255", border: "1px solid rgba(255,34,85,0.3)", boxShadow: "0 0 12px rgba(255,34,85,0.15)" },
              { background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.3)", boxShadow: "0 0 12px rgba(0,212,255,0.2)" },
            ];
            return (
              <button key={label} style={{
                ...styles[i], padding: "10px 24px", fontFamily: "'Inter', sans-serif",
                fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "0.04em",
              }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#40406a", letterSpacing: "0.1em", marginBottom: 16 }}>TOGGLE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div onClick={() => setToggled(!toggled)} style={{
            width: 48, height: 26, background: toggled ? "rgba(136,68,255,0.3)" : "#10102a",
            border: toggled ? "1px solid rgba(136,68,255,0.6)" : "1px solid rgba(100,140,255,0.15)",
            position: "relative", cursor: "pointer", transition: "all 0.2s",
            ...(toggled ? { boxShadow: "0 0 14px rgba(136,68,255,0.35)" } : {}),
          }}>
            <div style={{
              position: "absolute", top: 3, left: toggled ? 24 : 3, width: 18, height: 18,
              background: toggled ? "#8844FF" : "#40406a", transition: "all 0.2s",
            }} />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: toggled ? "#e8e8f0" : "#7070a0" }}>
            {toggled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* Input */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#40406a", letterSpacing: "0.1em", marginBottom: 16 }}>INPUT</div>
        <input
          defaultValue="Z := yx − w"
          style={{
            background: "#08081a", border: "1px solid rgba(100,140,255,0.15)",
            color: "#e8e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
            padding: "12px 18px", width: 320, outline: "none",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(136,68,255,0.5)"; e.target.style.boxShadow = "0 0 16px rgba(136,68,255,0.15)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(100,140,255,0.15)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Agent Grid */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#40406a", letterSpacing: "0.1em", marginBottom: 16 }}>AGENT CARDS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 }}>
          {agents.map(a => (
            <div key={a.name} style={{
              background: "#10102a", border: "1px solid rgba(100,140,255,0.08)",
              padding: "20px 18px", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: a.color, boxShadow: `0 0 16px ${a.color}88`,
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: a.color + "22", border: `1px solid ${a.color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: a.color }}>{a.name[0]}</span>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[a.status], boxShadow: `0 0 8px ${statusColor[a.status]}` }} />
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#e8e8f0" }}>{a.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7070a0", marginTop: 4 }}>{a.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "palette",    label: "Palette"    },
  { id: "typography", label: "Typography" },
  { id: "tokens",     label: "Tokens"     },
  { id: "components", label: "Components" },
];

export default function BrandTemplate() {
  const [active, setActive] = useState("palette");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    if (!document.head.querySelector(`link[href="${link.href}"]`)) document.head.appendChild(link);
  }, []);

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "#e8e8f0", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(100,140,255,0.08)" }}>
        <GradientBar height={3} glow />
        <div style={{ padding: "32px 48px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#40406a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              Design System · v2.0 · Neon Noir
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 42, margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
              BlackRoad{" "}
              <span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Brand System
              </span>
            </h1>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#40406a", textAlign: "right", lineHeight: 2 }}>
            <div>6 accents · 8 surfaces</div>
            <div>3 typefaces · PS-SHA∞</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(100,140,255,0.08)", padding: "0 48px" }}>
        {SECTIONS.map(s => (
          <SectionTab key={s.id} id={s.id} label={s.label} active={active === s.id} onClick={setActive} />
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "48px" }}>
        {active === "palette"    && <PaletteSection />}
        {active === "typography" && <TypeSection />}
        {active === "tokens"     && <TokenSection />}
        {active === "components" && <ComponentSection />}
      </div>

      <GradientBar height={2} glow />
    </div>
  );
}
