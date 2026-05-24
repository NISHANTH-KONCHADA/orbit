import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Issues from './pages/Issues';
import Settings from './pages/Settings';

// ── Keep-alive: ping backend every 10 min so Render free tier never sleeps ──
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const ping = () => {
  if (import.meta.env.PROD) {
    fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/health`)
      .catch(() => {}); // silent — we don't care about the response
  }
};


function App() {
  // Ping every 10 min in production to keep Render free instance warm
  useEffect(() => {
    ping(); // ping immediately on load
    const id = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#F97316', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Public auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected app layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/board" element={<Board />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
