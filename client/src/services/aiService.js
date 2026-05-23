import api from './api';

export const aiService = {
  generateTask: (title, projectId) =>
    api.post('/ai/generate-task', { title, projectId }).then((r) => r.data),

  chat: (message, projectId, history = []) =>
    api.post('/ai/chat', { message, projectId, history }).then((r) => r.data),

  sprintSummary: (projectId) =>
    api.post('/ai/sprint-summary', { projectId }).then((r) => r.data),

  autoLabel: (description) =>
    api.post('/ai/auto-label', { description }).then((r) => r.data),
};
