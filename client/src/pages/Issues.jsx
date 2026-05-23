import { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { PriorityBadge, TypeBadge, StatusBadge } from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import IssueModal from '../components/issue/IssueModal';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import { PRIORITY, ISSUE_TYPE, COLUMNS } from '../utils/constants';
import { timeAgo } from '../utils/helpers';
import { Loader2, Filter, Plus, Search, SortAsc } from 'lucide-react';

const Issues = () => {
  const { issues, loadingIssues, activeProject } = useProject();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ search: '', type: '', priority: '', status: '', assignee: '' });
  const [sort, setSort] = useState('createdAt');

  const filtered = useMemo(() => {
    let list = [...issues];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((i) =>
        i.title.toLowerCase().includes(q) || i.issueId?.toLowerCase().includes(q)
      );
    }
    if (filters.type) list = list.filter((i) => i.type === filters.type);
    if (filters.priority) list = list.filter((i) => i.priority === filters.priority);
    if (filters.status) list = list.filter((i) => i.status === filters.status);

    // Sort
    list.sort((a, b) => {
      if (sort === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (sort === 'status') return a.status.localeCompare(b.status);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [issues, filters, sort]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: f[key] === val ? '' : val }));

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <p className="text-lg font-medium">No project selected</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issues</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {filtered.length} of {issues.length} issues
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> Create Issue
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-gray-400" />
          <input
            className="bg-transparent text-sm outline-none flex-1 text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="Search by title or ID…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1 flex-wrap">
          {Object.entries(ISSUE_TYPE).map(([k, v]) => (
            <button key={k} onClick={() => setFilter('type', k)}
              className={`badge cursor-pointer transition-all ${filters.type === k ? 'ring-2 ring-orbit-500' : ''} ${v.color}`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex gap-1 flex-wrap">
          {Object.entries(PRIORITY).map(([k, v]) => (
            <button key={k} onClick={() => setFilter('priority', k)}
              className={`badge cursor-pointer transition-all ${filters.priority === k ? 'ring-2 ring-orbit-500' : ''} ${v.color}`}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SortAsc size={14} className="text-gray-400" />
          <select className="select text-sm py-1.5 w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Issue table */}
      {loadingIssues ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-orbit-500" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {['ID', 'Title', 'Type', 'Priority', 'Status', 'Assignee', 'Created'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No issues found. Try adjusting filters or create a new issue.
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => (
                  <tr
                    key={issue._id}
                    onClick={() => setSelectedIssue(issue)}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-400">{issue.issueId}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-orbit-600 dark:group-hover:text-orbit-400 transition-colors">
                        {issue.title}
                      </p>
                      {issue.labels?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {issue.labels.slice(0, 2).map((l) => (
                            <span key={l} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{l}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={issue.type} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                    <td className="px-4 py-3">
                      {issue.assignee
                        ? <div className="flex items-center gap-1.5">
                            <Avatar name={issue.assignee.name} color={issue.assignee.avatarColor} size="xs" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{issue.assignee.name}</span>
                          </div>
                        : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{timeAgo(issue.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={(u) => setSelectedIssue(u)}
        />
      )}
      {showCreate && <CreateIssueModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default Issues;
