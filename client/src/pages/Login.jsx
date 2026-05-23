import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'orbit123' });

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-orbit-500 via-orbit-600 to-orange-700 p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="font-bold text-lg">O</span>
            </div>
            <span className="font-bold text-2xl">Orbit</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Tasks in<br />Motion 🚀
          </h1>
          <p className="text-orange-100 text-lg leading-relaxed max-w-sm">
            Your team's command center. Manage projects, track issues, and ship faster with AI-powered insights.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: '🎯', text: 'Kanban board with drag & drop' },
            { icon: '🤖', text: 'AI-powered task generation' },
            { icon: '⚡', text: 'Real-time team collaboration' },
            { icon: '📊', text: 'Sprint analytics & reports' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-orange-50">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-orbit-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Orbit</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                id="login-email"
                className="input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-orbit-50 dark:bg-orbit-900/20 rounded-xl border border-orbit-200 dark:border-orbit-800">
            <p className="text-xs font-semibold text-orbit-700 dark:text-orbit-400 mb-2">🎭 Demo accounts</p>
            <div className="space-y-1">
              {[
                { label: 'Admin', email: 'admin@orbit.dev' },
                { label: 'Project Manager', email: 'pm@orbit.dev' },
                { label: 'Developer', email: 'dev@orbit.dev' },
              ].map(({ label, email }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email)}
                  className="w-full text-left text-xs text-orbit-600 dark:text-orbit-400 hover:text-orbit-800 dark:hover:text-orbit-200 transition-colors py-0.5"
                >
                  <span className="font-medium">{label}:</span> {email} / orbit123
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            No account?{' '}
            <Link to="/register" className="text-orbit-600 hover:text-orbit-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
