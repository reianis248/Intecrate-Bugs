import { getCurrentUser } from './auth.js'; // Helper import if needed

const USERS_KEY = 'boundful_users_data';
const CURRENT_USER_KEY = 'boundful_current_user';

const defaultUsers = [
  { username: 'BoundedDev', role: 'Admin', avatar: 'BD' },
  { username: 'Steve', role: 'User', avatar: 'ST' },
  { username: 'Alex_Craft', role: 'User', avatar: 'AC' }
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
  const current = localStorage.getItem(CURRENT_USER_KEY);
  if (!current) {
    const defaultUser = defaultUsers[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
  return JSON.parse(current);
}

export function setCurrentUser(username) {
  const users = getStoredUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    updateUserAvatarUI();
  }
}

export function updateUserAvatarUI() {
  const user = getCurrentUser();
  const avatarEl = document.querySelector('.user-avatar');
  if (avatarEl) {
    avatarEl.textContent = user.avatar;
    avatarEl.title = `Logged in as ${user.username} (${user.role})`;
  }
}

export function initAuth() {
  updateUserAvatarUI();

  const avatarEl = document.querySelector('.user-avatar');
  if (avatarEl) {
    avatarEl.addEventListener('click', () => {
      const users = getStoredUsers();
      const current = getCurrentUser();
      const nextIndex = (users.findIndex(u => u.username === current.username) + 1) % users.length;
      const nextUser = users[nextIndex];

      setCurrentUser(nextUser.username);
      alert(`Switched user profile to: ${nextUser.username} (${nextUser.role})`);
      window.location.reload();
    });
  }
}
