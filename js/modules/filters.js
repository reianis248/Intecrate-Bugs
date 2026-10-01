import { getStoredIssues } from './storage.js';

export function renderIssueTable(filteredIssues = null) {
  const tbody = document.getElementById('issue-table-body');
  if (!tbody) return;

  const issues = filteredIssues || getStoredIssues();
  tbody.innerHTML = '';

  if (issues.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #5e6c84;">No matching issues found</td></tr>`;
    return;
  }

  issues.forEach(issue => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.className = 'issue-row';
    tr.setAttribute('data-key', issue.key);

    const badgeClass = issue.status === 'OPEN' ? 'open' : 'in-progress';
    const priorityIcon = issue.priority === 'High'
      ? '<i class="fa-solid fa-angles-up" style="color: #ff5630;"></i> High'
      : '<i class="fa-solid fa-angle-up" style="color: #ffab00;"></i> Medium';

    tr.innerHTML = `
            <td><i class="fa-solid fa-bug" style="color: #e5493a;"></i></td>
            <td><a href="#" class="issue-link" data-key="${issue.key}">${issue.key}</a></td>
            <td>${issue.summary}</td>
            <td><span class="status-badge ${badgeClass}">${issue.status}</span></td>
            <td>${priorityIcon}</td>
            <td>${issue.updated}</td>
        `;

    // Row Click Handler -> Navigate to issue.html full page
    tr.addEventListener('click', (e) => {
      if (e.target.classList.contains('issue-link')) return; // Let modal open if text link clicked
      window.location.href = `issue.html?key=${issue.key}`;
    });

    tbody.appendChild(tr);
  });
}

export function initFilters() {
  const searchInput = document.getElementById('issue-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const issues = getStoredIssues();
    const filtered = issues.filter(item =>
      item.key.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query)
    );
    renderIssueTable(filtered);
  });
}
