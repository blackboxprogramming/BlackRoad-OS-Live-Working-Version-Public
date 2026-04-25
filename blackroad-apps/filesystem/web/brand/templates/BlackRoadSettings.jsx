import { useState, useEffect, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Sidebar nav ─────────────────────────────────────────────────
const NAV = [
  { id: "profile",    label: "Profile",         icon: "◈" },
  { id: "account",    label: "Account",         icon: "◉" },
  { id: "apikeys",    label: "API Keys",        icon: "⬡" },
  { id: "agents",     label: "Agents",          icon: "△" },
  { id: "security",   label: "Security",        icon: "▣" },
  { id: "webhooks",   label: "Webhooks",        icon: "⟳" },
  { id: "billing",    label: "Billing",         icon: "◇" },
  { id: "danger",     label: "Danger Zone",     icon: "⚠", danger: true },
];

// ─── Mock API keys ────────────────────────────────────────────────
const INIT_KEYS = [
  { id: "k1", name: "Production",   prefix: "br_live_a3Kx", created: "Jan 12, 2026", last: "2 min ago",  scopes: ["agents:read","agents:write","events:publish"] },
  { id: "k2", name: "Staging",      prefix: "br_live_mZ9q", created: "Feb 04, 2026", last: "1 hr ago",   scopes: ["agents:read","events:publish"] },
  { id: "k3", name: "CI / Testing", prefix: "br_test_vL2p", created: "Mar 01, 2026", last: "3 days ago", scopes: ["agents:read"] },
];

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
  const copy = () => { navigator.clipboard?.writeText(val).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return [copied, copy];
}

// ─── Shared primitives ────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 8 }}>{children}</div>;
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#e8e8e8", letterSpacing: "-0.02em", marginBottom: 4 }}>{title}</h2>
      {sub && <p style={{ fontFamily: inter, fontSize: 13, color: "#3a3a3a", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#0f0f0f", margin: "28px 0" }} />;
}

function Input({ label, value, onChange, placeholder, mono: isMono, type = "text", hint }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
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
          outline: "none", padding: "10px 14px",
          fontFamily: isMono ? mono : inter,
          fontSize: isMono ? 12 : 14,
          color: "#c0c0c0",
          transition: "border-color 0.15s",
        }}
      />
      {hint && <div style={{ fontFamily: inter, fontSize: 11, color: "#2a2a2a", marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ label, sub, value, onChange, color = "#4488FF" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "14px 0", borderBottom: "1px solid #0d0d0d" }}>
      <div>
        <div style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0", marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontFamily: inter, fontSize: 11, color: "#2e2e2e" }}>{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 40, height: 22, borderRadius: 11, flexShrink: 0,
          background: value ? color : "#111",
          border: `1px solid ${value ? color + "88" : "#1a1a1a"}`,
          cursor: "pointer", position: "relative", transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <div style={{
          position: "absolute", top: 2, left: value ? 19 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: value ? "#fff" : "#2a2a2a",
          transition: "left 0.18s, background 0.18s",
        }} />
      </button>
    </div>
  );
}

function SaveBar({ dirty, onSave, onDiscard, saving }) {
  if (!dirty) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, animation: "slideUp 0.2s ease both", boxShadow: "0 8px 32px rgba(0,0,0,0.8)", minWidth: 320 }}>
      <span style={{ fontFamily: inter, fontSize: 13, color: "#484848", flex: 1 }}>Unsaved changes</span>
      <button onClick={onDiscard} style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "7px 14px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#888"}
        onMouseLeave={e => e.currentTarget.style.color = "#333"}
      >Discard</button>
      <button onClick={onSave} style={{ fontFamily: mono, fontSize: 9, color: "#f0f0f0", background: saving ? "#111" : "#4488FF", border: "none", padding: "7px 16px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "background 0.15s" }}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

// ─── Profile section ──────────────────────────────────────────────
function ProfileSection() {
  const [name,     setName]    = useState("Alexa Amundson");
  const [handle,   setHandle]  = useState("alexa");
  const [bio,      setBio]     = useState("Founder of BlackRoad OS. Building sovereign AI infrastructure.");
  const [url,      setUrl]     = useState("blackroad.io");
  const [timezone, setTZ]      = useState("America/Chicago");
  const [dirty,    setDirty]   = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [saved,    setSaved]   = useState(false);

  const mark = (fn) => (...args) => { fn(...args); setDirty(true); setSaved(false); };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false); setDirty(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <SectionHead title="Profile" sub="Public-facing information attached to your developer identity." />

      {/* Avatar */}
      <div style={{ marginBottom: 28 }}>
        <Label>Avatar</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, background: "#0d0d0d", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: GRAD, opacity: 0.12 }} />
            <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 22, color: "#e0e0e0", letterSpacing: "-0.02em", position: "relative" }}>AA</span>
          </div>
          <div>
            <button style={{ fontFamily: mono, fontSize: 9, color: "#484848", background: "none", border: "1px solid #1a1a1a", padding: "7px 14px", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.15s, border-color 0.15s", display: "block", marginBottom: 6 }}
              onMouseEnter={e => { e.currentTarget.style.color = "#c0c0c0"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#484848"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
            >Upload image</button>
            <div style={{ fontFamily: inter, fontSize: 11, color: "#242424" }}>PNG, JPG · max 2MB</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 0 }}>
        <div style={{ paddingRight: 16 }}>
          <Input label="Display name" value={name} onChange={mark(setName)} placeholder="Your name" />
        </div>
        <div>
          <Input label="Username" value={handle} onChange={mark(setHandle)} placeholder="handle" mono hint="blackroad.io/@handle" />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Label>Bio</Label>
        <textarea
          value={bio}
          onChange={e => { mark(setBio)(e.target.value); }}
          rows={3}
          style={{ width: "100%", background: "#080808", border: "1px solid #141414", outline: "none", padding: "10px 14px", fontFamily: inter, fontSize: 14, color: "#c0c0c0", resize: "vertical", lineHeight: 1.6, minHeight: 80 }}
        />
        <div style={{ fontFamily: inter, fontSize: 11, color: "#2a2a2a", marginTop: 5 }}>{bio.length} / 160 characters</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 0 }}>
        <div style={{ paddingRight: 16 }}>
          <Input label="Website" value={url} onChange={mark(setUrl)} placeholder="yoursite.io" />
        </div>
        <div>
          <Input label="Timezone" value={timezone} onChange={mark(setTZ)} placeholder="UTC" mono />
        </div>
      </div>

      {saved && (
        <div style={{ fontFamily: mono, fontSize: 10, color: "#00D4FF", marginTop: -8, marginBottom: 12 }}>✓ Changes saved</div>
      )}

      <SaveBar dirty={dirty} onSave={save} onDiscard={() => { setDirty(false); }} saving={saving} />
    </div>
  );
}

// ─── API Keys section ─────────────────────────────────────────────
function ApiKeysSection() {
  const [keys, setKeys]       = useState(INIT_KEYS);
  const [creating, setCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey]   = useState(null);
  const [revoke, setRevoke]   = useState(null);

  const createKey = () => {
    if (!newName.trim()) return;
    const fake = "br_live_" + Math.random().toString(36).slice(2, 14);
    setNewKey({ name: newName, full: fake });
    setKeys(prev => [{ id: Date.now().toString(), name: newName, prefix: fake.slice(0, 12), created: "Mar 08, 2026", last: "never", scopes: ["agents:read"] }, ...prev]);
    setNewName(""); setCreate(false);
  };

  return (
    <div>
      <SectionHead title="API Keys" sub="Manage keys used to authenticate requests to the BlackRoad API." />

      {/* New key reveal */}
      {newKey && (
        <div style={{ background: "#00D4FF08", border: "1px solid #00D4FF22", padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>New key created — copy it now, it won't be shown again</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <code style={{ fontFamily: mono, fontSize: 12, color: "#909090", flex: 1, wordBreak: "break-all" }}>{newKey.full}</code>
            <CopyBtn val={newKey.full} />
          </div>
          <button onClick={() => setNewKey(null)} style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "none", cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>I've saved it, dismiss</button>
        </div>
      )}

      {/* Create form */}
      {creating ? (
        <div style={{ background: "#080808", border: "1px solid #141414", padding: "16px 18px", marginBottom: 20 }}>
          <Label>Key name</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createKey(); if (e.key === "Escape") setCreate(false); }}
              placeholder="e.g. Production"
              style={{ flex: 1, background: "#050505", border: "1px solid #1a1a1a", outline: "none", padding: "9px 12px", fontFamily: inter, fontSize: 13, color: "#c0c0c0" }}
            />
            <button onClick={createKey} style={{ fontFamily: mono, fontSize: 9, color: "#f0f0f0", background: "#4488FF", border: "none", padding: "9px 16px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>Create</button>
            <button onClick={() => setCreate(false)} style={{ fontFamily: mono, fontSize: 9, color: "#444", background: "none", border: "1px solid #1a1a1a", padding: "9px 14px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCreate(true)}
          style={{ fontFamily: mono, fontSize: 9, color: "#4488FF", background: "none", border: "1px solid #4488FF33", padding: "9px 16px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#4488FF0d"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >+ New API key</button>
      )}

      {/* Key list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {keys.map(k => (
          <KeyRow key={k.id} k={k} onRevoke={() => setRevoke(k.id)} />
        ))}
      </div>

      {/* Revoke confirm */}
      {revoke && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#080808", border: "1px solid #1a1a1a", padding: "28px 28px", maxWidth: 380, width: "100%" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 17, color: "#e0e0e0", marginBottom: 10 }}>Revoke API key?</div>
            <p style={{ fontFamily: inter, fontSize: 13, color: "#484848", lineHeight: 1.65, marginBottom: 24 }}>
              This key will stop working immediately. Any services using it will fail. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setKeys(prev => prev.filter(k => k.id !== revoke)); setRevoke(null); }}
                style={{ fontFamily: mono, fontSize: 9, color: "#f0f0f0", background: "#FF2255", border: "none", padding: "9px 18px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>Revoke</button>
              <button onClick={() => setRevoke(null)}
                style={{ fontFamily: mono, fontSize: 9, color: "#444", background: "none", border: "1px solid #1a1a1a", padding: "9px 14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KeyRow({ k, onRevoke }) {
  const [show, setShow] = useState(false);
  const [copied, copy] = useCopy(k.prefix + "••••••••••••");
  return (
    <div style={{ background: "#080808", border: "1px solid #0f0f0f", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0", marginBottom: 4 }}>{k.name}</div>
          <code style={{ fontFamily: mono, fontSize: 11, color: "#3a3a3a" }}>{show ? k.prefix + "••••••••••••" : k.prefix.slice(0,8) + "…"}</code>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", textAlign: "right" }}>
            <div>Created {k.created}</div>
            <div>Used {k.last}</div>
          </div>
          <button onClick={() => setShow(s => !s)} style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "5px 10px", cursor: "pointer", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}
          >{show ? "Hide" : "Show"}</button>
          <CopyBtn val={k.prefix + "xxxxxxxxxxxx"} />
          <button onClick={onRevoke} style={{ fontFamily: mono, fontSize: 9, color: "#FF2255", background: "none", border: "1px solid #FF225522", padding: "5px 10px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#FF22550d"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >Revoke</button>
        </div>
      </div>
      {/* Scopes */}
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {k.scopes.map(s => (
          <span key={s} style={{ fontFamily: mono, fontSize: 9, color: "#8844FF", background: "#8844FF12", border: "1px solid #8844FF22", padding: "2px 8px", letterSpacing: "0.04em" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function CopyBtn({ val }) {
  const [copied, copy] = useCopy(val);
  return (
    <button onClick={copy} style={{ fontFamily: mono, fontSize: 9, color: copied ? "#00D4FF" : "#333", background: "none", border: "1px solid #1a1a1a", padding: "5px 10px", cursor: "pointer", transition: "color 0.15s" }}>
      {copied ? "✓" : "Copy"}
    </button>
  );
}

// ─── Security section ─────────────────────────────────────────────
function SecuritySection() {
  const [twofa,  setTwofa]  = useState(true);
  const [sso,    setSso]    = useState(false);
  const [audit,  setAudit]  = useState(true);
  const [alerts, setAlerts] = useState(true);

  const sessions = [
    { device: "MacBook Pro · Chrome", location: "Chicago, IL", time: "Active now",   current: true  },
    { device: "iPhone 16 · Safari",   location: "Chicago, IL", time: "2 hrs ago",    current: false },
    { device: "CLI · blackroad-cli",  location: "localhost",   time: "Yesterday",    current: false },
  ];

  return (
    <div>
      <SectionHead title="Security" sub="Manage authentication, active sessions, and security alerts." />

      <div style={{ marginBottom: 28 }}>
        <Label>Authentication</Label>
        <div style={{ background: "#080808", border: "1px solid #0f0f0f" }}>
          <Toggle label="Two-factor authentication"   sub="TOTP via authenticator app"    value={twofa}  onChange={setTwofa}  color="#00D4FF" />
          <Toggle label="SSO / SAML"                  sub="Enterprise single sign-on"     value={sso}    onChange={setSso}    color="#4488FF" />
          <Toggle label="Audit log"                   sub="Log all API and UI actions"    value={audit}  onChange={setAudit}  color="#8844FF" />
          <Toggle label="Security alerts via email"   sub="Notify on new device sign-ins" value={alerts} onChange={setAlerts} color="#4488FF" />
        </div>
      </div>

      <Divider />

      <div>
        <Label>Active sessions</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sessions.map((s, i) => (
            <div key={i} style={{ background: "#080808", border: "1px solid #0f0f0f", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.current ? "#00D4FF" : "#1a1a1a", flexShrink: 0, animation: s.current ? "dotPing 1.5s ease-in-out infinite" : "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0" }}>{s.device}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{s.location} · {s.time}</div>
              </div>
              {s.current
                ? <span style={{ fontFamily: mono, fontSize: 9, color: "#00D4FF44" }}>this session</span>
                : <button style={{ fontFamily: mono, fontSize: 9, color: "#FF2255", background: "none", border: "1px solid #FF225522", padding: "4px 10px", cursor: "pointer" }}>Revoke</button>
              }
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <div>
        <Label>Password</Label>
        <button style={{ fontFamily: mono, fontSize: 9, color: "#484848", background: "none", border: "1px solid #1a1a1a", padding: "9px 16px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.15s, border-color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#c0c0c0"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#484848"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
        >Change password →</button>
      </div>
    </div>
  );
}

// ─── Agents section ───────────────────────────────────────────────
function AgentsSection() {
  const agents = [
    { name: "Lucidia",   role: "Cognition · Memory",    status: "running",  model: "llama3.2",    color: "#8844FF" },
    { name: "BlackBot",  role: "Orchestration",         status: "degraded", model: "mistral",     color: "#FF6B2B" },
    { name: "Aura",      role: "Intelligence",          status: "running",  model: "gemma2",      color: "#4488FF" },
    { name: "Sentinel",  role: "Security · Monitoring", status: "running",  model: "phi4",        color: "#00D4FF" },
  ];
  const [memory, setMemory]   = useState(true);
  const [autoScale, setAuto]  = useState(false);
  const [logging, setLogging] = useState(true);

  return (
    <div>
      <SectionHead title="Agents" sub="Configure your agent fleet — models, memory, and runtime behaviour." />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {agents.map(a => {
          const statusColor = a.status === "running" ? "#00D4FF" : "#FF6B2B";
          return (
            <div key={a.name} style={{ background: "#080808", border: "1px solid #0f0f0f", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 3, height: 36, background: a.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: grotesk, fontWeight: 600, fontSize: 14, color: "#d0d0d0", marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{a.role}</div>
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#2a2a2a" }}>{a.model}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                <span style={{ fontFamily: mono, fontSize: 9, color: statusColor }}>{a.status}</span>
              </div>
              <button style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "5px 10px", cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#888"}
                onMouseLeave={e => e.currentTarget.style.color = "#333"}
              >Configure</button>
            </div>
          );
        })}
      </div>

      <Divider />
      <Label>Runtime settings</Label>
      <div style={{ background: "#080808", border: "1px solid #0f0f0f" }}>
        <Toggle label="Persistent memory"    sub="PS-SHA∞ append-only journal across sessions" value={memory}   onChange={setMemory}   color="#8844FF" />
        <Toggle label="Auto-scale workers"   sub="Spawn sub-agents on high task load"           value={autoScale}onChange={setAuto}     color="#4488FF" />
        <Toggle label="Verbose agent logs"   sub="Stream full reasoning traces to log pipeline" value={logging}  onChange={setLogging}  color="#00D4FF" />
      </div>
    </div>
  );
}

// ─── Danger zone ──────────────────────────────────────────────────
function DangerSection() {
  const [confirm, setConfirm] = useState("");
  const [open, setOpen]       = useState(null);

  const actions = [
    { id: "export",  label: "Export all data",      sub: "Download a full archive of your account data, agents, and keys.", btn: "Export",          color: "#4488FF" },
    { id: "pause",   label: "Pause all agents",     sub: "Immediately stop all running agents. Can be restarted at any time.", btn: "Pause agents",   color: "#FF6B2B" },
    { id: "delete",  label: "Delete workspace",     sub: "Permanently delete your workspace. All data is irrecoverable.", btn: "Delete workspace",color: "#FF2255" },
  ];

  return (
    <div>
      <SectionHead title="Danger Zone" sub="Irreversible actions. Proceed with caution." />
      <div style={{ border: "1px solid #FF225518", overflow: "hidden" }}>
        {actions.map((a, i) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: i < actions.length - 1 ? "1px solid #FF225510" : "none", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: inter, fontSize: 13, color: "#c0c0c0", marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontFamily: inter, fontSize: 12, color: "#2e2e2e" }}>{a.sub}</div>
            </div>
            <button onClick={() => setOpen(a.id)}
              style={{ fontFamily: mono, fontSize: 9, color: a.color, background: "none", border: `1px solid ${a.color}33`, padding: "8px 16px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "background 0.15s", flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = a.color + "0d"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >{a.btn}</button>
          </div>
        ))}
      </div>

      {open === "delete" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#080808", border: "1px solid #FF225522", padding: "28px", maxWidth: 400, width: "100%" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#e0e0e0", marginBottom: 10 }}>Delete workspace?</div>
            <p style={{ fontFamily: inter, fontSize: 13, color: "#484848", lineHeight: 1.65, marginBottom: 20 }}>
              This will permanently delete all your data, agents, API keys, and logs. Type <span style={{ fontFamily: mono, fontSize: 12, color: "#FF2255" }}>delete my workspace</span> to confirm.
            </p>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="delete my workspace"
              style={{ width: "100%", background: "#050505", border: "1px solid #1a1a1a", outline: "none", padding: "10px 12px", fontFamily: mono, fontSize: 12, color: "#c0c0c0", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button disabled={confirm !== "delete my workspace"}
                style={{ fontFamily: mono, fontSize: 9, color: "#f0f0f0", background: confirm === "delete my workspace" ? "#FF2255" : "#1a1a1a", border: "none", padding: "9px 18px", cursor: confirm === "delete my workspace" ? "pointer" : "not-allowed", textTransform: "uppercase", letterSpacing: "0.08em", transition: "background 0.2s" }}
              >Delete forever</button>
              <button onClick={() => { setOpen(null); setConfirm(""); }}
                style={{ fontFamily: mono, fontSize: 9, color: "#444", background: "none", border: "1px solid #1a1a1a", padding: "9px 14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Placeholder section ──────────────────────────────────────────
function PlaceholderSection({ title, sub }) {
  return (
    <div>
      <SectionHead title={title} sub={sub} />
      <div style={{ background: "#080808", border: "1px dashed #141414", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#1e1e1e" }}>Section coming soon</div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadSettings() {
  const [active, setActive]   = useState("profile");
  const [menuOpen, setMenu]   = useState(false);
  const w = useWidth();
  const desktop = w >= 800;
  const mobile  = w < 640;

  const CONTENT = {
    profile:  <ProfileSection />,
    account:  <PlaceholderSection title="Account" sub="Organization details, plan, and seat management." />,
    apikeys:  <ApiKeysSection />,
    agents:   <AgentsSection />,
    security: <SecuritySection />,
    webhooks: <PlaceholderSection title="Webhooks" sub="Configure endpoints to receive real-time event payloads." />,
    billing:  <PlaceholderSection title="Billing" sub="Manage your subscription, invoices, and payment methods." />,
    danger:   <DangerSection />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        button, input, textarea { appearance: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);   }
          50%       { opacity: 0.45; transform: scaleY(0.6);}
        }
        @keyframes dotPing {
          0%, 100% { opacity: 1;   transform: scale(1);   }
          50%       { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(12px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        input::placeholder, textarea::placeholder { color: #242424; }
        input:focus, textarea:focus { border-color: #2a2a2a !important; }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, background: "rgba(0,0,0,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {!desktop && (
                <button onClick={() => setMenu(o => !o)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>☰</button>
              )}
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => (
                  <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
                ))}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#252525" }}>· Settings</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, background: "#0d0d0d", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: GRAD, opacity: 0.14 }} />
                <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 10, color: "#d0d0d0", position: "relative" }}>AA</span>
              </div>
              {!mobile && <span style={{ fontFamily: mono, fontSize: 10, color: "#2e2e2e" }}>alexa</span>}
            </div>
          </nav>
        </div>

        {/* ── Mobile drawer ────────────────────────────────────── */}
        {!desktop && menuOpen && (
          <>
            <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.8)" }} />
            <div style={{ position: "fixed", top: 54, left: 0, bottom: 0, width: 220, zIndex: 160, background: "#040404", borderRight: "1px solid #141414", overflowY: "auto", animation: "slideIn 0.2s ease" }}>
              <SidebarNav active={active} setActive={(id) => { setActive(id); setMenu(false); }} />
            </div>
          </>
        )}

        {/* ── Layout ───────────────────────────────────────────── */}
        <div style={{ display: "flex", minHeight: "calc(100vh - 54px)" }}>
          {desktop && (
            <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid #0a0a0a", position: "sticky", top: 54, height: "calc(100vh - 54px)", overflowY: "auto" }}>
              <SidebarNav active={active} setActive={setActive} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ maxWidth: 680, padding: desktop ? "44px 40px 100px" : "28px 16px 100px" }}>
              {CONTENT[active]}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

function SidebarNav({ active, setActive }) {
  return (
    <div style={{ padding: "20px 0 40px" }}>
      {NAV.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{
              width: "100%", textAlign: "left",
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 16px",
              background: isActive ? "#0d0d0d" : "none",
              borderLeft: isActive ? `2px solid ${item.danger ? "#FF2255" : "#4488FF"}` : "2px solid transparent",
              border: "none", cursor: "pointer", transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#080808"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
          >
            <span style={{ fontFamily: mono, fontSize: 11, color: isActive ? (item.danger ? "#FF2255" : "#4488FF") : "#242424", width: 14, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontFamily: inter, fontSize: 13, color: isActive ? (item.danger ? "#FF6666" : "#d0d0d0") : item.danger ? "#FF225544" : "#484848" }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
