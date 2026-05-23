import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChatBot from '../ai/AIChatBot';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('orbit_dark') === 'true';
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('orbit_dark', String(darkMode));
  }, [darkMode]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          darkMode={darkMode}
          toggleDark={() => setDarkMode((d) => !d)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Floating Chatbot */}
      <AIChatBot />
    </div>
  );
};

export default AppLayout;
