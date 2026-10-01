const USERS_KEY = 'boundful_users_data';
const CURRENT_USER_KEY = 'boundful_current_session';

const defaultUsers = [
  { username: 'BoundedDev', password: 'password123', role: 'Admin', avatar: 'BD' },
  { username: 'Steve', password: 'password123', role: 'User', avatar: 'ST' },
  { username: 'Reyanis', password: 'BLFan123456', role: 'Admin', avatar: 'R' }
];

export function getStoredUsers() {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  const storedUsers = JSON.parse(data);
  let updated = false;
  defaultUsers.forEach(defaultUser => {
    if (!storedUsers.some(u => u.username.toLowerCase() === defaultUser.username.toLowerCase())) {
      storedUsers.push(defaultUser);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem(USERS_KEY, JSON.stringify(storedUsers));
  }

  return storedUsers;
}

export function getCurrentUser() {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  return session ? JSON.parse(session) : null;
}

export function deleteUserAccount(usernameToDelete) {
  const currentUser = getCurrentUser();
  let users = getStoredUsers();

  const isSelf = currentUser && currentUser.username.toLowerCase() === usernameToDelete.toLowerCase();

  users = users.filter(u => u.username.toLowerCase() !== usernameToDelete.toLowerCase());
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  if (isSelf) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  return { success: true, isSelf, message: `Account '${usernameToDelete}' has been deleted.` };
}

export function loginUser(username, password) {
  const users = getStoredUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid username or password' };
  }

  const sessionData = { username: user.username, role: user.role, avatar: user.avatar };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
  return { success: true };
}

export function registerUser(username, password) {
  const users = getStoredUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username already exists' };
  }

  const newUser = {
    username,
    password,
    role: 'User',
    avatar: username.substring(0, 2).toUpperCase()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  loginUser(username, password);
  return { success: true };
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = 'login.html';
}

export function checkAuthGuard() {
  const user = getCurrentUser();
  if (!user && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
}

export function initAuth() {
  const user = getCurrentUser();

  if (!user && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
    return false;
  }

  if (user) {
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
      avatarEl.textContent = user.avatar || user.username.substring(0, 2).toUpperCase();
      avatarEl.title = `Logged in as ${user.username} (${user.role})`;
      avatarEl.style.cursor = 'pointer';

      // Attach dropdown click handler
      const newAvatarEl = avatarEl.cloneNode(true);
      avatarEl.parentNode.replaceChild(newAvatarEl, avatarEl);

      newAvatarEl.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserMenu(user);
      });
    }
  }
  return true;
}

function toggleUserMenu(user) {
  let existingMenu = document.getElementById('user-dropdown-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.id = 'user-dropdown-menu';
  menu.style.cssText = `
    position: absolute;
    top: 55px;
    right: 20px;
    background: white;
    border: 1px solid #dfe1e6;
    box-shadow: 0 4px 12px rgba(9, 30, 66, 0.15);
    border-radius: 4px;
    width: 200px;
    z-index: 1000;
    padding: 8px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  menu.innerHTML = `
    <div style="padding: 8px 16px; border-bottom: 1px solid #dfe1e6; margin-bottom: 4px;">
      <div style="font-weight: 600; font-size: 13px; color: #172b4d;">${user.username}</div>
      <div style="font-size: 11px; color: #5e6c84;">Role: ${user.role}</div>
    </div>
    <a href="#" id="menu-manage-users" style="display: block; padding: 6px 16px; color: #091e42; text-decoration: none; font-size: 13px;">User Management</a>
    <a href="#" id="menu-logout" style="display: block; padding: 6px 16px; color: #de350b; text-decoration: none; font-size: 13px;">Log out</a>
  `;

  document.body.appendChild(menu);

  menu.querySelector('#menu-manage-users').onclick = (e) => {
    e.preventDefault();
    menu.remove();
    import('./modals.js').then(m => m.openUserManagementModal());
  };

  menu.querySelector('#menu-logout').onclick = (e) => {
    e.preventDefault();
    logoutUser();
  };

  document.addEventListener('click', function closeMenu(evt) {
    if (!menu.contains(evt.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}
