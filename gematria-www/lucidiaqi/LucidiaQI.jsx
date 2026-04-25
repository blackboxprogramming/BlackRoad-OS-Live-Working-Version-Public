import { useState, useEffect, useRef } from "react";
const STOPS=["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD="linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono="'JetBrains Mono',monospace";const grotesk="'Space Grotesk',sans-serif";const inter="'Inter',sans-serif";
function useWidth(){const[w,s]=useState(typeof window!=="undefined"?window.innerWidth:390);useEffect(()=>{const f=()=>s(window.innerWidth);window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f)},[]);return w}
function useVisible(t=0.12){const ref=useRef(null);const[v,s]=useState(false);useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){s(true);o.disconnect()}},{threshold:t});if(ref.current)o.observe(ref.current);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0}){const[ref,vis]=useVisible();return<div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",transition:`opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`}}>{children}</div>}
function GradBtn({children,outline=false,href}){const[h,setH]=useState(false);const Tag=href?"a":"button";const lp=href?{href,target:href.startsWith("http")?"_blank":undefined}:{};if(outline)return<Tag {...lp} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{fontFamily:inter,fontWeight:600,fontSize:15,padding:"14px 32px",background:h?"rgba(255,255,255,0.05)":"transparent",border:"1px solid #2a2a2a",color:"#a0a0a0",cursor:"pointer",transition:"all 0.2s",textDecoration:"none",display:"inline-flex"}}>{children}</Tag>;return<Tag {...lp} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{fontFamily:inter,fontWeight:600,fontSize:15,padding:"14px 36px",background:GRAD,backgroundSize:"200% 100%",backgroundPosition:h?"100% 0":"0% 0",border:"none",color:"#fff",cursor:"pointer",transition:"background-position 0.4s,transform 0.2s",transform:h?"translateY(-1px)":"none",boxShadow:"0 4px 16px rgba(136,68,255,0.2)",textDecoration:"none",display:"inline-flex"}}>{children}</Tag>}
export default function LucidiaQI(){
  const w=useWidth();
  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;overflow-x:hidden;background:#000}body{overflow-x:hidden}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#1c1c1c}
      @keyframes gradShift{0%{background-position:0% 50%}100%{background-position:200% 50%}}
      @keyframes barPulse{0%,100%{opacity:1;transform:scaleY(1)}50%{opacity:.45;transform:scaleY(.65)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
    <div style={{background:"#000",minHeight:"100vh",color:"#f0f0f0",overflowX:"hidden",width:"100%"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200}}>
        <div style={{height:4,background:GRAD,backgroundSize:"200% 100%",animation:"gradShift 4s linear infinite"}}/>
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:w<640?"0 16px":"0 40px",height:56,background:"rgba(0,0,0,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid #141414"}}>
          <a href="https://blackroad.io" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <div style={{display:"flex",gap:2}}>{STOPS.map((c,i)=><div key={c} style={{width:3,height:18,background:c,animation:`barPulse 2.5s ease-in-out ${i*.14}s infinite`}}/>)}</div>
            <span style={{fontFamily:grotesk,fontWeight:700,fontSize:18,color:"#f5f5f5",letterSpacing:"-0.03em"}}>BlackRoad</span>
          </a>
          <a href="https://blackroad.io" style={{fontFamily:inter,fontSize:13,color:"#686868",textDecoration:"none"}}>\u2190 Home</a>
        </nav>
      </div>
      <section style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:w<480?"120px 20px 60px":"140px 40px 80px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",width:500,height:500,background:"radial-gradient(circle,rgba(136,68,255,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontFamily:mono,fontSize:10,color:"#383838",textTransform:"uppercase",letterSpacing:"0.18em",marginBottom:24,animation:"fadeUp 0.6s ease 0.1s both"}}>BlackRoad OS</div>
        <h1 style={{fontFamily:grotesk,fontWeight:700,fontSize:"clamp(36px,10vw,72px)",color:"#f5f5f5",letterSpacing:"-0.04em",lineHeight:0.95,marginBottom:24,animation:"fadeUp 0.6s ease 0.2s both"}}>Lucidia QI</h1>
        <p style={{fontFamily:inter,fontSize:"clamp(15px,3vw,18px)",color:"#606060",lineHeight:1.7,maxWidth:520,animation:"fadeUp 0.6s ease 0.3s both"}}>Quantum Dreaming. Dream logic meets formal verification.</p>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:GRAD,opacity:0.3}}/>
      </section>
      <section style={{padding:"120px 40px",borderTop:"1px solid #0d0d0d",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:400,background:"radial-gradient(ellipse,rgba(136,68,255,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <FadeIn><div style={{maxWidth:640,margin:"0 auto"}}>
          <h2 style={{fontFamily:grotesk,fontWeight:700,fontSize:"clamp(34px,8vw,60px)",color:"#f5f5f5",letterSpacing:"-0.04em",lineHeight:1.0,marginBottom:24}}>Pave Tomorrow.</h2>
          <p style={{fontFamily:inter,fontSize:16,color:"#555",lineHeight:1.7,marginBottom:44}}>Sovereign AI infrastructure.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}><GradBtn href="https://blackroad.io">BlackRoad OS</GradBtn><GradBtn outline href="https://docs.blackroad.io">Docs \u2192</GradBtn></div>
        </div></FadeIn>
      </section>
      <footer style={{borderTop:"1px solid #0d0d0d",padding:"48px 40px 36px"}}><div style={{maxWidth:1060,margin:"0 auto"}}>
        <div style={{height:1,background:GRAD,marginBottom:40,opacity:0.4}}/>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:24}}>
          <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{display:"flex",gap:2}}>{STOPS.map(c=><div key={c} style={{width:2,height:14,background:c}}/>)}</div><span style={{fontFamily:grotesk,fontWeight:700,fontSize:16,color:"#ebebeb"}}>BlackRoad</span></div><div style={{fontFamily:mono,fontSize:10,color:"#252525"}}>Pave Tomorrow.</div></div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>{[["Home","https://blackroad.io"],["AI","https://blackroadai.com"],["Lucidia","https://lucidia.earth"],["Network","https://blackroad.network"],["Status","https://blackroad.systems"],["Company","https://blackroad.company"],["Pricing","https://pricing.blackroad.io"],["GitHub","https://github.com/blackboxprogramming"]].map(([l,h])=><a key={l} href={h} style={{fontFamily:inter,fontSize:12,color:"#353535",textDecoration:"none"}}>{l}</a>)}</div>
        </div>
        <div style={{marginTop:32,fontFamily:mono,fontSize:9,color:"#1a1a1a"}}>&copy; 2026 BlackRoad OS, Inc.</div>
      </div></footer>
    </div>
  </>);
}