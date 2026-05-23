const asyncHandler = require('express-async-handler');
const Issue = require('../models/Issue');
const Activity = require('../models/Activity');

// ── Helper: log activity ──────────────────────────────────────────────────────
const logActivity = async (userId, projectId, action, issueId = null, meta = {}) => {
  try {
    await Activity.create({ user: userId, project: projectId, action, issue: issueId, meta });
  } catch (_) { /* non-critical */ }
};

// ── @GET /api/issues?project=:id ─────────────────────────────────────────────
const getIssues = asyncHandler(async (req, res) => {
  const { project, status, priority, type, assignee } = req.query;
  const filter = {};
  if (project)  filter.project  = project;
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  if (type)     filter.type     = type;
  if (assignee) filter.assignee = assignee;

  const issues = await Issue.find(filter)
    .populate('assignee', 'name avatarColor email')
    .populate('reporter', 'name avatarColor email')
    .sort({ status: 1, position: 1, createdAt: -1 });

  res.json({ success: true, issues });
});

// ── @POST /api/issues ─────────────────────────────────────────────────────────
const createIssue = asyncHandler(async (req, res) => {
  const {
    title, description, acceptanceCriteria, type, priority,
    status, project, assignee, labels, dueDate, position,
    estimatedHours, aiGenerated,
  } = req.body;

  const issue = await Issue.create({
    title, description, acceptanceCriteria, type, priority,
    status: status || 'backlog', project, assignee,
    reporter: req.user._id, labels, dueDate, position,
    estimatedHours, aiGenerated: aiGenerated || false,
  });

  await issue.populate([
    { path: 'assignee', select: 'name avatarColor email' },
    { path: 'reporter', select: 'name avatarColor email' },
  ]);

  await logActivity(req.user._id, project, 'created_issue', issue._id, { title });

  // Real-time broadcast
  req.io?.to(`project:${project}`).emit('issue:created', issue);

  res.status(201).json({ success: true, issue });
});

// ── @GET /api/issues/:id ──────────────────────────────────────────────────────
const getIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('assignee', 'name avatarColor email role')
    .populate('reporter', 'name avatarColor email role')
    .populate('comments.user', 'name avatarColor');

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  res.json({ success: true, issue });
});

// ── @PUT /api/issues/:id ──────────────────────────────────────────────────────
const updateIssue = asyncHandler(async (req, res) => {
  const {
    title, description, acceptanceCriteria, type, priority,
    status, assignee, labels, dueDate, estimatedHours,
  } = req.body;

  const existing = await Issue.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Track status change in history
  const historyEntry =
    status && status !== existing.status
      ? { from: existing.status, to: status, changedBy: req.user._id }
      : null;

  const update = {
    title, description, acceptanceCriteria, type, priority,
    status, assignee, labels, dueDate, estimatedHours,
  };
  if (historyEntry) update.$push = { history: historyEntry };

  const issue = await Issue.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate('assignee', 'name avatarColor email')
    .populate('reporter', 'name avatarColor email')
    .populate('comments.user', 'name avatarColor');

  if (historyEntry) {
    await logActivity(req.user._id, existing.project, 'moved_issue', issue._id, {
      from: historyEntry.from, to: historyEntry.to,
    });
    req.io?.to(`project:${existing.project}`).emit('issue:moved', {
      issueId: issue._id, from: historyEntry.from, to: historyEntry.to, issue,
    });
  } else {
    req.io?.to(`project:${existing.project}`).emit('issue:updated', issue);
  }

  res.json({ success: true, issue });
});

// ── @PATCH /api/issues/:id/move ───────────────────────────────────────────────
// Lightweight endpoint for drag-drop (just update status + position)
const moveIssue = asyncHandler(async (req, res) => {
  const { status, position } = req.body;

  const existing = await Issue.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const wasStatus = existing.status;
  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    {
      status,
      position,
      $push: wasStatus !== status
        ? { history: { from: wasStatus, to: status, changedBy: req.user._id } }
        : undefined,
    },
    { new: true }
  ).populate('assignee', 'name avatarColor');

  if (wasStatus !== status) {
    await logActivity(req.user._id, existing.project, 'moved_issue', issue._id, {
      from: wasStatus, to: status,
    });
  }

  req.io?.to(`project:${existing.project}`).emit('issue:moved', {
    issueId: issue._id, from: wasStatus, to: status, issue,
  });

  res.json({ success: true, issue });
});

// ── @DELETE /api/issues/:id ───────────────────────────────────────────────────
const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  await issue.deleteOne();
  await logActivity(req.user._id, issue.project, 'deleted_issue', null, { title: issue.title });
  req.io?.to(`project:${issue.project}`).emit('issue:deleted', { issueId: req.params.id });

  res.json({ success: true, message: 'Issue deleted' });
});

// ── @POST /api/issues/:id/comments ───────────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { user: req.user._id, text: text.trim() } } },
    { new: true }
  ).populate('comments.user', 'name avatarColor');

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  await logActivity(req.user._id, issue.project, 'commented', issue._id, { text: text.slice(0, 50) });
  req.io?.to(`project:${issue.project}`).emit('issue:commented', { issueId: issue._id, issue });

  res.json({ success: true, comments: issue.comments });
});

// ── @DELETE /api/issues/:id/comments/:commentId ───────────────────────────────
const deleteComment = asyncHandler(async (req, res) => {
  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    { $pull: { comments: { _id: req.params.commentId } } },
    { new: true }
  ).populate('comments.user', 'name avatarColor');

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  res.json({ success: true, comments: issue.comments });
});

module.exports = {
  getIssues,
  createIssue,
  getIssue,
  updateIssue,
  moveIssue,
  deleteIssue,
  addComment,
  deleteComment,
};
