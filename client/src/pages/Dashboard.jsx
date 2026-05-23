import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import { actionLabel, timeAgo, statusToPercent } from '../utils/helpers';
import { PRIORITY, ISSUE_TYPE } from '../utils/constants';
import Avatar from '../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import api from '../services/api';
import {
  Loader2, Sparkles, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  BarChart3, Activity, Zap, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const STATUS_COLORS = {
  backlog: '#9CA3AF', todo: '#60A5FA', 'in-progress': '#F97316', review: '#A78BFA', done: '#34D399',
};
const PRIORITY_COLORS = { low: '#60A5FA', medium: '#FBBF24', high: '#F97316', critical: '#EF4444' };

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { issues, activeProject, loadingIssues } = useProject();
  const [activities, setActivities] = useState([]);
  const [sprintSummary, setSprintSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!activeProject?._id) return;
    api.get(`/projects/${activeProject._id}/activity`)
      .then((r) => setActivities(r.data.activities))
      .catch(() => {});
  }, [activeProject?._id]);

  const stats = {
    total: issues.length,
    done: issues.filter((i) => i.status === 'done').length,
    inProgress: issues.filter((i) => i.status === 'in-progress').length,
    critical: issues.filter((i) => i.priority === 'critical').length,
    progress: statusToPercent(issues),
  };

  // Donut chart data
  const statusData = Object.entries(
    issues.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Priority bar chart data
  const priorityData = ['low', 'medium', 'high', 'critical'].map((p) => ({
    name: PRIORITY[p].label,
    count: issues.filter((i) => i.priority === p).length,
    fill: PRIORITY_COLORS[p],
  }));

  const generateSprintSummary = async () => {
    if (!activeProject?._id) { toast.error('Select a project first'); return; }
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const res = await aiService.sprintSummary(activeProject._id);
      setSprintSummary(res.summary);
    } catch (err) {
      toast.error(err.message);
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <BarChart3 size={48} className="text-gray-300" />
        <p className="text-lg font-medium">No project selected</p>
        <p className="text-sm">Create or select a project from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeProject.icon} Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {activeProject.name} · {activeProject.currentSprint?.name}
          </p>
        </div>

        <button
          onClick={generateSprintSummary}
          disabled={summaryLoading}
          className="btn-primary gap-2"
        >
          {summaryLoading
            ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
            : <><Sparkles size={15} /> AI Sprint Summary</>
          }
        </button>
      </div>

      {/* AI Sprint Summary Panel */}
      {showSummary && (
        <div className="card p-5 border-l-4 border-orbit-500 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orbit-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">AI Sprint Summary</span>
              <span className="badge badge-purple text-[10px]">Gemini 1.5 Flash</span>
            </div>
            <button onClick={() => setShowSummary(false)} className="btn-icon w-6 h-6 text-gray-400">
              <X size={14} />
            </button>
          </div>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Analyzing sprint data…</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown>{sprintSummary}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Issues" value={stats.total} icon={BarChart3} color="bg-blue-500" />
        <StatCard label="Done" value={stats.done} icon={CheckCircle2} color="bg-emerald-500"
          sub={`${stats.progress}% complete`} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="bg-orbit-500" />
        <StatCard label="Critical" value={stats.critical} icon={AlertTriangle} color="bg-red-500"
          sub="Needs attention" />
      </div>

      {/* Sprint progress bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-orbit-500" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Sprint Progress</span>
          </div>
          <span className="text-sm font-bold text-orbit-600">{stats.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orbit-500 to-orbit-400 rounded-full transition-all duration-700"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{stats.done} done</span>
          <span>{stats.total - stats.done} remaining</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Issues by Status</h3>
          {statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No issues yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{d.name.replace('-', ' ')}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Priority bar chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Issues by Priority</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity feed */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-orbit-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Activity</h3>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act._id} className="flex items-start gap-3 animate-fade-in">
                <Avatar name={act.user?.name} color={act.user?.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{act.user?.name}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">{actionLabel(act.action, act.meta)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(act.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
