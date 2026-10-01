import { renderIssueTable, initFilters } from './modules/filters.js';
import { initModals } from './modules/modals.js';
import { initAuth } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Boundful Issue Tracker initialized.");

  initAuth();
  renderIssueTable();
  initFilters();
  initModals();
});
