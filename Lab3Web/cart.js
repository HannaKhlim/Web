const API_URL = 'http://localhost:3000';

const container = document.getElementById('cart-container');
const summary   = document.getElementById('cart-summary');

async function loadCart() {
  try {
    const res  = await fetch(`${API_URL}/cart`);
    const data = await res.json();
    renderCart(data);
  } catch (err) {
    container.innerHTML = '<div class="no-results">Cannot connect to server. Run: <b>npm run server</b></div>';
  }
}

function renderCart(data) {
  container.innerHTML = '';
  summary.innerHTML   = '';

  if (!data.length) {
    container.innerHTML = '<div class="no-results">Your cart is empty. Browse the <a href="catalog.html">Catalog</a>.</div>';
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
      <p style="color:#ed017f;font-weight:600">$${item.minAmount.toLocaleString()} &times; ${item.quantity}</p>
      <div class="card-actions">
        <button class="card-btn btn-white qty-minus">−</button>
        <span style="line-height:32px;font-weight:700">${item.quantity}</span>
        <button class="card-btn btn-white qty-plus">+</button>
        <button class="card-btn btn-pink remove-btn" style="margin-left:auto">🗑 Remove</button>
      </div>`;
    card.querySelector('.qty-minus').onclick  = () => updateQty(item, item.quantity - 1);
    card.querySelector('.qty-plus').onclick   = () => updateQty(item, item.quantity + 1);
    card.querySelector('.remove-btn').onclick = () => removeFromCart(item.id);
    container.appendChild(card);
  });

  const total = data.reduce((sum, i) => sum + i.minAmount * i.quantity, 0);
  summary.innerHTML = `
    <div class="cart-summary-bar">
      <h3>Total: <span style="color:#ed017f">$${total.toLocaleString()}</span></h3>
      <button class="btn-pink" id="checkoutBtn" style="padding:12px 32px;font-size:14px;">Place Order</button>
    </div>`;
  document.getElementById('checkoutBtn').onclick = checkout;
}

async function updateQty(item, newQty) {
  if (newQty < 1) {
    await removeFromCart(item.id);
    return;
  }
  await fetch(`${API_URL}/cart/${item.id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ quantity: newQty }),
  });
  loadCart();
}

async function removeFromCart(id) {
  await fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
  loadCart();
}

async function checkout() {
  const cart = await (await fetch(`${API_URL}/cart`)).json();
  await Promise.all(cart.map(i => fetch(`${API_URL}/cart/${i.id}`, { method: 'DELETE' })));
  container.innerHTML = '';
  summary.innerHTML   = `
    <div style="text-align:center;padding:60px 75px;color:#ed017f;font-size:24px;font-weight:700">
      ✅ Order placed successfully! Thank you for choosing IPDC.
    </div>`;
}

loadCart();
