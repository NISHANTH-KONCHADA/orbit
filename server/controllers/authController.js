const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ── Helper: generate JWT ──────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Helper: avatar color from name ───────────────────────────────────────────
const AVATAR_COLORS = [
  '#F97316', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
  '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#6366F1',
];
const getAvatarColor = (name) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── @POST /api/auth/register ──────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Developer',
    avatarColor: getAvatarColor(name),
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user,
  });
});

// ── @POST /api/auth/login ─────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Strip password from response
  const userObj = user.toJSON();

  res.json({
    success: true,
    token: generateToken(user._id),
    user: userObj,
  });
});

// ── @GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('projects', 'name key icon color');
  res.json({ success: true, user });
});

// ── @PUT /api/auth/me ─────────────────────────────────────────────────────────
const updateMe = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

// ── @PUT /api/auth/change-password ───────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const match = await user.comparePassword(currentPassword);
  if (!match) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getMe, updateMe, changePassword };
