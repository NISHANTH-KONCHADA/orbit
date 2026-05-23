import { formatDistanceToNow, format } from 'date-fns';

/** Format date as "2 hours ago" */
export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/** Format date as "May 23, 2024" */
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
};

/** Get initials from a full name */
export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Truncate string */
export const truncate = (str, len = 60) =>
  str?.length > len ? str.slice(0, len) + '…' : str;

/** Clamp a number between min and max */
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** Map issue status → percentage for sprint progress bar */
export const statusToPercent = (issues = []) => {
  if (!issues.length) return 0;
  const done = issues.filter((i) => i.status === 'done').length;
  return Math.round((done / issues.length) * 100);
};

/** Group issues by status */
export const groupByStatus = (issues = []) => {
  return issues.reduce((acc, issue) => {
    const key = issue.status;
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {});
};

/** Activity action → readable string */
export const actionLabel = (action, meta = {}) => {
  const map = {
    created_issue:  `created issue "${meta.title || ''}"`,
    moved_issue:    `moved issue from ${meta.from} → ${meta.to}`,
    commented:      `commented: "${meta.text || ''}"`,
    deleted_issue:  `deleted issue "${meta.title || ''}"`,
    created_project: `created project "${meta.name || ''}"`,
    updated_issue:  `updated issue`,
  };
  return map[action] || action;
};
