const USERS_KEY = 'boundful_users_data';
const CURRENT_USER_KEY = 'boundful_current_session';

const defaultUsers = [
  { username: 'BoundedDev', password: 'password123', role: 'Admin', avatar: 'BD' },
  { username: 'Steve', password: 'password123', role: 'User', avatar: 'ST' }
];

export function getStoredUsers() {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(data);
}

export function getCurrentUser() {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  return session ? JSON.parse(session) : null;
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

  // Auto log in after registration
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
  checkAuthGuard();
  const currentUser = getCurrentUser();

  if (currentUser) {
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
      avatarEl.textContent = currentUser.avatar;
      avatarEl.title = `Logged in as ${currentUser.username} (${currentUser.role}) - Click to logout`;
      avatarEl.style.cursor = 'pointer';

      // Click avatar to log out
      avatarEl.onclick = () => {
        if (confirm(`Logged in as ${currentUser.username}. Do you want to log out?`)) {
          logoutUser();
        }
      };
    }
  }
}
