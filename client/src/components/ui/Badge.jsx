import { PRIORITY, ISSUE_TYPE } from '../../utils/constants';

/**
 * Badge — flexible badge component.
 * Variants: priority | type | status | custom className
 */

const STATUS_CLASS = {
  backlog:      'badge-gray',
  todo:         'badge-blue',
  'in-progress':'badge-orange',
  review:       'badge-purple',
  done:         'badge-green',
};

const STATUS_LABEL = {
  backlog:      'Backlog',
  todo:         'To Do',
  'in-progress':'In Progress',
  review:       'Review',
  done:         'Done',
};

export const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY[priority] || PRIORITY.medium;
  return (
    <span className={cfg.color + ' badge gap-1'}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const TypeBadge = ({ type }) => {
  const cfg = ISSUE_TYPE[type] || ISSUE_TYPE.task;
  return (
    <span className={cfg.color + ' badge'}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => (
  <span className={(STATUS_CLASS[status] || 'badge-gray') + ' badge'}>
    {STATUS_LABEL[status] || status}
  </span>
);

/** Generic colored badge */
const Badge = ({ children, className = '' }) => (
  <span className={`badge ${className}`}>{children}</span>
);

export default Badge;
