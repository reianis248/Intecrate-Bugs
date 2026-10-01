// Modular entry point for application state, auth system, and DOM rendering
import { initAuth } from './modules/auth.js';
import { initIssues } from './modules/issues.js';
import { initUI } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Mojira tracker initialized via modular JS.");
  initAuth();
  initUI();
  initIssues();
});
