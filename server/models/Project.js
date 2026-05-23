const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // Short key like "ORB", "DASH" used as issue prefix
    key: {
      type: String,
      required: [true, 'Project key is required'],
      uppercase: true,
      trim: true,
      maxlength: [6, 'Key cannot exceed 6 characters'],
      match: [/^[A-Z0-9]+$/, 'Key must be alphanumeric uppercase'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['Admin', 'Project Manager', 'Developer'],
          default: 'Developer',
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
    },
    // Current sprint info
    currentSprint: {
      name: { type: String, default: 'Sprint 1' },
      startDate: { type: Date, default: Date.now },
      endDate: {
        type: Date,
        default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      },
    },
    icon: {
      type: String,
      default: '🚀',
    },
    color: {
      type: String,
      default: '#F97316',
    },
  },
  { timestamps: true }
);

// Virtual: issue count (populated when needed)
projectSchema.virtual('issueCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

module.exports = mongoose.model('Project', projectSchema);
