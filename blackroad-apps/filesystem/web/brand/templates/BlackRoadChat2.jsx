import { useState, useEffect, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

const OLLAMA_BASE = "http://localhost:11434";

const SYSTEM_PROMPT = `You are Lucidia — the cognitive core of BlackRoad OS, an AI-native operating system for sovereign organizations.

You are helpful, precise, and direct. You speak with quiet confidence — never verbose, never sycophantic. You have deep knowledge of infrastructure, AI systems, distributed computing, and the Z-framework (Z:=yx−w).

When asked about BlackRoad OS:
- It runs on a K3s cluster with nodes Alice (gateway) and Octavia (Hailo AI worker)
- The agent fleet includes: Lucidia (memory/cognition), BlackBot (orchestration), Aura (intelligence), Sentinel (security)
- The Z-framework models all systems as feedback loops: Z:=yx−w
- Core pillars: Sovereign Infrastructure, Sentient Agents, Spatial Interfaces

Keep responses concise and well-structured. Use markdown sparingly — only for code blocks and key emphasis. Prefer prose over bullet lists.`;

const SUGGESTED = [
  "What is BlackRoad OS?",
  "Explain the Z-framework",
  "How do agents communicate?",
  "What is sovereign infrastructure?",
  "Tell me about Lucidia's memory system",
  "How does K3s fit into the stack?",
];

// Common Ollama models — user can type any model name too
const PRESET_MODELS = [
  "llama3.2",
  "llama3.1",
  "mistral",
  "mixtral",
  "gemma2",
  "gemma3",
  "qwen2.5",
  "phi4",
  "deepseek-r1",
  "codellama",
  "dolphin-mistral",
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

// ─── Typing dots ──────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#8844FF", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────
function RenderText({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let inCode = false;
  let codeLines = [];
  let codeLang = "";

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCode = false;
        elements.push(
          <pre key={`code-${i}`} style={{ fontFamily: mono, fontSize: 11, color: "#666", background: "#050505", border: "1px solid #1a1a1a", padding: "12px 14px", margin: "10px 0", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 }}>
            {codeLang && <div style={{ fontFamily: mono, fontSize: 9, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{codeLang}</div>}
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (!line.trim()) { elements.push(<div key={`br-${i}`} style={{ height: 8 }} />); return; }

    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} style={{ color: "#d0d0d0", fontWeight: 600 }}>{p.slice(2,-2)}</strong>
        : p
    );

    if (line.startsWith("### "))      elements.push(<div key={i} style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#dedede", margin: "12px 0 6px" }}>{line.slice(4)}</div>);
    else if (line.startsWith("## ")) elements.push(<div key={i} style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 17, color: "#ebebeb", margin: "16px 0 8px", letterSpacing: "-0.02em" }}>{line.slice(3)}</div>);
    else if (line.startsWith("- ") || line.startsWith("• "))
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "4px 0" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: STOPS[elements.length % STOPS.length], flexShrink: 0, marginTop: 7 }} />
          <span style={{ fontFamily: inter, fontSize: 14, color: "#848484", lineHeight: 1.65 }}>{parts.slice(1)}</span>
        </div>
      );
    else elements.push(<p key={i} style={{ fontFamily: inter, fontSize: 14, color: "#848484", lineHeight: 1.75, margin: "4px 0" }}>{parts}</p>);
  });

  return <div>{elements}</div>;
}

// ─── Message ──────────────────────────────────────────────────────
function Message({ msg, modelName }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row", marginBottom: 20 }}>
      <div style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isUser ? "#0d0d0d" : "#0a0a0a", border: `1px solid ${isUser ? "#222" : "#1a1a1a"}` }}>
        {isUser
          ? <span style={{ fontFamily: mono, fontSize: 10, color: "#404040" }}>you</span>
          : <div style={{ display: "flex", gap: 1 }}>
              {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 10, background: c, borderRadius: 1, animation: `barPulse 2s ease-in-out ${i * 0.12}s infinite` }} />)}
            </div>
        }
      </div>
      <div style={{ maxWidth: "76%", background: isUser ? "#0a0a0a" : "transparent", border: isUser ? "1px solid #1a1a1a" : "none", padding: isUser ? "12px 16px" : "4px 0", flex: isUser ? "none" : 1 }}>
        {!isUser && (
          <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            {modelName || "Lucidia"}
          </div>
        )}
        {msg.typing
          ? <TypingDots />
          : isUser
            ? <p style={{ fontFamily: inter, fontSize: 14, color: "#c0c0c0", lineHeight: 1.65, margin: 0 }}>{msg.content}</p>
            : <RenderText text={msg.content} />
        }
        {msg.timestamp && (
          <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", marginTop: 8 }}>{msg.timestamp}</div>
        )}
      </div>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────
function Chip({ text, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ fontFamily: inter, fontSize: 12, color: hover ? "#c0c0c0" : "#484848", background: hover ? "#0d0d0d" : "#080808", border: `1px solid ${hover ? "#2a2a2a" : "#161616"}`, padding: "8px 14px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}
    >{text}</button>
  );
}

// ─── Model selector ───────────────────────────────────────────────
function ModelPicker({ model, setModel, models, fetchingModels }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const list = models.length > 0 ? models : PRESET_MODELS;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 10, color: "#484848", background: "#080808", border: "1px solid #1a1a1a", padding: "5px 10px", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#484848"; }}
      >
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#8844FF", flexShrink: 0 }} />
        {model}
        <span style={{ color: "#2a2a2a" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#080808", border: "1px solid #1a1a1a", minWidth: 200, zIndex: 100, maxHeight: 280, overflowY: "auto" }}>
          {/* Custom input */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #111" }}>
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && custom.trim()) { setModel(custom.trim()); setOpen(false); setCustom(""); } }}
              placeholder="type model name…"
              style={{ width: "100%", background: "none", border: "none", outline: "none", fontFamily: mono, fontSize: 10, color: "#888", padding: 0 }}
            />
          </div>
          {/* Model list */}
          {list.map(m => (
            <button key={m} onClick={() => { setModel(m); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", fontFamily: mono, fontSize: 10, color: m === model ? "#d0d0d0" : "#484848", background: m === model ? "#0d0d0d" : "none", border: "none", borderLeft: m === model ? "2px solid #8844FF" : "2px solid transparent", padding: "9px 12px", cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => { if (m !== model) e.currentTarget.style.background = "#0a0a0a"; }}
              onMouseLeave={e => { if (m !== model) e.currentTarget.style.background = "none"; }}
            >{m}{fetchingModels ? "" : ""}</button>
          ))}
          <div style={{ padding: "8px 12px", borderTop: "1px solid #0d0d0d" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>
              {models.length > 0 ? `${models.length} local models` : "preset models · type to add"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadChat() {
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [model, setModel]               = useState("llama3.2");
  const [localModels, setLocalModels]   = useState([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const w = useWidth();
  const mobile = w < 640;

  // Fetch local Ollama models on mount
  useEffect(() => {
    const load = async () => {
      setFetchingModels(true);
      try {
        const res = await fetch(`${OLLAMA_BASE}/api/tags`);
        if (res.ok) {
          const data = await res.json();
          const names = (data.models || []).map(m => m.name);
          if (names.length > 0) {
            setLocalModels(names);
            setModel(names[0]);
          }
        }
      } catch (_) {
        // Ollama not running — that's fine, presets will show
      } finally {
        setFetchingModels(false);
      }
    };
    load();
  }, []);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const ts = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setError(null);

    const userMsg   = { role: "user", content, timestamp: ts() };
    const typingMsg = { role: "assistant", content: "", typing: true };
    const history   = [...messages, userMsg];

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    // Build Ollama messages array (with system prompt first)
    const ollamaMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: ollamaMessages,
          stream: false,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.message?.content || "No response.";

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply, timestamp: ts() },
      ]);
    } catch (err) {
      setMessages(prev => prev.slice(0, -1));
      const msg = err.message?.includes("Failed to fetch")
        ? "Cannot reach Ollama. Make sure it's running on localhost:11434."
        : `Error: ${err.message}`;
      setError(msg);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; background: #000; height: 100%; max-width: 100vw; }
        button { appearance: none; }
        textarea { resize: none; }
        input { appearance: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        @keyframes gradShift {
          0%   { background-position: 0% 50%;   }
          100% { background-position: 200% 50%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1;    transform: scaleY(1);    }
          50%       { opacity: 0.45; transform: scaleY(0.6); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1;   }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: #2e2e2e; }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: #1c1c1c; }
        input::placeholder { color: #2e2e2e; }
      `}</style>

      <div style={{ background: "#000", height: "100vh", display: "flex", flexDirection: "column", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>

        {/* ── Nav ──────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, background: "rgba(0,0,0,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414" }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {STOPS.map((c, i) => (
                  <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
                ))}
              </div>
              <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#252525" }}>· Lucidia</span>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ModelPicker model={model} setModel={setModel} models={localModels} fetchingModels={fetchingModels} />
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); setError(null); }}
                  style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "5px 10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.15s, border-color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#333"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
                >New chat</button>
              )}
            </div>
          </nav>
        </div>

        {/* ── Chat area ────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: mobile ? "24px 14px 0" : "32px 24px 0", flex: 1 }}>

            {/* Empty state */}
            {isEmpty && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "45vh", textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 24 }}>
                  {STOPS.map((c, i) => (
                    <div key={c} style={{ width: 4, height: 36, background: c, borderRadius: 2, animation: `barPulse 2s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
                <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(24px, 6vw, 36px)", color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 10 }}>
                  Talk to Lucidia
                </h1>
                <p style={{ fontFamily: inter, fontSize: 14, color: "#484848", lineHeight: 1.7, maxWidth: 360, marginBottom: 8 }}>
                  Cognitive core of BlackRoad OS. Running on <span style={{ fontFamily: mono, fontSize: 12, color: "#8844FF" }}>{model}</span> via Ollama.
                </p>
                <p style={{ fontFamily: inter, fontSize: 12, color: "#2a2a2a", marginBottom: 36 }}>
                  Make sure Ollama is running on localhost:11434
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 560 }}>
                  {SUGGESTED.map(s => (
                    <Chip key={s} text={s} onClick={() => sendMessage(s)} />
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} modelName={model} />
            ))}

            {/* Error */}
            {error && (
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: "#FF225509", border: "1px solid #FF225522", margin: "8px 0 16px" }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#FF2255", flexShrink: 0 }}>✕</span>
                <span style={{ fontFamily: inter, fontSize: 13, color: "#666", lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <div ref={bottomRef} style={{ height: 16 }} />
          </div>
        </div>

        {/* ── Input bar ────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #111", background: "#000", padding: mobile ? "14px 14px 18px" : "16px 24px 20px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>

            {/* Quick chips */}
            {messages.length > 0 && messages.length < 4 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
                {SUGGESTED.slice(0, 4).map(s => (
                  <Chip key={s} text={s} onClick={() => sendMessage(s)} />
                ))}
              </div>
            )}

            {/* Input row */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1, background: "#080808", border: `1px solid ${input.length > 0 ? "#2a2a2a" : "#161616"}`, transition: "border-color 0.15s", display: "flex", alignItems: "flex-end" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Message Lucidia via ${model}…`}
                  rows={1}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: inter, fontSize: 14, color: "#c0c0c0", padding: "12px 14px", lineHeight: 1.5, minHeight: 44, maxHeight: 140, resize: "none", overflowY: "auto" }}
                  onInput={e => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{ width: 44, height: 44, flexShrink: 0, background: input.trim() && !loading ? GRAD : "#0a0a0a", backgroundSize: "200% 100%", border: `1px solid ${input.trim() && !loading ? "transparent" : "#1a1a1a"}`, cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, border-color 0.2s" }}
              >
                {loading
                  ? <div style={{ width: 14, height: 14, border: "1.5px solid #333", borderTopColor: "#8844FF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 8L2 2l3 6-3 6 12-6z" fill={input.trim() ? "#fff" : "#333"} />
                    </svg>
                }
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>
                Lucidia · BlackRoad OS · Ollama · Z:=yx−w
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
