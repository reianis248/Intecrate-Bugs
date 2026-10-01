import { loginUser, registerUser, getCurrentUser } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Redirect to home if user is already logged in
  if (getCurrentUser()) {
    window.location.href = '/';
    return;
  }

  let isRegisterMode = false;

  const form = document.getElementById('auth-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');
  const toggleBtn = document.getElementById('toggle-btn');
  const toggleText = document.getElementById('toggle-text');
  const errorMsg = document.getElementById('error-msg');

  toggleBtn.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    errorMsg.style.display = 'none';

    if (isRegisterMode) {
      submitBtn.textContent = 'Create Account';
      toggleText.textContent = 'Already have an account?';
      toggleBtn.textContent = 'Log in';
    } else {
      submitBtn.textContent = 'Log In';
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = 'Sign up';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) return;

    if (isRegisterMode) {
      const result = registerUser(username, password);
      if (!result.success) {
        errorMsg.textContent = result.message;
        errorMsg.style.display = 'block';
      } else {
        window.location.href = '/';
      }
    } else {
      const result = loginUser(username, password);
      if (!result.success) {
        errorMsg.textContent = result.message;
        errorMsg.style.display = 'block';
      } else {
        window.location.href = '/';
      }
    }
  });
});
