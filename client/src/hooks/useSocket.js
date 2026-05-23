import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useProject } from '../context/ProjectContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export const useSocket = (projectId) => {
  const { syncIssueFromSocket } = useProject();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    // Reuse socket connection
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }

    socketRef.current = socketInstance;
    const socket = socketRef.current;

    socket.emit('join-project', projectId);

    // Real-time board events
    const events = ['issue:created', 'issue:moved', 'issue:updated', 'issue:deleted', 'issue:commented'];
    events.forEach((event) => {
      socket.on(event, (data) => syncIssueFromSocket(event, data));
    });

    return () => {
      socket.emit('leave-project', projectId);
      events.forEach((event) => socket.off(event));
    };
  }, [projectId, syncIssueFromSocket]);

  const emitDrag = useCallback((issueId, toStatus) => {
    socketRef.current?.emit('issue:drag', { projectId, issueId, toStatus });
  }, [projectId]);

  return { socket: socketRef.current, emitDrag };
};
