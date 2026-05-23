import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../hooks/useSocket';
import Column from '../components/kanban/Column';
import IssueCard from '../components/kanban/IssueCard';
import IssueModal from '../components/issue/IssueModal';
import CreateIssueModal from '../components/issue/CreateIssueModal';
import { COLUMNS } from '../utils/constants';
import { groupByStatus } from '../utils/helpers';
import { Loader2, RefreshCw } from 'lucide-react';

const Board = () => {
  const { issues, loadingIssues, activeProject, moveIssue, fetchIssues } = useProject();
  const { emitDrag } = useSocket(activeProject?._id);

  const [activeIssue, setActiveIssue] = useState(null); // dragging
  const [selectedIssue, setSelectedIssue] = useState(null); // modal
  const [createForStatus, setCreateForStatus] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const grouped = groupByStatus(issues);

  const handleDragStart = ({ active }) => {
    const issue = issues.find((i) => i._id === active.id);
    setActiveIssue(issue || null);
  };

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveIssue(null);
    if (!over) return;

    const overId = over.id;
    const issue = issues.find((i) => i._id === active.id);
    if (!issue) return;

    // Determine target column
    const targetColumn = COLUMNS.find((c) => c.id === overId)
      ? overId
      : issues.find((i) => i._id === overId)?.status;

    if (!targetColumn || targetColumn === issue.status) return;

    const targetIssues = grouped[targetColumn] || [];
    const newPosition = targetIssues.length;

    moveIssue(issue._id, targetColumn, newPosition);
    emitDrag(issue._id, targetColumn);
  }, [issues, grouped, moveIssue, emitDrag]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <p className="text-lg font-medium">No project selected</p>
        <p className="text-sm">Select a project from the sidebar to view the board</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {activeProject.icon} Board
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{activeProject.currentSprint?.name} · {issues.length} issues</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchIssues(activeProject._id)}
            className="btn-ghost btn-sm"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setCreateForStatus('backlog')}
            className="btn-primary btn-sm"
          >
            + Create Issue
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      {loadingIssues ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-orbit-500" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-6 h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {COLUMNS.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  issues={grouped[column.id] || []}
                  onCardClick={setSelectedIssue}
                  onAddIssue={setCreateForStatus}
                />
              ))}

              {/* Drag overlay — shows ghost card while dragging */}
              <DragOverlay>
                {activeIssue && (
                  <div className="rotate-2 opacity-90 shadow-xl">
                    <IssueCard issue={activeIssue} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      )}

      {/* Issue detail modal */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={(updated) => setSelectedIssue(updated)}
        />
      )}

      {/* Create issue modal */}
      {createForStatus && (
        <CreateIssueModal
          defaultStatus={createForStatus}
          onClose={() => setCreateForStatus(null)}
        />
      )}
    </div>
  );
};

export default Board;
