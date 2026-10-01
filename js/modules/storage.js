const STORAGE_KEY = 'boundful_issues_data';

const initialIssues = [
  {
    key: 'BF-1001',
    type: 'Bug',
    summary: 'The game crashes randomly',
    status: 'OPEN',
    priority: 'High',
    updated: 'Just now',
    reporter: 'Steve',
    description: 'Game randomly closes when moving across chunk boundaries.',
    comments: [{ author: 'BoundedDev', text: 'Looking into the crash log attached.', date: 'Just now' }]
  },
  {
    key: 'BF-1002',
    type: 'Bug',
    summary: 'Spear attack registration is not synced between server and client',
    status: 'IN PROGRESS',
    priority: 'Medium',
    updated: '2 mins ago',
    reporter: 'Alex_Craft',
    description: 'Client registers hit particle but server does not deal damage on tick alignment.',
    comments: []
  }
];

export function getStoredIssues() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIssues));
    return initialIssues;
  }
  return JSON.parse(data);
}

export function saveIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}
