const API_URL = 'http://localhost:3000';
const MIN_TEXT = 20;

let selectedRating = 0;
let allServices    = [];

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('toast-hide'), 2000);
  setTimeout(() => t.remove(), 2500);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearError(id) { showError(id, ''); }

document.querySelectorAll('#star-rating span').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.val);
    document.getElementById('rev-rating').value = selectedRating;
    document.querySelectorAll('#star-rating span').forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating);
    });
    clearError('err-rev-rating');
    validateReviewForm();
  });
});

document.getElementById('rev-text').addEventListener('input', () => {
  const len = document.getElementById('rev-text').value.trim().length;
  document.getElementById('hint-rev-text').textContent = `${len} / ${MIN_TEXT}`;
  validateReviewForm();
});

async function loadServices() {
  const res   = await fetch(`${API_URL}/services`);
  allServices = await res.json();

  const sel      = document.getElementById('rev-service');
  const filterEl = document.getElementById('filter-service');
  allServices.forEach(s => {
    sel.insertAdjacentHTML('beforeend',      `<option value="${s.id}">${s.name}</option>`);
    filterEl.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`);
  });
}

document.getElementById('rev-service').addEventListener('change', async () => {
  const sId  = parseInt(document.getElementById('rev-service').value);
  const user = getCurrentUser();
  clearError('err-rev-service');

  if (!sId || !user) { validateReviewForm(); return; }

  const orders = await (await fetch(`${API_URL}/orders?userId=${user.id}`)).json();
  const bought = orders.some(o => o.items && o.items.some(i => i.serviceId === sId));
  if (!bought) {
    showError('err-rev-service', 'You can only review services you have purchased');
  }
  validateReviewForm();
});

function validateReviewForm() {
  const user   = getCurrentUser();
  const sId    = document.getElementById('rev-service').value;
  const text   = document.getElementById('rev-text').value.trim();
  const svcErr = document.getElementById('err-rev-service').textContent;

  const ok = user && user.role !== 'admin' && sId && !svcErr && selectedRating > 0 && text.length >= MIN_TEXT;
  document.getElementById('btn-submit-review').disabled = !ok;
}

document.getElementById('review-form').addEventListener('submit', async e => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) { showError('review-auth-note', 'Please sign in to leave a review'); return; }
  if (user.role === 'admin') { showError('review-auth-note', 'Admins cannot leave reviews'); return; }

  const sId     = parseInt(document.getElementById('rev-service').value);
  const service = allServices.find(s => s.id === sId);

  await fetch(`${API_URL}/feedback`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId:    sId,
      serviceName:  service ? service.name : '',
      userId:       user.id,
      userNickname: user.nickname,
      rating:       selectedRating,
      text:         document.getElementById('rev-text').value.trim(),
      createdAt:    new Date().toISOString(),
    }),
  });

  showToast('Review submitted!');
  document.getElementById('review-form').reset();
  selectedRating = 0;
  document.querySelectorAll('#star-rating span').forEach(s => s.classList.remove('active'));
  document.getElementById('hint-rev-text').textContent = `0 / ${MIN_TEXT}`;
  document.getElementById('btn-submit-review').disabled = true;
  loadReviews();
});

async function loadReviews(serviceId = '') {
  const url = serviceId
    ? `${API_URL}/feedback?serviceId=${serviceId}`
    : `${API_URL}/feedback`;
  const data = await (await fetch(url)).json();
  renderReviews(data);
}

function renderReviews(data) {
  const el = document.getElementById('reviews-list');
  if (!data.length) {
    el.innerHTML = '<p style="color:#999;padding:20px 0">No reviews yet.</p>';
    return;
  }
  el.innerHTML = data.map(r => `
    <div class="review-card">
      <div class="review-header">
        <strong>${r.serviceName}</strong>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <span style="color:#999;font-size:12px">${r.userNickname} · ${r.createdAt.slice(0,10)}</span>
      </div>
      <p>${r.text}</p>
    </div>`).join('');
}

document.getElementById('filter-service').addEventListener('change', e => {
  loadReviews(e.target.value);
});

function checkAuthGate() {
  const user = getCurrentUser();
  const note = document.getElementById('review-auth-note');
  if (!user) {
    note.textContent = 'Sign in to leave a review.';
    document.getElementById('review-form').querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = true);
  } else if (user.role === 'admin') {
    note.textContent = 'Admins cannot leave reviews.';
    document.getElementById('btn-submit-review').disabled = true;
  }
}

async function init() {
  await loadServices();
  checkAuthGate();
  loadReviews();
}

init();
