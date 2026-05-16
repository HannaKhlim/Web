const API_URL = 'http://localhost:3000';
const LIMIT = 8;

let currentPage = 1;
let totalCount  = 0;
let categories  = new Set();
let pageData    = [];

const filters = {
  q:        '',
  category: '',
  popular:  '',
  sort:     '',
  order:    'asc',
  rateMin:  '',
  rateMax:  '',
};

const container = document.getElementById('services-container');

// ── Toast ────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('toast-hide'), 2000);
  setTimeout(() => t.remove(), 2500);
}

// ── Build query params ───────────────────────────────────────────
function buildParams() {
  const p = new URLSearchParams();
  if (filters.q)              p.set('q',        filters.q);
  if (filters.category)       p.set('category', filters.category);
  if (filters.popular)        p.set('popular',  filters.popular);
  if (filters.sort)         { p.set('_sort',    filters.sort);
                               p.set('_order',   filters.order); }
  if (filters.rateMin !== '') p.set('rate_gte', filters.rateMin);
  if (filters.rateMax !== '') p.set('rate_lte', filters.rateMax);
  p.set('_page',  currentPage);
  p.set('_limit', LIMIT);
  return p;
}

// ── Fetch & Render ───────────────────────────────────────────────
async function fetchAndRender() {
  try {
    const res = await fetch(`${API_URL}/services?${buildParams()}`);
    totalCount = parseInt(res.headers.get('X-Total-Count') || '0');
    pageData   = await res.json();
    renderCards(pageData);
    renderPagination();
  } catch (err) {
    container.innerHTML = '<div class="no-results">Cannot connect to server. Run: <b>npm run server</b></div>';
  }
}

function renderCards(data) {
  container.innerHTML = '';
  if (!data.length) {
    container.innerHTML = '<div class="no-results">No services found for your criteria.</div>';
    return;
  }
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <div class="service-image"><img src="${item.img}" alt="${item.name}"></div>
      <div class="service-footer">
        <h4>IPDC ${item.name}<br>
          <small style="font-size:12px;color:#ed017f">${item.category} | ${item.rate}%</small></h4>
        <img class="arrow-btn" src="public/Arrow Circle Right (1).svg">
      </div>
      <p style="padding:8px 0;color:#999">${item.desc}</p>
      <div class="card-actions">
        <button class="card-btn btn-pink">♥ Favourite</button>
        <button class="card-btn btn-white">🛒 Cart</button>
      </div>`;
    card.querySelectorAll('.card-btn')[0].onclick = () => addToFavorites(item);
    card.querySelectorAll('.card-btn')[1].onclick = () => addToCart(item);
    container.appendChild(card);
  });
}

// ── Pagination ───────────────────────────────────────────────────
function renderPagination() {
  const el = document.getElementById('pagination');
  if (!el) return;
  el.innerHTML = '';
  const totalPages = Math.ceil(totalCount / LIMIT);
  if (totalPages <= 1) return;

  const makeBtn = (label, targetPage, disabled) => {
    const b = document.createElement('button');
    b.className = targetPage === currentPage ? 'btn-pink' : 'btn-white';
    b.textContent = label;
    b.disabled    = disabled;
    b.onclick     = () => { currentPage = targetPage; fetchAndRender(); };
    el.appendChild(b);
  };

  makeBtn('←', currentPage - 1, currentPage === 1);
  for (let i = 1; i <= totalPages; i++) makeBtn(i, i, false);
  makeBtn('→', currentPage + 1, currentPage === totalPages);
}

// ── Categories (Set) ─────────────────────────────────────────────
async function loadCategories() {
  const res = await fetch(`${API_URL}/services`);
  const all  = await res.json();
  all.forEach(s => categories.add(s.category));
  renderCategoryButtons();
}

function renderCategoryButtons() {
  const div = document.getElementById('categoryButtons');
  if (!div) return;
  div.innerHTML = '';

  const addCatBtn = (label, value) => {
    const b = document.createElement('button');
    b.className = value === filters.category ? 'btn-pink' : 'btn-white';
    b.style.cssText = 'height:35px;font-size:10px;';
    b.textContent   = label;
    b.onclick = () => {
      filters.category = value;
      filters.popular  = '';
      currentPage = 1;
      div.querySelectorAll('button').forEach(x => (x.className = 'btn-white'));
      b.className = 'btn-pink';
      fetchAndRender();
    };
    div.appendChild(b);
  };

  addCatBtn('All', '');
  categories.forEach(cat => addCatBtn(cat, cat));
}

// ── Array-method buttons ─────────────────────────────────────────
function setupMethodButtons() {
  const methods = [
    {
      label: 'Filter: Popular',
      func: () => {
        filters.popular  = 'true';
        filters.category = '';
        currentPage = 1;
        renderCategoryButtons();
        fetchAndRender();
      },
    },
    {
      label: 'Sort: Low Rate',
      func: () => {
        filters.sort  = 'rate';
        filters.order = 'asc';
        currentPage   = 1;
        document.getElementById('sortSelect').value = 'rate|asc';
        fetchAndRender();
      },
    },
    {
      label: 'Map: Promo Info',
      func: () => {
        renderCards(
          pageData.map(i => ({ ...i, name: i.name.toUpperCase(), desc: '🔥 PROMO: ' + i.desc }))
        );
      },
    },
    {
      label: 'Find: High Rate',
      func: async () => {
        const res   = await fetch(`${API_URL}/services?rate_gte=13`);
        const found = await res.json();
        renderCards(found.slice(0, 1));
        document.getElementById('pagination').innerHTML = '';
      },
    },
    {
      label: 'Reduce: Avg Rate',
      func: async () => {
        const all = await (await fetch(`${API_URL}/services`)).json();
        const avg = all.reduce((acc, i) => acc + i.rate, 0) / all.length;
        const res = await fetch(`${API_URL}/services?rate_gte=${avg.toFixed(1)}&_sort=rate&_order=asc`);
        renderCards(await res.json());
        document.getElementById('pagination').innerHTML = '';
      },
    },
    {
      label: 'Some: Above 10%',
      func: async () => {
        const res = await fetch(`${API_URL}/services?rate_gte=10`);
        renderCards(await res.json());
        document.getElementById('pagination').innerHTML = '';
      },
    },
    {
      label: 'Every: Low Rate?',
      func: async () => {
        const res = await fetch(`${API_URL}/services?rate_gte=3`);
        renderCards(await res.json());
        document.getElementById('pagination').innerHTML = '';
      },
    },
    {
      label: 'Slice: First 5',
      func: async () => {
        const res = await fetch(`${API_URL}/services?_page=1&_limit=5`);
        renderCards(await res.json());
        document.getElementById('pagination').innerHTML = '';
      },
    },
    {
      label: 'Reset Catalog',
      func: () => {
        Object.assign(filters, { q:'', category:'', popular:'', sort:'', order:'asc', rateMin:'', rateMax:'' });
        currentPage = 1;
        document.getElementById('searchInput').value = '';
        document.getElementById('sortSelect').value  = '';
        document.getElementById('rateMin').value     = '';
        document.getElementById('rateMax').value     = '';
        renderCategoryButtons();
        fetchAndRender();
      },
    },
  ];

  const div = document.getElementById('methodsButtons');
  methods.forEach(m => {
    const btn = document.createElement('button');
    btn.className    = 'btn-pink';
    btn.style.cssText = 'width:auto;height:35px;font-size:10px;';
    btn.textContent  = m.label;
    btn.onclick      = m.func;
    div.appendChild(btn);
  });
}

// ── Favourites & Cart ────────────────────────────────────────────
async function addToFavorites(item) {
  const existing = await (await fetch(`${API_URL}/favorites?serviceId=${item.id}`)).json();
  if (existing.length) { showToast('Already in favourites!'); return; }
  await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: item.id, name: item.name, category: item.category,
      rate: item.rate, desc: item.desc, img: item.img,
      popular: item.popular, termMonths: item.termMonths, minAmount: item.minAmount,
    }),
  });
  showToast('Added to favourites!');
}

async function addToCart(item) {
  const existing = await (await fetch(`${API_URL}/cart?serviceId=${item.id}`)).json();
  if (existing.length) {
    const cur = existing[0];
    await fetch(`${API_URL}/cart/${cur.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: cur.quantity + 1 }),
    });
    showToast('Quantity updated in cart!');
  } else {
    await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: item.id, name: item.name, category: item.category,
        rate: item.rate, desc: item.desc, img: item.img,
        popular: item.popular, termMonths: item.termMonths, minAmount: item.minAmount,
        quantity: 1,
      }),
    });
    showToast('Added to cart!');
  }
}

// ── Event listeners ──────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', e => {
  filters.q   = e.target.value;
  currentPage = 1;
  fetchAndRender();
});

document.getElementById('sortSelect').addEventListener('change', e => {
  const val = e.target.value;
  if (!val) {
    filters.sort  = '';
    filters.order = 'asc';
  } else {
    const [field, order] = val.split('|');
    filters.sort  = field;
    filters.order = order;
  }
  currentPage = 1;
  fetchAndRender();
});

document.getElementById('rateMin').addEventListener('input', e => {
  filters.rateMin = e.target.value;
  currentPage = 1;
  fetchAndRender();
});

document.getElementById('rateMax').addEventListener('input', e => {
  filters.rateMax = e.target.value;
  currentPage = 1;
  fetchAndRender();
});

// ── Init ─────────────────────────────────────────────────────────
async function init() {
  await loadCategories();
  setupMethodButtons();
  await fetchAndRender();
}

init();