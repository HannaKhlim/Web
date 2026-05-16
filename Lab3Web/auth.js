const API_URL = 'http://localhost:3000';

// ── Top-100 common passwords ──────────────────────────────────────
const COMMON_PASSWORDS = new Set([
  '123456','password','123456789','12345678','12345','1234567','password1',
  'iloveyou','admin','welcome','monkey','login','abc123','starwars','dragon',
  'passw0rd','master','hello','freedom','whatever','qazwsx','trustno1',
  '1q2w3e4r','batman','letmein','shadow','michael','jessica','password123',
  'qwerty','111111','000000','1234567890','qwerty123','password2','1q2w3e4r5t',
  'qwertyuiop','sunshine','princess','football','charlie','donald','flower',
  'hottie','maggie','cheese','killer','soccer','hockey','ranger','daniel',
  'george','thomas','summer','computer','internet','superman','test123',
  'pass1234','11111111','55555555','baseball','zxcvbnm','abc12345','123qwe',
]);

// ── Validators ────────────────────────────────────────────────────
function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address';
}
function validatePhone(v) {
  return /^\+375(25|29|33|44)\d{7}$/.test(v.replace(/\s/g, ''))
    ? '' : 'Enter a Belarus number: +375(25|29|33|44)XXXXXXX';
}
function validateBirth(v) {
  if (!v) return 'Date of birth is required';
  const birth  = new Date(v);
  const minAge = new Date(birth.getFullYear() + 16, birth.getMonth(), birth.getDate());
  return new Date() >= minAge ? '' : 'You must be at least 16 years old';
}
function validatePassword(v) {
  if (!v || v.length < 8 || v.length > 20) return 'Password must be 8–20 characters';
  if (!/[A-Z]/.test(v))   return 'Must contain at least one uppercase letter';
  if (!/[a-z]/.test(v))   return 'Must contain at least one lowercase letter';
  if (!/\d/.test(v))      return 'Must contain at least one digit';
  if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(v))
                          return 'Must contain at least one special character';
  if (COMMON_PASSWORDS.has(v.toLowerCase())) return 'This password is too common';
  return '';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearError(id) { showError(id, ''); }

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('toast-hide'), 2000);
  setTimeout(() => t.remove(), 2500);
}

// ── Tabs ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('login-form').style.display    = tab === 'login'    ? '' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? '' : 'none';
  });
});

// ── Password mode toggle ──────────────────────────────────────────
document.querySelectorAll('[name="pwMode"]').forEach(r => {
  r.addEventListener('change', () => {
    const manual = document.querySelector('[name="pwMode"]:checked').value === 'manual';
    document.getElementById('manual-pw-fields').style.display = manual ? '' : 'none';
    validateAll();
  });
});

// ── Nickname generation ───────────────────────────────────────────
let nickAttempts  = 0;
const MAX_AUTO    = 5;

function generateNickname() {
  const fn = document.getElementById('reg-firstName').value.trim().replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '') || 'User';
  const ln = document.getElementById('reg-lastName').value.trim().replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')  || 'X';
  const pLen = Math.floor(Math.random() * 3) + 1;
  const sLen = Math.floor(Math.random() * 3) + 1;
  const num  = Math.floor(Math.random() * 990) + 10;
  const sfx  = ['', '_x', '_dev', '_pro', ''][Math.floor(Math.random() * 5)];
  return fn.substring(0, pLen) + ln.substring(0, sLen) + num + sfx;
}

document.getElementById('btn-regen').addEventListener('click', () => {
  nickAttempts++;
  const hint = document.getElementById('hint-nickname');
  if (nickAttempts >= MAX_AUTO) {
    const nickEl = document.getElementById('reg-nickname');
    nickEl.readOnly = false;
    nickEl.value    = '';
    nickEl.focus();
    hint.textContent = 'Enter your own nickname';
    document.getElementById('btn-regen').style.display = 'none';
  } else {
    document.getElementById('reg-nickname').value = generateNickname();
    hint.textContent = `Attempts left: ${MAX_AUTO - nickAttempts}`;
    clearError('err-nickname');
  }
  validateAll();
});

// Auto-generate on name input
['reg-firstName', 'reg-lastName'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    if (nickAttempts < MAX_AUTO) {
      document.getElementById('reg-nickname').value = generateNickname();
      clearError('err-nickname');
    }
    validateAll();
  });
});

// Prevent paste in confirm password
document.getElementById('reg-confirm').addEventListener('paste', e => e.preventDefault());

// ── Live validation ───────────────────────────────────────────────
function getIsManual() {
  return document.querySelector('[name="pwMode"]:checked').value === 'manual';
}

function validateAll() {
  let ok = true;

  const firstName = document.getElementById('reg-firstName').value.trim();
  if (!firstName) { showError('err-firstName', 'First name is required'); ok = false; }
  else clearError('err-firstName');

  const lastName = document.getElementById('reg-lastName').value.trim();
  if (!lastName) { showError('err-lastName', 'Last name is required'); ok = false; }
  else clearError('err-lastName');

  const emailErr = validateEmail(document.getElementById('reg-email').value.trim());
  if (emailErr) { showError('err-email', emailErr); ok = false; }
  else clearError('err-email');

  const phoneErr = validatePhone(document.getElementById('reg-phone').value.trim());
  if (phoneErr) { showError('err-phone', phoneErr); ok = false; }
  else clearError('err-phone');

  const birthErr = validateBirth(document.getElementById('reg-birthDate').value);
  if (birthErr) { showError('err-birthDate', birthErr); ok = false; }
  else clearError('err-birthDate');

  if (getIsManual()) {
    const pw    = document.getElementById('reg-password').value;
    const pwErr = validatePassword(pw);
    if (pwErr) { showError('err-password', pwErr); ok = false; }
    else clearError('err-password');

    const conf = document.getElementById('reg-confirm').value;
    if (conf !== pw) { showError('err-confirm', 'Passwords do not match'); ok = false; }
    else clearError('err-confirm');
  }

  const nick = document.getElementById('reg-nickname').value.trim();
  if (!nick) { showError('err-nickname', 'Nickname is required'); ok = false; }
  else clearError('err-nickname');

  if (!document.getElementById('reg-agree').checked) {
    showError('err-agree', 'You must agree to the User Agreement'); ok = false;
  } else clearError('err-agree');

  document.getElementById('btn-register').disabled = !ok;
  return ok;
}

// Attach live validation to all register fields
['reg-email','reg-phone','reg-birthDate','reg-password','reg-confirm','reg-nickname'].forEach(id => {
  document.getElementById(id).addEventListener('input', validateAll);
});
document.getElementById('reg-agree').addEventListener('change', validateAll);

// ── LOGIN ─────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const identity = document.getElementById('login-identity').value.trim();
  const password = document.getElementById('login-password').value;

  if (!identity) { showError('err-login-identity', 'This field is required'); return; }
  if (!password) { showError('err-login-password', 'This field is required'); return; }

  const res   = await fetch(`${API_URL}/users?email=${encodeURIComponent(identity)}`);
  let   users = await res.json();
  if (!users.length) {
    const res2 = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(identity)}`);
    users = await res2.json();
  }

  const user = users.find(u => u.password === password);
  if (!user) {
    showError('err-login-password', 'Invalid credentials');
    return;
  }

  setCurrentUser(user);
  showToast(`Welcome back, ${user.nickname}!`);
  setTimeout(() => { window.location.href = 'finance.html'; }, 1000);
});

['login-identity','login-password'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    clearError(`err-login-${id.replace('login-','')}`);
  });
});

// ── REGISTER ─────────────────────────────────────────────────────
document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateAll()) return;

  const nickname = document.getElementById('reg-nickname').value.trim();

  // Check nickname uniqueness
  const existing = await (await fetch(`${API_URL}/users?nickname=${encodeURIComponent(nickname)}`)).json();
  if (existing.length) {
    showError('err-nickname', 'This nickname is already taken');
    document.getElementById('btn-register').disabled = true;
    return;
  }

  const isManual = getIsManual();
  const password = isManual
    ? document.getElementById('reg-password').value
    : Math.random().toString(36).slice(-8) + 'A1!';

  const newUser = {
    nickname,
    firstName:  document.getElementById('reg-firstName').value.trim(),
    lastName:   document.getElementById('reg-lastName').value.trim(),
    patronymic: document.getElementById('reg-patronymic').value.trim(),
    email:      document.getElementById('reg-email').value.trim(),
    phone:      document.getElementById('reg-phone').value.trim(),
    birthDate:  document.getElementById('reg-birthDate').value,
    password,
    role:       'customer',
    createdAt:  new Date().toISOString().slice(0, 10),
  };

  const res = await fetch(`${API_URL}/users`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(newUser),
  });
  const created = await res.json();
  setCurrentUser(created);
  showToast(`Registered! Welcome, ${created.nickname}!`);
  setTimeout(() => { window.location.href = 'finance.html'; }, 1200);
});