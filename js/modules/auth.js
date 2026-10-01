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

  // Auto-sync new hardcoded default users if added
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

  // Check if user is deleting themselves
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

  // Route guard: redirect unauthenticated users to login page
  if (!user && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
    return false;
  }

  if (user) {
    const avatarEl = document.querySelector('.user-avatar');
    if (avatarEl) {
      avatarEl.textContent = user.avatar || user.username.substring(0, 2).toUpperCase();
      avatarEl.title = `Logged in as ${user.username} (${user.role})`;
    }
  }
  return true;
}
