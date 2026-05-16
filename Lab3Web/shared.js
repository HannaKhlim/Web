// shared.js — auth state & nav update (included on every page)

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

function updateNav() {
  const user    = getCurrentUser();
  const authEl  = document.getElementById('nav-auth');
  const adminEl = document.getElementById('nav-admin');

  if (authEl) {
    authEl.innerHTML = user
      ? `<a href="auth.html">${user.nickname}</a>`
      : '<a href="auth.html">SIGN IN</a>';
  }
  if (adminEl) {
    adminEl.style.display = (user && user.role === 'admin') ? '' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
