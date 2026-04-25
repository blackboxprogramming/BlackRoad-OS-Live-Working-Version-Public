import { useState, useEffect, useRef } from "react";
const STOPS=["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD="linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono="'JetBrains Mono',monospace";const grotesk="'Space Grotesk',sans-serif";const inter="'Inter',sans-serif";
function useWidth(){const[w,s]=useState(typeof window!=="undefined"?window.innerWidth:390);useEffect(()=>{const f=()=>s(window.innerWidth);window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f)},[]);return w}
function useVisible(t=0.12){const ref=useRef(null);const[v,s]=useState(false);useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){s(true);o.disconnect()}},{threshold:t});if(ref.current)o.observe(ref.current);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0}){const[ref,vis]=useVisible();return<div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",transition:`opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`}}>{children}</div>}
export default function Oracle(){
  const w=useWidth();
  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth;overflow-x:hidden;background:#000}body{overflow-x:hidden}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#1c1c1c}
      @keyframes gradShift{0%{background-position:0% 50%}100%{background-position:200% 50%}}
      @keyframes barPulse{0%,100%{opacity:1;transform:scaleY(1)}50%{opacity:.45;transform:scaleY(.65)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
    <div style={{background:"#000",minHeight:"100vh",color:"#f0f0f0",overflowX:"hidden",width:"100%"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200}}>
        <div style={{height:4,background:GRAD,backgroundSize:"200% 100%",animation:"gradShift 4s linear infinite"}}/>
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:w<640?"0 16px":"0 40px",height:56,background:"rgba(0,0,0,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid #141414"}}>
          <a href="https://agents.blackroad.io" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <div style={{display:"flex",gap:2}}>{STOPS.map((c,i)=><div key={c} style={{width:3,height:18,background:c,animation:`barPulse 2.5s ease-in-out ${i*.14}s infinite`}}/>)}</div>
            <span style={{fontFamily:grotesk,fontWeight:700,fontSize:18,color:"#f5f5f5",letterSpacing:"-0.03em"}}>Agents</span>
          </a>
          <a href="https://blackroad.io" style={{fontFamily:inter,fontSize:13,color:"#686868",textDecoration:"none"}}>← Back to BlackRoad</a>
        </nav>
      </div>
      <section style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:w<480?"120px 20px 60px":"140px 40px 80px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",width:500,height:500,background:"radial-gradient(circle,#CC00AA11 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{width:80,height:4,background:"#CC00AA",marginBottom:32,animation:"fadeUp 0.6s ease 0.1s both"}}/>
        <h1 style={{fontFamily:grotesk,fontWeight:700,fontSize:"clamp(48px,12vw,96px)",color:"#f5f5f5",letterSpacing:"-0.04em",lineHeight:0.95,marginBottom:16,animation:"fadeUp 0.6s ease 0.2s both"}}>Oracle</h1>
        <p style={{fontFamily:inter,fontSize:"clamp(15px,3vw,18px)",color:"#606060",lineHeight:1.7,maxWidth:520,marginBottom:24,animation:"fadeUp 0.6s ease 0.3s both"}}>System introspection, fleet reflection, prediction. Sees what is coming.</p>
        <div style={{fontFamily:mono,fontSize:13,color:"#333",animation:"fadeUp 0.6s ease 0.4s both"}}>oracle@blackroad.io</div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:GRAD,opacity:0.3}}/>
      </section>
      <footer style={{borderTop:"1px solid #0d0d0d",padding:"48px 40px 36px"}}>
        <div style={{maxWidth:1060,margin:"0 auto"}}>
          <div style={{height:1,background:GRAD,marginBottom:40,opacity:0.4}}/>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:24}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{display:"flex",gap:2}}>{STOPS.map(c=><div key={c} style={{width:2,height:14,background:c}}/>)}</div>
                <span style={{fontFamily:grotesk,fontWeight:700,fontSize:16,color:"#ebebeb"}}>BlackRoad OS</span>
              </div>
              <div style={{fontFamily:mono,fontSize:10,color:"#252525"}}>Pave Tomorrow.</div>
            </div>
            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
              {[["Home","https://blackroad.io"],["Agents","https://agents.blackroad.io"],["AI","https://blackroadai.com"],["Network","https://blackroad.network"],["GitHub","https://github.com/blackboxprogramming"]].map(([l,h])=><a key={l} href={h} style={{fontFamily:inter,fontSize:12,color:"#353535",textDecoration:"none"}}>{l}</a>)}
            </div>
          </div>
          <div style={{marginTop:32,fontFamily:mono,fontSize:9,color:"#1a1a1a"}}>© 2026 BlackRoad OS, Inc.</div>
        </div>
      </footer>
    </div>
  </>);
}
