import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { ROLES } from '../utils/constants';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Developer' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-orbit-500 via-orbit-600 to-orange-700 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="font-bold text-lg">O</span>
            </div>
            <span className="font-bold text-2xl">Orbit</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">Join the mission 🚀</h1>
          <p className="text-orange-100 text-lg leading-relaxed max-w-sm">
            Create your workspace and start managing projects with your team today.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { num: '5', label: 'Kanban columns' },
              { num: '3', label: 'User roles' },
              { num: '∞', label: 'Issues & tasks' },
              { num: 'AI', label: 'Powered insights' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-bold">{num}</p>
                <p className="text-sm text-orange-100 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-orbit-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Orbit</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Set up your Orbit workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input id="reg-name" className="input" placeholder="Alex Johnson" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Email</label>
              <input id="reg-email" className="input" type="email" placeholder="alex@company.com" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input id="reg-password" className="input pr-10" type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Role</label>
              <select id="reg-role" className="select" value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orbit-600 hover:text-orbit-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
