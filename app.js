const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const state = JSON.parse(localStorage.getItem('terry-copilot-state') || '{}');
const save = () => localStorage.setItem('terry-copilot-state', JSON.stringify(state));

const data = {
  knowledge: [
    {icon:'MD', name:'旧地图·新世界 核心设定.md', meta:'小说 · 2.4 MB · 已索引'},
    {icon:'PDF', name:'AI 产品设计参考.pdf', meta:'产品 · 18.6 MB · 已索引'},
    {icon:'TXT', name:'聊天记录_2026-08.txt', meta:'资料 · 9.1 MB · 待整理'},
    {icon:'ZIP', name:'项目资料归档.zip', meta:'归档 · 326 MB · 已导入'}
  ],
  notes: [
    {title:'Copilot 产品决策', text:'单用户、本地优先、四区统一由一个 AI 助理管理。', time:'今天 19:42'},
    {title:'巨型任务原则', text:'先计划、可暂停、断点续跑、阶段自检、过程透明。', time:'今天 18:10'},
    {title:'小说改编准则', text:'素材是矿，不是大纲。保留内核，重组表层事件。', time:'昨天'},
    {title:'待办', text:'接入 DeepSeek API；补文件导入；加本地备份。', time:'昨天'}
  ],
  repos: [
    {icon:'⌘', name:'personal-copilot-ios', meta:'Swift · 24 files · 今天修改'},
    {icon:'WEB', name:'portfolio-site', meta:'HTML / CSS / JS · 18 files'},
    {icon:'JS', name:'api-experiments', meta:'JavaScript · 7 snippets'}
  ]
};

function renderLists(){
  const q = ($('#knowledgeSearch')?.value || '').trim().toLowerCase();
  $('#knowledgeList').innerHTML = data.knowledge.filter(x => !q || (x.name+x.meta).toLowerCase().includes(q)).map((x,i)=>`
    <div class="file-row" data-index="${i}"><div class="file-icon">${x.icon}</div><div><strong>${x.name}</strong><small>${x.meta}</small></div><button class="row-more" data-delete="knowledge" data-index="${i}">⋯</button></div>`).join('');
  $('#noteGrid').innerHTML = data.notes.map((x,i)=>`<article class="note-card" data-index="${i}"><div><h3>${x.title}</h3><p>${x.text}</p></div><small>${x.time}</small></article>`).join('');
  $('#repoList').innerHTML = data.repos.map((x,i)=>`<div class="repo-row"><div class="repo-icon">${x.icon}</div><div><strong>${x.name}</strong><small>${x.meta}</small></div><button class="row-more" data-delete="repos" data-index="${i}">⋯</button></div>`).join('');
}
renderLists();

$$('.tab').forEach(btn => btn.addEventListener('click', () => {
  const tab = btn.dataset.tab;
  $$('.tab').forEach(x=>x.classList.toggle('active', x===btn));
  $$('.view').forEach(v=>v.classList.toggle('active', v.dataset.view===tab));
  const names = {chat:'我的个人助理',knowledge:'知识库',notes:'笔记',code:'代码库'};
  $('#headerSub').textContent = names[tab];
}));

const scrim = $('#scrim');
const openDrawer = el => { el.classList.add('open'); scrim.classList.add('show'); };
const closeOverlays = () => { $$('.drawer,.sheet').forEach(x=>x.classList.remove('open')); scrim.classList.remove('show'); };
$('#historyBtn').onclick = () => openDrawer($('#historyDrawer'));
$('#assistantBtn').onclick = () => openDrawer($('#assistantDrawer'));
$$('[data-close]').forEach(b=>b.onclick=closeOverlays);
scrim.onclick = closeOverlays;

['webToggle','researchToggle'].forEach(id => {
  const el = $('#'+id); const key=id+'On';
  if(state[key]) el.classList.add('on');
  el.onclick=()=>{ el.classList.toggle('on'); state[key]=el.classList.contains('on'); save(); };
});

$('#modelBtn').onclick=()=>{ $('#modelSheet').classList.add('open'); scrim.classList.add('show'); };
$$('[data-sheet-close]').forEach(b=>b.onclick=closeOverlays);
$$('.model-option').forEach(opt=>opt.onclick=()=>{
  $$('.model-option').forEach(x=>x.classList.remove('selected'));
  opt.classList.add('selected');
  $$('.model-option b').forEach(x=>x.textContent='');
  $('b', opt).textContent='✓';
  state.model=opt.dataset.model; $('#modelName').textContent=state.model; save();
});
if(state.model) $('#modelName').textContent=state.model;
$$('#reasoningSeg button').forEach(btn=>btn.onclick=()=>{
  $$('#reasoningSeg button').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  state.reasoning=btn.textContent; save();
});
if(state.reasoning){ $$('#reasoningSeg button').forEach(x=>x.classList.toggle('active',x.textContent===state.reasoning)); }

function autosize(){ const t=$('#chatInput'); t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,130)+'px'; }
$('#chatInput').addEventListener('input', autosize);
$('#chatInput').addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } });
$('#sendBtn').onclick=sendMessage;
function sendMessage(){
  const t=$('#chatInput'), value=t.value.trim(); if(!value) return;
  const user=document.createElement('div'); user.className='message user-message'; user.innerHTML=`<p>${escapeHtml(value)}</p>`;
  $('#chatScroll').insertBefore(user,$('.task-card'));
  t.value=''; autosize();
  const ai=document.createElement('div'); ai.className='message ai-message'; ai.innerHTML='<div class="ai-label">COPILOT</div><p>收到。这个 PWA 版目前先用本地演示逻辑响应；下一步接上你的 DeepSeek API 后，这里会变成真实流式回复。</p>';
  $('#chatScroll').insertBefore(ai,$('.task-card'));
  $('#chatScroll').scrollTop=$('#chatScroll').scrollHeight;
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

let paused=false, progress=42;
$('#pauseTaskBtn').onclick=()=>{ paused=!paused; $('#pauseTaskBtn').textContent=paused?'继续':'暂停'; $('#taskStage').textContent=paused?'任务已暂停':'正在建立主题索引'; };
setInterval(()=>{ if(paused||progress>=96)return; progress++; $('#taskPercent').textContent=progress+'%'; $('#taskBar').style.width=progress+'%'; }, 5000);

$('#knowledgeSearch').addEventListener('input',renderLists);
$$('.filter').forEach(btn=>btn.onclick=()=>{ $$('.filter').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); });
$$('.assist-action').forEach(btn=>btn.onclick=()=>{
  $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='chat'));
  $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view==='chat'));
  $('#chatInput').value=btn.dataset.assist+'：'; autosize(); $('#chatInput').focus();
});

$('#addNoteBtn').onclick=()=>{ data.notes.unshift({title:'新笔记',text:'点这里开始记录。之后可让 Copilot 自动补写与整理。',time:'刚刚'}); renderLists(); };

let deleteTarget=null;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-delete]'); if(!b)return;
  deleteTarget={type:b.dataset.delete,index:Number(b.dataset.index)}; $('#confirmModal').classList.add('show');
});
$('#cancelDelete').onclick=()=>{deleteTarget=null;$('#confirmModal').classList.remove('show')};
$('#confirmDelete').onclick=()=>{
  if(deleteTarget){ data[deleteTarget.type].splice(deleteTarget.index,1); renderLists(); }
  deleteTarget=null; $('#confirmModal').classList.remove('show');
};

$$('.settings-list button').forEach(btn=>btn.onclick=()=>{
  alert(`${btn.dataset.panel}：第一版已预留入口。下一步接真实配置页。`);
});

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
