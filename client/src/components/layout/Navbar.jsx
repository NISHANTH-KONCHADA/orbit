import { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, Bell, Search, PanelLeftClose, PanelLeft } from 'lucide-react';

const Navbar = ({ darkMode, toggleDark, onToggleSidebar, sidebarCollapsed }) => {
  const { activeProject } = useProject();
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700
                       flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn-icon text-gray-500 hover:text-gray-900 dark:hover:text-white"
          title="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {activeProject && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">
              {activeProject.icon} {activeProject.name}
            </span>
            <span className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {activeProject.key}
            </span>
          </div>
        )}
      </div>

      {/* Right: search + notifications + dark mode */}
      <div className="flex items-center gap-2">
        {/* Search hint */}
        <button
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500
                     bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                     transition-colors border border-gray-200 dark:border-gray-700"
        >
          <Search size={14} />
          <span>Search issues...</span>
          <kbd className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1 rounded">⌘K</kbd>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="btn-icon text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          title={darkMode ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell */}
        <button className="btn-icon text-gray-500 dark:text-gray-400 relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orbit-500 rounded-full" />
        </button>

        {/* Sprint label */}
        {activeProject?.currentSprint && (
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-orbit-50 dark:bg-orbit-900/20 px-2 py-1 rounded-lg border border-orbit-200 dark:border-orbit-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orbit-500 animate-pulse" />
            {activeProject.currentSprint.name}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
