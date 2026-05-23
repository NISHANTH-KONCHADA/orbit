import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge, TypeBadge, StatusBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { aiService } from '../../services/aiService';
import api from '../../services/api';
import { PRIORITY, ISSUE_TYPE, COLUMNS } from '../../utils/constants';
import { timeAgo, formatDate } from '../../utils/helpers';
import {
  Loader2, Sparkles, Trash2, Edit3, Save, X,
  MessageSquare, Calendar, User, Tag, Clock, Wand2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const IssueModal = ({ issue: initialIssue, onClose, onUpdated }) => {
  const { updateIssue, deleteIssue, activeProject } = useProject();
  const { user } = useAuth();

  const [issue, setIssue] = useState(initialIssue);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: initialIssue.title,
    description: initialIssue.description || '',
    type: initialIssue.type,
    priority: initialIssue.priority,
    status: initialIssue.status,
    assignee: initialIssue.assignee?._id || '',
    dueDate: initialIssue.dueDate ? formatDate(initialIssue.dueDate) : '',
    labels: initialIssue.labels?.join(', ') || '',
  });
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (activeProject?._id) {
      api.get(`/projects/${activeProject._id}`)
        .then((r) => setMembers(r.data.project?.members?.map((m) => m.user) || []))
        .catch(() => {});
    }
  }, [activeProject]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateIssue(issue._id, {
        ...form,
        labels: form.labels.split(',').map((l) => l.trim()).filter(Boolean),
      });
      setIssue(updated);
      onUpdated?.(updated);
      setEditing(false);
      toast.success('Issue updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteIssue(issue._id);
      onClose();
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const res = await api.post(`/issues/${issue._id}/comments`, { text: comment });
      setIssue((prev) => ({ ...prev, comments: res.data.comments }));
      setComment('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCommenting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!form.title) { toast.error('Enter a title first'); return; }
    setAiLoading(true);
    try {
      const res = await aiService.generateTask(form.title, activeProject?._id);
      const d = res.data;
      setForm((f) => ({
        ...f,
        description: d.description || f.description,
        priority: d.suggestedPriority || f.priority,
        labels: d.suggestedLabels?.join(', ') || f.labels,
      }));
      toast.success('✨ AI filled in the details!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700 max-h-[85vh]">
        {/* Left: main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Issue ID + type */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{issue.issueId}</span>
            <TypeBadge type={issue.type} />
            {issue.aiGenerated && <span className="badge badge-purple text-[10px]">✨ AI Generated</span>}
          </div>

          {/* Title */}
          {editing ? (
            <input
              className="input text-lg font-bold"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          ) : (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{issue.title}</h2>
          )}

          {/* AI generate button (in edit mode) */}
          {editing && (
            <button onClick={handleAIGenerate} disabled={aiLoading} className="btn-secondary btn-sm ai-gradient">
              {aiLoading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <><Wand2 size={13} /> ✨ Generate with AI</>}
            </button>
          )}

          {/* Description */}
          <div>
            <label className="label flex items-center gap-1.5"><Edit3 size={12} /> Description</label>
            {editing ? (
              <textarea
                className="textarea"
                rows={5}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue…"
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 min-h-[60px]">
                {issue.description
                  ? <ReactMarkdown>{issue.description}</ReactMarkdown>
                  : <span className="text-gray-400 italic text-sm">No description</span>
                }
              </div>
            )}
          </div>

          {/* Acceptance criteria (if exists) */}
          {issue.acceptanceCriteria?.length > 0 && (
            <div>
              <label className="label">Acceptance Criteria</label>
              <ul className="space-y-1.5">
                {issue.acceptanceCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="label flex items-center gap-1.5"><MessageSquare size={12} /> Comments ({issue.comments?.length || 0})</label>
            <div className="space-y-3 mb-4">
              {(issue.comments || []).map((c) => (
                <div key={c._id} className="flex gap-3 animate-fade-in">
                  <Avatar name={c.user?.name} color={c.user?.avatarColor} size="sm" />
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl rounded-tl-sm px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{c.user?.name}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <form onSubmit={handleComment} className="flex gap-2">
              <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
              <div className="flex-1 flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" disabled={commenting || !comment.trim()} className="btn-primary btn-sm px-3">
                  {commenting ? <Loader2 size={13} className="animate-spin" /> : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: metadata panel */}
        <div className="w-full lg:w-64 p-5 space-y-4 shrink-0 overflow-y-auto">
          {/* Actions */}
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm flex-1">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost btn-sm"><X size={13} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="btn-secondary btn-sm flex-1">
                  <Edit3 size={13} /> Edit
                </button>
                <button onClick={handleDelete} disabled={deleting} className="btn-danger btn-sm btn-icon">
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </>
            )}
          </div>

          <div className="divider" />

          {/* Status */}
          <div>
            <label className="label text-xs">Status</label>
            {editing ? (
              <select className="select text-sm" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            ) : <StatusBadge status={issue.status} />}
          </div>

          {/* Priority */}
          <div>
            <label className="label text-xs">Priority</label>
            {editing ? (
              <select className="select text-sm" value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                {Object.keys(PRIORITY).map((p) => <option key={p} value={p}>{PRIORITY[p].label}</option>)}
              </select>
            ) : <PriorityBadge priority={issue.priority} />}
          </div>

          {/* Type */}
          <div>
            <label className="label text-xs">Type</label>
            {editing ? (
              <select className="select text-sm" value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {Object.keys(ISSUE_TYPE).map((t) => <option key={t} value={t}>{ISSUE_TYPE[t].label}</option>)}
              </select>
            ) : <TypeBadge type={issue.type} />}
          </div>

          {/* Assignee */}
          <div>
            <label className="label text-xs flex items-center gap-1"><User size={11} /> Assignee</label>
            {editing ? (
              <select className="select text-sm" value={form.assignee}
                onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map((m) => m && <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            ) : (
              issue.assignee
                ? <div className="flex items-center gap-2">
                    <Avatar name={issue.assignee.name} color={issue.assignee.avatarColor} size="xs" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{issue.assignee.name}</span>
                  </div>
                : <span className="text-sm text-gray-400">Unassigned</span>
            )}
          </div>

          {/* Reporter */}
          <div>
            <label className="label text-xs">Reporter</label>
            <div className="flex items-center gap-2">
              <Avatar name={issue.reporter?.name} color={issue.reporter?.avatarColor} size="xs" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{issue.reporter?.name || 'Unknown'}</span>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="label text-xs flex items-center gap-1"><Calendar size={11} /> Due Date</label>
            {editing ? (
              <input type="date" className="input text-sm" value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {issue.dueDate ? formatDate(issue.dueDate) : 'Not set'}
              </span>
            )}
          </div>

          {/* Labels */}
          <div>
            <label className="label text-xs flex items-center gap-1"><Tag size={11} /> Labels</label>
            {editing ? (
              <input className="input text-sm" placeholder="bug, frontend, …" value={form.labels}
                onChange={(e) => setForm((f) => ({ ...f, labels: e.target.value }))} />
            ) : (
              <div className="flex flex-wrap gap-1">
                {issue.labels?.length
                  ? issue.labels.map((l) => (
                      <span key={l} className="badge badge-gray text-[10px]">{l}</span>
                    ))
                  : <span className="text-sm text-gray-400">None</span>
                }
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Timestamps */}
          <div className="space-y-1.5 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock size={10} />
              <span>Created {timeAgo(issue.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={10} />
              <span>Updated {timeAgo(issue.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IssueModal;
