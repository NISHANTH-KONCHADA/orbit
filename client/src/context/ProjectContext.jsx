import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // Load projects when user logs in
  useEffect(() => {
    if (user) fetchProjects();
    else { setProjects([]); setActiveProject(null); setIssues([]); }
  }, [user]);

  // Load issues when active project changes
  useEffect(() => {
    if (activeProject?._id) fetchIssues(activeProject._id);
    else setIssues([]);
  }, [activeProject?._id]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
      // Auto-select first project
      if (res.data.projects.length > 0 && !activeProject) {
        setActiveProject(res.data.projects[0]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchIssues = useCallback(async (projectId) => {
    setLoadingIssues(true);
    try {
      const res = await api.get(`/issues?project=${projectId}`);
      setIssues(res.data.issues);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoadingIssues(false);
    }
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await api.post('/projects', data);
    const project = res.data.project;
    setProjects((prev) => [project, ...prev]);
    setActiveProject(project);
    toast.success(`Project "${project.name}" created!`);
    return project;
  }, []);

  const createIssue = useCallback(async (data) => {
    const res = await api.post('/issues', { ...data, project: activeProject._id });
    const issue = res.data.issue;
    setIssues((prev) => [...prev, issue]);
    return issue;
  }, [activeProject]);

  const updateIssue = useCallback(async (id, data) => {
    const res = await api.put(`/issues/${id}`, data);
    const updated = res.data.issue;
    setIssues((prev) => prev.map((i) => (i._id === id ? updated : i)));
    return updated;
  }, []);

  const moveIssue = useCallback(async (id, status, position) => {
    // Optimistic update
    setIssues((prev) =>
      prev.map((i) => (i._id === id ? { ...i, status, position } : i))
    );
    try {
      await api.patch(`/issues/${id}/move`, { status, position });
    } catch (err) {
      toast.error('Failed to move issue');
      // Revert
      if (activeProject) fetchIssues(activeProject._id);
    }
  }, [activeProject, fetchIssues]);

  const deleteIssue = useCallback(async (id) => {
    await api.delete(`/issues/${id}`);
    setIssues((prev) => prev.filter((i) => i._id !== id));
    toast.success('Issue deleted');
  }, []);

  // Called by Socket.io to sync real-time updates
  const syncIssueFromSocket = useCallback((event, data) => {
    if (event === 'issue:created') {
      setIssues((prev) => {
        if (prev.find((i) => i._id === data._id)) return prev;
        return [...prev, data];
      });
    } else if (event === 'issue:moved' || event === 'issue:updated') {
      setIssues((prev) => prev.map((i) => (i._id === data._id ? data : i)));
    } else if (event === 'issue:deleted') {
      setIssues((prev) => prev.filter((i) => i._id !== data.issueId));
    }
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        issues,
        loadingProjects,
        loadingIssues,
        fetchProjects,
        fetchIssues,
        createProject,
        createIssue,
        updateIssue,
        moveIssue,
        deleteIssue,
        syncIssueFromSocket,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};

export default ProjectContext;
