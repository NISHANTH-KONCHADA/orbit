const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    // Human-readable ID e.g. "ORB-12"
    issueId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    acceptanceCriteria: [
      {
        type: String,
      },
    ],
    type: {
      type: String,
      enum: ['bug', 'feature', 'task', 'story'],
      default: 'task',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
      default: 'backlog',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [commentSchema],
    labels: [{ type: String, trim: true }],
    dueDate: { type: Date, default: null },
    // Position within its column for drag-drop ordering
    position: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: null },
    // AI-generated flag
    aiGenerated: { type: Boolean, default: false },
    // Status change history
    history: [
      {
        from: String,
        to: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate issueId before save
issueSchema.pre('save', async function (next) {
  if (this.isNew && !this.issueId) {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.project);
    const count = await mongoose.model('Issue').countDocuments({ project: this.project });
    this.issueId = `${project ? project.key : 'ORB'}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
