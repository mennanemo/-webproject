const Notifications = (() => {
  let _userId = null;
  let _pollInterval = null;
  let _isOpen= false;
  const POLL_MS = 15000; 


  function init(userId) {
    if (!userId) return;
    _userId = userId;

    _buildUI();
    _bindEvents();
    fetchAndRender();

    _pollInterval = setInterval(fetchAndRender, POLL_MS);
  }


  async function fetchAndRender() {
    try {
      const res  = await fetch(`/api/notifications?userId=${_userId}`);
      if (!res.ok) return;
      const data = await res.json();
      _render(data.notifications, data.totalUnread);
    } catch (err) {
      console.error('Notifications fetch error:', err);
    }
  }

  function onNewMessage(msg) {
    if (!_userId) return;
    const senderId = msg.senderId?._id || msg.senderId;
    if (senderId === _userId) return;

    fetchAndRender();
  }

  async function markRead(conversationId) {
    if (!_userId || !conversationId) return;
    try {
      await fetch('/api/notifications/mark-read', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ conversationId, userId: _userId }),
      });
      fetchAndRender();
    } catch (err) {
      console.error('Mark read error:', err);
    }
  }

  async function markAllRead() {
    const items = document.querySelectorAll('.notif-item');
    const ids   = [...items].map(el => el.dataset.convId).filter(Boolean);
    await Promise.all(ids.map(id => markRead(id)));
  }

  function _render(notifications, totalUnread) {
    _updateBadge(totalUnread);
    _updateTabTitle(totalUnread);
    _updatePanel(notifications);
  }

  function _updateBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function _updateTabTitle(count) {
    const base = 'Kroww Chat';
    document.title = count > 0 ? `(${count}) ${base}` : base;
  }

  function _updatePanel(notifications) {
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
      list.innerHTML = '<div class="notif-empty">No new notifications</div>';
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="notif-item" data-conv-id="${n.conversationId}" onclick="Notifications.handleClick('${n.conversationId}')">
        <div class="notif-avatar" style="background:${n.senderColor}">${n.senderInitials}</div>
        <div class="notif-body">
          <div class="notif-sender">${n.senderName}</div>
          <div class="notif-preview">${_escapeHtml(n.preview)}</div>
        </div>
        <div class="notif-meta">
          <span class="notif-time">${_formatTime(n.time)}</span>
          <span class="notif-count">${n.unreadCount}</span>
        </div>
      </div>
    `).join('');
  }


  async function handleClick(conversationId) {
    await markRead(conversationId);
    _closePanel();

    if (typeof openConv === 'function') {
      openConv(conversationId);
    } else {
      window.location.href = '/chat.html';
    }
  }

  function _buildUI() {
    const mount = document.getElementById('notif-mount');
    if (!mount) return;

    mount.innerHTML = `
      <div class="notif-wrapper">
        <button class="notif-btn" id="notif-btn" title="Notifications">
          🔔
          <span class="notif-badge hidden" id="notif-badge">0</span>
        </button>
        <div class="notif-panel" id="notif-panel">
          <div class="notif-panel-header">
            <span>Notifications</span>
            <button onclick="Notifications.markAllRead()">Mark all read</button>
          </div>
          <div id="notif-list">
            <div class="notif-empty">No new notifications</div>
          </div>
        </div>
      </div>
    `;
  }

  function _bindEvents() {
    document.addEventListener('click', (e) => {
      const btn   = document.getElementById('notif-btn');
      const panel = document.getElementById('notif-panel');
      if (!btn || !panel) return;

      if (btn.contains(e.target)) {
        _isOpen = !_isOpen;
        panel.classList.toggle('open', _isOpen);
        if (_isOpen) fetchAndRender();
        return;
      }

      if (_isOpen && !panel.contains(e.target)) {
        _closePanel();
      }
    });
  }

  function _closePanel() {
    _isOpen = false;
    const panel = document.getElementById('notif-panel');
    if (panel) panel.classList.remove('open');
  }

  function _formatTime(dateStr) {
    const d    = new Date(dateStr);
    const now  = new Date();
    const diff = now - d;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return d.toLocaleDateString();
  }

  function _escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function destroy() {
    if (_pollInterval) clearInterval(_pollInterval);
  }

  return { init, fetchAndRender, onNewMessage, markRead, markAllRead, handleClick, destroy };
})();