


const urlParams    = new URLSearchParams(window.location.search);
const proposalId   = urlParams.get('proposalId');


document.addEventListener('DOMContentLoaded', () => {
  if (proposalId) {
    loadProposal(proposalId);
  } else {
    
    loadDemoData();
  }
});


async function loadProposal(id) {
  try {
    const res = await fetch(`/api/proposals/${id}`);
    if (!res.ok) throw new Error('Proposal not found');
    const data = await res.json();
    renderProposal(data.proposal || data);
  } catch (err) {
    console.warn('Could not load proposal from backend:', err);
   
    loadDemoData();
  }
}


function renderProposal(p) {
  document.getElementById('prop-job-title').textContent      = p.jobTitle     || '—';
  document.getElementById('prop-client-name').textContent    = p.clientName   || p.clientId    || '—';
  document.getElementById('prop-freelancer-name').textContent = p.freelancerName || p.freelancerId || '—';
  document.getElementById('prop-price').textContent          = formatPrice(p.agreedPrice, p.currency);
  if (p.message) {
    document.getElementById('prop-message').textContent = `"${p.message}"`;
  }

  if (p.status === 'accepted') {
    showAcceptedState(p);
  } else if (p.status === 'rejected' || p.status === 'cancelled') {
    showRejectedState();
  }
}


function loadDemoData() {
  renderProposal({
    jobTitle:       'Logo Design for Tech Startup',
    clientName:     'Ahmed Hassan',
    freelancerName: 'Snoopy Peterson',
    agreedPrice:    250,
    currency:       'USD',
    message:        'I have reviewed your requirements carefully and I am confident I can deliver a clean, modern logo that matches your brand perfectly. My estimated delivery time is 3 days.',
    status:         'pending'
  });
}


function formatPrice(amount, currency) {
  if (!amount && amount !== 0) return '$—';
  const symbol = currency === 'EGP' ? 'EGP ' : '$';
  return symbol + Number(amount).toLocaleString();
}


async function handleAccept() {
  const btn = document.querySelector('.btn-accept');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
   
    if (proposalId) {
      const res = await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId })
      });

      if (!res.ok) throw new Error('Accept failed');
      const data = await res.json();

      
      if (data.paymentRedirectUrl) {
        window.location.href = data.paymentRedirectUrl;
        return;
      }
    }

    
    showAcceptedState({
      agreedPrice: document.getElementById('prop-price').textContent,
      jobTitle:    document.getElementById('prop-job-title').textContent
    });

  } catch (err) {
    console.error('Accept error:', err);
    showToast('Something went wrong. Please try again.');
    btn.textContent = 'Accept & Pay';
    btn.disabled = false;
  }
}


async function handleReject() {
  const btn = document.querySelector('.btn-reject');
  btn.textContent = 'Declining...';
  btn.disabled = true;

  try {
    if (proposalId) {
      await fetch('/api/proposals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId })
      });
    }
    showRejectedState();
  } catch (err) {
    console.error('Reject error:', err);
    showToast('Something went wrong. Please try again.');
    btn.textContent = 'Decline';
    btn.disabled = false;
  }
}


function showAcceptedState(proposal) {
  // Update status bar
  const dot   = document.querySelector('.status-dot');
  const label = document.getElementById('status-label');
  dot.className   = 'status-dot accepted';
  label.textContent = 'Proposal accepted';

  
  document.getElementById('proposal-actions').style.display = 'none';

  const price     = typeof proposal.agreedPrice === 'number'
    ? proposal.agreedPrice
    : document.getElementById('prop-price').textContent.replace(/[^0-9.]/g, '');
  const jobTitle  = encodeURIComponent(proposal.jobTitle || document.getElementById('prop-job-title').textContent);
  const payUrl    = `payment.html?proposalId=${proposalId || 'demo'}&amount=${price}&jobTitle=${jobTitle}`;

  
  const result = document.getElementById('proposal-result');
  result.style.display = 'block';
  result.innerHTML = `
    <div class="result-accepted">
      <div class="result-icon">🎉</div>
      <h3>Proposal accepted!</h3>
      <p>You're being redirected to complete payment. Your money will be held securely in escrow.</p>
      <button class="btn-go-payment" onclick="window.location.href='${payUrl}'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        Continue to Payment
      </button>
    </div>
  `;

  
  setTimeout(() => {
    window.location.href = payUrl;
  }, 2500);
}


function showRejectedState() {
  const dot   = document.querySelector('.status-dot');
  const label = document.getElementById('status-label');
  dot.className    = 'status-dot rejected';
  label.textContent = 'Proposal declined';

  document.getElementById('proposal-actions').style.display = 'none';

  const result = document.getElementById('proposal-result');
  result.style.display = 'block';
  result.innerHTML = `
    <div class="result-rejected">
      <div class="result-icon">🙅</div>
      <h3>Proposal declined</h3>
      <p>The freelancer has been notified. You can go back to chat to discuss further.</p>
      <button class="btn-back-chat" onclick="history.back()">← Back to chat</button>
    </div>
  `;
}


let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}