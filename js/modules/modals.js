import { getStoredIssues, saveIssues } from './storage.js';
import { renderIssueTable } from './filters.js';
import { getCurrentUser, getStoredUsers, deleteUserAccount } from './auth.js';

export function initModals() {
  document.addEventListener('click', (e) => {
    // Handle Issue Link Click
    if (e.target.classList.contains('issue-link')) {
      e.preventDefault();
      const key = e.target.getAttribute('data-key');
      openIssueModal(key);
      return;
    }

    // Handle User Management Sidebar Click
    const manageBtn = e.target.closest('#manage-users-btn');
    if (manageBtn) {
      e.preventDefault();
      openUserManagementModal();
      return;
    }

    // Handle Create Button Click
    const createBtn = e.target.closest('#create-btn') ||
      e.target.closest('.create-btn') ||
      (e.target.tagName === 'BUTTON' && e.target.textContent.trim() === 'Create');
    if (createBtn && !e.target.closest('.jira-modal')) {
      e.preventDefault();
      openCreateModal();
      return;
    }
  });
}

export function openCreateModal() {
  const modal = document.createElement('div');
  modal.className = 'jira-modal-overlay';

  modal.innerHTML = `
    <div class="jira-modal" style="max-width: 520px;">
        <div class="jira-modal-header">
            <h2>Create Issue</h2>
            <button class="close-modal">&times;</button>
        </div>
        <form id="create-issue-form" class="jira-modal-body" style="padding: 16px;">
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: #5e6c84; margin-bottom: 4px;">Issue Type</label>
                <select id="issue-type" style="width: 100%; padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px;">
                    <option value="Bug">Bug</option>
                    <option value="Task">Task</option>
                    <option value="Story">Story</option>
                </select>
            </div>

            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: #5e6c84; margin-bottom: 4px;">Summary *</label>
                <input type="text" id="issue-summary" required placeholder="What needs to be done?" style="width: 100%; padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px; box-sizing: border-box;">
            </div>

            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: #5e6c84; margin-bottom: 4px;">Attachment (Image or Link URL)</label>
                <input type="url" id="issue-attachment" placeholder="https://example.com/image.png or website link" style="width: 100%; padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px; box-sizing: border-box;">
            </div>

            <div style="margin-bottom: 12px; display: flex; gap: 12px;">
                <div style="flex: 1;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #5e6c84; margin-bottom: 4px;">Status</label>
                    <select id="issue-status" style="width: 100%; padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px;">
                        <option value="OPEN">OPEN</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #5e6c84; margin-bottom: 4px;">Priority</label>
                    <select id="issue-priority" style="width: 100%; padding: 8px; border: 1px solid #dfe1e6; border-radius: 3px;">
                        <option value="High">High</option>
                        <option value="Medium" selected>Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
                <button type="button" class="close-modal" style="background: none; border: none; padding: 8px 12px; cursor: pointer; color: #42526e;">Cancel</button>
                <button type="submit" style="background: #0052cc; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer; font-weight: 600;">Create</button>
            </div>
        </form>
    </div>
    `;

  document.body.appendChild(modal);

  modal.querySelectorAll('.close-modal').forEach(btn => btn.onclick = () => modal.remove());

  modal.querySelector('#create-issue-form').onsubmit = (e) => {
    e.preventDefault();

    const issues = getStoredIssues();
    const nextNumber = issues.length > 0 ? Math.max(...issues.map(i => parseInt(i.key.replace('BF-', '')) || 1000)) + 1 : 1001;
    const newKey = `BF-${nextNumber}`;

    const attachment = document.getElementById('issue-attachment').value.trim();

    const newIssue = {
      key: newKey,
      type: document.getElementById('issue-type').value,
      summary: document.getElementById('issue-summary').value.trim(),
      status: document.getElementById('issue-status').value,
      priority: document.getElementById('issue-priority').value,
      attachment: attachment || null,
      updated: 'Just now'
    };

    issues.unshift(newIssue);
    saveIssues(issues);
    renderIssueTable();
    modal.remove();
  };
}

export function openIssueModal(key) {
  const issues = getStoredIssues();
  const issueIndex = issues.findIndex(i => i.key === key);
  if (issueIndex === -1) return;

  const issue = issues[issueIndex];
  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.role === 'Admin';

  const modal = document.createElement('div');
  modal.className = 'jira-modal-overlay';

  const isImage = issue.attachment && /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(issue.attachment);

  modal.innerHTML = `
    <div class="jira-modal" style="max-width: 550px;">
        <div class="jira-modal-header">
            <h2>${issue.key}: ${issue.summary}</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="jira-modal-body" style="padding: 16px;">
            <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <span style="font-size: 12px; font-weight: bold; color: #5e6c84;">Type:</span> ${issue.type} |
                    <span style="font-size: 12px; font-weight: bold; color: #5e6c84;">Priority:</span> ${issue.priority}
                </div>

                ${isAdmin ? `
                    <div>
                        <label style="font-size: 12px; font-weight: bold; color: #5e6c84; margin-right: 4px;">Status (Admin):</label>
                        <select id="admin-status-select" style="padding: 4px 8px; border-radius: 3px; border: 1px solid #dfe1e6;">
                            <option value="OPEN" ${issue.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                            <option value="IN PROGRESS" ${issue.status === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                            <option value="DONE" ${issue.status === 'DONE' ? 'selected' : ''}>DONE</option>
                        </select>
                    </div>
                ` : `
                    <div><span class="status-badge">${issue.status}</span></div>
                `}
            </div>

            ${issue.attachment ? `
                <div style="margin-top: 16px; border-top: 1px solid #dfe1e6; padding-top: 12px;">
                    <strong style="font-size: 12px; color: #5e6c84; display: block; margin-bottom: 8px;">Attachment:</strong>
                    ${isImage ? `
                        <a href="${issue.attachment}" target="_blank">
                            <img src="${issue.attachment}" alt="Attachment" style="max-width: 100%; max-height: 250px; border-radius: 4px; border: 1px solid #dfe1e6; display: block;">
                        </a>
                    ` : `
                        <a href="${issue.attachment}" target="_blank" style="color: #0052cc; word-break: break-all;">${issue.attachment}</a>
                    `}
                </div>
            ` : ''}
        </div>
    </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('.close-modal').onclick = () => modal.remove();

  if (isAdmin) {
    const statusSelect = modal.querySelector('#admin-status-select');
    statusSelect.onchange = (e) => {
      issues[issueIndex].status = e.target.value;
      issues[issueIndex].updated = 'Just now';
      saveIssues(issues);
      renderIssueTable();
    };
  }
}

export function openUserManagementModal() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = getStoredUsers();
  const isAdmin = currentUser.role === 'Admin';

  const modal = document.createElement('div');
  modal.className = 'jira-modal-overlay';

  modal.innerHTML = `
    <div class="jira-modal" style="max-width: 550px;">
        <div class="jira-modal-header">
            <h2><i class="fa-solid fa-users" style="color: #0052cc;"></i> User Management</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="jira-modal-body">
            <p style="font-size: 13px; color: #5e6c84; margin-bottom: 16px;">
                ${isAdmin ? 'Admin View: Manage all registered user accounts.' : 'Registered user accounts. You can delete your own account.'}
            </p>

            <table class="issue-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                    <tr style="border-bottom: 2px solid #dfe1e6; text-align: left;">
                        <th style="padding: 8px;">User</th>
                        <th style="padding: 8px;">Role</th>
                        <th style="padding: 8px; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody id="users-table-body">
                    ${users.map(u => {
    const isSelf = u.username.toLowerCase() === currentUser.username.toLowerCase();
    const canDelete = (isAdmin && !isSelf) || isSelf;

    return `
                            <tr style="border-bottom: 1px solid #dfe1e6;">
                                <td style="padding: 10px 8px; display: flex; align-items: center; gap: 10px;">
                                    <div class="user-avatar" style="width: 28px; height: 28px; font-size: 11px;">${u.avatar}</div>
                                    <strong>${u.username}</strong>${isSelf ? '<span style="font-size:11px; color:#0052cc;">(You)</span>' : ''}
                                </td>
                                <td style="padding: 10px 8px;"><span class="status-badge ${u.role === 'Admin' ? 'open' : 'in-progress'}">${u.role}</span></td>
                                <td style="padding: 10px 8px; text-align: right;">
                                    ${canDelete
      ? `<button class="delete-user-btn" data-username="${u.username}" style="background: #de350b; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">${isSelf ? 'Delete My Account' : 'Delete'}</button>`
      : '<span style="font-size: 12px; color: #5e6c84;">Protected</span>'}
                                </td>
                            </tr>
                        `;
  }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('.close-modal').onclick = () => modal.remove();

  modal.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.onclick = () => {
      const targetUsername = btn.getAttribute('data-username');
      const isSelf = targetUsername.toLowerCase() === currentUser.username.toLowerCase();

      const confirmMsg = isSelf
        ? "Are you sure you want to permanently delete YOUR OWN account? This will log you out immediately."
        : `Are you sure you want to permanently delete account '${targetUsername}'?`;

      if (confirm(confirmMsg)) {
        const res = deleteUserAccount(targetUsername);
        if (res.success) {
          alert(res.message);
          modal.remove();

          if (isSelf) {
            window.location.href = 'login.html';
          } else {
            openUserManagementModal();
          }
        } else {
          alert(res.message);
        }
      }
    };
  });
}
