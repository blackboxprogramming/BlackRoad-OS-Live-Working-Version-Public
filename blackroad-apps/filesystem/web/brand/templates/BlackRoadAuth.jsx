import { useState, useEffect, useRef } from "react";

const STOPS   = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD    = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono    = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter   = "'Inter', sans-serif";

// ─── Utilities ────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// ─── Animated background orbs ─────────────────────────────────────
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[
        { c: "#8844FF", x: "10%",  y: "20%", s: 480, d: 12 },
        { c: "#4488FF", x: "80%",  y: "60%", s: 360, d: 18 },
        { c: "#CC00AA", x: "60%",  y: "10%", s: 280, d: 22 },
        { c: "#FF6B2B", x: "20%",  y: "75%", s: 200, d: 15 },
        { c: "#00D4FF", x: "90%",  y: "85%", s: 240, d: 20 },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          left: o.x, top: o.y,
          width: o.s, height: o.s,
          borderRadius: "50%",
          background: o.c,
          opacity: 0.04,
          filter: "blur(80px)",
          animation: `orbDrift ${o.d}s ease-in-out infinite alternate`,
          animationDelay: `${i * 1.8}s`,
          transform: "translate(-50%, -50%)",
        }} />
      ))}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, error, hint, autoComplete }) {
  const [focus, setFocus] = useState(false);
  const [show,  setShow]  = useState(false);
  const isPass = type === "password";

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <label style={{ fontFamily: mono, fontSize: 9, color: focus ? "#484848" : "#242424", textTransform: "uppercase", letterSpacing: "0.13em", transition: "color 0.2s" }}>{label}</label>
        {hint && <span style={{ fontFamily: inter, fontSize: 11, color: "#1e1e1e" }}>{hint}</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type={isPass && !show ? "password" : "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: "100%",
            background: "#080808",
            border: `1px solid ${error ? "#FF225544" : focus ? "#2a2a2a" : "#111"}`,
            outline: "none",
            padding: isPass ? "12px 44px 12px 14px" : "12px 14px",
            fontFamily: inter, fontSize: 14,
            color: "#c8c8c8",
            transition: "border-color 0.2s",
            boxShadow: focus ? `0 0 0 1px ${error ? "#FF225522" : "#ffffff08"}` : "none",
          }}
        />
        {isPass && (
          <button
            onClick={() => setShow(s => !s)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: mono, fontSize: 9, color: "#2a2a2a", padding: 0, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}
          >{show ? "hide" : "show"}</button>
        )}
      </div>
      {error && <div style={{ fontFamily: inter, fontSize: 11, color: "#FF2255", marginTop: 5, lineHeight: 1.5 }}>{error}</div>}
    </div>
  );
}

// ─── Gradient button ──────────────────────────────────────────────
function GradBtn({ children, onClick, loading, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        background: disabled ? "#0d0d0d" : GRAD,
        backgroundSize: "200% 100%",
        animation: disabled ? "none" : "gradShift 4s linear infinite",
        border: disabled ? "1px solid #1a1a1a" : "none",
        padding: "13px 0",
        fontFamily: mono, fontSize: 11,
        color: disabled ? "#2a2a2a" : "#f0f0f0",
        textTransform: "uppercase", letterSpacing: "0.12em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: hover && !disabled ? 0.88 : 1,
        transition: "opacity 0.15s",
      }}
    >{loading ? "Verifying…" : children}</button>
  );
}

// ─── OAuth button ─────────────────────────────────────────────────
function OAuthBtn({ icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: hover ? "#0d0d0d" : "#080808",
        border: "1px solid #111",
        padding: "10px 0",
        fontFamily: inter, fontSize: 13, color: "#484848",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Views ────────────────────────────────────────────────────────
function LoginView({ onSwitch, onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email.includes("@")) e.email = "Enter a valid email address.";
    if (password.length < 6)  e.password = "Password must be at least 6 characters.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    onSuccess();
  };

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 14 }}>Sign in</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 6 }}>Welcome back.</h1>
      <p style={{ fontFamily: inter, fontSize: 14, color: "#2a2a2a", marginBottom: 32, lineHeight: 1.6 }}>
        Sign in to your BlackRoad workspace.
      </p>

      {/* OAuth */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <OAuthBtn icon="⌘" label="GitHub" onClick={() => {}} />
        <OAuthBtn icon="◈" label="Google" onClick={() => {}} />
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: "#0d0d0d" }} />
        <span style={{ fontFamily: mono, fontSize: 9, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.1em" }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: "#0d0d0d" }} />
      </div>

      <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: "" })); }}
        placeholder="you@yourcompany.io" error={errors.email} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: "" })); }}
        placeholder="••••••••••••" error={errors.password}
        hint={<span onClick={() => onSwitch("forgot")} style={{ cursor: "pointer", color: "#2a2a2a", transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#888"}
          onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}>Forgot?</span>}
        autoComplete="current-password"
      />

      <GradBtn onClick={submit} loading={loading} disabled={!email || !password}>Sign in →</GradBtn>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ fontFamily: inter, fontSize: 13, color: "#1e1e1e" }}>No account? </span>
        <button onClick={() => onSwitch("signup")} style={{ fontFamily: inter, fontSize: 13, color: "#484848", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "#c0c0c0"}
          onMouseLeave={e => e.currentTarget.style.color = "#484848"}>Create one →</button>
      </div>
    </div>
  );
}

function SignupView({ onSwitch, onSuccess }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [agreed,   setAgreed]   = useState(false);

  const strength = password.length === 0 ? 0
    : password.length < 8  ? 1
    : password.length < 12 ? 2
    : 3;
  const strengthColors = ["#111", "#FF2255", "#FF6B2B", "#00D4FF"];
  const strengthLabels = ["", "weak", "fair", "strong"];

  const validate = () => {
    const e = {};
    if (name.trim().length < 2)   e.name = "Enter your name.";
    if (!email.includes("@"))     e.email = "Enter a valid email address.";
    if (password.length < 8)      e.password = "Password must be at least 8 characters.";
    if (!agreed)                  e.agreed = "You must accept the terms.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    onSuccess();
  };

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 14 }}>Create account</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 6 }}>Join BlackRoad.</h1>
      <p style={{ fontFamily: inter, fontSize: 14, color: "#2a2a2a", marginBottom: 32, lineHeight: 1.6 }}>
        Sovereign infrastructure. Sentient agents.
      </p>

      <Field label="Name" value={name} onChange={v => { setName(v); setErrors(e => ({...e, name:""})); }}
        placeholder="Alexa Amundson" error={errors.name} autoComplete="name" />
      <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); setErrors(e => ({...e, email:""})); }}
        placeholder="you@yourcompany.io" error={errors.email} autoComplete="email" />

      {/* Password + strength */}
      <Field label="Password" type="password" value={password} onChange={v => { setPassword(v); setErrors(e => ({...e, password:""})); }}
        placeholder="Choose a strong password" error={errors.password} autoComplete="new-password" />
      {password.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginTop: -14, marginBottom: 20, alignItems: "center" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 2, background: i <= strength ? strengthColors[strength] : "#111", transition: "background 0.3s", borderRadius: 2 }} />
          ))}
          <span style={{ fontFamily: mono, fontSize: 9, color: strengthColors[strength], width: 40, textAlign: "right", transition: "color 0.3s" }}>{strengthLabels[strength]}</span>
        </div>
      )}

      {/* Terms */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: errors.agreed ? 6 : 24, cursor: "pointer" }}
        onClick={() => { setAgreed(a => !a); setErrors(e => ({...e, agreed:""})); }}>
        <div style={{ width: 16, height: 16, border: `1px solid ${agreed ? "#8844FF" : errors.agreed ? "#FF2255" : "#1a1a1a"}`, background: agreed ? "#8844FF18" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
          {agreed && <span style={{ fontFamily: mono, fontSize: 10, color: "#8844FF" }}>✓</span>}
        </div>
        <span style={{ fontFamily: inter, fontSize: 12, color: "#2a2a2a", lineHeight: 1.5 }}>
          I agree to the <span style={{ color: "#484848" }}>Terms of Service</span> and <span style={{ color: "#484848" }}>Privacy Policy</span>
        </span>
      </div>
      {errors.agreed && <div style={{ fontFamily: inter, fontSize: 11, color: "#FF2255", marginBottom: 20, marginTop: -2 }}>{errors.agreed}</div>}

      <GradBtn onClick={submit} loading={loading} disabled={!name || !email || !password}>Create account →</GradBtn>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ fontFamily: inter, fontSize: 13, color: "#1e1e1e" }}>Already have an account? </span>
        <button onClick={() => onSwitch("login")} style={{ fontFamily: inter, fontSize: 13, color: "#484848", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "#c0c0c0"}
          onMouseLeave={e => e.currentTarget.style.color = "#484848"}>Sign in →</button>
      </div>
    </div>
  );
}

function ForgotView({ onSwitch }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const submit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  if (sent) return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, border: "1px solid #00D4FF33", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: mono, fontSize: 20, color: "#00D4FF" }}>✓</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>Check your inbox</div>
        <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 24, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Reset link sent.</h2>
        <p style={{ fontFamily: inter, fontSize: 14, color: "#2a2a2a", lineHeight: 1.7 }}>
          We sent a password reset link to <span style={{ color: "#686868" }}>{email}</span>. Check your inbox and click the link within 15 minutes.
        </p>
      </div>
      <button onClick={() => onSwitch("login")} style={{ fontFamily: mono, fontSize: 9, color: "#484848", background: "none", border: "1px solid #1a1a1a", padding: "10px 0", width: "100%", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#c0c0c0"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#484848"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
      >← Back to sign in</button>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 14 }}>Reset password</div>
      <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 28, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Forgot your password?</h1>
      <p style={{ fontFamily: inter, fontSize: 14, color: "#2a2a2a", marginBottom: 32, lineHeight: 1.6 }}>
        Enter your email and we'll send you a reset link.
      </p>

      <Field label="Email" type="email" value={email} onChange={setEmail}
        placeholder="you@yourcompany.io" autoComplete="email" />

      <GradBtn onClick={submit} loading={loading} disabled={!email.includes("@")}>Send reset link →</GradBtn>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button onClick={() => onSwitch("login")} style={{ fontFamily: inter, fontSize: 13, color: "#2a2a2a", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "#888"}
          onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}>← Back to sign in</button>
      </div>
    </div>
  );
}

function SuccessView({ mode }) {
  return (
    <div style={{ animation: "fadeUp 0.35s ease both", textAlign: "center" }}>
      {/* Spectrum bars */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 32 }}>
        {STOPS.map((c, i) => (
          <div key={c} style={{ width: 4, height: 40, background: c, borderRadius: 2, animation: `barPulse 1.8s ease-in-out ${i * 0.12}s infinite` }} />
        ))}
      </div>

      <div style={{ fontFamily: mono, fontSize: 9, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 12 }}>
        {mode === "login" ? "Authenticated" : "Account created"}
      </div>
      <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 32, color: "#f0f0f0", letterSpacing: "-0.04em", marginBottom: 12 }}>
        {mode === "login" ? "Welcome back." : "You're in."}
      </h2>
      <p style={{ fontFamily: inter, fontSize: 14, color: "#2a2a2a", lineHeight: 1.75, marginBottom: 36, maxWidth: 320, margin: "0 auto 36px" }}>
        {mode === "login"
          ? "Your session is active. Redirecting to your workspace."
          : "Your BlackRoad workspace is being initialized. Lucidia is warming up."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280, margin: "0 auto" }}>
        {(mode === "login"
          ? ["Verifying identity hash", "Loading agent fleet", "Opening workspace"]
          : ["Generating genesis hash", "Seeding soul chain", "Provisioning workspace"]
        ).map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", animation: `fadeUp 0.3s ease ${i * 0.2}s both` }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: STOPS[i * 2] }}>✓</span>
            <span style={{ fontFamily: inter, fontSize: 12, color: "#2a2a2a" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Left panel ───────────────────────────────────────────────────
function LeftPanel() {
  const [angle, setAngle] = useState(135);
  useEffect(() => {
    const id = setInterval(() => setAngle(a => (a + 0.4) % 360), 30);
    return () => clearInterval(id);
  }, []);

  const testimonials = [
    { quote: "BlackRoad replaced our entire AI stack. Sovereign, fast, and auditable.", author: "infrastructure lead", org: "Series B startup" },
    { quote: "The soul chain architecture is unlike anything else. Every agent has identity.", author: "ML engineer", org: "research lab" },
    { quote: "RoadChain witnessing gave us the compliance audit trail we've been searching for.", author: "CTO", org: "fintech co." },
  ];
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000); return () => clearInterval(id); }, []);

  return (
    <div style={{ position: "relative", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", height: "100%" }}>
      {/* Background gradient orb */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, #8844FF08, transparent 70%)`, pointerEvents: "none" }} />

      {/* Logo */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 64 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {STOPS.map((c, i) => (
              <div key={c} style={{ width: 3, height: 20, background: c, borderRadius: 2, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />
            ))}
          </div>
          <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 18, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
        </div>

        {/* Rotating gradient ring */}
        <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from ${angle}deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF, #FF6B2B)`, opacity: 0.15 }} />
          <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#000" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#2a2a2a", letterSpacing: "-0.02em" }}>Z:=yx−w</span>
          </div>
        </div>

        <h2 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: "clamp(22px, 3vw, 32px)", color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
          Sovereign.<br />Sentient.<br />Spatial.
        </h2>
        <p style={{ fontFamily: inter, fontSize: 14, color: "#2a2a2a", lineHeight: 1.8, maxWidth: 320 }}>
          The distributed agent OS. Every identity cryptographically anchored. Every action witnessed on RoadChain.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 2, marginTop: 40 }}>
        {[["1K", "agents v1.0"], ["30K", "agents v2.0"], ["15", "GitHub orgs"]].map(([v, l]) => (
          <div key={l} style={{ flex: 1, background: "#080808", border: "1px solid #0d0d0d", padding: "12px 14px" }}>
            <div style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 20, color: "#686868", letterSpacing: "-0.03em", marginBottom: 3 }}>{v}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div style={{ marginTop: 28, padding: "18px 20px", background: "#080808", border: "1px solid #0d0d0d", position: "relative", overflow: "hidden", minHeight: 100 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: GRAD, backgroundSize: "100% 200%", animation: "gradShift 3s linear infinite" }} />
        <div key={tIdx} style={{ animation: "fadeUp 0.4s ease both" }}>
          <p style={{ fontFamily: inter, fontSize: 13, color: "#2a2a2a", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>"{testimonials[tIdx].quote}"</p>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1e1e1e" }}>{testimonials[tIdx].author}</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>·</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>{testimonials[tIdx].org}</span>
          </div>
        </div>
        {/* Dots */}
        <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
          {testimonials.map((_, i) => (
            <div key={i} onClick={() => setTIdx(i)} style={{ width: i === tIdx ? 16 : 4, height: 3, background: i === tIdx ? "#4488FF" : "#111", borderRadius: 2, cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function BlackRoadAuth() {
  const [view,    setView]    = useState("login"); // login | signup | forgot | success
  const [mode,    setMode]    = useState("login");
  const w = useWidth();
  const split = w >= 900;

  const handleSuccess = (m) => { setMode(m); setView("success"); };
  const switchView = (v) => setView(v);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; min-height: 100vh; }
        button, input { appearance: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 3px; }
        input::placeholder { color: #1e1e1e; }
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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes orbDrift {
          from { transform: translate(-50%, -50%) scale(1);    }
          to   { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", display: "flex", position: "relative" }}>
        <Orbs />

        {/* ── Split layout ─────────────────────────────────────── */}
        <div style={{ display: "flex", width: "100%", minHeight: "100vh", position: "relative", zIndex: 1 }}>

          {/* Left panel — brand / info */}
          {split && (
            <div style={{ width: "45%", flexShrink: 0, borderRight: "1px solid #0d0d0d", background: "rgba(0,0,0,0.6)" }}>
              <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
              <LeftPanel />
            </div>
          )}

          {/* Right panel — form */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {!split && <div style={{ height: 2, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />}

            {/* Mobile logo */}
            {!split && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 24px", borderBottom: "1px solid #0a0a0a" }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {STOPS.map((c, i) => <div key={c} style={{ width: 2, height: 13, background: c, borderRadius: 2 }} />)}
                </div>
                <span style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 15, color: "#f0f0f0", letterSpacing: "-0.03em" }}>BlackRoad</span>
              </div>
            )}

            {/* Form center */}
            <div style={{ flex: 1, display: "flex", alignItems: view === "success" ? "center" : "flex-start", justifyContent: "center", padding: split ? "80px 64px" : "40px 24px 60px", overflowY: "auto" }}>
              <div style={{ width: "100%", maxWidth: 400 }}>
                {view === "login"   && <LoginView  onSwitch={switchView} onSuccess={() => handleSuccess("login")}  />}
                {view === "signup"  && <SignupView onSwitch={switchView} onSuccess={() => handleSuccess("signup")} />}
                {view === "forgot"  && <ForgotView onSwitch={switchView} />}
                {view === "success" && <SuccessView mode={mode} />}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: split ? "16px 64px" : "16px 24px", borderTop: "1px solid #0a0a0a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#141414" }}>blackroad.io · Z:=yx−w</span>
              <div style={{ display: "flex", gap: 16 }}>
                {["Terms", "Privacy", "Docs"].map(l => (
                  <span key={l} style={{ fontFamily: inter, fontSize: 11, color: "#1e1e1e", cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#484848"}
                    onMouseLeave={e => e.currentTarget.style.color = "#1e1e1e"}>{l}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
