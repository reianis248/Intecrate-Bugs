const ISSUES_KEY = 'boundful_issues_data';

export function getStoredIssues() {
  const data = localStorage.getItem(ISSUES_KEY);
  if (!data) {
    localStorage.setItem(ISSUES_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
}

export function saveIssues(issues) {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
}
