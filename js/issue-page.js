import { getStoredIssues, saveIssues } from './modules/storage.js';
import { getCurrentUser, initAuth } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('key');
  const container = document.getElementById('full-issue-container');

  if (!key) {
    container.innerHTML = `<h2>No issue specified.</h2><a href="index.html">Return to Dashboard</a>`;
    return;
  }

  const issues = getStoredIssues();
  const issue = issues.find(i => i.key === key);

  if (!issue) {
    container.innerHTML = `<h2>Issue ${key} not found.</h2><a href="index.html">Return to Dashboard</a>`;
    return;
  }

  renderFullIssue(issue, container);
});

function renderFullIssue(issue, container) {
  const currentUser = getCurrentUser();

  container.innerHTML = `
        <div style="background: #ffffff; padding: 32px; border: 1px solid #dfe1e6; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dfe1e6; padding-bottom: 16px;">
                <h1 style="font-size: 22px;"><i class="fa-solid fa-bug" style="color: #e5493a;"></i> ${issue.key}: ${issue.summary}</h1>
                <span class="status-badge ${issue.status === 'OPEN' ? 'open' : 'in-progress'}">${issue.status}</span>
            </div>

            <div style="margin-top: 20px; display: flex; gap: 24px;">
                <div style="flex: 2;">
                    <h3>Description</h3>
                    <div class="description-box" style="padding: 16px; background: #fafbfc; border: 1px solid #dfe1e6; border-radius: 3px; margin: 12px 0;">
                        ${issue.description || 'No description provided.'}
                    </div>

                    <h3 style="margin-top: 28px;">Activity / Comments</h3>
                    <div id="full-comments-list" style="margin-top: 12px;">
                        ${(issue.comments || []).map(c => `
                            <div class="comment" style="margin-bottom: 10px; background: #f4f5f7; padding: 10px; border-radius: 3px;">
                                <strong>${c.author}</strong> <span style="font-size: 11px; color: #5e6c84;">• ${c.date || 'Just now'}</span>
                                <p style="margin-top: 4px;">${c.text}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin-top: 16px; display: flex; gap: 8px;">
                        <input type="text" id="full-comment-input" placeholder="Add a comment as ${currentUser.username}..." style="flex: 1; padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px;">
                        <button id="full-post-comment-btn" class="create-btn">Comment</button>
                    </div>
                </div>

                <div style="flex: 1; background: #f4f5f7; padding: 16px; border-radius: 4px; height: fit-content;">
                    <h4 style="margin-bottom: 12px; color: #5e6c84;">Details</h4>
                    <p style="font-size: 13px; margin-bottom: 8px;"><strong>Reporter:</strong> ${issue.reporter}</p>
                    <p style="font-size: 13px; margin-bottom: 8px;"><strong>Priority:</strong> ${issue.priority}</p>
                    <p style="font-size: 13px;"><strong>Updated:</strong> ${issue.updated}</p>
                </div>
            </div>
        </div>
    `;

  document.getElementById('full-post-comment-btn').onclick = () => {
    const input = document.getElementById('full-comment-input');
    if (!input.value.trim()) return;

    const issues = getStoredIssues();
    const currentIssue = issues.find(i => i.key === issue.key);
    currentIssue.comments = currentIssue.comments || [];
    currentIssue.comments.push({ author: currentUser.username, text: input.value.trim(), date: 'Just now' });

    saveIssues(issues);
    renderFullIssue(currentIssue, container);
  };
}
