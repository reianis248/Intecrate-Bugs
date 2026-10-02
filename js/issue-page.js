import { getStoredIssues, saveIssues } from './modules/storage.js';
import { getCurrentUser, initAuth } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();

  // Read issue key from URL path or query string
  const urlParams = new URLSearchParams(window.location.search);
  let key = urlParams.get('key');

  if (!key) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      key = pathSegments[pathSegments.length - 1];
    }
  }

  const container = document.getElementById('full-issue-container');

  if (!key || key === 'issue.html') {
    container.innerHTML = `<h2>No issue specified.</h2><a href="/" style="color: #0052cc;">Return to Issue Navigator</a>`;
    return;
  }

  const issues = getStoredIssues();
  const issue = issues.find(i => i.key.toUpperCase() === key.toUpperCase());

  if (!issue) {
    container.innerHTML = `<h2>Issue ${key} not found.</h2><a href="/" style="color: #0052cc;">Return to Issue Navigator</a>`;
    return;
  }

  renderMojiraIssuePage(issue, container);
});

function renderMojiraIssuePage(issue, container) {
  const currentUser = getCurrentUser();
  const badgeClass = issue.status === 'OPEN' ? 'open' : 'in-progress';
  const isImage = issue.attachment && /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(issue.attachment);

  container.innerHTML = `
        <!-- Breadcrumb Navigation -->
        <div style="font-size: 13px; color: #5e6c84; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <a href="/" style="color: #0052cc; text-decoration: none;">Boundful Issues</a> /
            <a href="/browse/BF/issues/${issue.key}" style="color: #0052cc; text-decoration: none;">${issue.key}</a>
        </div>

        <!-- Issue Title -->
        <h1 style="font-size: 24px; font-weight: 500; margin-bottom: 16px; color: #172b4d; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-bug" style="color: #e5493a; font-size: 20px;"></i>
            ${issue.summary}
        </h1>

        <!-- Action Toolbar -->
        <div style="display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #dfe1e6; padding-bottom: 16px;">
            <button class="create-btn" style="background-color: #ebecf0; color: #42526e; font-weight: 600;"><i class="fa-solid fa-pen"></i> Edit</button>
            <button class="create-btn" style="background-color: #ebecf0; color: #42526e; font-weight: 600;"><i class="fa-solid fa-comment"></i> Comment</button>
            <button class="create-btn" style="background-color: #ebecf0; color: #42526e; font-weight: 600;"><i class="fa-solid fa-share-nodes"></i> Assign</button>
        </div>

        <!-- Two-Column Mojira Layout -->
        <div style="display: flex; gap: 32px;">
            <!-- Left Side: Main Details & Comments -->
            <div style="flex: 3;">
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 14px; color: #5e6c84; text-transform: uppercase; margin-bottom: 8px;">Description</h3>
                    <div style="background: #ffffff; border: 1px solid #dfe1e6; border-radius: 3px; padding: 16px; font-size: 14px; line-height: 1.5; color: #172b4d; white-space: pre-wrap;">
                        ${issue.description || 'No description provided for this issue.'}
                    </div>
                </div>

                ${issue.attachment ? `
                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 14px; color: #5e6c84; text-transform: uppercase; margin-bottom: 8px;">Attachment</h3>
                        <div style="background: #ffffff; border: 1px solid #dfe1e6; border-radius: 3px; padding: 16px;">
                            ${isImage ? `
                                <a href="${issue.attachment}" target="_blank">
                                    <img src="${issue.attachment}" alt="Attachment" style="max-width: 100%; max-height: 350px; border-radius: 4px; border: 1px solid #dfe1e6; display: block;">
                                </a>
                            ` : `
                                <a href="${issue.attachment}" target="_blank" style="color: #0052cc; word-break: break-all; font-size: 14px;">${issue.attachment}</a>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Activity / Comments Box -->
                <div style="margin-top: 32px;">
                    <h3 style="font-size: 14px; color: #5e6c84; text-transform: uppercase; margin-bottom: 12px;">Activity - Comments</h3>

                    <div id="full-comments-list" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                        ${(issue.comments || []).map(c => `
                            <div style="background: #fafbfc; border: 1px solid #dfe1e6; border-radius: 3px; padding: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #5e6c84; margin-bottom: 6px;">
                                    <strong><i class="fa-solid fa-user-circle"></i> ${c.author}</strong>
                                    <span>${c.date || 'Just now'}</span>
                                </div>
                                <div style="font-size: 14px; color: #172b4d;">${c.text}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="full-comment-input" placeholder="Add a comment as ${currentUser ? currentUser.username : 'Guest'}..." style="flex: 1; padding: 8px 12px; border: 1px solid #dfe1e6; border-radius: 3px; font-size: 14px;">
                        <button id="full-post-comment-btn" class="create-btn">Add Comment</button>
                    </div>
                </div>
            </div>

            <!-- Right Side: Mojira Metadata Panel -->
            <div style="flex: 1; min-width: 240px; background: #fafbfc; border: 1px solid #dfe1e6; border-radius: 3px; padding: 16px; height: fit-content;">
                <h3 style="font-size: 12px; color: #5e6c84; text-transform: uppercase; border-bottom: 1px solid #dfe1e6; padding-bottom: 8px; margin-bottom: 16px;">Details</h3>

                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
                    <div>
                        <span style="color: #5e6c84; display: block; font-size: 11px;">STATUS</span>
                        <span class="status-badge ${badgeClass}" style="margin-top: 4px;">${issue.status}</span>
                    </div>
                    <div>
                        <span style="color: #5e6c84; display: block; font-size: 11px;">PRIORITY</span>
                        <span style="font-weight: 500;">${issue.priority}</span>
                    </div>
                    <div>
                        <span style="color: #5e6c84; display: block; font-size: 11px;">REPORTER</span>
                        <span style="font-weight: 500;">${issue.reporter || 'Anonymous'}</span>
                    </div>
                    <div>
                        <span style="color: #5e6c84; display: block; font-size: 11px;">UPDATED</span>
                        <span>${issue.updated}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Comment listener
  document.getElementById('full-post-comment-btn').onclick = () => {
    const input = document.getElementById('full-comment-input');
    if (!input.value.trim()) return;

    const issues = getStoredIssues();
    const currentIssue = issues.find(i => i.key === issue.key);
    currentIssue.comments = currentIssue.comments || [];
    currentIssue.comments.push({
      author: currentUser ? currentUser.username : 'Guest',
      text: input.value.trim(),
      date: 'Just now'
    });

    saveIssues(issues);
    renderMojiraIssuePage(currentIssue, container);
  };
}
