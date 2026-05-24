import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Kanban, Bot, Users, BarChart2, ArrowRight, Zap,
  CheckCircle, Sun, Moon, Layers, Target,
  MoveRight, Sparkles, GitBranch, Clock, ListTodo,
  Settings2, Bell, Search, Filter, Plus, MoreHorizontal,
  TrendingUp, AlertCircle, Circle, ArrowUpCircle,
  Loader2, Shield, Cpu, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─────────── DATA ─────────── */
const MARQUEE_ITEMS = [
  { icon: GitBranch, text: 'Sprint Planning'  },
  { icon: Zap,       text: 'AI-Powered'       },
  { icon: Kanban,    text: 'Kanban Boards'    },
  { icon: Clock,     text: 'Real-time Sync'   },
  { icon: Sparkles,  text: 'Gemini AI'        },
  { icon: BarChart2, text: 'Sprint Analytics' },
  { icon: Users,     text: 'Team Roles'       },
  { icon: Target,    text: 'Issue Tracking'   },
  { icon: Shield,    text: 'Role-based Access'},
  { icon: Cpu,       text: 'AI Generation'    },
];

const DEEP_FEATURES = [
  {
    tag: 'Issue Tracking',
    tagColor: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20',
    icon: ListTodo,
    iconColor: 'from-blue-500 to-blue-600',
    headline: 'Every issue.\nPerfectly tracked.',
    desc: 'Create bugs, features, and tasks with types, priorities, assignees, due dates, and custom labels. Filter by anything. Never lose context again.',
    bullets: ['Bug, Feature, Task & Story types', 'Critical / High / Medium / Low priority', 'Assignee & due date tracking', 'Custom labels & comments'],
    mockup: 'issues',
  },
  {
    tag: 'Kanban Board',
    tagColor: 'text-orbit-600 bg-orbit-50 dark:bg-orbit-500/10 border border-orbit-200 dark:border-orbit-500/20',
    icon: Kanban,
    iconColor: 'from-orbit-500 to-orange-500',
    headline: 'Visualise your\nentire sprint.',
    desc: 'Drag and drop issues across Backlog, In Progress, Review, and Done. See your whole sprint at a glance and unblock your team in seconds.',
    bullets: ['5 customisable columns', 'Smooth drag-and-drop', 'Real-time progress bar', 'Sprint velocity tracking'],
    mockup: 'board',
  },
  {
    tag: 'AI Generation',
    tagColor: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20',
    icon: Bot,
    iconColor: 'from-violet-500 to-purple-600',
    headline: 'AI that\nactually helps.',
    desc: 'Generate a full sprint\'s worth of tasks from a single prompt. Get AI-written sprint summaries and breakdowns powered by Gemini 1.5 Flash.',
    bullets: ['Generate sprint tasks from prompt', 'AI sprint summary reports', 'Contextual sub-issue breakdown', 'Gemini 1.5 Flash powered'],
    mockup: 'ai',
  },
  {
    tag: 'Team & Roles',
    tagColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20',
    icon: Users,
    iconColor: 'from-emerald-500 to-teal-600',
    headline: 'Right person,\nright access.',
    desc: 'Three built-in roles — Admin, Project Manager, Developer — each with precisely scoped permissions. Manage your whole team from one place.',
    bullets: ['Admin: full control', 'Project Manager: sprint & project ops', 'Developer: issue-level work', 'Avatar colours & profiles'],
    mockup: 'team',
  },
];

const KANBAN_COLS = [
  { label: 'Backlog',     dot: 'bg-slate-400',   pill: 'bg-slate-100 dark:bg-slate-400/15 text-slate-600 dark:text-slate-400',
    cards: [
      { title: 'Set up CI/CD pipeline',       type: 'Task',    pri: 'high',   priColor: 'text-red-500'    },
      { title: 'Write API documentation',     type: 'Task',    pri: 'low',    priColor: 'text-blue-500'   },
      { title: 'Auth token refresh logic',    type: 'Bug',     pri: 'medium', priColor: 'text-amber-500'  },
    ]},
  { label: 'In Progress', dot: 'bg-orbit-500',   pill: 'bg-orbit-50 dark:bg-orbit-500/15 text-orbit-600 dark:text-orbit-400',
    cards: [
      { title: 'Dashboard redesign',          type: 'Feature', pri: 'high',   priColor: 'text-red-500'    },
      { title: 'Kanban drag & drop',          type: 'Feature', pri: 'medium', priColor: 'text-amber-500'  },
    ]},
  { label: 'Review',      dot: 'bg-violet-500',  pill: 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400',
    cards: [
      { title: 'Sprint report generator',     type: 'Feature', pri: 'low',    priColor: 'text-blue-500'   },
      { title: 'User onboarding flow',        type: 'Task',    pri: 'medium', priColor: 'text-amber-500'  },
    ]},
  { label: 'Done',        dot: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    cards: [
      { title: 'JWT authentication',          type: 'Feature', pri: 'done',   priColor: 'text-emerald-500'},
      { title: 'Database schema design',      type: 'Task',    pri: 'done',   priColor: 'text-emerald-500'},
      { title: 'REST API endpoints',          type: 'Feature', pri: 'done',   priColor: 'text-emerald-500'},
    ]},
];

const ISSUES_MOCK = [
  { id: 'ORB-42', title: 'Fix auth token expiry on mobile',   type: 'Bug',     pri: 'critical', status: 'In Progress', assignee: 'AS' },
  { id: 'ORB-41', title: 'Implement dark mode toggle',        type: 'Feature', pri: 'high',     status: 'Review',      assignee: 'PK' },
  { id: 'ORB-40', title: 'AI sprint summary endpoint',        type: 'Feature', pri: 'high',     status: 'Done',        assignee: 'AS' },
  { id: 'ORB-39', title: 'Write unit tests for API layer',    type: 'Task',    pri: 'medium',   status: 'Backlog',     assignee: 'RJ' },
  { id: 'ORB-38', title: 'Add drag-and-drop to kanban',      type: 'Feature', pri: 'medium',   status: 'In Progress', assignee: 'RJ' },
];

const AI_TASKS = [
  'Set up project repository and CI/CD pipeline',
  'Design database schema for user authentication',
  'Implement JWT token refresh mechanism',
  'Build RESTful API endpoints for issues',
  'Create drag-and-drop Kanban board UI',
  'Integrate Gemini AI for task generation',
  'Write comprehensive unit test suite',
  'Deploy application to production environment',
];

const TEAM_MEMBERS = [
  { name: 'Aditya S.',  role: 'Admin',           color: 'bg-orbit-500',   issues: 12, done: 8  },
  { name: 'Priya K.',   role: 'Project Manager', color: 'bg-violet-500',  issues: 9,  done: 6  },
  { name: 'Rajan J.',   role: 'Developer',       color: 'bg-emerald-500', issues: 15, done: 11 },
  { name: 'Meera T.',   role: 'Developer',       color: 'bg-blue-500',    issues: 7,  done: 5  },
];

/* ─────────── SUB-COMPONENTS ─────────── */
const BoardMockup = () => (
  <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-gray-900 p-4 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-colors duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Target size={12}/> <span className="font-medium">Sprint 4 — Alpha</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-orbit-600 dark:text-orbit-400 bg-orbit-50 dark:bg-orbit-500/10 border border-orbit-200 dark:border-orbit-500/20 rounded-lg px-2.5 py-1">
        <Sparkles size={10}/> AI Summary
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2.5">
      {KANBAN_COLS.map(({ label, dot, pill, cards }) => (
        <div key={label} className="space-y-2">
          <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold ${pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>
            {label}
            <span className="ml-auto opacity-50">{cards.length}</span>
          </div>
          {cards.map(c => (
            <div key={c.title} className="rounded-xl border border-gray-200 dark:border-white/6 bg-white dark:bg-white/4 p-2 transition-colors">
              <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 leading-tight mb-1.5">{c.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-[8px] bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">{c.type}</span>
                <span className={`text-[8px] font-bold uppercase ${c.priColor}`}>{c.pri}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const IssuesMockup = () => (
  <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden transition-colors duration-300">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/6">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <ListTodo size={12}/><span className="font-semibold text-gray-700 dark:text-gray-300">Issues</span>
        <span className="bg-gray-100 dark:bg-white/8 px-2 py-0.5 rounded-full font-medium">{ISSUES_MOCK.length}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-lg px-2 py-1">
          <Filter size={9}/> Filter
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white bg-orbit-500 rounded-lg px-2 py-1">
          <Plus size={9}/> New
        </div>
      </div>
    </div>
    <div className="divide-y divide-gray-50 dark:divide-white/4">
      {ISSUES_MOCK.map(issue => (
        <div key={issue.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/70 dark:hover:bg-white/3 transition-colors">
          <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600 w-10 shrink-0">{issue.id}</span>
          <p className="text-[11px] text-gray-700 dark:text-gray-300 flex-1 truncate">{issue.title}</p>
          <span className="text-[8px] bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium shrink-0">{issue.type}</span>
          <span className={`text-[8px] font-bold uppercase shrink-0 ${
            issue.pri === 'critical' ? 'text-red-500' :
            issue.pri === 'high'     ? 'text-orange-500' :
            issue.pri === 'medium'   ? 'text-amber-500' :
            issue.pri === 'done'     ? 'text-emerald-500' : 'text-blue-500'
          }`}>{issue.pri}</span>
          <div className="w-5 h-5 rounded-full bg-orbit-400 flex items-center justify-center text-[7px] font-bold text-white shrink-0">{issue.assignee}</div>
        </div>
      ))}
    </div>
  </div>
);

const AIMockup = () => {
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setVisibleCount(n => n < AI_TASKS.length ? n + 1 : 3), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-white dark:bg-gray-900 shadow-xl shadow-violet-100/50 dark:shadow-violet-900/20 overflow-hidden transition-colors duration-300">
      <div className="px-4 py-3 border-b border-violet-100 dark:border-violet-500/15 bg-violet-50/50 dark:bg-violet-500/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={12} className="text-white"/>
          </div>
          <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">AI Task Generator</span>
          <span className="ml-auto text-[9px] bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-500/20">Gemini 1.5 Flash</span>
        </div>
        <div className="mt-2.5 bg-white dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-3 py-2 text-[10px] text-gray-500 dark:text-gray-400 italic">
          "Build a project management web app with authentication, kanban board, and AI features..."
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {AI_TASKS.slice(0, visibleCount).map((task, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 animate-fade-in">
            <CheckCircle size={12} className="text-violet-500 shrink-0 mt-0.5"/>
            <p className="text-[10px] text-gray-700 dark:text-gray-300">{task}</p>
          </div>
        ))}
        {visibleCount < AI_TASKS.length && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-violet-500">
            <Loader2 size={10} className="animate-spin"/> Generating more tasks...
          </div>
        )}
      </div>
    </div>
  );
};

const TeamMockup = () => (
  <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden transition-colors duration-300">
    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <Users size={12}/> Team Members
      </div>
      <span className="text-[10px] text-gray-400">{TEAM_MEMBERS.length} members</span>
    </div>
    <div className="divide-y divide-gray-50 dark:divide-white/4">
      {TEAM_MEMBERS.map(m => (
        <div key={m.name} className="flex items-center gap-3 px-4 py-3">
          <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
            {m.name.split(' ').map(w => w[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{m.name}</p>
            <p className="text-[10px] text-gray-400">{m.role}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{m.done}/{m.issues}</p>
            <p className="text-[10px] text-gray-400">issues done</p>
          </div>
          <div className="w-16 bg-gray-100 dark:bg-white/8 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full ${m.color} rounded-full`} style={{ width: `${Math.round(m.done/m.issues*100)}%` }}/>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MOCKUP_MAP = { board: <BoardMockup/>, issues: <IssuesMockup/>, ai: <AIMockup/>, team: <TeamMockup/> };

/* ─────────── MAIN COMPONENT ─────────── */
const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('orbit_dark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [demoLoading, setDemoLoading] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('orbit_dark', String(dark));
  }, [dark]);

  // Auto-cycle feature tabs
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(n => (n + 1) % DEEP_FEATURES.length), 5000);
    return () => clearInterval(id);
  }, []);

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

  const feat = DEEP_FEATURES[activeFeature];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white
                    flex flex-col overflow-x-hidden transition-colors duration-300">

      {/* ══════════════ NAV ══════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50
                      bg-white/85 dark:bg-gray-950/90 backdrop-blur-xl
                      border-b border-gray-200/70 dark:border-white/6
                      flex items-center justify-between px-5 sm:px-10 py-3.5
                      transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orbit-500 to-orbit-600
                          flex items-center justify-center shadow-md shadow-orbit-500/40">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Orbit</span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How it works</a>
          <a href="#demo" className="hover:text-gray-900 dark:hover:text-white transition-colors">Try demo</a>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setDark(d => !d)} aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       text-gray-500 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-white/8
                       border border-gray-200 dark:border-white/10
                       transition-all duration-200 hover:scale-105 active:scale-95">
            {dark ? <Sun size={16} className="text-amber-400"/> : <Moon size={16}/>}
          </button>
          <Link to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white
                       bg-orbit-500 hover:bg-orbit-600 px-5 py-2.5 rounded-xl
                       transition-all shadow-md shadow-orbit-500/30 hover:-translate-y-px">
            Sign in <ArrowRight size={14}/>
          </Link>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative flex flex-col items-center justify-center text-center
                          px-6 pt-36 pb-20 min-h-screen overflow-hidden">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4
                          w-[900px] h-[600px] rounded-full blur-3xl opacity-60
                          bg-orbit-500/8 dark:bg-orbit-500/14"/>
          <div className="absolute top-1/3 left-[10%] w-[500px] h-[500px] rounded-full blur-3xl
                          bg-violet-500/4 dark:bg-violet-500/8"/>
          <div className="absolute top-1/3 right-[8%] w-[450px] h-[450px] rounded-full blur-3xl
                          bg-amber-400/4 dark:bg-amber-400/7"/>
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        bg-orbit-50 dark:bg-orbit-500/10
                        border border-orbit-200 dark:border-orbit-500/25
                        text-orbit-600 dark:text-orbit-400
                        text-xs font-semibold mb-7 animate-fade-in tracking-wide uppercase">
          <Sparkles size={11}/> Powered by Gemini AI
        </div>

        {/* Headline */}
        <h1 className="relative font-serif italic font-bold
                       text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem]
                       leading-[1.02] tracking-tight text-gray-900 dark:text-white
                       max-w-5xl mx-auto animate-slide-up mb-5">
          Where teams{' '}
          <span className="bg-gradient-to-r from-orbit-500 via-orange-400 to-amber-400
                           bg-clip-text text-transparent">
            move
          </span>
          <br className="hidden sm:block"/>
          with purpose.
        </h1>

        <p className="relative text-base sm:text-xl text-gray-500 dark:text-gray-400
                      max-w-xl mx-auto leading-relaxed animate-slide-up mb-10">
          Orbit is your team's command center — issue tracking, kanban sprints, and
          AI generation unified in one beautiful workspace.
        </p>

        {/* CTA */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 animate-slide-up mb-6">
          <Link to="/login"
            className="group inline-flex items-center gap-2.5
                       bg-orbit-500 hover:bg-orbit-600 text-white font-semibold text-base
                       px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orbit-500/35
                       hover:shadow-orbit-500/55 hover:-translate-y-1">
            Sign in to workspace
            <MoveRight size={18} className="transition-transform group-hover:translate-x-1"/>
          </Link>
          <a href="#demo"
            className="inline-flex items-center gap-2 text-sm font-medium
                       text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                       border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20
                       px-6 py-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-white/5">
            Try demo instantly
          </a>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Demo accounts available — no sign-up required
        </p>

        {/* Trust */}
        <div className="relative flex items-center gap-5 mt-8 flex-wrap justify-center">
          {[
            { icon: CheckCircle, text: 'Free to use' },
            { icon: CheckCircle, text: 'No credit card' },
            { icon: CheckCircle, text: 'AI included' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Icon size={13} className="text-emerald-500"/> {text}
            </div>
          ))}
        </div>

        {/* Hero Kanban preview */}
        <div className="relative mt-16 w-full max-w-5xl mx-auto">
          <div className="landing-preview-card">
            <BoardMockup/>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-28 rounded-b-2xl
                          bg-gradient-to-t from-white dark:from-gray-950 to-transparent
                          pointer-events-none transition-colors duration-300"/>
        </div>
      </section>

      {/* ══════════════ MARQUEE ══════════════ */}
      <div className="border-y border-gray-100 dark:border-white/6
                      bg-gray-50/80 dark:bg-white/2
                      overflow-hidden py-4 transition-colors duration-300">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0 px-8
                                    text-sm font-medium text-gray-400 dark:text-gray-600">
              <Icon size={14} className="text-orbit-400 dark:text-orbit-600 shrink-0"/>
              {text}
              <span className="ml-8 w-px h-3 bg-gray-200 dark:bg-white/10"/>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ DEEP FEATURE SHOWCASE ══════════════ */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orbit-500 dark:text-orbit-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Everything you need
            </p>
            <h2 className="font-serif italic font-bold text-4xl sm:text-5xl
                           text-gray-900 dark:text-white leading-tight">
              Built for{' '}
              <span className="bg-gradient-to-r from-orbit-500 to-amber-400 bg-clip-text text-transparent">
                modern teams.
              </span>
            </h2>
          </div>

          {/* Tab selectors */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {DEEP_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <button key={f.tag} onClick={() => setActiveFeature(i)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                              transition-all duration-200 border
                              ${activeFeature === i
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                                : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}>
                  <Icon size={13}/>
                  {f.tag}
                </button>
              );
            })}
          </div>

          {/* Feature panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left text */}
            <div className="animate-fade-in" key={feat.tag}>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 ${feat.tagColor}`}>
                <feat.icon size={11}/> {feat.tag}
              </span>
              <h3 className="font-serif italic font-bold text-4xl sm:text-5xl
                             text-gray-900 dark:text-white leading-[1.1] mb-5 whitespace-pre-line">
                {feat.headline}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-7">
                {feat.desc}
              </p>
              <ul className="space-y-3">
                {feat.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5"/>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right mockup */}
            <div className="animate-fade-in" key={feat.tag + '-mockup'}>
              {MOCKUP_MAP[feat.mockup]}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section id="how-it-works"
        className="py-24 px-6 bg-gray-50/70 dark:bg-white/2
                   border-y border-gray-100 dark:border-white/6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-orbit-500 dark:text-orbit-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            How it works
          </p>
          <h2 className="font-serif italic font-bold text-4xl sm:text-5xl
                         text-gray-900 dark:text-white leading-tight">
            Up and running{' '}
            <span className="bg-gradient-to-r from-orbit-500 to-amber-400 bg-clip-text text-transparent">
              in minutes.
            </span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orbit-300 dark:via-orbit-700 to-transparent"/>

          {[
            { n: '01', icon: Plus, title: 'Create a project', desc: 'Give your project a name, pick an icon, and set up your first sprint in seconds.' },
            { n: '02', icon: Bot,  title: 'Generate with AI',  desc: 'Describe your goal and let Gemini AI generate a full backlog of issues for you.' },
            { n: '03', icon: TrendingUp, title: 'Track & ship', desc: 'Move issues across the kanban, review analytics, and ship with confidence.' },
          ].map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800
                                border border-gray-200 dark:border-white/10
                                shadow-lg shadow-gray-200/60 dark:shadow-black/30
                                flex items-center justify-center">
                  <Icon size={28} className="text-orbit-500"/>
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                                  bg-orbit-500 text-white text-[10px] font-bold
                                  flex items-center justify-center shadow-md shadow-orbit-500/30">
                  {n.slice(1)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURE GRID ══════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif italic font-bold text-4xl sm:text-5xl
                           text-gray-900 dark:text-white leading-tight">
              All the tools your{' '}
              <span className="bg-gradient-to-r from-orbit-500 to-amber-400 bg-clip-text text-transparent">
                team needs.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: ListTodo,   color: 'text-blue-500   bg-blue-50   dark:bg-blue-500/10',   title: 'Issue Tracking',     desc: 'Bug, Feature, Task & Story'       },
              { icon: Kanban,     color: 'text-orbit-500  bg-orbit-50  dark:bg-orbit-500/10',  title: 'Kanban Board',       desc: '5 columns, drag & drop'           },
              { icon: Bot,        color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10', title: 'AI Generation',      desc: 'Gemini-powered tasks'             },
              { icon: BarChart2,  color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', title: 'Sprint Analytics', desc: 'Pie & bar charts'                },
              { icon: Users,      color: 'text-pink-500   bg-pink-50   dark:bg-pink-500/10',   title: 'Team Roles',         desc: 'Admin, PM, Developer'             },
              { icon: Target,     color: 'text-amber-500  bg-amber-50  dark:bg-amber-500/10',  title: 'Sprint Planning',    desc: 'Sprint goals & milestones'        },
              { icon: Activity,   color: 'text-cyan-500   bg-cyan-50   dark:bg-cyan-500/10',   title: 'Activity Feed',      desc: 'Real-time team audit log'         },
              { icon: Bell,       color: 'text-red-500    bg-red-50    dark:bg-red-500/10',    title: 'Notifications',      desc: 'Stay on top of changes'           },
              { icon: Settings2,  color: 'text-gray-500   bg-gray-100  dark:bg-white/5',       title: 'Project Settings',   desc: 'Sprints, members & config'        },
              { icon: Filter,     color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10', title: 'Advanced Filters',   desc: 'Filter by any attribute'          },
              { icon: Search,     color: 'text-teal-500   bg-teal-50   dark:bg-teal-500/10',   title: 'Global Search',      desc: 'Find anything instantly'          },
              { icon: Shield,     color: 'text-slate-500  bg-slate-100 dark:bg-white/5',       title: 'Access Control',     desc: 'Role-scoped permissions'          },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title}
                className="group rounded-2xl p-5
                           border border-gray-100 dark:border-white/6
                           bg-white dark:bg-white/2
                           hover:bg-gray-50 dark:hover:bg-white/5
                           hover:border-gray-200 dark:hover:border-white/12
                           hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-black/30
                           transition-all duration-200 hover:-translate-y-0.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={17}/>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-xs mb-1">{title}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-white/2
                          border-y border-gray-100 dark:border-white/6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '5',  label: 'Kanban columns'  },
            { value: '3',  label: 'Role types'       },
            { value: '∞',  label: 'Issues & tasks'  },
            { value: 'AI', label: 'Powered insights' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-serif italic font-bold text-4xl sm:text-5xl
                            text-gray-900 dark:text-white mb-1.5">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ ONE-CLICK DEMO LOGIN ══════════════ */}
      <section id="demo" className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-orbit-500 dark:text-orbit-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Try it now
          </p>
          <h2 className="font-serif italic font-bold text-4xl sm:text-5xl
                         text-gray-900 dark:text-white leading-tight mb-4">
            One click.{' '}
            <span className="bg-gradient-to-r from-orbit-500 to-amber-400 bg-clip-text text-transparent">
              You&apos;re in.
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            Choose a role and jump straight into the app with live demo data.
            No sign-up, no credit card.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              role: 'Admin',
              email: 'admin@orbit.dev',
              icon: Shield,
              color: 'from-orbit-500 to-orange-500',
              glow: 'shadow-orbit-500/30',
              border: 'border-orbit-200 dark:border-orbit-500/30',
              bg: 'hover:bg-orbit-50/50 dark:hover:bg-orbit-500/5',
              perms: ['Full project control', 'Manage all users', 'All settings access'],
            },
            {
              role: 'Project Manager',
              email: 'pm@orbit.dev',
              icon: Target,
              color: 'from-violet-500 to-purple-600',
              glow: 'shadow-violet-500/30',
              border: 'border-violet-200 dark:border-violet-500/30',
              bg: 'hover:bg-violet-50/50 dark:hover:bg-violet-500/5',
              perms: ['Sprint management', 'Assign & prioritise', 'View analytics'],
            },
            {
              role: 'Developer',
              email: 'dev@orbit.dev',
              icon: GitBranch,
              color: 'from-emerald-500 to-teal-600',
              glow: 'shadow-emerald-500/30',
              border: 'border-emerald-200 dark:border-emerald-500/30',
              bg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5',
              perms: ['Update own issues', 'Kanban board', 'Comment & track'],
            },
          ].map(({ role, email, icon: Icon, color, glow, border, bg, perms }) => (
            <button
              key={role}
              onClick={() => loginAs(role, email)}
              disabled={!!demoLoading}
              className={`group relative flex flex-col items-start gap-4 p-6 rounded-2xl
                          border ${border} ${bg}
                          bg-white dark:bg-white/2
                          hover:shadow-xl ${glow}
                          transition-all duration-200 hover:-translate-y-1
                          disabled:opacity-60 disabled:cursor-wait text-left w-full`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center
                              shadow-lg ${glow}`}>
                {demoLoading === role
                  ? <Loader2 size={20} className="text-white animate-spin"/>
                  : <Icon size={20} className="text-white"/>
                }
              </div>

              {/* Text */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{role}</p>
                  {demoLoading === role && (
                    <span className="text-[9px] bg-orbit-100 dark:bg-orbit-500/15 text-orbit-600 dark:text-orbit-400
                                     px-2 py-0.5 rounded-full font-medium">Signing in…</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-mono mb-3">{email}</p>
                <ul className="space-y-1">
                  {perms.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle size={11} className="text-emerald-500 shrink-0"/>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover arrow */}
              <div className={`absolute bottom-5 right-5 w-7 h-7 rounded-full bg-gradient-to-br ${color}
                              flex items-center justify-center opacity-0 group-hover:opacity-100
                              transition-all duration-200 -translate-y-1 group-hover:translate-y-0 shadow-md ${glow}`}>
                <ArrowRight size={12} className="text-white"/>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Password for all accounts: <span className="font-mono text-gray-600 dark:text-gray-400">orbit123</span>
        </p>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden
                          border border-orbit-200 dark:border-orbit-500/20
                          bg-gradient-to-br from-orbit-50 via-white to-amber-50/30
                          dark:from-orbit-500/10 dark:via-gray-900 dark:to-amber-500/5
                          p-12 sm:p-16 text-center transition-colors duration-300">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2
                              w-[600px] h-[300px] rounded-full blur-3xl
                              bg-orbit-400/10 dark:bg-orbit-500/15"/>
            </div>
            <div className="relative">
              <h2 className="font-serif italic font-bold
                             text-4xl sm:text-5xl lg:text-6xl
                             text-gray-900 dark:text-white leading-tight mb-5">
                Ship faster,<br/>
                <span className="bg-gradient-to-r from-orbit-500 to-amber-400 bg-clip-text text-transparent">
                  together.
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Join with your team or try the demo right now.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register"
                  className="group inline-flex items-center gap-2.5
                             bg-orbit-500 hover:bg-orbit-600 text-white font-semibold text-base
                             px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orbit-500/30
                             hover:-translate-y-0.5">
                  Create workspace <MoveRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
                <a href="#demo"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                             border border-gray-200 dark:border-white/10 px-6 py-4 rounded-2xl
                             transition-all hover:bg-gray-50 dark:hover:bg-white/5">
                  Try demo instead
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-gray-950
                         py-8 px-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orbit-500 to-orbit-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="text-sm font-semibold text-gray-400">Orbit</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300 dark:text-gray-700">
            <Layers size={11}/> Tasks in Motion — built with care
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <a href="#features" className="hover:text-orbit-500 transition-colors">Features</a>
            <a href="#demo"     className="hover:text-orbit-500 transition-colors">Demo</a>
            <Link to="/login"   className="hover:text-orbit-500 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
