const LS_KEY = 'notepad_users_v1';

// Load database or create with default admin
function loadDB() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const seed = { 'admin0': { password: 'admin0', notes: '' } };
    localStorage.setItem(LS_KEY, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw); }
  catch (e) { return {}; }
}

// Save database
function saveDB(db) {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

let db = loadDB();
let currentUser = null;

// Login
function login() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  db = loadDB();

  if (db[user] && db[user].password === pass) {
    currentUser = user;
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('mainBox').style.display = 'block';
    document.getElementById('userTitle').innerText = 'Welcome, ' + user;
    renderNotes();
  } else {
    alert('❌ No such user or wrong password!');
  }
}

// Logout
function logout() {
  currentUser = null;
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('mainBox').style.display = 'none';
  document.getElementById('notes').value = '';
  document.getElementById('userTitle').innerText = '';
}

// Render Notes or Admin List
function renderNotes() {
  db = loadDB();
  const isAdmin = (currentUser === 'admin0');

  if (isAdmin) {
    document.getElementById('notes').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    renderAdminList();
  } else {
    document.getElementById('notes').style.display = 'block';
    document.getElementById('saveBtn').style.display = 'inline-block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('notes').value = db[currentUser].notes || '';
  }
}

// Save Notes
function saveNote() {
  db[currentUser].notes = document.getElementById('notes').value;
  saveDB(db);
  alert('💾 Note saved successfully!');
}

// Register New User
function register() {
  const user = prompt('Enter new username:');
  if (!user) return;
  if (db[user]) { alert('⚠️ User already exists!'); return; }
  const pass = prompt('Enter password for ' + user + ':');
  db[user] = { password: pass, notes: '' };
  saveDB(db);
  alert('✅ User created successfully!');
}

// Render Admin User List
function renderAdminList() {
  const container = document.getElementById('adminUsers');
  container.innerHTML = '';

  for (const u in db) {
    const card = document.createElement('div');
    card.className = 'userCard';
    card.style.border = '1px solid #ccc';
    card.style.padding = '10px';
    card.style.margin = '10px';
    card.style.borderRadius = '10px';
    card.style.backgroundColor = '#fafafa';
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';

    const name = document.createElement('span');
    name.textContent = u;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '10px';

    // View button
    const btnView = document.createElement('button');
    btnView.textContent = 'View';
    btnView.onclick = () => {
      alert(`🧾 ${u}'s Notes:\n\n${db[u].notes || '(Empty)'}`);
    };

    // Copy button
    const btnCopy = document.createElement('button');
    btnCopy.textContent = 'Copy';
    btnCopy.onclick = () => {
      navigator.clipboard.writeText(db[u].notes || '');
      alert('📋 Notes copied to clipboard!');
    };

    // Remove button (Red)
    const btnRemove = document.createElement('button');
    btnRemove.textContent = 'Remove';
    btnRemove.style.backgroundColor = '#e53e3e';
    btnRemove.style.color = '#fff';
    btnRemove.style.border = 'none';
    btnRemove.style.padding = '8px 12px';
    btnRemove.style.borderRadius = '8px';
    btnRemove.style.cursor = 'pointer';
    btnRemove.onclick = () => {
      if (u === 'admin0') {
        alert('🚫 Cannot remove the main admin!');
        return;
      }
      if (confirm(`⚠️ Are you sure you want to remove "${u}" and all data?`)) {
        delete db[u];
        saveDB(db);
        renderAdminList();
        alert(`✅ User "${u}" removed successfully.`);
      }
    };

    actions.appendChild(btnView);
    actions.appendChild(btnCopy);
    actions.appendChild(btnRemove);
    card.appendChild(name);
    card.appendChild(actions);
    container.appendChild(card);
  }
}
