import { useState } from 'react';
import Modal from '../ui/Modal';
import { useProject } from '../../context/ProjectContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONS = ['🚀', '🔥', '💡', '⚡', '🎯', '🌟', '📊', '🔧', '🎨', '🛡️'];
const COLORS = ['#F97316', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProject();
  const [form, setForm] = useState({ name: '', description: '', key: '', icon: '🚀', color: '#F97316' });
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    // Auto-generate key from name
    const key = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setForm((f) => ({ ...f, name, key }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.key.trim()) {
      toast.error('Name and key are required');
      return;
    }
    setLoading(true);
    try {
      await createProject(form);
      onClose();
      setForm({ name: '', description: '', key: '', icon: '🚀', color: '#F97316' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Icon + color picker */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: form.color + '22', border: `2px solid ${form.color}` }}
          >
            {form.icon}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-1 flex-wrap">
              {ICONS.map((ic) => (
                <button type="button" key={ic} onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`text-lg p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                    ${form.icon === ic ? 'ring-2 ring-orbit-500 bg-orbit-50' : ''}`}
                >
                  {ic}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110
                    ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label">Project Name *</label>
          <input className="input" placeholder="e.g. Orbit App" value={form.name} onChange={handleNameChange} required />
        </div>

        {/* Key */}
        <div>
          <label className="label">Project Key *</label>
          <input
            className="input font-mono uppercase"
            placeholder="e.g. ORB"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }))}
            required maxLength={6}
          />
          <p className="text-xs text-gray-400 mt-1">Issues will be labeled as {form.key || 'KEY'}-1, {form.key || 'KEY'}-2, …</p>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea className="textarea" rows={3} placeholder="What is this project about?"
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
