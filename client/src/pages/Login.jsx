import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, Eye, EyeOff, ArrowLeft,
  Kanban, Bot, Zap, BarChart2,
  Shield, Target, GitBranch, ArrowRight, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: Kanban,    text: 'Kanban board with drag & drop' },
  { icon: Bot,       text: 'AI-powered task generation'    },
  { icon: Zap,       text: 'Real-time team collaboration'  },
  { icon: BarChart2, text: 'Sprint analytics & reports'    },
];

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@orbit.dev',
    icon: Shield,
    desc: 'Full control',
    color: 'bg-orbit-500',
    ring: 'ring-orbit-500/30',
    border: 'border-orbit-200 dark:border-orbit-500/30',
    hoverBg: 'hover:bg-orbit-50 dark:hover:bg-orbit-500/10',
    textColor: 'text-orbit-700 dark:text-orbit-300',
  },
  {
    role: 'Project Manager',
    email: 'pm@orbit.dev',
    icon: Target,
    desc: 'Sprint & project ops',
    color: 'bg-violet-500',
    ring: 'ring-violet-500/30',
    border: 'border-violet-200 dark:border-violet-500/30',
    hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
    textColor: 'text-violet-700 dark:text-violet-300',
  },
  {
    role: 'Developer',
    email: 'dev@orbit.dev',
    icon: GitBranch,
    desc: 'Issue-level access',
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

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

  /* One-click demo login — fills credentials AND submits immediately */
  const loginAs = async (role, email) => {
    setDemoLoading(role);
    try {
      await login({ email, password: 'orbit123' });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed — is the server running?');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] xl:w-1/2
                      bg-gradient-to-br from-orbit-500 via-orbit-600 to-orange-700
                      p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10"/>
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/5"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full bg-white/4"/>

        {/* Top */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white
                                   text-sm mb-12 transition-colors">
            <ArrowLeft size={14}/> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center
                            backdrop-blur-sm border border-white/30">
              <span className="font-bold text-lg">O</span>
            </div>
            <span className="font-bold text-2xl">Orbit</span>
          </div>
          <h1 className="font-serif italic text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Tasks in Motion.
          </h1>
          <p className="text-orange-100 text-base leading-relaxed max-w-sm">
            Your team's command center. Manage projects, track issues, and ship
            faster with AI-powered insights.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-col gap-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm
                                       rounded-xl px-4 py-3 border border-white/20">
              <Icon size={16} className="text-orange-200 shrink-0"/>
              <span className="text-sm text-orange-50">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 xl:px-16
                      py-10 bg-white dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-md mx-auto animate-slide-up">

          {/* Mobile logo + back */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orbit-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Orbit</span>
            </div>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400
                                     hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft size={12}/> Home
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to your workspace</p>

          {/* ── Email/password form ── */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-7">
            <div>
              <label className="label">Email</label>
              <input id="login-email" className="input" type="email"
                placeholder="you@company.com" value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input id="login-password" className="input pr-10"
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required/>
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" disabled={loading || !!demoLoading}
              className="btn-primary w-full btn-lg">
              {loading
                ? <><Loader2 size={18} className="animate-spin"/> Signing in…</>
                : 'Sign in'
              }
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="relative flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">or try a demo account</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
          </div>

          {/* ── One-click demo login cards ── */}
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map(({ role, email, icon: Icon, desc, color, ring, border, hoverBg, textColor }) => (
              <button
                key={role}
                id={`demo-${role.toLowerCase().replace(' ', '-')}`}
                type="button"
                onClick={() => loginAs(role, email)}
                disabled={!!demoLoading || loading}
                className={`group w-full flex items-center gap-4 p-4 rounded-2xl text-left
                            border ${border} bg-white dark:bg-white/2
                            ${hoverBg} hover:shadow-md transition-all duration-150
                            disabled:opacity-60 disabled:cursor-wait
                            focus-visible:ring-2 ${ring} outline-none`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-md`}>
                  {demoLoading === role
                    ? <Loader2 size={18} className="text-white animate-spin"/>
                    : <Icon size={18} className="text-white"/>
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${textColor} leading-tight`}>
                    {demoLoading === role ? 'Signing in…' : `Sign in as ${role}`}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{desc} · {email}</p>
                </div>

                {/* Arrow */}
                <ArrowRight size={16}
                  className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400
                             group-hover:translate-x-0.5 transition-all duration-150 shrink-0"/>
              </button>
            ))}
          </div>

          {/* Password hint */}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
            <CheckCircle size={11} className="text-emerald-500"/>
            All demo accounts use password:
            <code className="font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/8 px-1.5 py-0.5 rounded">
              orbit123
            </code>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
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
