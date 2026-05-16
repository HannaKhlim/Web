const API_URL = 'http://localhost:3000';

function showToast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('toast-hide'), 2000);
  setTimeout(() => t.remove(), 2500);
}
function showError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearError(id)     { showError(id, ''); }

// ── Guard ─────────────────────────────────────────────────────────
function checkAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    document.getElementById('admin-guard').style.display   = '';
    document.getElementById('admin-content').style.display = 'none';
    return false;
  }
  document.getElementById('admin-guard').style.display   = 'none';
  document.getElementById('admin-content').style.display = '';
  return true;
}

// ── Tabs ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-services').style.display = btn.dataset.tab === 'services' ? '' : 'none';
    document.getElementById('tab-reviews').style.display  = btn.dataset.tab === 'reviews'  ? '' : 'none';
    if (btn.dataset.tab === 'reviews') loadAdminReviews();
  });
});

// ══════════ SERVICES ══════════════════════════════════════════════
const svcFields = ['name','category','rate','amount','term','desc','img'];

function validateSvcForm() {
  let ok = true;
  if (!document.getElementById('svc-name').value.trim())    { showError('err-svc-name','Required');     ok=false; } else clearError('err-svc-name');
  if (!document.getElementById('svc-category').value.trim()){ showError('err-svc-category','Required'); ok=false; } else clearError('err-svc-category');
  const rate = parseFloat(document.getElementById('svc-rate').value);
  if (isNaN(rate) || rate < 0)                              { showError('err-svc-rate','Enter valid rate');     ok=false; } else clearError('err-svc-rate');
  const amt  = parseFloat(document.getElementById('svc-amount').value);
  if (isNaN(amt) || amt < 0)                                { showError('err-svc-amount','Enter valid amount'); ok=false; } else clearError('err-svc-amount');
  const term = parseInt(document.getElementById('svc-term').value);
  if (isNaN(term) || term < 1)                              { showError('err-svc-term','Enter valid term');     ok=false; } else clearError('err-svc-term');
  if (!document.getElementById('svc-desc').value.trim())    { showError('err-svc-desc','Required');     ok=false; } else clearError('err-svc-desc');
  if (!document.getElementById('svc-img').value.trim())     { showError('err-svc-img','Required');      ok=false; } else clearError('err-svc-img');
  document.getElementById('btn-svc-submit').disabled = !ok;
  return ok;
}

svcFields.forEach(f => {
  const el = document.getElementById(`svc-${f}`);
  if (el) el.addEventListener('input', validateSvcForm);
});

async function loadServicesTable() {
  const data = await (await fetch(`${API_URL}/services`)).json();
  const wrap = document.getElementById('svc-table-wrap');
  if (!data.length) { wrap.innerHTML = '<p style="color:#999">No services yet.</p>'; return; }
  wrap.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Rate</th><th></th></tr></thead>
      <tbody>
        ${data.map(s => `
          <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.category}</td>
            <td>${s.rate}%</td>
            <td class="td-actions">
              <button class="btn-white" onclick="editService(${s.id})">✏ Edit</button>
              <button class="btn-pink"  onclick="deleteService(${s.id})">🗑</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  // Populate review filter
  const sel = document.getElementById('filter-rev-service');
  sel.innerHTML = '<option value="">All services</option>';
  data.forEach(s => sel.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`));
}

document.getElementById('svc-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateSvcForm()) return;
  const id = document.getElementById('svc-id').value;
  const body = {
    name:       document.getElementById('svc-name').value.trim(),
    category:   document.getElementById('svc-category').value.trim(),
    rate:       parseFloat(document.getElementById('svc-rate').value),
    minAmount:  parseFloat(document.getElementById('svc-amount').value),
    termMonths: parseInt(document.getElementById('svc-term').value),
    desc:       document.getElementById('svc-desc').value.trim(),
    img:        document.getElementById('svc-img').value.trim(),
    popular:    document.getElementById('svc-popular').checked,
    currency:   'USD',
    badge:      null,
  };
  if (id) {
    await fetch(`${API_URL}/services/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    showToast('Service updated!');
  } else {
    await fetch(`${API_URL}/services`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    showToast('Service added!');
  }
  resetSvcForm();
  loadServicesTable();
});

function resetSvcForm() {
  document.getElementById('svc-form').reset();
  document.getElementById('svc-id').value = '';
  document.getElementById('svc-form-title').textContent = 'Add Service';
  document.getElementById('btn-svc-cancel').style.display = 'none';
  document.getElementById('btn-svc-submit').disabled = true;
}

document.getElementById('btn-svc-cancel').addEventListener('click', resetSvcForm);

async function editService(id) {
  const s = await (await fetch(`${API_URL}/services/${id}`)).json();
  document.getElementById('svc-id').value       = s.id;
  document.getElementById('svc-name').value     = s.name;
  document.getElementById('svc-category').value = s.category;
  document.getElementById('svc-rate').value     = s.rate;
  document.getElementById('svc-amount').value   = s.minAmount;
  document.getElementById('svc-term').value     = s.termMonths;
  document.getElementById('svc-desc').value     = s.desc;
  document.getElementById('svc-img').value      = s.img;
  document.getElementById('svc-popular').checked = s.popular;
  document.getElementById('svc-form-title').textContent = 'Edit Service';
  document.getElementById('btn-svc-cancel').style.display = '';
  document.getElementById('btn-svc-submit').disabled = false;
  document.getElementById('svc-form').scrollIntoView({ behavior: 'smooth' });
}

async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
  showToast('Deleted!');
  loadServicesTable();
}

// ══════════ REVIEWS ═══════════════════════════════════════════════
async function loadAdminReviews() {
  const svcId    = document.getElementById('filter-rev-service').value;
  const userId   = document.getElementById('filter-rev-user').value;
  let   url      = `${API_URL}/feedback`;
  const params   = new URLSearchParams();
  if (svcId)  params.set('serviceId', svcId);
  if (userId) params.set('userId',    userId);
  if ([...params].length) url += '?' + params;

  const data = await (await fetch(url)).json();
  renderAdminReviews(data);
}

function renderAdminReviews(data) {
  const el = document.getElementById('admin-reviews-list');
  if (!data.length) { el.innerHTML = '<p style="color:#999">No reviews found.</p>'; return; }
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Service</th><th>User</th><th>Rating</th><th>Text</th><th>Date</th><th></th></tr></thead>
      <tbody>
        ${data.map(r => `
          <tr>
            <td>${r.serviceName}</td>
            <td>${r.userNickname}</td>
            <td>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
            <td>${r.text}</td>
            <td>${r.createdAt.slice(0,10)}</td>
            <td><button class="btn-pink" onclick="deleteReview(${r.id})">🗑</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  await fetch(`${API_URL}/feedback/${id}`, { method: 'DELETE' });
  showToast('Review deleted!');
  loadAdminReviews();
}

['filter-rev-service','filter-rev-user'].forEach(id => {
  document.getElementById(id).addEventListener('change', loadAdminReviews);
});

async function loadUserFilter() {
  const users = await (await fetch(`${API_URL}/users`)).json();
  const sel   = document.getElementById('filter-rev-user');
  users.forEach(u => sel.insertAdjacentHTML('beforeend', `<option value="${u.id}">${u.nickname}</option>`));
}

// ── Init ──────────────────────────────────────────────────────────
if (checkAdmin()) {
  loadServicesTable();
  loadUserFilter();
}