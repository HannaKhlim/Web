const API_URL = 'http://localhost:3000';

const container = document.getElementById('favorites-container');

async function loadFavorites() {
  try {
    const res  = await fetch(`${API_URL}/favorites`);
    const data = await res.json();
    renderFavorites(data);
  } catch (err) {
    container.innerHTML = '<div class="no-results">Cannot connect to server. Run: <b>npm run server</b></div>';
  }
}

function renderFavorites(data) {
  container.innerHTML = '';
  if (!data.length) {
    container.innerHTML = '<div class="no-results">No favourites yet. Add some from the <a href="catalog.html">Catalog</a>.</div>';
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
        <button class="card-btn btn-pink">🗑 Remove</button>
      </div>`;
    card.querySelector('.card-btn').onclick = () => removeFromFavorites(item.id);
    container.appendChild(card);
  });
}

async function removeFromFavorites(id) {
  await fetch(`${API_URL}/favorites/${id}`, { method: 'DELETE' });
  loadFavorites();
}

loadFavorites();
