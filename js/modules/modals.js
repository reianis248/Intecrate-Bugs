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
    const createBtn = e.target.closest('.create-btn');
    if (createBtn && !e.target.closest('.jira-modal')) {
      e.preventDefault();
      openCreateModal();
      return;
    }
  });
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
