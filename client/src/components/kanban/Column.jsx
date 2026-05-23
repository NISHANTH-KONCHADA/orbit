import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import IssueCard from './IssueCard';
import { Plus } from 'lucide-react';

const COLUMN_COLORS = {
  backlog:      'bg-gray-400',
  todo:         'bg-blue-400',
  'in-progress':'bg-orbit-500',
  review:       'bg-purple-400',
  done:         'bg-emerald-400',
};

const Column = ({ column, issues, onCardClick, onAddIssue }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const issueIds = issues.map((i) => i._id);

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[column.id] || 'bg-gray-400'}`} />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{column.label}</h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
            {issues.length}
          </span>
        </div>
        <button
          onClick={() => onAddIssue(column.id)}
          className="btn-icon text-gray-400 hover:text-orbit-600 hover:bg-orbit-50 dark:hover:bg-orbit-900/20 w-7 h-7"
          title={`Add issue to ${column.label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[200px] rounded-xl p-2 space-y-2 transition-colors duration-150
          ${isOver
            ? 'bg-orbit-50 dark:bg-orbit-900/20 ring-2 ring-orbit-300 dark:ring-orbit-700'
            : 'bg-gray-100/60 dark:bg-gray-800/40'
          }
        `}
      >
        <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} onClick={onCardClick} />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-24 text-center cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orbit-400 dark:hover:border-orbit-600 transition-colors"
            onClick={() => onAddIssue(column.id)}
          >
            <Plus size={16} className="text-gray-300 dark:text-gray-600 mb-1" />
            <p className="text-xs text-gray-400 dark:text-gray-500">Add issue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
