const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');

// ── @GET /api/projects ────────────────────────────────────────────────────────
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [
      { owner: req.user._id },
      { 'members.user': req.user._id },
    ],
  })
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor')
    .sort('-createdAt');

  res.json({ success: true, projects });
});

// ── @POST /api/projects ───────────────────────────────────────────────────────
const createProject = asyncHandler(async (req, res) => {
  const { name, description, key, icon, color } = req.body;

  // Check key uniqueness
  const keyExists = await Project.findOne({ key: key?.toUpperCase() });
  if (keyExists) {
    res.status(409);
    throw new Error(`Project key "${key}" already exists`);
  }

  const project = await Project.create({
    name,
    description,
    key: key?.toUpperCase(),
    owner: req.user._id,
    icon: icon || '🚀',
    color: color || '#F97316',
    members: [{ user: req.user._id, role: req.user.role }],
  });

  // Add to user's projects array
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { projects: project._id },
  });

  await project.populate('owner', 'name email avatarColor');

  res.status(201).json({ success: true, project });
});

// ── @GET /api/projects/:id ────────────────────────────────────────────────────
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatarColor role')
    .populate('members.user', 'name email avatarColor role');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json({ success: true, project });
});

// ── @PUT /api/projects/:id ────────────────────────────────────────────────────
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, icon, color, currentSprint, status } = req.body;

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, icon, color, currentSprint, status },
    { new: true, runValidators: true }
  )
    .populate('owner', 'name email avatarColor')
    .populate('members.user', 'name email avatarColor');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json({ success: true, project });
});

// ── @DELETE /api/projects/:id ─────────────────────────────────────────────────
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Only the project owner or Admin can delete a project');
  }

  await project.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});

// ── @POST /api/projects/:id/members ──────────────────────────────────────────
const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    res.status(404);
    throw new Error('User not found with that email');
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const alreadyMember = project.members.some(
    (m) => m.user.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) {
    res.status(409);
    throw new Error('User is already a member');
  }

  project.members.push({ user: userToAdd._id, role: role || 'Developer' });
  await project.save();
  await User.findByIdAndUpdate(userToAdd._id, { $addToSet: { projects: project._id } });
  await project.populate('members.user', 'name email avatarColor role');

  res.json({ success: true, project });
});

// ── @DELETE /api/projects/:id/members/:userId ─────────────────────────────────
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.members = project.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );
  await project.save();
  await User.findByIdAndUpdate(req.params.userId, { $pull: { projects: project._id } });

  res.json({ success: true, message: 'Member removed' });
});

// ── @GET /api/projects/:id/activity ──────────────────────────────────────────
const getActivity = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ project: req.params.id })
    .populate('user', 'name avatarColor')
    .populate('issue', 'issueId title')
    .sort('-createdAt')
    .limit(30);

  res.json({ success: true, activities });
});

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getActivity,
};
