/**
 * Socket.io handler — manages real-time project rooms and board events
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join a project room ────────────────────────────────────────────────
    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    // ── Leave a project room ───────────────────────────────────────────────
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // ── Client-side drag events (optimistic UI) ───────────────────────────
    // Broadcast to all OTHER clients in the room immediately
    socket.on('issue:drag', ({ projectId, issueId, toStatus }) => {
      socket.to(`project:${projectId}`).emit('issue:drag', { issueId, toStatus });
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
