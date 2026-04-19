const CONTACTS = [
  {id:'sara',  name:'Sara',  ini:'SM', bg:'#970A12', role:'Designer',  online:true,  unread:2, prev:"I've sent the first draft!", time:'2m',  req:'Logo for The Roasted Bean'},
  {id:'karim', name:'Karim', ini:'KB', bg:'#5686BB', role:'Developer', online:true,  unread:0, prev:'Staging link is ready',     time:'1h',  req:'React web app build'},
  {id:'lena',  name:'Lena',  ini:'LF', bg:'#D1601F', role:'Writer',   online:false, unread:0, prev:'Thanks for the 5 stars!',   time:'2d',  req:'5 SEO blog articles'},
  {id:'omar',  name:'Omar',  ini:'ON', bg:'#70191D', role:'Marketer', online:false, unread:1, prev:'Campaign is live!',          time:'3d',  req:'Instagram & TikTok ads'},
];

const MSGS = {
  sara: [
    {from:'them', type:'text', text:'Hi! I saw your request — I\'d love to help with your coffee shop logo 🎨', time:'Yesterday'},
    {from:'me',   type:'text', text:'Great! I love your portfolio. Go with the earthy terracotta palette.', time:'Yesterday'},
    {from:'them', type:'file', name:'initial_moodboard.pdf', size:'1.2 MB', time:'Yesterday'},
    {from:'them', type:'text', text:'Here\'s a mood board before I start the concepts. Let me know if this direction feels right!', time:'Yesterday'},
    {from:'me',   type:'text', text:'This is exactly the vibe! Let\'s go 🙌', time:'Yesterday'},
    {from:'them', type:'offer', price:75, delivery:'3 days', note:'3 concepts, unlimited revisions, all source files.', time:'Yesterday'},
    {from:'me',   type:'text', text:'Offer accepted!', time:'Today'},
    {from:'them', type:'text', text:"I've sent the first draft!", time:'Today'},
    {from:'them', type:'file', name:'logo_concept_v1.zip', size:'4.8 MB', time:'Today'},
  ],
  karim: [
    {from:'them', type:'text', text:'Hey! React app is done. Staging link is ready.', time:'Yesterday'},
    {from:'me',   type:'text', text:'Testing now… looks great overall!', time:'Yesterday'},
    {from:'me',   type:'text', text:'One issue: mobile nav doesn\'t close on outside tap.', time:'Yesterday'},
    {from:'them', type:'text', text:'On it! Fix coming tonight.', time:'Yesterday'},
  ],
  lena: [
    {from:'them', type:'text', text:'All 5 articles delivered with SEO optimization.', time:'3 days ago'},
    {from:'me',   type:'text', text:'These are brilliant, exactly what we needed! Releasing payment.', time:'3 days ago'},
    {from:'them', type:'text', text:'Thanks for the 5 stars! 🙏', time:'3 days ago'},
  ],
  omar: [
    {from:'them', type:'text', text:'Instagram + TikTok campaigns are live! CTR is 3.2%.', time:'3 days ago'},
    {from:'me',   type:'text', text:'Great work Omar!', time:'3 days ago'},
    {from:'them', type:'text', text:'Campaign is live! Full report at end of week.', time:'Today'},
  ],
};

let active = 'sara';
let timer = null;

function renderContacts(filter = '') {
  const el = document.getElementById('contacts');
  const list = CONTACTS.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
  el.innerHTML = list.map(c => `
    <div class="contact ${c.id === active ? 'on' : ''}" onclick="open('${c.id}')">
      <div class="c-av" style="background:${c.bg}">${c.ini}</div>
      <div class="c-body">
        <div class="c-name">${c.name}</div>
        <div class="c-prev">${c.prev}</div>
      </div>
      <div class="c-meta">
        <span class="c-time">${c.time}</span>
        ${c.unread ? `<span class="unread">${c.unread}</span>` : ''}
      </div>
    </div>`).join('');
}

function open(id) {
  active = id;
  const c = CONTACTS.find(x => x.id === id);
  c.unread = 0;
  renderContacts();
  document.getElementById('h-av').textContent = c.ini;
  document.getElementById('h-av').style.background = c.bg;
  document.getElementById('h-name').textContent = c.name;
  document.getElementById('h-status').textContent = (c.online ? '● Online' : '○ Offline') + ' · ' + c.role;
  document.getElementById('h-status').style.color = c.online ? '#4caf50' : 'var(--muted)';
  document.getElementById('ctx-title').textContent = 'Request: ' + c.req;
  document.getElementById('typing-lbl').textContent = c.name.split(' ')[0] + ' is typing…';
  renderMsgs();
}

function renderMsgs() {
  const area = document.getElementById('messages');
  const msgs = MSGS[active] || [];
  const c = CONTACTS.find(x => x.id === active);
  let html = '<div class="date-sep"><span>Yesterday</span></div>';
  msgs.forEach((m, i) => {
    if (m.time === 'Today' && (i === 0 || msgs[i-1].time !== 'Today')) {
      html += '<div class="date-sep"><span>Today</span></div>';
    }
    if (m.type === 'file') {
      html += `<div class="msg-wrap ${m.from}">
        <div class="file-msg"><span style="font-size:1.4rem;">📄</span><div><div style="font-size:0.8rem;font-weight:600">${m.name}</div><div style="font-size:0.72rem;color:var(--muted)">${m.size}</div></div></div>
        <div class="msg-time">${m.time}</div></div>`;
    } else if (m.type === 'offer') {
      html += `<div class="msg-wrap ${m.from}">
        <div class="offer-msg">
          <div style="font-weight:700;font-size:0.88rem;margin-bottom:0.3rem;">💰 Service Offer</div>
          <div class="op">$${m.price}</div>
          <div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.7rem;">⏱ ${m.delivery} · ${m.note}</div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-red btn-sm" onclick="location.href='payment.html'">Accept & Pay</button>
            <button class="btn btn-ghost btn-sm">Decline</button>
          </div>
        </div>
        <div class="msg-time">${m.time}</div></div>`;
    } else {
      html += `<div class="msg-wrap ${m.from}">
        <div class="bubble">${m.text.replace(/\n/g,'<br>')}</div>
        <div class="msg-time">${m.time}</div></div>`;
    }
  });
  area.innerHTML = html;
  area.scrollTop = area.scrollHeight;
}

function send() {
  const inp = document.getElementById('msg-in');
  const text = inp.value.trim();
  if (!text) return;
  if (!MSGS[active]) MSGS[active] = [];
  MSGS[active].push({from:'me', type:'text', text, time:'Today'});
  inp.value = ''; inp.style.height = 'auto';
  renderMsgs();
  // auto reply if online
  const c = CONTACTS.find(x => x.id === active);
  if (c.online) {
    document.getElementById('typing').style.display = 'block';
    clearTimeout(timer);
    timer = setTimeout(() => {
      document.getElementById('typing').style.display = 'none';
      const replies = ['Got it, on it! 👍','Thanks for letting me know!','Understood, I\'ll update you soon.','Noted! Leave it with me.'];
      const reply = replies[Math.floor(Math.random()*replies.length)];
      MSGS[active].push({from:'them', type:'text', text:reply, time:'Today'});
      c.prev = reply;
      renderMsgs(); renderContacts();
    }, 1500 + Math.random()*800);
  }
}

function attachFile() {
  if (!MSGS[active]) MSGS[active] = [];
  MSGS[active].push({from:'me', type:'file', name:'project_brief.pdf', size:'0.8 MB', time:'Today'});
  renderMsgs();
}

function sendOffer() {
  closeModal();
  if (!MSGS[active]) MSGS[active] = [];
  MSGS[active].push({from:'me', type:'offer', price:85, delivery:'3 days', note:'Full delivery with revisions.', time:'Today'});
  renderMsgs();
}

function showModal() { document.getElementById('modal').classList.add('show'); }
function closeModal() { document.getElementById('modal').classList.remove('show'); }
function filterC(v) { renderContacts(v); }
function onKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }
function resize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px'; }

document.addEventListener('DOMContentLoaded', () => { renderContacts(); renderMsgs(); });