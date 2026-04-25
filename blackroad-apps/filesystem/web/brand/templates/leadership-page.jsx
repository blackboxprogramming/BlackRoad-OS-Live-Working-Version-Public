import { useState } from "react";

const COLORS = ["#FF6B2B", "#FF2255", "#CC00AA", "#8844FF", "#4488FF", "#00D4FF"];
const GRADIENT = `linear-gradient(90deg, ${COLORS.join(", ")})`;

const ORGS = [
  { name: "BlackRoad-OS-Inc", desc: "Enterprise root — data layer, coordination hub", tier: "root" },
  { name: "BlackRoad-OS", desc: "Core operating system, web apps, API gateway", tier: "core" },
  { name: "BlackRoad-Studio", desc: "Creator tools, Unity homes, rendering", tier: "product" },
  { name: "BlackRoad-AI", desc: "AI models, agent frameworks, inference", tier: "product" },
  { name: "BlackRoad-Education", desc: "RoadWork, tutoring, curriculum tools", tier: "product" },
  { name: "BlackRoad-Media", desc: "RoadView, RoadTube, video/audio pipelines", tier: "product" },
  { name: "BlackRoad-Interactive", desc: "Genesis Road, RoadWorld, game engine", tier: "product" },
  { name: "BlackRoad-Cloud", desc: "Infrastructure, K3s clusters, edge compute", tier: "infra" },
  { name: "BlackRoad-Security", desc: "Auth, encryption, PS-SHA∞, identity", tier: "infra" },
  { name: "BlackRoad-Gov", desc: "Cece governance engine, policy, ledger", tier: "infra" },
  { name: "BlackRoad-Hardware", desc: "Pi mesh fleet, Jetson nodes, edge devices", tier: "infra" },
  { name: "BlackRoad-Labs", desc: "Research, quantum computing, experiments", tier: "research" },
  { name: "BlackRoad-Foundation", desc: "Open source, community, grants", tier: "research" },
  { name: "BlackRoad-Ventures", desc: "Investments, partnerships, ecosystem", tier: "corporate" },
  { name: "BlackRoad-Archive", desc: "Historical docs, conversation archives", tier: "corporate" },
  { name: "Blackbox-Enterprises", desc: "Developer brand, blackboxprogramming.io", tier: "corporate" },
];

const DOMAINS = [
  { domain: "blackroad.io", purpose: "Main OS & product site", tier: "Core" },
  { domain: "blackroad.systems", purpose: "Internal ops, infra, APIs", tier: "Core" },
  { domain: "blackroad.network", purpose: "Agent & device mesh", tier: "Core" },
  { domain: "blackroadinc.us", purpose: "Legal / corporate entity", tier: "Core" },
  { domain: "blackroad.me", purpose: "Founder personal hub", tier: "Core" },
  { domain: "blackroad.company", purpose: "Public corporate site", tier: "Core" },
  { domain: "lucidia.earth", purpose: "Lucidia AI platform", tier: "Product" },
  { domain: "lucidia.studio", purpose: "Creator tools & Unity homes", tier: "Product" },
  { domain: "roadchain.io", purpose: "Blockchain / ledger protocol", tier: "Product" },
  { domain: "roadcoin.io", purpose: "Token / economic layer", tier: "Product" },
  { domain: "blackroadai.com", purpose: "AI-focused marketing", tier: "Product" },
  { domain: "blackboxprogramming.io", purpose: "Developer / creator brand", tier: "Product" },
  { domain: "blackroadquantum.com", purpose: "Quantum research hub", tier: "Quantum" },
  { domain: "blackroadquantum.info", purpose: "Quantum education", tier: "Quantum" },
  { domain: "blackroadquantum.net", purpose: "Quantum network infra", tier: "Quantum" },
  { domain: "blackroadquantum.shop", purpose: "Merch / products", tier: "Quantum" },
  { domain: "blackroadquantum.store", purpose: "Merch / products", tier: "Quantum" },
  { domain: "blackroadqi.com", purpose: "Quantum identity portal", tier: "Quantum" },
  { domain: "lucidiaqi.com", purpose: "Lucidia + QI hybrid", tier: "Quantum" },
  { domain: "aliceqi.com", purpose: "Alice agent identity", tier: "Agent" },
];

const TIER_COLORS = { root: COLORS[0], core: COLORS[1], product: COLORS[2], infra: COLORS[3], research: COLORS[4], corporate: COLORS[5] };

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
        {["Leadership", "Structure", "Domains"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#737373", textDecoration: "none" }}>{item}</a>
        ))}
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{ padding: "56px 20px 64px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {COLORS.map((c) => <div key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
          </div>
          Leadership
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
          One architect.<br />Fifteen organizations.<br />Twenty domains.
        </h1>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.65, maxWidth: 520, marginBottom: 40 }}>
          BlackRoad OS is designed and built by Alexa Amundson — sole founder, mathematician, and systems architect. The organization structure is intentionally deep: intelligent turtles all the way down.
        </p>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section id="leadership" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Founder
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 28 }}>
          Alexa Louise Amundson
        </h2>

        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ height: 2, background: GRADIENT }} />
          <div style={{ padding: 28 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: 14, background: "#1a1a1a",
                border: "1px solid #262626", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: "#f5f5f5",
                flexShrink: 0,
              }}>
                A
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#f5f5f5", marginBottom: 4 }}>Alexa Amundson</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#525252", marginBottom: 12 }}>Founder · CEO · Chief Architect</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>founder@blackroad.systems</div>
              </div>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.7, marginBottom: 16 }}>
              Mathematician and systems architect who authored 317+ equations across seven volumes, formalized five novel mathematical frameworks, and designed a 20-domain, 150+ subdomain infrastructure from scratch. Background in the psychology of advertising and media multitasking under Dr. Claire Segijn at the University of Minnesota.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#737373", lineHeight: 1.7, marginBottom: 20 }}>
              Sole architect of the Z-Framework (Z := yx − w), the 1-2-3-4 Pauli Model mapping ontological primitives to su(2) Lie algebra, the Creative Energy Formula proving contradictions fuel creativity super-linearly, and the PS-SHA∞ memory persistence protocol giving AI agents cryptographic identity.
            </p>

            {/* Roles grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {[
                { title: "Mathematics", items: "317+ equations, 7 volumes, 5 frameworks" },
                { title: "Architecture", items: "20 domains, 150+ subdomains, 4 layers" },
                { title: "Engineering", items: "K3s, NATS, Cloudflare, Pi mesh" },
                { title: "Product", items: "12 products, 6 portals, 1,000 agents" },
              ].map((r) => (
                <div key={r.title} style={{ background: "#0a0a0a", border: "1px solid #151515", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{r.title}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#404040", lineHeight: 1.5 }}>{r.items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corporate info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginTop: 16 }}>
          {[
            { label: "Entity", value: "BlackRoad OS, Inc.", sub: "Delaware C-Corporation" },
            { label: "Established", value: "November 2025", sub: "SOC 2 compliance target" },
            { label: "Headquarters", value: "United States", sub: "blackroadinc.us" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: 18 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#f5f5f5", marginBottom: 2 }}>{c.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#404040" }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrgStructureSection() {
  const [filter, setFilter] = useState("all");
  const tiers = ["all", "root", "core", "product", "infra", "research", "corporate"];
  const filtered = filter === "all" ? ORGS : ORGS.filter((o) => o.tier === filter);

  return (
    <section id="structure" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Organization
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Intelligent turtles<br />all the way down.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 28, maxWidth: 500 }}>
          Fifteen GitHub organizations coordinated through a single enterprise root. Each org owns its domain, its repos, and its deployment pipeline.
        </p>

        {/* Hierarchy visual */}
        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Hierarchy</div>

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2.2 }}>
            <div style={{ color: "#f5f5f5" }}>
              <span style={{ color: COLORS[0] }}>●</span> blackroad-os (enterprise)
            </div>
            <div style={{ paddingLeft: 20, color: "#d4d4d4" }}>
              <span style={{ color: COLORS[1] }}>●</span> BlackRoad-OS-Inc (root org)
            </div>
            <div style={{ paddingLeft: 40, color: "#a3a3a3" }}>
              <span style={{ color: COLORS[2] }}>●</span> BlackRoad-OS (core)
            </div>
            <div style={{ paddingLeft: 60, color: "#737373", display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
              {["Studio", "AI", "Education", "Media", "Interactive"].map((n) => (
                <span key={n}>→ {n}</span>
              ))}
            </div>
            <div style={{ paddingLeft: 60, color: "#525252", display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
              {["Cloud", "Security", "Gov", "Hardware"].map((n) => (
                <span key={n}>→ {n}</span>
              ))}
            </div>
            <div style={{ paddingLeft: 60, color: "#404040", display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
              {["Labs", "Foundation", "Ventures", "Archive"].map((n) => (
                <span key={n}>→ {n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.06em",
                color: filter === t ? "#f5f5f5" : "#404040",
                background: filter === t ? "#1a1a1a" : "transparent",
                border: "1px solid #1a1a1a", borderRadius: 5,
                padding: "5px 12px", cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Org list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
          {filtered.map((o) => (
            <div key={o.name} style={{ background: "#131313", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: TIER_COLORS[o.tier], flexShrink: 0 }} />
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#d4d4d4", marginBottom: 2 }}>{o.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252" }}>{o.desc}</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", background: "#0a0a0a", padding: "3px 8px", borderRadius: 4, border: "1px solid #151515", flexShrink: 0 }}>
                {o.tier}
              </span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginTop: 12, textAlign: "center" }}>
          {filter === "all" ? "16 organizations" : `${filtered.length} ${filter} org${filtered.length !== 1 ? "s" : ""}`} · github.com/enterprises/blackroad-os
        </div>
      </div>
    </section>
  );
}

function DomainsSection() {
  const [tierFilter, setTierFilter] = useState("All");
  const tiers = ["All", "Core", "Product", "Quantum", "Agent"];
  const filtered = tierFilter === "All" ? DOMAINS : DOMAINS.filter((d) => d.tier === tierFilter);

  return (
    <section id="domains" style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Infrastructure
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Twenty domains.<br />One Cloudflare account.
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#737373", lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
          DNS as architecture. Every domain maps to a layer, every subdomain to a service. The URL tells you where you are in the stack.
        </p>

        {/* Filter */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {tiers.map((t) => (
            <button key={t} onClick={() => setTierFilter(t)} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500,
              textTransform: "uppercase", letterSpacing: "0.06em",
              color: tierFilter === t ? "#f5f5f5" : "#404040",
              background: tierFilter === t ? "#1a1a1a" : "transparent",
              border: "1px solid #1a1a1a", borderRadius: 5,
              padding: "5px 12px", cursor: "pointer",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Domain list */}
        <div style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, padding: "10px 20px", borderBottom: "1px solid #1a1a1a" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em" }}>Domain</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em" }}>Purpose</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", width: 60 }}>Tier</span>
          </div>
          {filtered.map((d, i) => (
            <div key={d.domain} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12,
              padding: "10px 20px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none",
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#a3a3a3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.domain}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252" }}>{d.purpose}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#404040", textTransform: "uppercase", width: 60, textAlign: "right" }}>{d.tier}</span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333", marginTop: 12, textAlign: "center" }}>
          {tierFilter === "All" ? "20 domains" : `${filtered.length} ${tierFilter.toLowerCase()} domain${filtered.length !== 1 ? "s" : ""}`} · managed via Cloudflare
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const contacts = [
    { label: "General", value: "admin@blackroad.systems" },
    { label: "Founder", value: "founder@blackroad.systems" },
    { label: "Support", value: "support@blackroad.systems" },
    { label: "Security", value: "security@blackroad.systems" },
    { label: "Billing", value: "billing@blackroad.systems" },
  ];
  return (
    <section style={{ padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
          Contact
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 24 }}>
          Reach the humans<br />(and the agents).
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {contacts.map((c) => (
            <div key={c.label} style={{ background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#a3a3a3", wordBreak: "break-all" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Agent contacts */}
        <div style={{ marginTop: 16, background: "#131313", border: "1px solid #1a1a1a", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Agent Addresses</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { agent: "Cece", addr: "cece@blackroad.systems" },
              { agent: "Alice", addr: "alice@aliceqi.com" },
              { agent: "Lucidia", addr: "core@lucidia.earth" },
            ].map((a) => (
              <div key={a.agent} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#404040" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#525252" }}>{a.agent}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#333" }}>{a.addr}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "0 20px 48px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <GradientBar />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {COLORS.map((c) => <div key={c} style={{ width: 3, height: 10, borderRadius: 2, background: c }} />)}
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: "#a3a3a3" }}>BlackRoad OS, Inc.</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333" }}>
              Delaware C-Corporation · Est. November 2025
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Home", "About", "Docs", "Pricing"].map((link) => (
              <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#525252", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LeadershipPage() {
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
        <HeroSection />
        <GradientBar />
        <FounderSection />
        <OrgStructureSection />
        <DomainsSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
