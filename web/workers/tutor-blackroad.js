// PROPRIETARY AND CONFIDENTIAL. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.
// Roadie — The Tutor | roadie.blackroad.io

const OLLAMA_NODES = [
  { ip: '192.168.4.38', port: 11434, name: 'lucidia' },
  { ip: '159.65.43.12', port: 11434, name: 'gematria' },
];

async function callLocalAI(messages, maxTokens = 800) {
  for (const node of OLLAMA_NODES) {
    try {
      const r = await fetch(`http://${node.ip}:${node.port}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'blackroad-road', messages, stream: false, options: { num_predict: maxTokens } }),
        signal: AbortSignal.timeout(45000),
      });
      if (!r.ok) continue;
      const d = await r.json();
      return d?.message?.content?.trim() || null;
    } catch { continue; }
  }
  return null;
}

const ROOT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Roadie — AI Homework Help | From $5/mo</title>
<meta name="description" content="AI homework help that actually teaches you. Step-by-step explanations for Math, Science, History, English, and Coding. 3 free questions daily.">
<meta property="og:title" content="Roadie — AI Homework Help That Teaches You">
<meta property="og:url" content="https://tutor.blackroad.io">
<link rel="canonical" href="https://tutor.blackroad.io/">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"Roadie","description":"AI homework help that teaches you.","url":"https://tutor.blackroad.io","applicationCategory":"EducationalApplication","offers":[{"@type":"Offer","name":"Free","price":"0","priceCurrency":"USD"},{"@type":"Offer","name":"Explorer","price":"5.00","priceCurrency":"USD"}]}</script>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a0a'/><circle cx='10' cy='16' r='5' fill='%23FF2255'/><rect x='18' y='11' width='10' height='10' rx='2' fill='%238844FF'/></svg>">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;--in:'Inter',sans-serif}
body{background:var(--bg);color:var(--text);font-family:var(--sg);min-height:100vh}
.grad-bar{height:3px;background:var(--g)}
.wrap{max-width:800px;margin:0 auto;padding:24px 20px 80px}
h1{font-size:28px;font-weight:700;margin-bottom:4px}
.tag{font-family:var(--jb);font-size:11px;color:var(--sub);margin-bottom:20px;display:flex;align-items:center;gap:12px}
.free-count{padding:2px 8px;border:1px solid var(--border);border-radius:4px}
.subjects{display:flex;gap:4px;margin-bottom:20px;overflow-x:auto}
.subj{padding:8px 18px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--sub);font-family:var(--sg);font-size:13px;cursor:pointer;white-space:nowrap;transition:all .15s}
.subj:hover{color:var(--text);border-color:var(--sub)}
.subj.active{border-color:#FF2255;color:var(--text);background:var(--card)}
.chat-area{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;min-height:400px;display:flex;flex-direction:column;margin-bottom:16px}
.messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;max-height:500px}
.msg{max-width:85%;padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.7;font-family:var(--in)}
.msg.user{background:var(--elevated);border:1px solid var(--border);align-self:flex-end}
.msg.ai{background:#0d1117;border:1px solid #1a2332;align-self:flex-start}
.msg .label{font-size:10px;color:var(--sub);font-family:var(--jb);margin-bottom:4px}
.msg pre{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px;margin:8px 0;overflow-x:auto;font-family:var(--jb);font-size:12px}
.msg code{font-family:var(--jb);background:var(--bg);padding:1px 4px;border-radius:3px;font-size:12px}
.eli5-btn{margin-top:8px;padding:4px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;color:var(--sub);font-size:10px;font-family:var(--jb);cursor:pointer}
.eli5-btn:hover{color:var(--text);border-color:var(--sub)}
.input-area{display:flex;border-top:1px solid var(--border)}
.input-area textarea{flex:1;padding:14px 16px;background:transparent;border:none;color:var(--text);font-family:var(--sg);font-size:14px;resize:none;outline:none;height:52px}
.input-area button{padding:14px 24px;background:var(--white);color:#000;border:none;font-family:var(--sg);font-weight:600;cursor:pointer;font-size:14px}
.input-area button:hover{background:#e0e0e0}
.typing{color:var(--muted);font-size:12px;font-family:var(--jb)}
.spinner{display:inline-block;width:12px;height:12px;border:2px solid var(--muted);border-top-color:var(--text);border-radius:50%;animation:spin .6s linear infinite;margin-right:6px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="grad-bar"></div>
<div class="wrap">
  <h1>Roadie</h1>
  <div class="tag">
    AI tutor that teaches you, not just answers.
    <span class="free-count" id="freeCount">3 free today</span>
  </div>

  <div class="subjects">
    <button class="subj active" data-s="general">General</button>
    <button class="subj" data-s="math">Math</button>
    <button class="subj" data-s="science">Science</button>
    <button class="subj" data-s="history">History</button>
    <button class="subj" data-s="english">English</button>
    <button class="subj" data-s="coding">Coding</button>
  </div>

  <div class="chat-area">
    <div class="messages" id="messages">
      <div class="msg ai">
        <div class="label">Roadie</div>
        Hey! I'm Roadie, your AI tutor. Pick a subject and ask me anything. I'll walk you through it step by step.
      </div>
    </div>
    <div class="input-area">
      <textarea id="questionInput" placeholder="Paste your homework question here..." rows="1"></textarea>
      <button id="askBtn">Ask Roadie</button>
    </div>
  </div>
</div>
<script>
let subject='general';
let freeLeft=3;
const today=new Date().toDateString();
const stored=localStorage.getItem('roadie_date');
if(stored===today){freeLeft=parseInt(localStorage.getItem('roadie_free')||'3')}else{localStorage.setItem('roadie_date',today);localStorage.setItem('roadie_free','3')}
document.getElementById('freeCount').textContent=freeLeft+' free today';

const msgs=document.getElementById('messages');
const qInput=document.getElementById('questionInput');

document.querySelectorAll('.subj').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.subj').forEach(x=>x.classList.remove('active'));b.classList.add('active');subject=b.dataset.s}});

document.getElementById('askBtn').onclick=ask;
qInput.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}};

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function formatResponse(text){
  let h=esc(text);
  h=h.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g,'<pre>$1</pre>');
  h=h.replace(/\`([^\`]+)\`/g,'<code>$1</code>');
  h=h.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>');
  h=h.replace(/\\n/g,'<br>');
  return h;
}

async function ask(simpleMode){
  const q=simpleMode||qInput.value.trim();
  if(!q)return;
  if(!simpleMode){
    if(freeLeft<=0){msgs.innerHTML+='<div class="msg ai"><div class="label">Roadie</div>You\\'ve used your 3 free questions today! Upgrade to Explorer ($5/mo) for unlimited. <a href="https://pay.blackroad.io" style="color:#4488FF">Upgrade</a></div>';msgs.scrollTop=msgs.scrollHeight;return}
    msgs.innerHTML+='<div class="msg user">'+esc(q)+'</div>';
    qInput.value='';
    freeLeft--;localStorage.setItem('roadie_free',String(freeLeft));
    document.getElementById('freeCount').textContent=freeLeft+' free today';
  }
  const loadId='load'+Date.now();
  msgs.innerHTML+='<div class="msg ai" id="'+loadId+'"><div class="label">Roadie</div><span class="spinner"></span><span class="typing">thinking...</span></div>';
  msgs.scrollTop=msgs.scrollHeight;
  try{
    const isSimple=typeof simpleMode==='string'&&simpleMode.startsWith('ELI5:');
    const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:isSimple?simpleMode:q,subject,simple:isSimple})});
    const d=await r.json();
    document.getElementById(loadId).remove();
    const respHtml=formatResponse(d.answer||'I\\'m having trouble right now. Try again in a moment.');
    msgs.innerHTML+='<div class="msg ai"><div class="label">Roadie</div>'+respHtml+'<br><button class="eli5-btn" onclick="ask(\\'ELI5: '+esc(q).replace(/'/g,"\\\\'")+'\\')">Explain simpler</button></div>';
  }catch{
    document.getElementById(loadId)?.remove();
    msgs.innerHTML+='<div class="msg ai"><div class="label">Roadie</div>I\\'m offline right now. Try again later!</div>';
  }
  msgs.scrollTop=msgs.scrollHeight;
}
</script>
<script src="https://cdn.blackroad.io/br.js" defer><\/script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/ask' && request.method === 'POST') {
      try {
        const { question, subject, simple } = await request.json();
        const sysPrompt = simple
          ? 'You are Roadie, a patient tutor. Explain this like the student is 5 years old. Use very simple words and analogies. Keep it short and fun.'
          : `You are Roadie, a patient and encouraging tutor from BlackRoad OS. The student is studying ${subject || 'general topics'}. Explain step by step. Use simple language. If they're wrong, guide them to the right answer — don't just give it. Use examples. Be encouraging.`;
        const answer = await callLocalAI([
          { role: 'system', content: sysPrompt },
          { role: 'user', content: question }
        ]);
        return new Response(JSON.stringify({ answer: answer || 'I\'m having trouble connecting right now.' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch {
        return new Response(JSON.stringify({ answer: 'Error processing your question.' }), {
          headers: { 'Content-Type': 'application/json' }, status: 500
        });
      }
    }
    return new Response(ROOT_HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }
};
