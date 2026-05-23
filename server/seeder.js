// ── DNS Fix: use Google DNS so mongodb+srv SRV lookup works ──────────────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

/**
 * Seeder — populates MongoDB with demo users, a project, and sample issues.
 * Run: node seeder.js
 * Clear: node seeder.js --clear
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Issue = require('./models/Issue');
const Activity = require('./models/Activity');

const CLEAR = process.argv.includes('--clear');

const DEMO_USERS = [
  { name: 'Alex Admin', email: 'admin@orbit.dev', password: 'orbit123', role: 'Admin', avatarColor: '#F97316' },
  { name: 'Priya PM', email: 'pm@orbit.dev', password: 'orbit123', role: 'Project Manager', avatarColor: '#8B5CF6' },
  { name: 'Dev Developer', email: 'dev@orbit.dev', password: 'orbit123', role: 'Developer', avatarColor: '#06B6D4' },
];

const SAMPLE_ISSUES = [
  { title: 'Set up CI/CD pipeline', type: 'task', priority: 'high', status: 'done', description: 'Configure GitHub Actions for automated testing and deployment to Render.' },
  { title: 'Design system tokens', type: 'task', priority: 'medium', status: 'done', description: 'Define color tokens, typography, spacing in Tailwind config.' },
  { title: 'JWT auth flow broken on mobile', type: 'bug', priority: 'critical', status: 'in-progress', description: 'Token is not persisted in localStorage on iOS Safari. Needs investigation.' },
  { title: 'Implement drag-and-drop kanban', type: 'feature', priority: 'high', status: 'in-progress', description: 'Use @dnd-kit to enable dragging cards between columns with optimistic updates.' },
  { title: 'Add Google Gemini AI assistant', type: 'feature', priority: 'high', status: 'todo', description: 'Integrate floating chatbot with project context awareness using Gemini 1.5 Flash.' },
  { title: 'Sprint summary dashboard widget', type: 'feature', priority: 'medium', status: 'todo', description: 'Show sprint progress bar and completion stats on dashboard.' },
  { title: 'Dark mode toggle', type: 'feature', priority: 'low', status: 'todo', description: 'Implement dark mode using Tailwind class strategy with localStorage persistence.' },
  { title: 'Role-based access control', type: 'task', priority: 'high', status: 'review', description: 'Ensure Admin/PM/Developer roles restrict UI elements and API endpoints correctly.' },
  { title: 'Activity feed real-time updates', type: 'feature', priority: 'medium', status: 'backlog', description: 'Push new activity items via Socket.io to update dashboard feed live.' },
  { title: 'Comment thread on issues', type: 'feature', priority: 'medium', status: 'backlog', description: 'Allow users to add, view, and delete comments on issue detail modal.' },
  { title: 'Recharts donut chart for issue stats', type: 'feature', priority: 'medium', status: 'backlog', description: 'Show issues by status in a donut chart on the dashboard using Recharts.' },
  { title: 'Export sprint report as PDF', type: 'feature', priority: 'low', status: 'backlog', description: 'Allow users to download AI-generated sprint summary as a formatted PDF.' },
];

async function seed() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  if (CLEAR) {
    await Promise.all([User.deleteMany({}), Project.deleteMany({}), Issue.deleteMany({}), Activity.deleteMany({})]);
    console.log('🗑️  Database cleared');
    process.exit(0);
  }

  // Check if already seeded
  const existingAdmin = await User.findOne({ email: 'admin@orbit.dev' });
  if (existingAdmin) {
    console.log('⚠️  Demo data already seeded. Run with --clear to reset.');
    process.exit(0);
  }

  // Create users one-by-one so the pre-save bcrypt hook fires on each
  const admin = await User.create(DEMO_USERS[0]);
  const pm    = await User.create(DEMO_USERS[1]);
  const dev   = await User.create(DEMO_USERS[2]);
  const users = [admin, pm, dev];
  console.log(`👤 Created ${users.length} demo users (passwords hashed ✅)`);

  // Create project
  const project = await Project.create({
    name: 'Orbit — Tasks in Motion',
    description: 'Full-stack MERN project management app inspired by Jira',
    key: 'ORB',
    owner: admin._id,
    icon: '🚀',
    color: '#F97316',
    members: [
      { user: admin._id, role: 'Admin' },
      { user: pm._id, role: 'Project Manager' },
      { user: dev._id, role: 'Developer' },
    ],
    currentSprint: {
      name: 'Sprint 1 — Foundation',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await User.updateMany({ _id: { $in: [admin._id, pm._id, dev._id] } }, { $push: { projects: project._id } });
  console.log(`📁 Created project: ${project.name}`);

  // Create issues
  const assignees = [admin._id, pm._id, dev._id, null];
  for (let i = 0; i < SAMPLE_ISSUES.length; i++) {
    const data = SAMPLE_ISSUES[i];
    await Issue.create({
      ...data,
      project: project._id,
      reporter: admin._id,
      assignee: assignees[i % assignees.length],
      position: i,
      labels: data.type === 'bug' ? ['bug', 'needs-investigation'] : [data.type],
      dueDate: i % 3 === 0 ? new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000) : null,
    });
  }
  console.log(`🎫 Created ${SAMPLE_ISSUES.length} sample issues`);

  // Seed activity
  await Activity.create([
    { user: admin._id, project: project._id, action: 'created_project', meta: { name: project.name } },
    { user: pm._id, project: project._id, action: 'moved_issue', meta: { from: 'todo', to: 'in-progress', title: 'Implement drag-and-drop kanban' } },
    { user: dev._id, project: project._id, action: 'commented', meta: { text: 'Working on the mobile fix now' } },
    { user: admin._id, project: project._id, action: 'moved_issue', meta: { from: 'in-progress', to: 'done', title: 'Set up CI/CD pipeline' } },
  ]);
  console.log('📊 Created activity entries');

  console.log('\n🎉 Seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test credentials:');
  console.log('  Admin:   admin@orbit.dev / orbit123');
  console.log('  PM:      pm@orbit.dev / orbit123');
  console.log('  Dev:     dev@orbit.dev / orbit123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
