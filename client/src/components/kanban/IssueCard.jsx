import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge, TypeBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils/helpers';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';

const IssueCard = ({ issue, onClick }) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: issue._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card group ${isDragging ? 'dragging opacity-50 rotate-1' : ''}`}
      onClick={(e) => {
        // Don't open modal if dragging
        if (!isDragging) onClick?.(issue);
      }}
    >
      {/* Type + Priority row */}
      <div className="flex items-center gap-1.5 mb-2">
        <TypeBadge type={issue.type} />
        <PriorityBadge priority={issue.priority} />
        {issue.aiGenerated && (
          <span className="badge badge-purple text-[10px] ml-auto">✨ AI</span>
        )}
      </div>

      {/* Issue ID + Title */}
      <p className="text-[10px] font-mono text-gray-400 mb-1">{issue.issueId}</p>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-orbit-600 dark:group-hover:text-orbit-400 transition-colors">
        {issue.title}
      </h4>

      {/* Labels */}
      {issue.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {issue.labels.slice(0, 3).map((lbl) => (
            <span key={lbl} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: due date + comments + assignee */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          {issue.dueDate && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Calendar size={10} />
              {formatDate(issue.dueDate)}
            </span>
          )}
          {issue.comments?.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <MessageSquare size={10} />
              {issue.comments.length}
            </span>
          )}
        </div>

        {issue.assignee ? (
          <Avatar
            name={issue.assignee.name}
            color={issue.assignee.avatarColor}
            size="xs"
            title={`Assigned to ${issue.assignee.name}`}
          />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center" title="Unassigned">
            <span className="text-[8px] text-gray-300">?</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
