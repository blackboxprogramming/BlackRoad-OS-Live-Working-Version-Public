import { useState, useEffect } from "react";
const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const grotesk = "'Space Grotesk', sans-serif";
const mono = "'JetBrains Mono', monospace";
const inter = "'Inter', sans-serif";
export default function BlackRoadQuantumInfo() {
  useEffect(() => { setTimeout(() => { window.location.href = "https://blackroadquantum.com"; }, 3000); }, []);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: #000; }
        @keyframes gradShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes barPulse { 0%, 100% { opacity: 1; transform: scaleY(1); } 50% { opacity: 0.45; transform: scaleY(0.65); } }
      `}</style>
      <div style={{ background: "#000", minHeight: "100vh", color: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: GRAD, backgroundSize: "200% 100%", animation: "gradShift 4s linear infinite" }} />
        <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>
          {STOPS.map((c, i) => <div key={c} style={{ width: 3, height: 18, background: c, animation: `barPulse 2.5s ease-in-out ${i * 0.14}s infinite` }} />)}
        </div>
        <h1 style={{ fontFamily: grotesk, fontWeight: 700, fontSize: 32, color: "#f5f5f5", letterSpacing: "-0.04em", marginBottom: 16 }}>Redirecting...</h1>
        <p style={{ fontFamily: inter, fontSize: 15, color: "#606060", marginBottom: 32 }}>Taking you to BlackRoad Quantum</p>
        <a href="https://blackroadquantum.com" style={{ fontFamily: mono, fontSize: 13, color: "#545454", textDecoration: "none", border: "1px solid #1e1e1e", padding: "10px 24px", transition: "border-color 0.2s, color 0.2s" }}
          onMouseEnter={e => { e.target.style.borderColor = "#444"; e.target.style.color = "#f0f0f0"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#1e1e1e"; e.target.style.color = "#545454"; }}
        >blackroadquantum.com →</a>
      </div>
    </>
  );
}
