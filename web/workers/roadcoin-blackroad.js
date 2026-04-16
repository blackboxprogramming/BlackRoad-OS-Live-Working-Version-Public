// PROPRIETARY AND CONFIDENTIAL. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.
// RoadCoin — The Token Economy | roadcoin.blackroad.io

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Anonymous',
    balance REAL DEFAULT 100.0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_address TEXT,
    to_address TEXT,
    amount REAL NOT NULL,
    type TEXT DEFAULT 'transfer',
    memo TEXT DEFAULT '',
    block_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`
];

function secHeaders(resp) {
  const h = new Headers(resp.headers);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Content-Security-Policy', "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io");
  return new Response(resp.body, { status: resp.status, headers: h });
}

const ROOT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RoadCoin — The Token Economy | BlackRoad OS</title>
<meta name="description" content="RoadCoin token economy. Earn, spend, transfer tokens across the BlackRoad OS ecosystem. Agent rewards, creator payments, and sovereign transactions.">
<meta property="og:title" content="RoadCoin — The Token Economy">
<meta property="og:url" content="https://roadcoin.blackroad.io">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a0a'/><circle cx='10' cy='16' r='5' fill='%23FF2255'/><rect x='18' y='11' width='10' height='10' rx='2' fill='%238844FF'/></svg>">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
body{background:var(--bg);color:var(--text);font-family:var(--sg)}
.grad-bar{height:3px;background:var(--g)}
.wrap{max-width:900px;margin:0 auto;padding:32px 20px 80px}
h1{font-size:28px;font-weight:700;margin-bottom:4px}
.tag{font-family:var(--jb);font-size:11px;color:var(--sub);margin-bottom:32px}
.wallet-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;margin-bottom:24px}
.wallet-label{font-size:11px;color:var(--sub);font-family:var(--jb);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.wallet-balance{font-size:48px;font-weight:700;margin-bottom:4px}
.wallet-balance .unit{font-size:20px;color:var(--sub);font-weight:400}
.wallet-addr{font-family:var(--jb);font-size:11px;color:var(--muted);margin-top:8px}
.actions{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:32px}
.action-btn{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px;cursor:pointer;text-align:center;transition:all .15s}
.action-btn:hover{border-color:var(--sub);background:var(--elevated)}
.action-btn .icon{font-size:24px;margin-bottom:6px}
.action-btn .label{font-size:13px;font-weight:500}
.action-btn .desc{font-size:10px;color:var(--sub);font-family:var(--jb);margin-top:2px}
h2{font-size:16px;font-weight:600;margin-bottom:12px}
.tx-list{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.tx-item{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;font-size:13px}
.tx-item:last-child{border-bottom:none}
.tx-icon{width:32px;height:32px;border-radius:8px;background:var(--elevated);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.tx-icon.earn{background:#0a1a0f;color:#22c55e}
.tx-icon.spend{background:#1a0a0f;color:#FF2255}
.tx-info{flex:1}
.tx-label{font-weight:500}
.tx-detail{font-size:10px;color:var(--sub);font-family:var(--jb);margin-top:2px}
.tx-amount{font-family:var(--jb);font-weight:600;font-size:14px}
.tx-amount.pos{color:#22c55e}
.tx-amount.neg{color:#FF2255}
.earn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:32px}
.earn-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px}
.earn-card h3{font-size:14px;margin-bottom:4px}
.earn-card .reward{font-family:var(--jb);font-size:12px;color:#22c55e;margin-bottom:4px}
.earn-card p{font-size:11px;color:var(--sub)}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:100}
.modal-overlay.show{display:flex}
.modal{background:var(--card);border:1px solid var(--border);border-radius:12px;width:400px;max-width:90vw;padding:24px}
.modal h2{margin-bottom:16px}
.form-group{margin-bottom:12px}
.form-group label{display:block;font-size:11px;color:var(--sub);font-family:var(--jb);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}
.form-group input{width:100%;padding:10px 14px;background:var(--elevated);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--sg);font-size:14px;outline:none}
.form-group input:focus{border-color:var(--sub)}
.modal-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.modal-btn{padding:8px 16px;border-radius:6px;font-family:var(--sg);font-size:13px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text)}
.modal-btn.primary{background:var(--white);color:#000;border:none;font-weight:600}
</style>
</head>
<body>
<div class="grad-bar"></div>
<div class="wrap">
  <h1>RoadCoin</h1>
  <p class="tag">The token economy for BlackRoad OS</p>

  <div class="wallet-card">
    <div class="wallet-label">Your Balance</div>
    <div class="wallet-balance" id="balance">100.00 <span class="unit">RC</span></div>
    <div class="wallet-addr" id="walletAddr"></div>
  </div>

  <div class="actions">
    <div class="action-btn" id="sendBtn"><div class="icon">↗</div><div class="label">Send</div><div class="desc">Transfer tokens</div></div>
    <div class="action-btn" id="earnBtn"><div class="icon">★</div><div class="label">Earn</div><div class="desc">Complete tasks</div></div>
    <div class="action-btn" onclick="location.href='https://roadchain.blackroad.io'"><div class="icon">◈</div><div class="label">Ledger</div><div class="desc">View on-chain</div></div>
    <div class="action-btn" onclick="location.href='https://roadwork.blackroad.io'"><div class="icon">☰</div><div class="label">Tasks</div><div class="desc">Earn by doing</div></div>
  </div>

  <h2>Ways to Earn</h2>
  <div class="earn-grid">
    <div class="earn-card"><h3>Complete Tasks</h3><div class="reward">+5-50 RC</div><p>Finish tasks in RoadWork</p></div>
    <div class="earn-card"><h3>Write Articles</h3><div class="reward">+10-100 RC</div><p>Publish on RoadBook</p></div>
    <div class="earn-card"><h3>Answer Questions</h3><div class="reward">+2-20 RC</div><p>Help in RoadSide</p></div>
    <div class="earn-card"><h3>Build Worlds</h3><div class="reward">+5-25 RC</div><p>Create in RoadWorld</p></div>
    <div class="earn-card"><h3>Agent Work</h3><div class="reward">+1-10 RC</div><p>Roadies auto-earn for tasks</p></div>
    <div class="earn-card"><h3>Daily Login</h3><div class="reward">+1 RC</div><p>Show up every day</p></div>
  </div>

  <h2>Recent Transactions</h2>
  <div class="tx-list" id="txList"></div>
</div>

<div class="modal-overlay" id="sendModal">
  <div class="modal">
    <h2>Send RoadCoin</h2>
    <div class="form-group"><label>Recipient Address</label><input type="text" id="sendTo" placeholder="rc_..."></div>
    <div class="form-group"><label>Amount</label><input type="number" id="sendAmount" placeholder="10.00" step="0.01" min="0.01"></div>
    <div class="form-group"><label>Memo</label><input type="text" id="sendMemo" placeholder="Optional note"></div>
    <div class="modal-btns">
      <button class="modal-btn" id="cancelSend">Cancel</button>
      <button class="modal-btn primary" id="confirmSend">Send</button>
    </div>
  </div>
</div>

<script>
// Generate or load wallet
let wallet=JSON.parse(localStorage.getItem('roadcoin_wallet')||'null');
if(!wallet){wallet={address:'rc_'+Math.random().toString(36).slice(2,14),balance:100,name:'Anonymous'};localStorage.setItem('roadcoin_wallet',JSON.stringify(wallet))}
document.getElementById('balance').innerHTML=wallet.balance.toFixed(2)+' <span class="unit">RC</span>';
document.getElementById('walletAddr').textContent=wallet.address;

// Demo transactions
let txs=JSON.parse(localStorage.getItem('roadcoin_txs')||'[]');
if(txs.length===0){
  txs=[
    {type:'earn',label:'Welcome Bonus',detail:'New wallet created',amount:100,time:new Date().toISOString()},
    {type:'earn',label:'Daily Login',detail:'Streak: 1 day',amount:1,time:new Date().toISOString()},
  ];
  localStorage.setItem('roadcoin_txs',JSON.stringify(txs));
}
function renderTx(){
  document.getElementById('txList').innerHTML=txs.slice().reverse().map(t=>'<div class="tx-item"><div class="tx-icon '+(t.type==='earn'?'earn':'spend')+'">'+
    (t.type==='earn'?'↓':'↑')+'</div><div class="tx-info"><div class="tx-label">'+t.label+'</div><div class="tx-detail">'+t.detail+'</div></div><div class="tx-amount '+(t.type==='earn'?'pos':'neg')+'">'+
    (t.type==='earn'?'+':'-')+t.amount.toFixed(2)+' RC</div></div>').join('');
}
renderTx();

// Send modal
document.getElementById('sendBtn').onclick=()=>document.getElementById('sendModal').classList.add('show');
document.getElementById('cancelSend').onclick=()=>document.getElementById('sendModal').classList.remove('show');
document.getElementById('confirmSend').onclick=()=>{
  const to=document.getElementById('sendTo').value.trim();
  const amount=parseFloat(document.getElementById('sendAmount').value);
  const memo=document.getElementById('sendMemo').value;
  if(!to||!amount||amount<=0||amount>wallet.balance){alert('Invalid amount');return}
  wallet.balance-=amount;
  txs.push({type:'spend',label:'Sent to '+to.slice(0,12)+'...',detail:memo||'Transfer',amount,time:new Date().toISOString()});
  localStorage.setItem('roadcoin_wallet',JSON.stringify(wallet));
  localStorage.setItem('roadcoin_txs',JSON.stringify(txs));
  document.getElementById('balance').innerHTML=wallet.balance.toFixed(2)+' <span class="unit">RC</span>';
  renderTx();
  document.getElementById('sendModal').classList.remove('show');
  ['sendTo','sendAmount','sendMemo'].forEach(id=>document.getElementById(id).value='');
};

// Earn button
document.getElementById('earnBtn').onclick=()=>location.href='https://roadwork.blackroad.io';
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/init') {
      for (const sql of SCHEMA) await env.DB.exec(sql);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/balance') {
      const addr = url.searchParams.get('address');
      if (!addr) return new Response(JSON.stringify({ error: 'address required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      try {
        const row = await env.DB.prepare('SELECT * FROM wallets WHERE address = ?').bind(addr).first();
        return new Response(JSON.stringify(row || { balance: 0 }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch {
        return new Response(JSON.stringify({ balance: 0 }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/transactions') {
      const addr = url.searchParams.get('address');
      try {
        const { results } = await env.DB.prepare('SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY created_at DESC LIMIT 50')
          .bind(addr || '', addr || '').all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    return secHeaders(new Response(ROOT_HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } }));
  }
};
