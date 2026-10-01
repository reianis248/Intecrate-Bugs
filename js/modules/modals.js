import { getStoredIssues, saveIssues } from './storage.js';
import { renderIssueTable } from './filters.js';
import { getCurrentUser } from './auth.js';

export function initModals() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('issue-link')) {
      e.preventDefault();
      const key = e.target.getAttribute('data-key');
      openIssueModal(key);
    }
  });

  const createBtn = document.querySelector('.create-btn');
  if (createBtn) {
    createBtn.addEventListener('click', openCreateModal);
  }
}

function openIssueModal(key) {
  const issues = getStoredIssues();
  const issue = issues.find(i => i.key === key);
  if (!issue) return;

  const currentUser = getCurrentUser();

  const modal = document.createElement('div');
  modal.className = 'jira-modal-overlay';
  modal.innerHTML = `
        <div class="jira-modal">
            <div class="jira-modal-header">
                <h2><i class="fa-solid fa-bug" style="color: #e5493a;"></i> ${issue.key}</h2>
                <button class="close-modal">&times;</button>
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

  modal.querySelector('.close-modal').onclick = () => modal.remove();
  modal.querySelector('#post-comment-btn').onclick = () => {
    const input = modal.querySelector('#comment-input');
    if (!input.value.trim()) return;

    issue.comments = issue.comments || [];
    issue.comments.push({ author: currentUser.username, text: input.value.trim(), date: 'Just now' });
    saveIssues(issues);
    modal.remove();
    openIssueModal(key);
  };
}

function openCreateModal() {
  const currentUser = getCurrentUser();

  const modal = document.createElement('div');
  modal.className = 'jira-modal-overlay';
  modal.innerHTML = `
        <div class="jira-modal">
            <div class="jira-modal-header">
                <h2>Create Bug Report</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="jira-modal-body" style="display: flex; flex-direction: column; gap: 12px;">
                <input type="text" id="new-summary" placeholder="Issue Summary (e.g., Render glitches)" style="padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px;">
                <textarea id="new-desc" placeholder="Detailed description..." style="padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px; height: 80px;"></textarea>
                <button id="submit-issue-btn" class="create-btn">Create Issue</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('.close-modal').onclick = () => modal.remove();
  modal.querySelector('#submit-issue-btn').onclick = () => {
    const summary = modal.querySelector('#new-summary').value.trim();
    const description = modal.querySelector('#new-desc').value.trim();

    if (!summary) return;

    const issues = getStoredIssues();
    const newKey = `BF-${1000 + issues.length + 1}`;
    issues.unshift({
      key: newKey,
      type: 'Bug',
      summary: summary,
      status: 'OPEN',
      priority: 'Medium',
      updated: 'Just now',
      reporter: currentUser.username,
      description: description,
      comments: []
    });

    saveIssues(issues);
    renderIssueTable();
    modal.remove();
  };
}
