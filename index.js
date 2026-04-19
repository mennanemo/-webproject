


let allProfiles = [];
let currentType = 'hire';

async function init() {
  try {
    const [fileRes, dataRes] = await Promise.all([
      fetch('file.json'),
      fetch('data.json')
    ]);
    const fileJson = await fileRes.json();
    const dataJson = await dataRes.json();

    
    allProfiles = dataJson.users.map(user => {
      const style = fileJson.users.find(f => f.id === user.id) || {};
      return {
        id:          user.id,
        name:        user.firstname + ' ' + user.lastname,
        initials:    style.initials || (user.firstname[0] + user.lastname[0]).toUpperCase(),
        avatarBg:    style.avatarBg    || '#FFF3CD',
        avatarColor: style.avatarColor || '#70191D',
        type:        style.type        || 'work',
        hourlyRate:  style.hourlyRate  || 'Negotiable',
        photo:       user.image        || '',
        headline:    Array.isArray(user.job) ? user.job.join(' & ') : user.job,
        location:    user.location     || '',
        skills:      parseSkills(user.skills),
        about:       user.about        || '',
        ratingp:     user.ratingp,
        ratingr:     user.ratingr,
        dealsnum:    user.dealsnum
      };
    });

    initListeners();

  } catch (e) {
    console.warn('Could not load JSON files:', e);
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('result-list').innerHTML = `
      <p style="color:var(--text-muted);font-size:14px;padding:2rem 0;">
        Could not load profiles. Make sure all files are in the same folder and opened via a local server.
      </p>`;
  }
}


function parseSkills(skillsArr) {
  if (!skillsArr || !skillsArr.length) return [];
  
  const result = [];
  skillsArr.forEach(item => {
    String(item).split(',').forEach(s => {
      const trimmed = s.trim();
      if (trimmed) result.push(trimmed);
    });
  });
  return result;
}


function initListeners() {
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
  document.querySelectorAll('.hero-tag').forEach(t => {
    t.addEventListener('click', function () {
      document.getElementById('search-input').value = this.textContent;
      doSearch();
    });
  });
}


function doSearch() {
  const raw = document.getElementById('search-input').value.trim();
  const q   = raw.toLowerCase();
  if (!q) { clearSearch(); return; }

  const matched = allProfiles.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.headline.toLowerCase().includes(q) ||
    p.skills.some(s => s.toLowerCase().includes(q)) ||
    String(p.id) === q
  );

  const section = document.getElementById('results-section');
  const list    = document.getElementById('result-list');
  const noRes   = document.getElementById('no-results');
  const label   = document.getElementById('results-label');
  const count   = document.getElementById('results-count');

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  label.textContent = `Results for "${raw}"`;

  if (matched.length === 0) {
    list.innerHTML = '';
    noRes.style.display = 'block';
    count.textContent = '0 found';
    return;
  }

  noRes.style.display = 'none';
  count.textContent = matched.length + ' profile' + (matched.length !== 1 ? 's' : '') + ' found';

  list.innerHTML = matched.map((p, i) => {
    const skillsHtml = p.skills.map(s => {
      const isMatch = s.toLowerCase().includes(q);
      return `<span class="skill-tag ${isMatch ? 'match' : ''}">${s}</span>`;
    }).join('');

    const avatarHtml = p.photo
      ? `<img src="${p.photo}" alt="${p.name}">`
      : '';

    return `
    <a class="result-card" href="profile.html?id=${p.id}" style="animation: resultIn 0.4s ${i * 0.07}s ease both;">
      <div class="result-avatar" style="background:${p.avatarBg};color:${p.avatarColor};">${avatarHtml}</div>
      <div class="result-info">
        <div class="result-name">${p.name}</div>
        <div class="result-headline">${p.headline}</div>
        <div class="result-skills">${skillsHtml}</div>
      </div>
      <div class="result-right">
        <span class="result-location">${p.location}</span>
        <span class="type-badge ${p.type === 'hire' ? 'badge-hire' : 'badge-work'}">${p.type === 'hire' ? 'Hiring' : 'For hire'}</span>
        <span class="result-arrow">→</span>
      </div>
    </a>`;
  }).join('');
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('results-section').style.display = 'none';
}


function openModal()  { document.getElementById('modal-overlay').classList.add('open'); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

function setType(t) {
  currentType = t;
  document.getElementById('btn-hire').className = 'type-btn' + (t === 'hire' ? ' active-hire' : '');
  document.getElementById('btn-work').className = 'type-btn' + (t === 'work' ? ' active-work' : '');
}

function submitPost() {
  const name  = document.getElementById('p-name').value.trim();
  const title = document.getElementById('p-title').value.trim();
  if (!name || !title) { showToast('Please fill in your name and title.'); return; }
  showToast('Post submitted! ID will be assigned once saved.');
  closeModal();
  ['p-name','p-title','p-desc','p-skills','p-location'].forEach(id => {
    document.getElementById(id).value = '';
  });
}


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
        countUp(e.target.querySelector('.stat-num'), [8400, 320, 5100][idx], 1400);
      }, parseInt(e.target.dataset.delay || 0));
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-cell').forEach(el => statObs.observe(el));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

window.addEventListener('scroll', () => {
  document.getElementById('main-nav').style.boxShadow =
    window.scrollY > 40 ? '0 4px 24px rgba(112,25,29,0.1)' : 'none';
});

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

init();