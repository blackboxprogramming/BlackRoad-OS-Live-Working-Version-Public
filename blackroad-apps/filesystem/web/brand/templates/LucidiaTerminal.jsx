import { useState, useEffect, useRef, useCallback } from "react";

const mono = "'JetBrains Mono', monospace";
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];

// ─── Boot sequence — BlackRoad spectrum colors ───────────────────
const BOOT_LINES = [
  { text: "+ Layer 3 (agents/system) loaded",        color: "#FF6B2B", delay: 120  },
  { text: "+ Layer 4 (deploy/orchestration) loaded", color: "#FF2255", delay: 240  },
  { text: "+ Layer 5 (branches/environments) loaded",color: "#CC00AA", delay: 360  },
  { text: "+ Layer 6 (lucidia core/memory) loaded",  color: "#8844FF", delay: 480  },
  { text: "+ Layer 7 (orchestration) loaded",        color: "#4488FF", delay: 600  },
  { text: "+ Layer 8 (network/API) loaded",          color: "#00D4FF", delay: 720  },
];

// ─── Aliases visible in screenshot ───────────────────────────────
const ALIASES = {
  "br-check":   "curl -sI https://blackroad.io | grep -iE '(x-robots|x-ai|noai|train)'",
  "br-headers": "curl -sI https://blackroad.io | grep -iE '(x-ai|strict-transport|x-frame)'",
  "br-deploy":  "cd ~/blackroad-os-cluster && wrangler deploy",
  "br-logs":    "wrangler tail blackroad-io --format pretty",
  "br-status":  "curl -sI https://blackroad.io && dig blackroad.io +short",
  "lcode":      "lucidia-code",
};

// ─── Known commands & their responses ────────────────────────────
const COMMANDS = {
  help: () => [
    { t: "dim",   v: "BlackRoad CLI v3 · available commands" },
    { t: "gap" },
    { t: "kv",    k: "br-check",    v: "AI crawl policy headers @ blackroad.io"    },
    { t: "kv",    k: "br-headers",  v: "security headers @ blackroad.io"           },
    { t: "kv",    k: "br-deploy",   v: "deploy via wrangler to Cloudflare"         },
    { t: "kv",    k: "br-logs",     v: "tail Cloudflare worker logs"               },
    { t: "kv",    k: "br-status",   v: "curl + dig blackroad.io"                   },
    { t: "kv",    k: "lcode",       v: "open lucidia-code"                         },
    { t: "gap" },
    { t: "kv",    k: "agents",      v: "list active agents"                        },
    { t: "kv",    k: "whoami",      v: "identity + session info"                   },
    { t: "kv",    k: "layers",      v: "show loaded CLI layers"                    },
    { t: "kv",    k: "chain",       v: "latest roadchain state"                    },
    { t: "kv",    k: "memory",      v: "lucidia memory journal status"             },
    { t: "kv",    k: "cluster",     v: "K3s cluster node status"                   },
    { t: "kv",    k: "alias",       v: "list all br- aliases"                      },
    { t: "kv",    k: "pwd",         v: "print working directory"                   },
    { t: "kv",    k: "clear",       v: "clear terminal"                            },
  ],

  pwd: () => [{ t: "out", v: "/Users/alexa" }],

  whoami: () => [
    { t: "out",   v: "blackroad@alexandria" },
    { t: "dim",   v: "session · zsh · BlackRoad CLI v3" },
    { t: "dim",   v: "workspace · blackroad-os · 15 orgs" },
  ],

  layers: () => BOOT_LINES.map(l => ({ t: "green", v: l.text })),

  alias: () => Object.entries(ALIASES).map(([k, v]) => ({ t: "kv", k, v })),

  agents: () => [
    { t: "dim",   v: "active agent fleet ·" },
    { t: "gap" },
    { t: "agent", name: "Lucidia",   role: "cognition · memory",      status: "running", color: "#8844FF" },
    { t: "agent", name: "BlackBot",  role: "orchestration · routing", status: "running", color: "#4488FF" },
    { t: "agent", name: "Aura",      role: "intelligence · analysis", status: "idle",    color: "#00D4FF" },
    { t: "agent", name: "Sentinel",  role: "security · monitoring",   status: "running", color: "#FF2255" },
    { t: "agent", name: "Cecilia",   role: "core · identity",         status: "running", color: "#CC00AA" },
    { t: "agent", name: "Alice",     role: "gateway · routing",       status: "running", color: "#FF6B2B" },
    { t: "gap" },
    { t: "dim",   v: "5/6 running · 1 idle · next: 30,000 agent scale (v2.0)" },
  ],

  chain: () => {
    const h = () => Math.random().toString(16).slice(2).repeat(5).slice(0, 64);
    return [
      { t: "dim",   v: "roadchain · non-terminating witnessing ledger" },
      { t: "gap" },
      { t: "kv",    k: "height",   v: "0x" + Math.floor(Math.random() * 9999 + 200).toString(16).padStart(4,"0") },
      { t: "kv",    k: "latest",   v: h() },
      { t: "kv",    k: "prev",     v: h() },
      { t: "kv",    k: "witnessed", v: (Math.floor(Math.random() * 800) + 200).toString() + " events" },
      { t: "kv",    k: "ledger",   v: "append-only · SHA-256 · non-terminating" },
      { t: "gap" },
      { t: "dim",   v: "Z := yx − w · every state transition hashed" },
    ];
  },

  memory: () => [
    { t: "dim",   v: "lucidia memory journal · PS-SHA-∞" },
    { t: "gap" },
    { t: "kv",    k: "journal",     v: "~/.lucidia/journal.db" },
    { t: "kv",    k: "truth_state", v: "committed · " + new Date().toISOString().slice(0,19) + "Z" },
    { t: "kv",    k: "entries",     v: (Math.floor(Math.random() * 3000) + 800).toString()         },
    { t: "kv",    k: "strategy",    v: "append-only · no silent forget"                             },
    { t: "kv",    k: "recall",      v: "semantic + symbolic keys"                                   },
    { t: "gap" },
    { t: "green", v: "✓ journal healthy · no corruption detected"                                   },
  ],

  cluster: () => [
    { t: "dim",   v: "K3s cluster · alice Pi400 + octavia Pi5 + cecilia Pi5" },
    { t: "gap" },
    { t: "node",  name: "alice",   role: "gateway · Redis · NATS",            ip: "192.168.1.10", status: "Ready", color: "#FF6B2B" },
    { t: "node",  name: "octavia", role: "Hailo-8L · 26 TOPS · LiteLLM",      ip: "192.168.1.11", status: "Ready", color: "#4488FF" },
    { t: "node",  name: "cecilia", role: "Pi5 · Ollama · PS-SHA-∞ journal",   ip: "192.168.1.12", status: "Ready", color: "#CC00AA" },
    { t: "gap" },
    { t: "green", v: "✓ 3/3 nodes Ready · K3s v1.30 · Traefik routing active" },
  ],

  "br-check": () => [
    { t: "dim",   v: "curl -sI https://blackroad.io | grep -iE '(x-robots|x-ai|noai|train)'" },
    { t: "gap" },
    { t: "kv",    k: "x-robots-tag",        v: "noindex, nofollow, noai, noimageai" },
    { t: "kv",    k: "x-ai-restriction",    v: "disallow-training: true"             },
    { t: "gap" },
    { t: "green", v: "✓ AI crawl protection active" },
  ],

  "br-headers": () => [
    { t: "dim",   v: "curl -sI https://blackroad.io | grep -iE '(x-ai|strict-transport|x-frame)'" },
    { t: "gap" },
    { t: "kv",    k: "strict-transport-security", v: "max-age=31536000; includeSubDomains; preload" },
    { t: "kv",    k: "x-frame-options",           v: "DENY"                                         },
    { t: "kv",    k: "x-content-type-options",    v: "nosniff"                                      },
    { t: "kv",    k: "x-ai-restriction",          v: "disallow-training: true"                      },
    { t: "gap" },
    { t: "green", v: "✓ security headers nominal" },
  ],

  "br-status": () => [
    { t: "dim",   v: "curl -sI https://blackroad.io && dig blackroad.io +short" },
    { t: "gap" },
    { t: "kv",    k: "HTTP",    v: "200 OK"              },
    { t: "kv",    k: "server",  v: "cloudflare"          },
    { t: "kv",    k: "dns",     v: "104.21.xx.xx (CF)"   },
    { t: "kv",    k: "latency", v: Math.floor(Math.random() * 40 + 12) + "ms" },
    { t: "gap" },
    { t: "green", v: "✓ blackroad.io reachable · Cloudflare edge healthy" },
  ],

  "br-deploy": () => [
    { t: "dim",   v: "cd ~/blackroad-os-cluster && wrangler deploy" },
    { t: "gap" },
    { t: "out",   v: "⛅ wrangler deploy"                            },
    { t: "out",   v: "Total Upload: 42.3 KiB / gzip: 12.1 KiB"     },
    { t: "out",   v: "Uploaded blackroad-io (1.23 sec)"             },
    { t: "out",   v: "Published blackroad-io (0.41 sec)"            },
    { t: "out",   v: "  https://blackroad.io"                       },
    { t: "gap" },
    { t: "green", v: "✓ deployed to Cloudflare edge" },
  ],

  "br-logs": () => [
    { t: "dim",   v: "wrangler tail blackroad-io --format pretty" },
    { t: "gap" },
    { t: "out",   v: "[" + new Date().toISOString() + "] GET / 200 12ms"   },
    { t: "out",   v: "[" + new Date().toISOString() + "] GET /api 200 8ms" },
    { t: "out",   v: "[" + new Date().toISOString() + "] POST /v1/agents/spawn 201 34ms" },
    { t: "dim",   v: "streaming · ctrl-c to stop" },
  ],

  lcode: () => [
    { t: "dim",   v: "opening lucidia-code…" },
    { t: "out",   v: "lcode=lucidia-code · alias resolved" },
    { t: "green", v: "✓ lucidia-code launched" },
  ],

  clear: () => "CLEAR",

  echo: (args) => [{ t: "out", v: args.join(" ") }],

  "type": (args) => {
    const cmd = args[0];
    if (ALIASES[cmd]) return [{ t: "out", v: `${cmd} is an alias for '${ALIASES[cmd]}'` }];
    if (COMMANDS[cmd]) return [{ t: "out", v: `${cmd} is a shell function` }];
    return [{ t: "err", v: `${cmd}: not found` }];
  },
};

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return w;
}

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

// ─── Render a single output line ─────────────────────────────────
function OutLine({ line }) {
  if (line.t === "gap")   return <div style={{ height: 6 }} />;
  if (line.t === "dim")   return <div style={{ fontFamily: mono, fontSize: 12, color: "#2a2a2a", lineHeight: 1.7 }}>{line.v}</div>;
  if (line.t === "green") return <div style={{ fontFamily: mono, fontSize: 12, color: "#00D4FF", lineHeight: 1.7 }}>{line.v}</div>;
  if (line.t === "err")   return <div style={{ fontFamily: mono, fontSize: 12, color: "#FF2255", lineHeight: 1.7 }}>{line.v}</div>;
  if (line.t === "out")   return <div style={{ fontFamily: mono, fontSize: 12, color: "#686868", lineHeight: 1.7 }}>{line.v}</div>;

  if (line.t === "kv") return (
    <div style={{ display: "flex", gap: 0, lineHeight: 1.7 }}>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#2e2e2e", minWidth: 200, flexShrink: 0 }}>{line.k}</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#686868" }}>{line.v}</span>
    </div>
  );

  if (line.t === "agent") return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", lineHeight: 1.7 }}>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: line.status === "running" ? line.color : "#333", flexShrink: 0 }} />
      <span style={{ fontFamily: mono, fontSize: 12, color: line.color, minWidth: 96, flexShrink: 0 }}>{line.name}</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#2a2a2a", minWidth: 200, flexShrink: 0 }}>{line.role}</span>
      <span style={{ fontFamily: mono, fontSize: 10, color: line.status === "running" ? "#00D4FF" : "#333" }}>{line.status}</span>
    </div>
  );

  if (line.t === "node") return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", lineHeight: 1.7 }}>
      <span style={{ fontFamily: mono, fontSize: 12, color: line.color, minWidth: 80, flexShrink: 0 }}>{line.name}</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#1e1e1e", minWidth: 120, flexShrink: 0 }}>{line.ip}</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#2a2a2a", flex: 1 }}>{line.role}</span>
      <span style={{ fontFamily: mono, fontSize: 10, color: "#00D4FF" }}>{line.status}</span>
    </div>
  );

  return null;
}

// ─── Prompt line ──────────────────────────────────────────────────
function Prompt({ value, onChange, onSubmit, onUp, onDown }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#FF6B2B", flexShrink: 0 }}>blackroad</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#CC00AA", flexShrink: 0 }}>@</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#8844FF", flexShrink: 0 }}>alexandria</span>
      <span style={{ fontFamily: mono, fontSize: 12, color: "#333", flexShrink: 0 }}> ~ $&nbsp;</span>
      <input
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") { e.preventDefault(); onSubmit(value); }
          if (e.key === "ArrowUp")   { e.preventDefault(); onUp();   }
          if (e.key === "ArrowDown") { e.preventDefault(); onDown(); }
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          fontFamily: mono, fontSize: 12, color: "#c0c0c0", caretColor: "#c0c0c0",
          lineHeight: 1.7,
        }}
      />
    </div>
  );
}

// ─── Main terminal ────────────────────────────────────────────────
export default function LucidiaTerminal() {
  const [lines,     setLines]     = useState([]);
  const [input,     setInput]     = useState("");
  const [booted,    setBooted]    = useState(false);
  const [booting,   setBooting]   = useState(true);
  const [bootIdx,   setBootIdx]   = useState(0);
  const [history,   setHistory]   = useState([]);
  const [histIdx,   setHistIdx]   = useState(-1);
  const [tab,       setTab]       = useState(0); // 0 = main terminal, 1 = second pane
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const w = useWidth();
  const mobile = w < 720;

  // ── Boot sequence ────────────────────────────────────────────────
  useEffect(() => {
    let i = 0;
    const run = () => {
      if (i >= BOOT_LINES.length) {
        setTimeout(() => { setBooting(false); setBooted(true); }, 300);
        return;
      }
      setTimeout(() => {
        setBootIdx(i + 1);
        i++;
        run();
      }, BOOT_LINES[i].delay);
    };
    run();
  }, []);

  // ── Scroll to bottom ─────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines, booted]);

  // ── Focus input on click anywhere ────────────────────────────────
  const focusInput = useCallback(() => {
    containerRef.current?.querySelector("input")?.focus();
  }, []);

  // ── Execute command ───────────────────────────────────────────────
  const execute = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Add to history
    setHistory(h => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);

    // Echo prompt + command
    const promptLine = {
      t: "prompt",
      cmd: trimmed,
      ts: timestamp(),
    };

    const [cmd, ...args] = trimmed.split(" ");
    const handler = COMMANDS[cmd.toLowerCase()];
    let output = [];

    if (cmd === "clear") {
      setLines([]);
      setInput("");
      return;
    }

    if (handler) {
      const result = handler(args);
      if (result === "CLEAR") {
        setLines([]);
        setInput("");
        return;
      }
      output = result;
    } else {
      output = [{ t: "err", v: `zsh: command not found: ${cmd}` }];
    }

    setLines(l => [...l, { type: "block", prompt: promptLine, output }]);
    setInput("");
  };

  const histUp = () => {
    const next = Math.min(histIdx + 1, history.length - 1);
    setHistIdx(next);
    setInput(history[next] || "");
  };
  const histDown = () => {
    const next = Math.max(histIdx - 1, -1);
    setHistIdx(next);
    setInput(next === -1 ? "" : history[next]);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #000; overflow: hidden; height: 100%; width: 100%; }
        input { -webkit-appearance: none; }
        ::selection { background: #4488FF33; }
        @keyframes gradShift {
          0%   { background-position: 0%; }
          100% { background-position: 200%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);   }
          50%       { opacity: 0.4; transform: scaleY(0.5); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div style={{ width: "100vw", height: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: mono }}>

        {/* ── macOS-style title bar ─────────────────────────────── */}
      <div style={{ background: "#0a0a0a", minHeight: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite", flexShrink: 0 }} />
        <div style={{ height: 38, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", flexShrink: 0, userSelect: "none" }}>
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {["#FF5F56","#FFBD2E","#27C93F"].map((c, i) => (
              <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, cursor: "pointer" }} />
            ))}
          </div>

          {/* Tab bar — like screenshot */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {["-- GitHub Copilot -- zsh -l", "-- GitHub Copilot -- zsh"].map((label, i) => (
              <button key={i} onClick={() => setTab(i)}
                style={{ fontFamily: mono, fontSize: 11, color: tab === i ? "#c0c0c0" : "#333", background: tab === i ? "#1c1c1c" : "none", border: "none", padding: "4px 14px", cursor: "pointer", borderTop: tab === i ? `1px solid ${STOPS[i * 2]}55` : "1px solid transparent", transition: "all 0.15s" }}
              >{label}</button>
            ))}
            <button style={{ fontFamily: mono, fontSize: 13, color: "#2a2a2a", background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}>+</button>
          </div>

          {/* Spacer */}
          <div style={{ width: 60 }} />
        </div>

        {/* ── Terminal body ─────────────────────────────────────── */}
        <div ref={containerRef} onClick={focusInput} style={{ flex: 1, overflowY: "auto", padding: "12px 16px 8px", cursor: "text", scrollbarWidth: "thin", scrollbarColor: "#1c1c1c #0d0d0d" }}>

          {/* Boot sequence */}
          <div style={{ marginBottom: 4 }}>
            {BOOT_LINES.slice(0, bootIdx).map((l, i) => (
              <div key={i} style={{ fontFamily: mono, fontSize: 12, color: l.color, lineHeight: 1.7, animation: "fadeIn 0.1s ease" }}>{l.text}</div>
            ))}
          </div>

          {/* Post-boot: pwd + initial prompt ghost */}
          {booted && lines.length === 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#FF6B2B" }}>blackroad</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#CC00AA" }}>@</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#8844FF" }}>alexandria</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#333" }}>~ $</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#444" }}>pwd</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 8 }}>/Users/alexa</div>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#1e1e1e", marginBottom: 12 }}>type 'help' for available commands</div>
            </div>
          )}

          {/* Command history blocks */}
          {booted && lines.map((block, bi) => (
            <div key={bi} style={{ marginBottom: 8, animation: "fadeIn 0.15s ease" }}>
              {/* Prompt echo */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 2 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#FF6B2B" }}>blackroad</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#CC00AA" }}>@</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#8844FF" }}>alexandria</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#333" }}>&nbsp;~&nbsp;$&nbsp;</span>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#c0c0c0" }}>{block.prompt.cmd}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#141414", marginLeft: "auto" }}>{block.prompt.ts}</span>
              </div>
              {/* Output */}
              <div style={{ paddingLeft: 0 }}>
                {block.output.map((line, li) => <OutLine key={li} line={line} />)}
              </div>
            </div>
          ))}

          {/* Active prompt */}
          {booted && (
            <div style={{ marginTop: 4 }}>
              <Prompt
                value={input}
                onChange={setInput}
                onSubmit={execute}
                onUp={histUp}
                onDown={histDown}
              />
            </div>
          )}

          {/* Booting — blinking cursor */}
          {booting && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: "#525252" }}>loading</span>
              <span style={{ fontFamily: mono, fontSize: 12, color: "#8844FF", animation: "blink 1s step-end infinite" }}>▋</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Status bar ───────────────────────────────────────── */}
        <div style={{ height: 22, background: "#111", borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Spectrum marks */}
            <div style={{ display: "flex", gap: 2 }}>
              {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 10, background: c, borderRadius: 1, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
            </div>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>BlackRoad CLI v3</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>·</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>zsh</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>·</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>L3–L8 loaded</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Z := yx − w</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>·</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
          </div>
        </div>

      </div>
    </>
  );
}
