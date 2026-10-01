import { getStoredIssues, saveIssues } from './storage.js';
import { renderIssueTable } from './filters.js';
import { getCurrentUser } from './auth.js';

export function initModals() {
  // Open modal when clicking issue link in table
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('issue-link')) {
      e.preventDefault();
      const key = e.target.getAttribute('data-key');

      // Push URL state for unique issue link
      window.history.pushState({ issueKey: key }, '', `?issue=${key}`);
      openIssueModal(key);
    }
  });

  // Check URL query parameters on initial page load
  checkUrlForIssue();

  // Handle browser Back/Forward navigation
  window.addEventListener('popstate', () => {
    const existingModal = document.querySelector('.jira-modal-overlay');
    if (existingModal) existingModal.remove();
    checkUrlForIssue();
  });

  const createBtn = document.querySelector('.create-btn');
  if (createBtn) {
    createBtn.addEventListener('click', openCreateModal);
  }
}

function checkUrlForIssue() {
  const urlParams = new URLSearchParams(window.location.search);
  const issueKey = urlParams.get('issue');
  if (issueKey) {
    openIssueModal(issueKey);
  }
}

export function openIssueModal(key) {
  const issues = getStoredIssues();
  const issue = issues.find(i => i.key === key);
  if (!issue) return;

  // Remove any existing active modal
  const existingModal = document.querySelector('.jira-modal-overlay');
  if (existingModal) existingModal.remove();

  const currentUser = getCurrentUser();

  const modal = document.createElement('div');
  modal.className = 'jira-modal-overlay';
  modal.innerHTML = `
        <div class="jira-modal">
            <div class="jira-modal-header">
                <h2><i class="fa-solid fa-bug" style="color: #e5493a;"></i> ${issue.key}</h2>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="share-issue-btn" title="Copy link to issue" style="background: none; border: none; cursor: pointer; color: #5e6c84;">
                        <i class="fa-solid fa-link"></i>
                    </button>
                    <button class="close-modal">&times;</button>
                </div>
            </div>
            <div class="jira-modal-body">
                <h3>${issue.summary}</h3>
                <p class="reporter"><strong>Reporter:</strong> ${issue.reporter}</p>
                <div class="description-box">
                    <strong>Description:</strong>
                    <p>${issue.description || 'No description provided.'}</p>
                </div>
                <hr style="margin: 16px 0; border: none; border-top: 1px solid #dfe1e6;">
                <h4>Comments</h4>
                <div class="comments-list" id="comments-list">
                    ${(issue.comments || []).map(c => `<div class="comment"><strong>${c.author}:</strong>${c.text}</div>`).join('')}
                </div>
                <div class="add-comment" style="margin-top: 12px; display: flex; gap: 8px;">
                    <input type="text" id="comment-input" placeholder="Add a comment as ${currentUser.username}..." style="flex: 1; padding: 6px;">
                    <button id="post-comment-btn" class="create-btn">Comment</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close modal & restore clean URL
  const closeModal = () => {
    modal.remove();
    window.history.pushState({}, '', window.location.pathname);
  };

  modal.querySelector('.close-modal').onclick = closeModal;

  // Shareable link button
  modal.querySelector('#share-issue-btn').onclick = () => {
    const shareableUrl = `${window.location.origin}${window.location.pathname}?issue=${issue.key}`;
    navigator.clipboard.writeText(shareableUrl);
    alert(`Direct URL copied to clipboard:\n${shareableUrl}`);
  };

  // Comment submission
  modal.querySelector('#post-comment-btn').onclick = () => {
    const input = modal.querySelector('#comment-input');
    if (!input.value.trim()) return;

    issue.comments = issue.comments || [];
    issue.comments.push({ author: currentUser.username, text: input.value.trim(), date: 'Just now' });
    saveIssues(issues);
    openIssueModal(key);
  };
}
