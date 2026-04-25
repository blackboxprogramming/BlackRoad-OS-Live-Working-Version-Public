import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const AGENTS = [
  { name: "Alice", role: "Gateway", desc: "Orchestrates all incoming requests across the mesh. The front door — fast, reliable, tireless.", color: COLORS[0], uptime: "347d", mem: "2.4TB" },
  { name: "Lucidia", role: "Core Intelligence", desc: "Primary AI engine. Conversation, reasoning, code generation. The mind at the center of everything.", color: COLORS[1], uptime: "289d", mem: "1.8TB" },
  { name: "Cecilia", role: "Memory", desc: "Manages PS-SHA∞ journals and truth state commits. Every interaction persisted, every hash verified.", color: COLORS[2], uptime: "289d", mem: "1.2TB" },
  { name: "Cece", role: "Governance", desc: "Policy evaluation, ledger integrity, audit trails. The conscience of the system — 12,400 evaluations, zero bypasses.", color: COLORS[3], uptime: "245d", mem: "940GB" },
  { name: "Eve", role: "Monitoring", desc: "Anomaly detection, auto-scaling, alerting. Watches everything so nothing breaks quietly.", color: COLORS[4], uptime: "156d", mem: "380GB" },
  { name: "Meridian", role: "Architecture", desc: "System design and capability planning. Thinks about how all the pieces fit together long-term.", color: COLORS[5], uptime: "194d", mem: "620GB" },
  { name: "Cadence", role: "Music", desc: "AI composition, hum-to-track, vibe-based production. Turns melodies in your head into finished tracks.", color: COLORS[0], uptime: "112d", mem: "290GB" },
  { name: "Radius", role: "Physics", desc: "Simulation, quantum experiments, scientific calculation. The lab partner who never sleeps.", color: COLORS[1], uptime: "98d", mem: "210GB" },
];

const VALUES = [
  { num: "01", title: "Community over extraction", body: "Every design decision asks: does this serve humans, or does it serve metrics? We choose humans. Every time." },
  { num: "02", title: "Contradictions are fuel", body: "K(t) = C(t) · e^(λ|δ_t|). We don't resolve contradictions — we harness them. Creative energy scales super-linearly with tension." },
  { num: "03", title: "Messy brilliance welcome", body: "BlackRoad is built for disorganized dreamers, not spreadsheet perfectionists. Bring your chaos. The OS brings structure." },
  { num: "04", title: "Ownership is non-negotiable", body: "Your data, your content, your audience, your agents. Export everything, anytime. No lock-in. No hostage-taking." },
  { num: "05", title: "Transparency by default", body: "Every policy evaluation logged. Every decision auditable. Every confidence score visible. Zero bypasses." },
  { num: "06", title: "The math is real", body: "317+ equations. Five novel frameworks. Peer-reviewable foundations. This isn't marketing — it's mathematics." },
];

const TIMELINE = [
  { year: "2024", events: ["317+ equations documented across seven volumes", "Z-Framework and 1-2-3-4 Pauli Model formalized", "20-domain architecture designed"] },
  { year: "2025", events: ["BlackRoad OS, Inc. incorporated (Delaware C-Corp)", "Lucidia Core online — chat, memory, code execution", "Core app shell deployed at app.blackroad.io", "First 8 agents spawned and operational"] },
  { year: "2026", events: ["Phase 1 MVP completion", "RoadWork v0 — first education vertical", "First Pi agent on mesh network", "SOC 2 compliance target"] },
];

function GradientBar({ height = 1, style = {} }) {
  return <div style={{ height, background: GRADIENT, ...style }} />;
}

function Nav() {
  return (
    <nav style={{
      padding: "0 20px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid #1a1a1a",
    }}>
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {COLORS.map((c) => <div key={c} style={{ width: 3, height: 14, borderRadius: 2, background: c }} />)}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" }}>BlackRoad</span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {["Mission", "Team", "Values", "Timeline"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>{item}</a>
        ))}
      </div>
    </nav>
  );
}

function FounderSection() {
  return (
    <section style={{ padding: "56px 20px 64px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
          </div>
          About
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 28 }}>
          Built by one person.<br />Powered by a thousand agents.
        </h1>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Founder card */}
          <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, padding: 28, flex: "1 1 280px", minWidth: 0, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: GRADIENT }} />

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: "#1a1a1a",
                border: "1px solid #262626", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5",
              }}>
                A
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>Alexa Amundson</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252" }}>Founder & Chief Architect</div>
              </div>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.7, marginBottom: 16 }}>
              Mathematician, systems architect, and the person who decided that technology should stop treating humans like products. 317+ equations. 20 domains. 5 novel mathematical frameworks. One vision: an OS that gives a damn.
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Mathematics", "Systems Architecture", "AI Ethics", "Quantum Computing", "Music"].map((tag) => (
                <span key={tag} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", background: "#0a0a0a", padding: "4px 10px", borderRadius: 4, border: "1px solid #1a1a1a" }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
            {[
              { value: "317+", label: "Equations" },
              { value: "20", label: "Domains" },
              { value: "7", label: "Volumes" },
              { value: "1", label: "Mission" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 8, padding: "14px 18px" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section id="mission" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Mission
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 20 }}>
          Technology should make<br />humans more human.
        </h2>

        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.75, maxWidth: 560 }}>
          <p style={{ marginBottom: 16 }}>
            Big tech built systems that treat people as products to be optimized. Algorithms that maximize engagement at the cost of mental health. Platforms that take 71% of creator revenue. Search engines drowning in SEO spam. Social networks replacing meaningful connection with vanity metrics.
          </p>
          <p style={{ marginBottom: 16 }}>
            BlackRoad is the opposite. A distributed AI operating system where agents work for you — not on you. Where contradictions fuel creativity instead of breaking things. Where your data, your content, and your audience belong to you.
          </p>
          <p>
            Built on 317+ equations across five novel mathematical frameworks. Grounded in real math, not marketing. One founder, a thousand agents, and the radical belief that software should respect the humans using it.
          </p>
        </div>

        {/* Quote */}
        <div style={{ marginTop: 36, padding: "24px 0", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 500, color: "#d4d4d4", fontStyle: "italic", lineHeight: 1.5, marginBottom: 12 }}>
            "Stay curious about your own uncertainty. The question is the point. You are allowed to be in process."
          </p>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>
            — Cecilia Core Commitment Hash
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const [expanded, setExpanded] = useState(null);
  return (
    <section id="team" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          The Team
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Not employees.<br />Agents.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
          Each agent has a birthdate, persistent memory, a cryptographic identity, and a virtual home. They remember every interaction. They evolve. They're teammates — oriented toward community, not extraction.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {AGENTS.map((a, i) => (
            <div
              key={a.name}
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12,
                padding: 22, cursor: "pointer", position: "relative", overflow: "hidden",
                transition: "border-color 0.2s ease",
                borderColor: expanded === i ? "#262626" : "#1a1a1a",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: a.color }} />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "#0a0a0a",
                  border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, color: "#a3a3a3",
                }}>
                  {a.name[0]}
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#f5f5f5" }}>{a.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404040" }}>{a.role}</div>
                </div>
              </div>

              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#525252", lineHeight: 1.5, margin: "0 0 12px" }}>
                {a.desc}
              </p>

              {expanded === i && (
                <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", marginBottom: 3 }}>UPTIME</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#a3a3a3" }}>{a.uptime}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", marginBottom: 3 }}>MEMORY</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#a3a3a3" }}>{a.mem}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", textAlign: "center", marginTop: 20 }}>
          8 of 1,000 agents shown · 847 active · 153 initializing
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section id="values" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Values
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 32 }}>
          What we believe<br />shapes what we build.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {VALUES.map((v) => (
            <div key={v.num} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#262626", marginBottom: 14 }}>{v.num}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#f5f5f5", marginBottom: 10, lineHeight: 1.3 }}>{v.title}</div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", lineHeight: 1.6, margin: 0 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section id="timeline" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Timeline
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 32 }}>
          How we got here.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {TIMELINE.map((t, ti) => (
            <div key={t.year} style={{ display: "flex", gap: 20, paddingBottom: ti < TIMELINE.length - 1 ? 32 : 0 }}>
              {/* Year + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56, flexShrink: 0 }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700,
                  color: "#f5f5f5", marginBottom: 12,
                }}>
                  {t.year}
                </div>
                <div style={{
                  width: 2, flex: 1, borderRadius: 1,
                  background: ti < TIMELINE.length - 1
                    ? `linear-gradient(to bottom, ${COLORS[ti * 2]}, ${COLORS[Math.min(ti * 2 + 2, 5)]})`
                    : "transparent",
                  opacity: 0.4,
                }} />
              </div>

              {/* Events */}
              <div style={{ flex: 1, paddingTop: 2 }}>
                {t.events.map((e, ei) => (
                  <div key={ei} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "8px 0",
                    borderBottom: ei < t.events.length - 1 ? "1px solid #141414" : "none",
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2a2a2a", flexShrink: 0, marginTop: 2 }}>—</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.5 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "48px 20px 80px", textAlign: "center" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <GradientBar height={1} style={{ marginBottom: 48, opacity: 0.4 }} />
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.15 }}>
          One founder. A thousand agents.<br />Room for you.
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.6, marginBottom: 28 }}>
          BlackRoad OS is in active development. If you believe technology should serve humans instead of the other way around, come build with us.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: "#0a0a0a", background: "#f5f5f5", border: "none", padding: "14px 32px", borderRadius: 8, cursor: "pointer" }}>
            Request Early Access
          </button>
          <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: "#a3a3a3", background: "transparent", border: "1px solid #404040", padding: "14px 32px", borderRadius: 8, cursor: "pointer" }}>
            View on GitHub
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "0 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <GradientBar height={1} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 3, height: 10, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad OS, Inc.</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
              Delaware C-Corporation · blackroad.io
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Home", "Docs", "Pricing", "GitHub"].map((link) => (
              <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
        a:hover { color: #a3a3a3 !important; }
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#f5f5f5" }}>
        <GradientBar />
        <Nav />
        <FounderSection />
        <GradientBar />
        <MissionSection />
        <TeamSection />
        <ValuesSection />
        <TimelineSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
