const API_URL= '/api';
const SOCKET_URL = window.location.origin;

let MY_USER_ID = localStorage.getItem('kroww_user_id') || '';

const socket = io(SOCKET_URL);
let activeConvId = null;
let typingTimer  = null;

socket.on('receive_message', (msg) => {
  if (msg.conversationId === activeConvId) {
    appendMessage(msg, false);
    scrollToBottom();
    Notifications.markRead(activeConvId); 
  }
  Notifications.onNewMessage(msg);
  loadContacts();
});

socket.on('typing', ({ userName }) => {
  const el = document.getElementById('typing');
  const lbl = document.getElementById('typing-lbl');
  if (el && lbl) { lbl.textContent = `${userName} is typing…`; el.style.display = 'block'; }
});

socket.on('stop_typing', () => {
  const el = document.getElementById('typing');
  if (el) el.style.display = 'none';
});

let conversations = [];  
let activeContact = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!MY_USER_ID) {
    window.location.href = '/auth.html';
    return;
  }
  await loadContacts();
  Notifications.init(MY_USER_ID);
});

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API_URL + path, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err) {
    console.error('API error:', err);
    return null;
  }
}

async function loadContacts(filter = '') {
  const data = await apiFetch(`/conversations?userId=${MY_USER_ID}`);
  if (!data) return;
  conversations = data;
  renderContacts(filter);
  if (!activeConvId && conversations.length) openConv(conversations[0]._id);
}

function renderContacts(filter = '') {
  const el = document.getElementById('contacts');
  const list = conversations.filter(c => {
    const other = getOtherParticipant(c);
    return other && other.name.toLowerCase().includes(filter.toLowerCase());
  });

  el.innerHTML = list.map(c => {
    const other = getOtherParticipant(c);
    if (!other) return '';
    const unread = c.unreadCount?.[MY_USER_ID] || 0;
    const active = c._id === activeConvId ? 'on' : '';
    return `
      <div class="contact ${active}" onclick="openConv('${c._id}')">
        <div class="c-av" style="background:${other.avatarColor}">${other.initials}</div>
        <div class="c-body">
          <div class="c-name">${other.name}</div>
          <div class="c-prev">${c.lastMessage || '—'}</div>
        </div>
        <div class="c-meta">
          <span class="c-time">${formatRelative(c.lastMessageAt)}</span>
          ${unread ? `<span class="unread">${unread}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

function getOtherParticipant(conv) {
  return conv.participants.find(p => p._id !== MY_USER_ID);
}

async function openConv(convId) {
  if (activeConvId) socket.emit('leave_room', activeConvId);

  activeConvId = convId;
  const conv = conversations.find(c => c._id === convId);
  if (!conv) return;
  activeContact = conv;

  socket.emit('join_room', convId);
  renderContacts();

  const other = getOtherParticipant(conv);
  if (other) {
    document.getElementById('h-av').textContent = other.initials;
    document.getElementById('h-av').style.background = other.avatarColor;
    document.getElementById('h-name').textContent = other.name;
    document.getElementById('h-status').textContent = (other.online ? '● Online' : '○ Offline') + ' · ' + other.role;
    document.getElementById('h-status').style.color = other.online ? '#4caf50' : 'var(--muted)';
    document.getElementById('typing-lbl').textContent = other.name + ' is typing…';
  }
  if (conv.requestTitle) {
    document.getElementById('ctx-title').textContent = 'Request: ' + conv.requestTitle;
  }

  await loadMessages(convId);
}

async function loadMessages(convId) {
  const msgs = await apiFetch(`/messages/${convId}?userId=${MY_USER_ID}`);
  if (!msgs) return;

  const area = document.getElementById('messages');
  area.innerHTML = '';

  let lastDate = null;
  msgs.forEach(m => {
    const d = new Date(m.createdAt).toLocaleDateString();
    if (d !== lastDate) {
      const sep = document.createElement('div');
      sep.className = 'date-sep';
      sep.innerHTML = `<span>${d}</span>`;
      area.appendChild(sep);
      lastDate = d;
    }
    appendMessage(m, true);
  });
  scrollToBottom();
}

function appendMessage(msg, skipScroll = false) {
  const area = document.getElementById('messages');
  const isMe = msg.senderId?._id === MY_USER_ID || msg.senderId === MY_USER_ID;
  const side  = isMe ? 'me' : 'them';
  const wrap  = document.createElement('div');
  wrap.className = `msg-wrap ${side}`;
  wrap.dataset.id = msg._id;

  if (msg.type === 'file') {
    wrap.innerHTML = `
      <a class="file-msg" href="${API_URL.replace('/api','')}${msg.fileUrl || '#'}" target="_blank" download="${msg.fileName}">
        <span style="font-size:1.4rem;">📄</span>
        <div>
          <div style="font-size:0.8rem;font-weight:600">${msg.fileName}</div>
          <div style="font-size:0.72rem;color:var(--muted)">${msg.fileSize}</div>
        </div>
      </a>
      <div class="msg-time">${formatRelative(msg.createdAt)}</div>`;
  } else if (msg.type === 'offer') {
    const accepted = msg.offerStatus === 'accepted';
    const declined = msg.offerStatus === 'declined';
    wrap.innerHTML = `
      <div class="offer-msg">
        <div style="font-weight:700;font-size:0.88rem;margin-bottom:0.3rem;">💰 Service Offer</div>
        <div class="op">$${msg.offerPrice}</div>
        <div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.7rem;">⏱ ${msg.offerDelivery} · ${msg.offerNote}</div>
        ${accepted
          ? '<div style="color:#4caf50;font-weight:600;font-size:0.82rem;">✅ Accepted</div>'
          : declined
          ? '<div style="color:var(--red);font-weight:600;font-size:0.82rem;">❌ Declined</div>'
          : !isMe
          ? `<div style="display:flex;gap:0.5rem;">
               <button class="btn btn-red btn-sm" onclick="respondOffer('${msg._id}','accepted')">Accept & Pay</button>
               <button class="btn btn-ghost btn-sm" onclick="respondOffer('${msg._id}','declined')">Decline</button>
             </div>`
          : '<div style="color:var(--muted);font-size:0.78rem;">Awaiting response…</div>'
        }
      </div>
      <div class="msg-time">${formatRelative(msg.createdAt)}</div>`;
  } else {
    wrap.innerHTML = `
      <div class="bubble">${(msg.text || '').replace(/\n/g,'<br>')}</div>
      <div class="msg-time">${formatRelative(msg.createdAt)}</div>`;
  }

  area.appendChild(wrap);
  if (!skipScroll) scrollToBottom();
}

async function send() {
  const inp  = document.getElementById('msg-in');
  const text = inp.value.trim();
  if (!text || !activeConvId) return;

  inp.value = '';
  inp.style.height = 'auto';
  socket.emit('stop_typing', { conversationId: activeConvId });

  const msg = await apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify({ conversationId: activeConvId, senderId: MY_USER_ID, type: 'text', text }),
  });
  if (!msg) return;

  appendMessage(msg);
  socket.emit('send_message', { conversationId: activeConvId, message: msg });
  loadContacts();
}

function attachFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file || !activeConvId) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('conversationId', activeConvId);
    fd.append('senderId', MY_USER_ID);
    try {
      const res = await fetch(`${API_URL}/messages/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const msg = await res.json();
      appendMessage(msg);
      socket.emit('send_message', { conversationId: activeConvId, message: msg });
      loadContacts();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };
  input.click();
}

async function sendOffer() {
  const price    = document.querySelector('#modal input[type=number]')?.value;
  const delivery = document.querySelector('#modal select')?.value;
  const note     = document.querySelector('#modal textarea')?.value;
  closeModal();
  if (!price || !activeConvId) return;

  const msg = await apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify({
      conversationId: activeConvId,
      senderId: MY_USER_ID,
      type: 'offer',
      offerPrice: Number(price),
      offerDelivery: delivery,
      offerNote: note,
    }),
  });
  if (!msg) return;
  appendMessage(msg);
  socket.emit('send_message', { conversationId: activeConvId, message: msg });
  loadContacts();
}

async function respondOffer(msgId, status) {
  const msg = await apiFetch(`/messages/${msgId}/offer`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!msg) return;
  const existing = document.querySelector(`[data-id="${msgId}"]`);
  if (existing) existing.remove();
  appendMessage(msg);
  socket.emit('send_message', { conversationId: activeConvId, message: msg });
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); return; }
  if (!activeConvId) return;
  const other = getOtherParticipant(activeContact);
  socket.emit('typing', { conversationId: activeConvId, userName: 'You' });
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('stop_typing', { conversationId: activeConvId });
  }, 1500);
}

function formatRelative(dateStr) {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = now - d;
  if (diff < 60000)        return 'just now';
  if (diff < 3600000)      return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000)     return Math.floor(diff / 3600000) + 'h ago';
  if (diff < 2 * 86400000) return 'Yesterday';
  return d.toLocaleDateString();
}

function scrollToBottom() {
  const area = document.getElementById('messages');
  if (area) area.scrollTop = area.scrollHeight;
}

function resize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function filterC(v) { renderContacts(v); }

function showModal()  { document.getElementById('modal').classList.add('show'); }
function closeModal() { document.getElementById('modal').classList.remove('show'); }
