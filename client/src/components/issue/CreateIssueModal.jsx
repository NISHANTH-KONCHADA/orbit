import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { PRIORITY, ISSUE_TYPE, COLUMNS } from '../../utils/constants';
import api from '../../services/api';
import { Loader2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateIssueModal = ({ defaultStatus = 'backlog', onClose }) => {
  const { createIssue, activeProject } = useProject();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', type: 'task', priority: 'medium',
    status: defaultStatus, assignee: '', labels: '', dueDate: '',
    acceptanceCriteria: [],
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (activeProject?._id) {
      api.get(`/projects/${activeProject._id}`)
        .then((r) => setMembers(r.data.project?.members?.map((m) => m.user).filter(Boolean) || []))
        .catch(() => {});
    }
  }, [activeProject]);

  const handleAIGenerate = async () => {
    if (!form.title.trim()) { toast.error('Enter a title first to generate with AI'); return; }
    setAiLoading(true);
    try {
      const res = await aiService.generateTask(form.title, activeProject?._id);
      const d = res.data;
      setForm((f) => ({
        ...f,
        description: d.description || f.description,
        priority: d.suggestedPriority || f.priority,
        labels: d.suggestedLabels?.join(', ') || f.labels,
        acceptanceCriteria: d.acceptanceCriteria || [],
      }));
      toast.success('✨ AI generated the details!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      await createIssue({
        ...form,
        labels: form.labels.split(',').map((l) => l.trim()).filter(Boolean),
        assignee: form.assignee || undefined,
        aiGenerated: aiLoading === false && form.description.length > 20,
      });
      toast.success('Issue created!');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Create Issue" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title + AI button */}
        <div>
          <label className="label">Title *</label>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="What needs to be done?" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
              className="btn-secondary btn-sm whitespace-nowrap shrink-0"
              title="Generate description, criteria, and priority with AI">
              {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
              ✨ AI Fill
            </button>
          </div>
        </div>

        {/* AI-generated AC */}
        {form.acceptanceCriteria.length > 0 && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-1">
              <Wand2 size={11} /> AI Acceptance Criteria
            </p>
            <ul className="space-y-1">
              {form.acceptanceCriteria.map((c, i) => (
                <li key={i} className="text-xs text-purple-800 dark:text-purple-300 flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5">✓</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Type + Priority + Status */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="select text-sm" value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {Object.entries(ISSUE_TYPE).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="select text-sm" value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select text-sm" value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea className="textarea" rows={4} placeholder="Describe the issue in detail…"
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>

        {/* Assignee + Due date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Assignee</label>
            <select className="select text-sm" value={form.assignee}
              onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input text-sm" value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="label">Labels (comma-separated)</label>
          <input className="input text-sm" placeholder="bug, frontend, needs-review"
            value={form.labels} onChange={(e) => setForm((f) => ({ ...f, labels: e.target.value }))} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create Issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateIssueModal;
