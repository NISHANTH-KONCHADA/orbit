const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    // e.g. 'created_issue', 'moved_issue', 'commented', 'updated_priority'
    action: {
      type: String,
      required: true,
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    // Extra context: { from: 'todo', to: 'in-progress' }
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast project feed queries
activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
