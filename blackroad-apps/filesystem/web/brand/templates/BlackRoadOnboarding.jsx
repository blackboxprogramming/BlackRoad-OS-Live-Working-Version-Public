import { useState, useEffect, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Steps ────────────────────────────────────────────────────────
const STEPS = [
  { id: "welcome",     label: "Welcome",       icon: "◈" },
  { id: "workspace",   label: "Workspace",     icon: "⬡" },
  { id: "cluster",     label: "Cluster",       icon: "△" },
  { id: "agents",      label: "Agents",        icon: "◉" },
  { id: "apikey",      label: "API Key",       icon: "▣" },
  { id: "launch",      label: "Launch",        icon: "→" },
];

const AGENT_OPTIONS = [
  { id: "lucidia",  name: "Lucidia",   role: "Cognition · Memory",     color: "#8844FF", rec: true  },
  { id: "blackbot", name: "BlackBot",  role: "Orchestration · Tasks",  color: "#4488FF", rec: true  },
  { id: "aura",     name: "Aura",      role: "Intelligence · Analysis",color: "#00D4FF", rec: false },
  { id: "sentinel", name: "Sentinel",  role: "Security · Monitoring",  color: "#FF2255", rec: false },
];

const CLUSTER_PRESETS = [
  { id: "local",  label: "Local K3s",        sub: "Single-node on your machine",  icon: "◈", color: "#8844FF" },
  { id: "remote", label: "Remote Cluster",   sub: "Connect existing K3s endpoint",icon: "⬡", color: "#4488FF" },
  { id: "auto",   label: "Auto-provision",   sub: "We spin it up for you",        icon: "△", color: "#00D4FF", badge: "beta" },
];

const MODEL_OPTIONS = ["llama3.2", "llama3.1", "mistral", "gemma2", "phi4", "qwen2.5"];

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

function useCopy(val) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(val).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  return [copied, copy];
}

// ─── Shared primitives ────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 8 }}>{children}</div>;
}

function FieldInput({ label, value, onChange, placeholder, mono: isMono, hint, type = "text" }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label>{label}</Label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%", background: "#080808",
          border: `1px solid ${focus ? "#2a2a2a" : "#141414"}`,
          outline: "none", padding: "11px 14px",
          fontFamily: isMono ? mono : inter,
          fontSize: isMono ? 12 : 14,
          color: "#c0c0c0",
          transition: "border-color 0.15s",
        }}
      />
      {hint && <div style={{ fontFamily: inter, fontSize: 11, color: "#242424", marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function NextBtn({ onClick, label = "Continue →", disabled = false, loading = false }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: mono, fontSize: 10,
        color: disabled ? "#2a2a2a" : "#f0f0f0",
        background: disabled ? "#0a0a0a" : GRAD,
        backgroundSize: "200% 100%",
        animation: disabled ? "none" : "gradShift 4s linear infinite",
        border: disabled ? "1px solid #1a1a1a" : "none",
        padding: "12px 28px",
        cursor: disabled ? "not-allowed" : "pointer",
        textTransform: "uppercase", letterSpacing: "0.1em",
        opacity: hover && !disabled ? 0.88 : 1,
        transition: "opacity 0.15s",
        minWidth: 160,
      }}
    >{loading ? "Working…" : label}</button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", padding: "12px 0", transition: "color 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.color = "#888"}
      onMouseLeave={e => e.currentTarget.style.color = "#2e2e2e"}
    >← Back</button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────
function StepBar({ current, total }) {
  const pct = ((current) / (total - 1)) * 100;
  return (
    <div style={{ height: 2, background: "#0d0d0d", position: "relative" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: GRAD, backgroundSize: "400% 100%", animation: "gradShift 4s linear infinite", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────
function StepDots({ currentIdx }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {STEPS.map((s, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: active ? 28 : 7, height: 7, borderRadius: 4,
              background: done ? "#4488FF44" : active ? "#4488FF" : "#111",
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Code block ───────────────────────────────────────────────────
function CodeBlock({ lines, copyVal }) {
  const [copied, copy] = useCopy(copyVal || lines.join("\n"));
  return (
    <div style={{ background: "#050505", border: "1px solid #141414", overflow: "hidden", margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 12px", borderBottom: "1px solid #0d0d0d" }}>
        <button onClick={copy} style={{ fontFamily: mono, fontSize: 9, color: copied ? "#00D4FF" : "#2a2a2a", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.2s" }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{ fontFamily: mono, fontSize: 12, color: "#555", lineHeight: 1.9, padding: "14px 16px", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {lines.join("\n")}
      </pre>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────

function StepWelcome({ data, setData, onNext }) {
  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      {/* Big logo mark */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
        {STOPS.map((c, i) => (
          <div key={c} style={{ width: 5, height: 52, background: c, borderRadius: 2, animation: `barPulse 2s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
      </div>

      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 14 }}>BlackRoad OS · Setup</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(28px, 6vw, 44px)", color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 16 }}>
        Welcome to<br />BlackRoad OS.
      </h1>
      <p style={{ fontFamily: inter, fontSize: 15, color: "#3a3a3a", lineHeight: 1.75, maxWidth: 440, marginBottom: 36 }}>
        Sovereign infrastructure. Sentient agents. Spatial interfaces. This wizard gets you from zero to running in under 5 minutes.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40, maxWidth: 400 }}>
        {[
          ["01", "Set up your workspace identity"],
          ["02", "Connect or provision a K3s cluster"],
          ["03", "Choose your agent fleet"],
          ["04", "Generate your first API key"],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", width: 20 }}>{n}</span>
            <span style={{ fontFamily: inter, fontSize: 13, color: "#484848" }}>{t}</span>
          </div>
        ))}
      </div>

      <NextBtn onClick={onNext} label="Get started →" />
    </div>
  );
}

function StepWorkspace({ data, setData, onNext, onBack }) {
  const valid = data.workspaceName.trim().length >= 2 && data.email.includes("@");
  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Step 1 · Workspace</div>
      <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Name your workspace</h2>
      <p style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a", lineHeight: 1.7, marginBottom: 32 }}>This identifies your BlackRoad OS instance and appears in all logs, dashboards, and API responses.</p>

      <FieldInput
        label="Workspace name"
        value={data.workspaceName}
        onChange={v => setData(d => ({ ...d, workspaceName: v }))}
        placeholder="acme-ai"
        mono
        hint={data.workspaceName ? `blackroad.io/${data.workspaceName.toLowerCase().replace(/\s+/g, "-")}` : ""}
      />
      <FieldInput
        label="Admin email"
        value={data.email}
        onChange={v => setData(d => ({ ...d, email: v }))}
        placeholder="you@yourcompany.io"
        type="email"
      />

      <div style={{ marginBottom: 18 }}>
        <Label>Region</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {["us-central", "eu-west", "ap-south"].map(r => {
            const active = data.region === r;
            return (
              <button key={r} onClick={() => setData(d => ({ ...d, region: r }))}
                style={{ fontFamily: mono, fontSize: 10, color: active ? "#d0d0d0" : "#333", background: active ? "#0d0d0d" : "#080808", border: `1px solid ${active ? "#2a2a2a" : "#111"}`, padding: "10px 0", cursor: "pointer", transition: "all 0.15s", textAlign: "center" }}
              >{r}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 32 }}>
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} disabled={!valid} />
      </div>
    </div>
  );
}

function StepCluster({ data, setData, onNext, onBack }) {
  const [testing, setTesting] = useState(false);
  const [tested,  setTested]  = useState(false);

  const testConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1400));
    setTesting(false);
    setTested(true);
  };

  const valid = data.clusterType && (data.clusterType !== "remote" || (data.kubeEndpoint && tested));

  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Step 2 · Cluster</div>
      <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Connect your cluster</h2>
      <p style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a", lineHeight: 1.7, marginBottom: 32 }}>BlackRoad OS runs on K3s. Choose how you want to connect.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {CLUSTER_PRESETS.map(p => {
          const active = data.clusterType === p.id;
          return (
            <button key={p.id} onClick={() => { setData(d => ({ ...d, clusterType: p.id })); setTested(false); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: active ? "#0a0a0a" : "#080808", border: `1px solid ${active ? p.color + "44" : "#111"}`, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s" }}
            >
              <div style={{ width: 2, height: 32, background: active ? p.color : "#1a1a1a", transition: "background 0.2s", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: active ? "#d0d0d0" : "#484848" }}>{p.label}</span>
                  {p.badge && <span style={{ fontFamily: mono, fontSize: 8, color: "#FF6B2B", background: "#FF6B2B18", border: "1px solid #FF6B2B28", padding: "2px 6px" }}>{p.badge}</span>}
                </div>
                <div style={{ fontFamily: inter, fontSize: 12, color: "#2a2a2a" }}>{p.sub}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1px solid ${active ? p.color : "#1a1a1a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Local setup instructions */}
      {data.clusterType === "local" && (
        <div style={{ animation: "fadeUp 0.25s ease both" }}>
          <Label>Install K3s locally</Label>
          <CodeBlock lines={["curl -sfL https://get.k3s.io | sh -", "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml"]} />
        </div>
      )}

      {/* Remote endpoint */}
      {data.clusterType === "remote" && (
        <div style={{ animation: "fadeUp 0.25s ease both" }}>
          <FieldInput
            label="K3s API endpoint"
            value={data.kubeEndpoint}
            onChange={v => { setData(d => ({ ...d, kubeEndpoint: v })); setTested(false); }}
            placeholder="https://alice:6443"
            mono
          />
          <FieldInput
            label="Node token"
            value={data.nodeToken}
            onChange={v => setData(d => ({ ...d, nodeToken: v }))}
            placeholder="K3S_TOKEN value from server"
            mono
            type="password"
          />
          <button onClick={testConnection} disabled={!data.kubeEndpoint || testing}
            style={{ fontFamily: mono, fontSize: 9, color: tested ? "#00D4FF" : "#4488FF", background: "none", border: `1px solid ${tested ? "#00D4FF33" : "#4488FF33"}`, padding: "8px 16px", cursor: data.kubeEndpoint && !testing ? "pointer" : "not-allowed", textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.15s", marginBottom: 12 }}
          >{testing ? "Testing…" : tested ? "✓ Connected" : "Test connection"}</button>
        </div>
      )}

      {/* Auto */}
      {data.clusterType === "auto" && (
        <div style={{ animation: "fadeUp 0.25s ease both", background: "#080808", border: "1px solid #00D4FF18", padding: "14px 16px" }}>
          <span style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a" }}>We'll provision a K3s cluster in your selected region after setup completes. No additional config needed.</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 32 }}>
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} disabled={!valid} />
      </div>
    </div>
  );
}

function StepAgents({ data, setData, onNext, onBack }) {
  const toggle = (id) => setData(d => ({
    ...d,
    agents: d.agents.includes(id) ? d.agents.filter(a => a !== id) : [...d.agents, id],
  }));

  const valid = data.agents.length > 0;

  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Step 3 · Agent fleet</div>
      <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Choose your agents</h2>
      <p style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a", lineHeight: 1.7, marginBottom: 32 }}>Select which agents to activate. You can add or remove agents any time after setup.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {AGENT_OPTIONS.map(a => {
          const selected = data.agents.includes(a.id);
          return (
            <button key={a.id} onClick={() => toggle(a.id)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: selected ? "#0a0a0a" : "#080808", border: `1px solid ${selected ? a.color + "44" : "#111"}`, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s" }}
            >
              <div style={{ width: 2, height: 36, background: selected ? a.color : "#1a1a1a", transition: "background 0.2s", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: selected ? "#d0d0d0" : "#484848" }}>{a.name}</span>
                  {a.rec && <span style={{ fontFamily: mono, fontSize: 8, color: a.color, background: a.color + "18", border: `1px solid ${a.color}28`, padding: "2px 6px" }}>recommended</span>}
                </div>
                <div style={{ fontFamily: inter, fontSize: 12, color: "#2a2a2a" }}>{a.role}</div>
              </div>
              {/* Model selector */}
              <select
                value={data.models[a.id] || MODEL_OPTIONS[0]}
                onChange={e => { e.stopPropagation(); setData(d => ({ ...d, models: { ...d.models, [a.id]: e.target.value } })); }}
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: mono, fontSize: 9, color: "#484848", background: "#050505", border: "1px solid #1a1a1a", padding: "5px 8px", cursor: "pointer", outline: "none" }}
              >
                {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {/* Checkbox */}
              <div style={{ width: 18, height: 18, border: `1px solid ${selected ? a.color : "#1a1a1a"}`, background: selected ? a.color + "22" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                {selected && <span style={{ fontFamily: mono, fontSize: 10, color: a.color }}>✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} disabled={!valid} />
      </div>
    </div>
  );
}

function StepApiKey({ data, setData, onNext, onBack }) {
  const FAKE_KEY = "br_live_" + "a3Kx9mZ2pQvL8rYt".slice(0, 16);
  const [copied, copy] = useCopy(FAKE_KEY);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Step 4 · API Key</div>
      <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Your first API key</h2>
      <p style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a", lineHeight: 1.7, marginBottom: 32 }}>This key authenticates all SDK and API requests from your workspace. Copy and store it securely — it won't be shown again.</p>

      <div style={{ background: "#FF6B2B08", border: "1px solid #FF6B2B1a", padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#FF6B2B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>⚠ Copy this key now</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <code style={{ fontFamily: mono, fontSize: 13, color: "#909090", flex: 1, wordBreak: "break-all" }}>{FAKE_KEY}</code>
          <button onClick={copy}
            style={{ fontFamily: mono, fontSize: 9, color: copied ? "#00D4FF" : "#484848", background: "none", border: `1px solid ${copied ? "#00D4FF33" : "#1a1a1a"}`, padding: "7px 14px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s", flexShrink: 0 }}
          >{copied ? "✓ Copied" : "Copy"}</button>
        </div>
      </div>

      <Label>Use in your project</Label>
      <CodeBlock
        lines={[`export BR_API_KEY="${FAKE_KEY}"`]}
        copyVal={`export BR_API_KEY="${FAKE_KEY}"`}
      />

      <FieldInput
        label="Key name (optional)"
        value={data.keyName}
        onChange={v => setData(d => ({ ...d, keyName: v }))}
        placeholder="Production"
      />

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 24, padding: "12px 14px", background: "#080808", border: "1px solid #111", cursor: "pointer" }}
        onClick={() => setConfirmed(c => !c)}>
        <div style={{ width: 16, height: 16, border: `1px solid ${confirmed ? "#4488FF" : "#1a1a1a"}`, background: confirmed ? "#4488FF22" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
          {confirmed && <span style={{ fontFamily: mono, fontSize: 10, color: "#4488FF" }}>✓</span>}
        </div>
        <span style={{ fontFamily: inter, fontSize: 13, color: "#484848", lineHeight: 1.5 }}>I've saved my API key somewhere safe</span>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} disabled={!confirmed} label="Complete setup →" />
      </div>
    </div>
  );
}

function StepLaunch({ data }) {
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks]       = useState([
    { label: "Creating workspace",      done: false },
    { label: "Connecting cluster",      done: false },
    { label: "Provisioning agents",     done: false },
    { label: "Configuring API key",     done: false },
    { label: "Running health checks",   done: false },
  ]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= tasks.length) { setComplete(true); return; }
      setTimeout(() => {
        setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: true } : t));
        setProgress(((i + 1) / tasks.length) * 100);
        i++;
        tick();
      }, 600 + Math.random() * 400);
    };
    tick();
  }, []);

  return (
    <div style={{ animation: "fadeUp 0.35s ease both" }}>
      {!complete ? (
        <>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Launching</div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Setting things up…</h2>
          <p style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a", lineHeight: 1.7, marginBottom: 32 }}>This usually takes under a minute.</p>

          {/* Progress */}
          <div style={{ height: 2, background: "#0d0d0d", marginBottom: 28, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: GRAD, backgroundSize: "400% 100%", animation: "gradShift 2s linear infinite", transition: "width 0.5s ease" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0a0a0a" }}>
                <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {t.done
                    ? <span style={{ fontFamily: mono, fontSize: 11, color: "#00D4FF" }}>✓</span>
                    : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a1a1a" }} />
                  }
                </div>
                <span style={{ fontFamily: inter, fontSize: 13, color: t.done ? "#c0c0c0" : "#2e2e2e", transition: "color 0.3s" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          {/* Success */}
          <div style={{ display: "flex", gap: 3, marginBottom: 28 }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: 4, height: 40, background: c, borderRadius: 2 }} />
            ))}
          </div>
          <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 32, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 10 }}>
            You're live.
          </h2>
          <p style={{ fontFamily: inter, fontSize: 14, color: "#3a3a3a", lineHeight: 1.75, marginBottom: 32, maxWidth: 420 }}>
            <strong style={{ color: "#d0d0d0" }}>{data.workspaceName || "Your workspace"}</strong> is running on BlackRoad OS with {data.agents.length} agent{data.agents.length !== 1 ? "s" : ""} active.
          </p>

          {/* Summary */}
          <div style={{ background: "#080808", border: "1px solid #111", marginBottom: 28 }}>
            {[
              ["Workspace",  data.workspaceName || "—"],
              ["Region",     data.region || "us-central"],
              ["Cluster",    data.clusterType || "local"],
              ["Agents",     data.agents.join(", ") || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 16, padding: "11px 16px", borderBottom: "1px solid #0a0a0a" }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a", width: 90, flexShrink: 0 }}>{k}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#666" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Next steps */}
          <Label>What's next</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 32 }}>
            {[
              ["→ Docs",       "Read the full BlackRoad OS documentation"],
              ["→ Dashboard",  "Monitor your agents in real-time"],
              ["→ API",        "Explore the REST API reference"],
            ].map(([link, desc]) => (
              <div key={link} style={{ display: "flex", gap: 14, padding: "11px 14px", background: "#080808", border: "1px solid #0d0d0d", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1a1a"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#0d0d0d"}
              >
                <span style={{ fontFamily: mono, fontSize: 10, color: "#4488FF", flexShrink: 0, width: 96 }}>{link}</span>
                <span style={{ fontFamily: inter, fontSize: 13, color: "#383838" }}>{desc}</span>
              </div>
            ))}
          </div>

          <button style={{ fontFamily: mono, fontSize: 10, color: "#f0f0f0", background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite", border: "none", padding: "13px 32px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Open dashboard →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadOnboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    workspaceName: "",
    email: "",
    region: "us-central",
    clusterType: "",
    kubeEndpoint: "",
    nodeToken: "",
    agents: ["lucidia", "blackbot"],
    models: {},
    keyName: "",
  });

  const w       = useWidth();
  const mobile  = w < 640;
  const isLast  = step === STEPS.length - 1;

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const STEP_CONTENT = [
    <StepWelcome   key="welcome"   data={data} setData={setData} onNext={next} />,
    <StepWorkspace key="workspace" data={data} setData={setData} onNext={next} onBack={back} />,
    <StepCluster   key="cluster"   data={data} setData={setData} onNext={next} onBack={back} />,
    <StepAgents    key="agents"    data={data} setData={setData} onNext={next} onBack={back} />,
    <StepApiKey    key="apikey"    data={data} setData={setData} onNext={next} onBack={back} />,
    <StepLaunch    key="launch"    data={data} />,
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        button, input, select { appearance: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        input::placeholder { color: #242424; }
        input:focus { outline: none; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);    }
          50%       { opacity: 0.45; transform: scaleY(0.55); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <StepBar current={step} total={STEPS.length} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, borderBottom: "1px solid #0d0d0d" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => (
                  <div key={c} style={{ width: 2, height: 14, background: c, borderRadius: 2 }} />
                ))}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 14, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
            </div>
            {/* Step dots + counter */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {!mobile && <StepDots currentIdx={step} />}
              <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{step + 1} / {STEPS.length}</span>
            </div>
          </div>
        </div>

        {/* ── Layout ───────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Left sidebar (desktop) */}
          {!mobile && (
            <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #0a0a0a", padding: "32px 0", display: "flex", flexDirection: "column", gap: 2 }}>
              {STEPS.map((s, i) => {
                const done   = i < step;
                const active = i === step;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderLeft: active ? "2px solid #4488FF" : "2px solid transparent", transition: "border-color 0.2s" }}>
                    <span style={{ fontFamily: mono, fontSize: 11, color: done ? "#4488FF66" : active ? "#4488FF" : "#1a1a1a", width: 14, transition: "color 0.2s" }}>{s.icon}</span>
                    <span style={{ fontFamily: inter, fontSize: 13, color: done ? "#3a3a3a" : active ? "#d0d0d0" : "#242424", transition: "color 0.2s" }}>{s.label}</span>
                    {done && <span style={{ fontFamily: mono, fontSize: 10, color: "#4488FF44", marginLeft: "auto" }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Main content */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 560, padding: mobile ? "36px 16px 60px" : "52px 40px 80px" }}>
              {STEP_CONTENT[step]}
            </div>
          </div>

          {/* Right gutter decoration (desktop) */}
          {!mobile && (
            <div style={{ width: 220, flexShrink: 0, borderLeft: "1px solid #0a0a0a", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Z-framework</div>
              <div style={{ fontFamily: mono, fontSize: 18, color: "#161616", letterSpacing: "-0.02em", lineHeight: 1.4 }}>Z:=yx−w</div>
              <div style={{ height: 1, background: "#0a0a0a", margin: "8px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Sovereign","Sentient","Spatial"].map((w, i) => (
                  <div key={w} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 2, height: 14, background: STOPS[i * 2], borderRadius: 1 }} />
                    <span style={{ fontFamily: inter, fontSize: 11, color: "#1e1e1e" }}>{w}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "#0a0a0a", margin: "8px 0" }} />
              <div style={{ fontFamily: mono, fontSize: 9, color: "#141414", lineHeight: 1.8 }}>
                {["Alice · gateway","Octavia · hailo","K3s · cluster"].map(l => <div key={l}>{l}</div>)}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
