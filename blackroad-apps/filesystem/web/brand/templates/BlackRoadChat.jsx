import { useState, useEffect, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "‘JetBrains Mono’, monospace";
const grotesk = "‘Space Grotesk’, sans-serif";
const inter   = "‘Inter’, sans-serif";

const OLLAMA_BASE = "http://localhost:11434";

const SYSTEM_PROMPT = `You are Lucidia -- the cognitive core of BlackRoad OS, an AI-native operating system for sovereign organizations. You are helpful, precise, and direct. You speak with quiet confidence -- never verbose, never sycophantic. Keep responses concise and well-structured.`;

const SUGGESTED = [
"What is BlackRoad OS?",
"Explain the Z-framework",
"How do agents communicate?",
"What is sovereign infrastructure?",
"Tell me about persistent memory",
"How does K3s fit into the stack?",
];

const DEFAULT_MODELS = [
"llama3.2", "llama3.1", "llama3", "mistral",
"mixtral", "gemma2", "qwen2.5", "phi3",
"deepseek-r1", "codellama", "llava", "neural-chat",
];

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
if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeLines = []; }
else {
inCode = false;
elements.push(
<pre key={`c${i}`} style={{ fontFamily: mono, fontSize: 11, color: "#666", background: "#050505", border: "1px solid #1a1a1a", padding: "12px 14px", margin: "10px 0", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 }}>
{codeLang && <div style={{ fontFamily: mono, fontSize: 9, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{codeLang}</div>}
{codeLines.join("\n")}
</pre>
);
codeLines = [];
}
return;
}
if (inCode) { codeLines.push(line); return; }
if (!line.trim()) { elements.push(<div key={`b${i}`} style={{ height: 8 }} />); return; }

```
const bold = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
  p.startsWith("**") && p.endsWith("**")
    ? <strong key={j} style={{ color: "#d0d0d0", fontWeight: 600 }}>{p.slice(2,-2)}</strong>
    : p
);

if (line.startsWith("### ")) elements.push(<div key={i} style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 14, color: "#dedede", margin: "10px 0 4px" }}>{line.slice(4)}</div>);
else if (line.startsWith("## ")) elements.push(<div key={i} style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 17, color: "#ebebeb", margin: "16px 0 8px", letterSpacing: "-0.02em" }}>{line.slice(3)}</div>);
else if (line.startsWith("# ")) elements.push(<div key={i} style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#f0f0f0", margin: "18px 0 10px", letterSpacing: "-0.03em" }}>{line.slice(2)}</div>);
else if (line.startsWith("- ") || line.startsWith("* ")) elements.push(
  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "4px 0" }}>
    <div style={{ width: 4, height: 4, borderRadius: "50%", background: STOPS[elements.length % STOPS.length], flexShrink: 0, marginTop: 8 }} />
    <span style={{ fontFamily: inter, fontSize: 14, color: "#848484", lineHeight: 1.65 }}>{bold.slice(1)}</span>
  </div>
);
else elements.push(<p key={i} style={{ fontFamily: inter, fontSize: 14, color: "#848484", lineHeight: 1.75, margin: "3px 0" }}>{bold}</p>);
```

});

return <div>{elements}</div>;
}

// ─── Message ──────────────────────────────────────────────────────
function Message({ msg }) {
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
{!isUser && <div style={{ fontFamily: mono, fontSize: 9, color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Lucidia</div>}
{msg.typing
? <TypingDots />
: isUser
? <p style={{ fontFamily: inter, fontSize: 14, color: "#c0c0c0", lineHeight: 1.65, margin: 0 }}>{msg.content}</p>
: <RenderText text={msg.content} />
}
{msg.timestamp && <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e", marginTop: 8 }}>{msg.timestamp}</div>}
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
function ModelSelector({ model, models, onChange, open, setOpen }) {
const ref = useRef(null);
useEffect(() => {
const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
document.addEventListener("mousedown", fn);
return () => document.removeEventListener("mousedown", fn);
}, []);

return (
<div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
<button
onClick={() => setOpen(o => !o)}
style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 10, color: "#505050", background: "#080808", border: "1px solid #1a1a1a", padding: "6px 10px", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#505050"; }}
>
<div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8844FF", flexShrink: 0 }} />
{model}
<span style={{ opacity: 0.4 }}>▾</span>
</button>

```
  {open && (
    <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 200, background: "#080808", border: "1px solid #1e1e1e", zIndex: 50, maxHeight: 260, overflowY: "auto" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.12em", padding: "8px 12px 6px" }}>Available models</div>
      {models.map(m => (
        <button key={m} onClick={() => { onChange(m); setOpen(false); }}
          style={{ width: "100%", textAlign: "left", fontFamily: mono, fontSize: 11, color: m === model ? "#c0c0c0" : "#484848", background: m === model ? "#0d0d0d" : "none", border: "none", padding: "8px 12px", cursor: "pointer", transition: "background 0.12s, color 0.12s", display: "flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => { if (m !== model) { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#888"; } }}
          onMouseLeave={e => { if (m !== model) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#484848"; } }}
        >
          {m === model && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#8844FF", flexShrink: 0 }} />}
          {m}
        </button>
      ))}
    </div>
  )}
</div>
```

);
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadChat() {
const [messages, setMessages]     = useState([]);
const [input, setInput]           = useState("");
const [loading, setLoading]       = useState(false);
const [error, setError]           = useState(null);
const [model, setModel]           = useState("llama3.2");
const [models, setModels]         = useState(DEFAULT_MODELS);
const [modelOpen, setModelOpen]   = useState(false);
const [streaming, setStreaming]   = useState(false);
const bottomRef  = useRef(null);
const inputRef   = useRef(null);
const abortRef   = useRef(null);
const w = useWidth();
const mobile = w < 640;

// Fetch models from Ollama on mount
useEffect(() => {
fetch(`${OLLAMA_BASE}/api/tags`)
.then(r => r.json())
.then(data => {
if (data?.models?.length) {
setModels(data.models.map(m => m.name));
setModel(data.models[0].name);
}
})
.catch(() => {}); // silent -- falls back to DEFAULT_MODELS
}, []);

useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

const ts = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const sendMessage = async (text) => {
const content = (text || input).trim();
if (!content || loading) return;
setInput("");
setError(null);

```
const userMsg  = { role: "user", content, timestamp: ts() };
const typingMsg = { role: "assistant", content: "", typing: true };

setMessages(prev => [...prev, userMsg, typingMsg]);
setLoading(true);
setStreaming(true);

const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

abortRef.current = new AbortController();

try {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: abortRef.current.signal,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ],
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Ollama error ${res.status}`);

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   full    = "";

  // Replace typing indicator with empty streaming message
  setMessages(prev => [
    ...prev.slice(0, -1),
    { role: "assistant", content: "", streaming: true },
  ]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json?.message?.content) {
          full += json.message.content;
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: "assistant", content: full, streaming: !json.done },
          ]);
        }
        if (json.done) break;
      } catch {}
    }
  }

  // Finalize with timestamp
  setMessages(prev => [
    ...prev.slice(0, -1),
    { role: "assistant", content: full, timestamp: ts() },
  ]);

} catch (err) {
  if (err.name === "AbortError") {
    // User stopped -- keep whatever was streamed
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 ? { ...m, streaming: false, timestamp: ts() } : m
    ));
  } else {
    setMessages(prev => prev.slice(0, -1));
    setError(
      err.message.includes("fetch") || err.message.includes("Failed")
        ? "Cannot reach Ollama. Make sure it's running on localhost:11434."
        : err.message
    );
  }
} finally {
  setLoading(false);
  setStreaming(false);
  setTimeout(() => inputRef.current?.focus(), 50);
}
```

};

const stopStream = () => { abortRef.current?.abort(); };

const handleKey = (e) => {
if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
};

const isEmpty = messages.length === 0;

return (
<>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } html, body { overflow-x: hidden; background: #000; height: 100%; max-width: 100vw; } button { appearance: none; } textarea { resize: none; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: #000; } ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; } textarea::placeholder { color: #2a2a2a; } @keyframes gradShift { 0%   { background-position: 0% 50%;   } 100% { background-position: 200% 50%; } } @keyframes barPulse { 0%, 100% { opacity: 1;    transform: scaleY(1);    } 50%       { opacity: 0.45; transform: scaleY(0.6); } } @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; } 40%            { transform: translateY(-5px); opacity: 1;   } } @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to   { opacity: 1; transform: translateY(0);    } } @keyframes spin { to { transform: rotate(360deg); } } @keyframes blink { 0%, 100% { opacity: 1; } 50%       { opacity: 0; } }`}</style>

```
  <div style={{ background: "#000", height: "100vh", display: "flex", flexDirection: "column", color: "#ebebeb", overflowX: "hidden", width: "100%" }}>

    {/* ── Nav ──────────────────────────────────────────────── */}
    <div style={{ flexShrink: 0 }}>
      <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mobile ? "0 14px" : "0 28px", height: 52, background: "rgba(0,0,0,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #141414", gap: 10 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: 2, height: 15, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
            ))}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
          {!mobile && <span style={{ fontFamily: mono, fontSize: 9, color: "#252525" }}>· Lucidia</span>}
        </div>

        {/* Center -- model selector */}
        <ModelSelector model={model} models={models} onChange={setModel} open={modelOpen} setOpen={setModelOpen} />

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {!mobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00D4FF", animation: "dotBounce 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a" }}>Ollama</span>
            </div>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setError(null); }}
              style={{ fontFamily: mono, fontSize: 9, color: "#333", background: "none", border: "1px solid #1a1a1a", padding: "5px 10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#333"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
            >Clear</button>
          )}
        </div>
      </nav>
    </div>

    {/* ── Messages ─────────────────────────────────────────── */}
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: mobile ? "24px 14px 0" : "32px 24px 0", flex: 1 }}>

        {/* Empty state */}
        {isEmpty && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "44vh", textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 24 }}>
              {STOPS.map((c, i) => (
                <div key={c} style={{ width: 4, height: 36, background: c, borderRadius: 2, animation: `barPulse 2s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
            <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(22px, 6vw, 34px)", color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 10 }}>
              Talk to Lucidia
            </h1>
            <p style={{ fontFamily: inter, fontSize: 14, color: "#484848", lineHeight: 1.7, maxWidth: 340, marginBottom: 10 }}>
              Running on <span style={{ fontFamily: mono, color: "#333" }}>{model}</span> via Ollama.
            </p>
            <p style={{ fontFamily: inter, fontSize: 13, color: "#383838", marginBottom: 32, maxWidth: 340 }}>
              Make sure Ollama is running on localhost:11434.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 520 }}>
              {SUGGESTED.map(s => <Chip key={s} text={s} onClick={() => sendMessage(s)} />)}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {/* Cursor blink while streaming */}
        {streaming && messages.length > 0 && messages[messages.length - 1].streaming && (
          <span style={{ display: "inline-block", width: 8, height: 14, background: "#8844FF", animation: "blink 0.8s step-end infinite", marginLeft: 2, verticalAlign: "text-bottom" }} />
        )}

        {/* Error */}
        {error && (
          <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: "#FF225508", border: "1px solid #FF225522", margin: "8px 0 16px" }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#FF2255", flexShrink: 0 }}>✕</span>
            <span style={{ fontFamily: inter, fontSize: 13, color: "#666", lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        <div ref={bottomRef} style={{ height: 16 }} />
      </div>
    </div>

    {/* ── Input ────────────────────────────────────────────── */}
    <div style={{ flexShrink: 0, borderTop: "1px solid #111", background: "#000", padding: mobile ? "12px 14px 16px" : "14px 24px 18px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Quick chips when fresh */}
        {messages.length > 0 && messages.length < 4 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {SUGGESTED.slice(0, 4).map(s => <Chip key={s} text={s} onClick={() => sendMessage(s)} />)}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {/* Textarea */}
          <div style={{ flex: 1, background: "#080808", border: `1px solid ${input.length > 0 ? "#2a2a2a" : "#161616"}`, transition: "border-color 0.15s" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message Lucidia via ${model}…`}
              rows={1}
              style={{ flex: 1, width: "100%", background: "none", border: "none", outline: "none", fontFamily: inter, fontSize: 14, color: "#c0c0c0", padding: "12px 14px", lineHeight: 1.5, minHeight: 44, maxHeight: 140, resize: "none", overflowY: "auto" }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
            />
          </div>

          {/* Stop / Send button */}
          {streaming ? (
            <button
              onClick={stopStream}
              style={{ width: 44, height: 44, flexShrink: 0, background: "#0a0a0a", border: "1px solid #FF225544", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#FF2255"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#FF225544"}
            >
              <div style={{ width: 12, height: 12, background: "#FF2255", borderRadius: 2 }} />
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ width: 44, height: 44, flexShrink: 0, background: input.trim() && !loading ? GRAD : "#0a0a0a", backgroundSize: "200% 100%", border: `1px solid ${input.trim() && !loading ? "transparent" : "#1a1a1a"}`, cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, border-color 0.2s" }}
            >
              {loading && !streaming
                ? <div style={{ width: 14, height: 14, border: "1.5px solid #333", borderTopColor: "#8844FF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 2l3 6-3 6 12-6z" fill={input.trim() ? "#fff" : "#333"} />
                  </svg>
              }
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Enter to send · Shift+Enter for newline</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a" }}>Lucidia · BlackRoad OS · Z:=yx−w</span>
        </div>
      </div>
    </div>

  </div>
</>
```

);
}