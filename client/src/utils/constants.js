// Priority config
export const PRIORITY = {
  low:      { label: 'Low',      color: 'badge-blue',   dot: 'bg-blue-400'    },
  medium:   { label: 'Medium',   color: 'badge-yellow', dot: 'bg-amber-400'   },
  high:     { label: 'High',     color: 'badge-orange', dot: 'bg-orbit-500'   },
  critical: { label: 'Critical', color: 'badge-red',    dot: 'bg-red-500'     },
};

// Issue type config
export const ISSUE_TYPE = {
  bug:     { label: 'Bug',     icon: '🐛', color: 'badge-red'    },
  feature: { label: 'Feature', icon: '✨', color: 'badge-purple' },
  task:    { label: 'Task',    icon: '✅', color: 'badge-blue'   },
  story:   { label: 'Story',   icon: '📖', color: 'badge-green'  },
};

// Kanban columns
export const COLUMNS = [
  { id: 'backlog',     label: 'Backlog',     color: 'bg-gray-400'    },
  { id: 'todo',        label: 'To Do',       color: 'bg-blue-400'    },
  { id: 'in-progress', label: 'In Progress', color: 'bg-orbit-500'   },
  { id: 'review',      label: 'Review',      color: 'bg-purple-400'  },
  { id: 'done',        label: 'Done',        color: 'bg-emerald-400' },
];

// Role display
export const ROLES = ['Admin', 'Project Manager', 'Developer'];

// Avatar color pool (same as server)
export const AVATAR_COLORS = [
  '#F97316', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
  '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#6366F1',
];
