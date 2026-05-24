import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Kanban, ListTodo, Settings, LogOut,
  Plus, ChevronDown, ChevronRight, Loader2, FolderOpen, Folder
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import Avatar from '../ui/Avatar';
import CreateProjectModal from '../project/CreateProjectModal';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/board',     icon: Kanban,          label: 'Board'     },
  { to: '/issues',    icon: ListTodo,         label: 'Issues'    },
  { to: '/settings',  icon: Settings,         label: 'Settings'  },
];

const Sidebar = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const { projects, activeProject, setActiveProject, loadingProjects } = useProject();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const navigate = useNavigate();

  const handleSelectProject = (project) => {
    setActiveProject(project);
    navigate('/board');
  };

  return (
    <>
      <aside
        className={`
          flex flex-col h-screen bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 shrink-0
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orbit-500 to-orbit-600 flex items-center justify-center shrink-0 shadow-orbit">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base leading-tight">Orbit</span>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Tasks in Motion</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}

          {/* Projects section */}
          {!collapsed && (
            <div className="pt-4">
              <button
                onClick={() => setProjectsOpen((o) => !o)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <FolderOpen size={12} /> Projects
                </span>
                {projectsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {projectsOpen && (
                <div className="mt-1 space-y-0.5 animate-fade-in">
                  {loadingProjects ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      {projects.map((project) => (
                        <button
                          key={project._id}
                          onClick={() => handleSelectProject(project)}
                          className={`
                            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                            transition-all duration-150 text-left
                            ${activeProject?._id === project._id
                              ? 'bg-orbit-100 dark:bg-orbit-900/30 text-orbit-700 dark:text-orbit-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <span className="shrink-0 flex items-center justify-center w-5 h-5">
                            {project.icon
                              ? <span className="text-base leading-none">{project.icon}</span>
                              : <Folder size={15} className="text-gray-400" />
                            }
                          </span>
                          <span className="truncate">{project.name}</span>
                          <span className="ml-auto text-[10px] font-mono text-gray-400">{project.key}</span>
                        </button>
                      ))}

                      <button
                        onClick={() => setShowCreateProject(true)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                   text-gray-400 dark:text-gray-500 hover:text-orbit-600 hover:bg-orbit-50
                                   dark:hover:bg-orbit-900/20 transition-all duration-150"
                      >
                        <Plus size={14} />
                        <span>New Project</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="btn-icon text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <CreateProjectModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} />
    </>
  );
};

export default Sidebar;
