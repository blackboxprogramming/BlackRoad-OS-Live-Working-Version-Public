// PROPRIETARY AND CONFIDENTIAL. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.
// RoadWork — The Task Manager | roadwork.blackroad.io

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    color TEXT DEFAULT '#FF2255',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    assignee TEXT DEFAULT '',
    due_date TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
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
<title>RoadWork — Task Manager | BlackRoad OS</title>
<meta name="description" content="Kanban task manager with projects, priorities, tags, assignees, and drag-and-drop. Get things done with The Roadies.">
<meta property="og:title" content="RoadWork — Task Manager">
<meta property="og:url" content="https://roadwork.blackroad.io">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a0a'/><circle cx='10' cy='16' r='5' fill='%23FF2255'/><rect x='18' y='11' width='10' height='10' rx='2' fill='%238844FF'/></svg>">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
body{background:var(--bg);color:var(--text);font-family:var(--sg);height:100vh;overflow:hidden}
.grad-bar{height:3px;background:var(--g)}
.app{display:flex;flex-direction:column;height:calc(100vh - 3px)}
.top-bar{display:flex;align-items:center;gap:12px;padding:12px 20px;background:var(--card);border-bottom:1px solid var(--border)}
.top-bar h1{font-size:18px;font-weight:700}
.top-bar .spacer{flex:1}
.add-btn{padding:8px 16px;background:var(--white);color:#000;border:none;border-radius:8px;font-family:var(--sg);font-weight:600;font-size:13px;cursor:pointer}
.add-btn:hover{background:#e0e0e0}
.filter-bar{display:flex;gap:8px;padding:10px 20px;background:var(--card);border-bottom:1px solid var(--border)}
.filter-pill{padding:5px 14px;background:transparent;border:1px solid var(--border);border-radius:20px;color:var(--sub);font-family:var(--jb);font-size:11px;cursor:pointer;transition:all .15s}
.filter-pill:hover{border-color:var(--sub);color:var(--text)}
.filter-pill.active{border-color:#FF2255;color:var(--text);background:#1a0a0f}
.board{display:flex;gap:16px;padding:20px;flex:1;overflow-x:auto}
.column{min-width:280px;width:280px;background:var(--card);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;max-height:100%}
.col-header{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.col-title{font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}
.col-count{font-size:10px;font-family:var(--jb);color:var(--sub);padding:2px 8px;background:var(--elevated);border-radius:10px}
.col-body{flex:1;overflow-y:auto;padding:8px}
.task-card{background:var(--elevated);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:6px;cursor:grab;transition:all .15s}
.task-card:hover{border-color:var(--sub)}
.task-card.dragging{opacity:.5}
.task-title{font-size:13px;font-weight:500;margin-bottom:6px}
.task-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.task-priority{font-size:9px;font-family:var(--jb);padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em}
.task-priority.high{background:#2a0a0f;color:#FF2255;border:1px solid #3a1a2f}
.task-priority.medium{background:#1a1a0a;color:#f59e0b;border:1px solid #2a2a1a}
.task-priority.low{background:#0a1a0f;color:#22c55e;border:1px solid #1a2a1f}
.task-tag{font-size:9px;font-family:var(--jb);padding:2px 6px;border-radius:4px;background:var(--bg);border:1px solid var(--border);color:var(--sub)}
.task-assignee{font-size:10px;color:var(--sub);font-family:var(--jb)}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:100}
.modal-overlay.show{display:flex}
.modal{background:var(--card);border:1px solid var(--border);border-radius:12px;width:420px;max-width:90vw;padding:24px}
.modal h2{font-size:16px;margin-bottom:16px}
.form-group{margin-bottom:12px}
.form-group label{display:block;font-size:11px;color:var(--sub);font-family:var(--jb);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}
.form-group input,.form-group textarea,.form-group select{width:100%;padding:8px 12px;background:var(--elevated);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--sg);font-size:13px;outline:none}
.form-group input:focus,.form-group textarea:focus{border-color:var(--sub)}
.form-group textarea{height:80px;resize:vertical}
.modal-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.modal-btn{padding:8px 16px;border-radius:6px;font-family:var(--sg);font-size:13px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text)}
.modal-btn.primary{background:var(--white);color:#000;border:none;font-weight:600}
</style>
<link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head>
<body>
<div class="grad-bar"></div>
<div class="app">
  <div class="top-bar">
    <h1>RoadWork</h1>
    <span class="spacer"></span>
    <button class="add-btn" id="addBtn">+ New Task</button>
  </div>
  <div class="filter-bar">
    <button class="filter-pill active" data-filter="all">All</button>
    <button class="filter-pill" data-filter="high">High Priority</button>
    <button class="filter-pill" data-filter="medium">Medium</button>
    <button class="filter-pill" data-filter="low">Low</button>
  </div>
  <div class="board" id="board">
    <div class="column" data-status="todo">
      <div class="col-header"><span class="col-title">To Do <span class="col-count" id="todoCount">0</span></span></div>
      <div class="col-body" id="todoCol"></div>
    </div>
    <div class="column" data-status="in-progress">
      <div class="col-header"><span class="col-title">In Progress <span class="col-count" id="ipCount">0</span></span></div>
      <div class="col-body" id="ipCol"></div>
    </div>
    <div class="column" data-status="review">
      <div class="col-header"><span class="col-title">Review <span class="col-count" id="reviewCount">0</span></span></div>
      <div class="col-body" id="reviewCol"></div>
    </div>
    <div class="column" data-status="done">
      <div class="col-header"><span class="col-title">Done <span class="col-count" id="doneCount">0</span></span></div>
      <div class="col-body" id="doneCol"></div>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modal">
  <div class="modal">
    <h2>New Task</h2>
    <div class="form-group"><label>Title</label><input type="text" id="taskTitle" placeholder="Task title"></div>
    <div class="form-group"><label>Description</label><textarea id="taskDesc" placeholder="Details..."></textarea></div>
    <div class="form-group"><label>Priority</label><select id="taskPriority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
    <div class="form-group"><label>Assignee</label><input type="text" id="taskAssignee" placeholder="Agent name"></div>
    <div class="form-group"><label>Tags (comma separated)</label><input type="text" id="taskTags" placeholder="frontend, bug"></div>
    <div class="modal-btns">
      <button class="modal-btn" id="cancelBtn">Cancel</button>
      <button class="modal-btn primary" id="saveBtn">Create</button>
    </div>
  </div>
</div>
<script>
let tasks=JSON.parse(localStorage.getItem('roadwork_tasks')||'[]');
let filter='all';
const COLS={todo:'todoCol','in-progress':'ipCol',review:'reviewCol',done:'doneCol'};
const COUNTS={todo:'todoCount','in-progress':'ipCount',review:'reviewCount',done:'doneCount'};

function render(){
  Object.values(COLS).forEach(id=>document.getElementById(id).innerHTML='');
  const filtered=filter==='all'?tasks:tasks.filter(t=>t.priority===filter);
  const counts={todo:0,'in-progress':0,review:0,done:0};
  filtered.forEach((t,i)=>{
    counts[t.status]=(counts[t.status]||0)+1;
    const tags=(t.tags||[]).map(tg=>'<span class="task-tag">'+tg+'</span>').join('');
    const card=document.createElement('div');
    card.className='task-card';card.draggable=true;card.dataset.idx=i;
    card.innerHTML='<div class="task-title">'+esc(t.title)+'</div><div class="task-meta"><span class="task-priority '+t.priority+'">'+t.priority+'</span>'+tags+(t.assignee?'<span class="task-assignee">@'+esc(t.assignee)+'</span>':'')+'</div>';
    card.ondragstart=e=>{e.dataTransfer.setData('text/plain',tasks.indexOf(t));card.classList.add('dragging')};
    card.ondragend=()=>card.classList.remove('dragging');
    card.ondblclick=()=>{if(confirm('Delete "'+t.title+'"?')){tasks.splice(tasks.indexOf(t),1);save();render()}};
    document.getElementById(COLS[t.status])?.appendChild(card);
  });
  Object.entries(COUNTS).forEach(([s,id])=>{document.getElementById(id).textContent=counts[s]||0});
}

// Drag & drop
document.querySelectorAll('.col-body').forEach(col=>{
  col.ondragover=e=>e.preventDefault();
  col.ondrop=e=>{
    e.preventDefault();
    const idx=+e.dataTransfer.getData('text/plain');
    const status=col.parentElement.dataset.status;
    tasks[idx].status=status;tasks[idx].updated_at=new Date().toISOString();
    save();render();
  };
});

// Filters
document.querySelectorAll('.filter-pill').forEach(p=>{p.onclick=()=>{document.querySelectorAll('.filter-pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');filter=p.dataset.filter;render()}});

// Modal
document.getElementById('addBtn').onclick=()=>document.getElementById('modal').classList.add('show');
document.getElementById('cancelBtn').onclick=()=>document.getElementById('modal').classList.remove('show');
document.getElementById('saveBtn').onclick=()=>{
  const title=document.getElementById('taskTitle').value.trim();
  if(!title)return;
  tasks.push({title,description:document.getElementById('taskDesc').value,priority:document.getElementById('taskPriority').value,assignee:document.getElementById('taskAssignee').value,tags:document.getElementById('taskTags').value.split(',').map(t=>t.trim()).filter(Boolean),status:'todo',created_at:new Date().toISOString()});
  save();render();
  document.getElementById('modal').classList.remove('show');
  ['taskTitle','taskDesc','taskAssignee','taskTags'].forEach(id=>document.getElementById(id).value='');
};

function save(){localStorage.setItem('roadwork_tasks',JSON.stringify(tasks))}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// Seed demo tasks if empty
if(tasks.length===0){
  tasks=[
    {title:'Deploy all 18 products',description:'Ensure every product domain resolves and renders',priority:'high',assignee:'Cecilia',tags:['deploy','infrastructure'],status:'done',created_at:new Date().toISOString()},
    {title:'Set up Stripe live mode',description:'Create live products and payment links',priority:'high',assignee:'Roadie',tags:['billing','stripe'],status:'in-progress',created_at:new Date().toISOString()},
    {title:'Connect Pi fleet to agents',description:'Ollama models accessible from all Workers',priority:'medium',assignee:'Lucidia',tags:['ai','fleet'],status:'todo',created_at:new Date().toISOString()},
    {title:'Write onboarding tutorial',description:'First-user experience for BlackRoad OS',priority:'medium',assignee:'Roadie',tags:['docs','ux'],status:'todo',created_at:new Date().toISOString()},
    {title:'SEO audit all domains',description:'Check meta tags, sitemaps, robots.txt',priority:'low',assignee:'Alexandria',tags:['seo'],status:'review',created_at:new Date().toISOString()},
  ];
  save();
}
render();
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

    if (url.pathname === '/api/tasks' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100').all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/tasks' && request.method === 'POST') {
      try {
        const { title, description, priority, assignee, tags, status } = await request.json();
        await env.DB.prepare('INSERT INTO tasks (title, description, priority, assignee, tags, status) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(title, description || '', priority || 'medium', assignee || '', JSON.stringify(tags || []), status || 'todo').run();
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return secHeaders(new Response(ROOT_HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } }));
  }
};
