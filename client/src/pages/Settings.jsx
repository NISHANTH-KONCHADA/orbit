import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import Avatar from '../components/ui/Avatar';
import api from '../services/api';
import { Loader2, User, Lock, Users, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Section = ({ title, icon: Icon, children }) => (
  <div className="card p-6">
    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
      <Icon size={16} className="text-orbit-500" />
      <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { activeProject, fetchProjects } = useProject();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Developer');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [members, setMembers] = useState(activeProject?.members || []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateUser(profileForm);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!activeProject) { toast.error('Select a project first'); return; }
    setMemberLoading(true);
    try {
      const res = await api.post(`/projects/${activeProject._id}/members`, { email: memberEmail, role: memberRole });
      setMembers(res.data.project.members);
      setMemberEmail('');
      toast.success('Member added!');
      fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeProject) return;
    try {
      await api.delete(`/projects/${activeProject._id}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.user?._id !== userId));
      toast.success('Member removed');
      fetchProjects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={user?.name} color={user?.avatarColor} size="xl" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="badge badge-orange mt-1">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save Profile'}
          </button>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={Lock}>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters" value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Team members */}
      {activeProject && (
        <Section title={`Team — ${activeProject.name}`} icon={Users}>
          <div className="space-y-3 mb-5">
            {members.map((m) => m.user && (
              <div key={m.user._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-none">
                <div className="flex items-center gap-3">
                  <Avatar name={m.user.name} color={m.user.avatarColor} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.user.name}</p>
                    <p className="text-xs text-gray-400">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-gray text-[10px]">{m.role}</span>
                  {m.user._id !== user?._id && (
                    <button onClick={() => handleRemoveMember(m.user._id)}
                      className="btn-icon w-7 h-7 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add member form */}
          <form onSubmit={handleAddMember} className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <UserPlus size={14} /> Invite Member
            </p>
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" type="email" placeholder="colleague@company.com"
                value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
              <select className="select text-sm w-36" value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}>
                {['Admin', 'Project Manager', 'Developer'].map((r) => <option key={r}>{r}</option>)}
              </select>
              <button type="submit" disabled={memberLoading} className="btn-primary btn-sm shrink-0">
                {memberLoading ? <Loader2 size={13} className="animate-spin" /> : 'Invite'}
              </button>
            </div>
          </form>
        </Section>
      )}
    </div>
  );
};

export default Settings;
