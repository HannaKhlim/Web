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

function logout() {
  setCurrentUser(null);
  window.location.href = 'finance.html';
}

function updateNav() {
  const user    = getCurrentUser();
  const authEl  = document.getElementById('nav-auth');
  const adminEl = document.getElementById('nav-admin');

  if (authEl) {
    authEl.innerHTML = user
      ? `<a href="auth.html">${user.nickname}</a>
         <a href="#" onclick="logout();return false;" style="color:#ed017f;margin-left:8px" title="Sign out">✕</a>`
      : '<a href="auth.html">SIGN IN</a>';
  }
  if (adminEl) {
    adminEl.style.display = (user && user.role === 'admin') ? '' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
