

function isLoggedIn() {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('currentUser');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      updateNavigationForUser(user);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}


function getCurrentUser() {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
}


function updateNavigationForUser(user) {
  const navLinks = document.querySelector('.nav-links');
  const navBtns = document.querySelector('.nav-btns');
  
  if (!navLinks || !navBtns) return;
  
  const isClient = user.role === 'client';
  const isFreelancer = user.role === 'freelancer';
  
  
  let linksHtml = '';
  
  if (isClient) {
    linksHtml = `
      <a href="searching.html">Find Freelancers</a>
      <a href="dashboard.html">My Jobs</a>
      <a href="chat.html">Messages</a>
    `;
  } else if (isFreelancer) {
    linksHtml = `
      <a href="searching.html">Find Work</a>
      <a href="dashboard.html">My Proposals</a>
      <a href="chat.html">Messages</a>
    `;
  } else {
    
    linksHtml = `
      <a href="searching.html">Search</a>
      <a href="dashboard.html">Dashboard</a>
      <a href="chat.html">Messages</a>
    `;
  }
  
  navLinks.innerHTML = linksHtml;
  
  
  navBtns.innerHTML = `
    <button class="btn-ghost" onclick="handleLogout()">Log out</button>
    <button class="btn-find-people" onclick="goToPost()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      ${isClient ? 'Post a Job' : 'Find Work'}
    </button>
  `;
}


function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.reload();
}


function goToPost() {
  const user = getCurrentUser();
  if (user && user.role === 'client') {
    window.location.href = 'post-job.html';
  } else {
    window.location.href = 'searching.html';
  }
}



function handleAuthRedirect(e) {
  if (e) e.preventDefault();
  showAuthNudge();
  return false;
}

function handleAuthSearch() {
  if (isLoggedIn()) {
    const q = document.getElementById('search-input').value.trim();
    window.location.href = 'searching.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  } else {
    showAuthNudge();
  }
}

function redirectToAuth(e) {
  if (isLoggedIn()) return true;
  if (e) e.preventDefault();
  window.location.href = 'auth.html';
  return false;
}



function showAuthNudge() {
  const overlay = document.getElementById('auth-nudge-overlay');
  if (overlay) overlay.classList.add('open');
}

function closeAuthNudge() {
  const overlay = document.getElementById('auth-nudge-overlay');
  if (overlay) overlay.classList.remove('open');
}

function goToSignUp() {
  window.location.href = 'auth.html';
}


(function buildNudgeOverlay() {
  if (document.getElementById('auth-nudge-overlay')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'auth-nudge-overlay';
  overlay.className = 'auth-nudge-overlay';
  overlay.innerHTML = `
    <div class="auth-nudge-box">
      <div class="auth-nudge-icon">🔐</div>
      <h3>Sign up to explore</h3>
      <p>Create a free account to search profiles, send messages, make payments, and find your next gig.</p>
      <div class="auth-nudge-btns">
        <button class="btn-nudge-ghost" onclick="closeAuthNudge()">Maybe later</button>
        <button class="btn-nudge-primary" onclick="goToSignUp()">Sign up — it's free</button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeAuthNudge();
  });
  document.body.appendChild(overlay);
})();



function countUp(el, target, duration) {
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = v >= 1000 ? (v / 1000).toFixed(1) + 'K+' : v + '+';
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.classList.add('visible');
        const idx = [...document.querySelectorAll('.stat-cell')].indexOf(e.target);
        const targets = [8400, 320, 5100];
        if (idx < targets.length) {
          countUp(e.target.querySelector('.stat-num'), targets[idx], 1400);
        }
      }, parseInt(e.target.dataset.delay || 0));
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-cell').forEach(el => statObs.observe(el));



const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const siblings = [...e.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(e.target);
      setTimeout(() => {
        e.target.classList.add('visible');
      }, idx * 100);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));



window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(112,25,29,0.15)' : 'none';
  }
});



let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}



document.addEventListener('DOMContentLoaded', () => {
  isLoggedIn();
});