# 🚀 Orbit — Tasks in Motion

A full-stack MERN project management application inspired by Jira, built with React + Vite + Tailwind CSS on the frontend and Node.js + Express + MongoDB on the backend. Features JWT authentication, role-based access control, real-time Kanban collaboration via Socket.io, and Google Gemini AI integration.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Kanban Board | 5-column drag-and-drop board (Backlog → Done) using @dnd-kit |
| 🔐 JWT Auth | Secure login/register with role-based access (Admin / PM / Developer) |
| 🤖 AI Assistant | Gemini 1.5 Flash chatbot with full project context awareness |
| ✨ AI Task Generator | Enter a title → AI fills description, acceptance criteria, priority |
| 📊 AI Sprint Summary | One-click AI report of sprint progress, completions, and blockers |
| ⚡ Real-time | Socket.io live board updates across all connected team members |
| 📈 Dashboard | Recharts donut chart, priority bar chart, sprint progress bar, activity feed |
| 💬 Comments | Thread-based commenting on every issue |
| 🌙 Dark Mode | Full dark mode with localStorage persistence |
| 🔖 Labels & Priority | Bug/Feature/Task/Story types with Low/Medium/High/Critical priority |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Real-time | Socket.io |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| AI | Google Gemini 1.5 Flash |
| Notifications | react-hot-toast |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & install

```bash
git clone <your-repo-url>
cd "Orbit — tasks in motion"

# Install backend deps
cd server
npm install

# Install frontend deps
cd ../client
npm install
```

### 2. Configure environment

**server/.env**
```env
MONGO_URI=mongodb://localhost:27017/orbit
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
PORT=5000
```

> 💡 **Get MongoDB**: Install MongoDB locally OR use [MongoDB Atlas](https://mongodb.com/atlas) (free 512MB)
>
> 💡 **Get Gemini key**: Visit [aistudio.google.com](https://aistudio.google.com) → "Get API key" → free (15 req/min)

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed demo data

```bash
cd server
npm run seed
```

### 4. Run the app

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🎭 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@orbit.dev | orbit123 |
| **Project Manager** | pm@orbit.dev | orbit123 |
| **Developer** | dev@orbit.dev | orbit123 |

> All 3 accounts are part of the **"Orbit — Tasks in Motion"** demo project with 12 pre-seeded issues.

---

## 📁 Folder Structure

```
Orbit — tasks in motion/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Button, Modal, Badge, Avatar
│   │   │   ├── kanban/        # Board, Column, IssueCard
│   │   │   ├── issue/         # IssueModal, CreateIssueModal
│   │   │   ├── ai/            # AIChatBot
│   │   │   ├── layout/        # Sidebar, Navbar, AppLayout
│   │   │   └── project/       # CreateProjectModal
│   │   ├── pages/             # Login, Register, Dashboard, Board, Issues, Settings
│   │   ├── context/           # AuthContext, ProjectContext
│   │   ├── hooks/             # useAuth, useSocket
│   │   ├── services/          # api.js (axios), aiService.js
│   │   └── utils/             # constants.js, helpers.js
│   └── .env
└── server/                    # Node + Express backend
    ├── controllers/           # auth, project, issue, ai
    ├── models/                # User, Project, Issue, Activity
    ├── routes/                # auth, projects, issues, ai
    ├── middleware/            # auth.js (JWT), errorHandler.js
    ├── socket/                # socketHandler.js
    ├── seeder.js
    └── .env
```

---

## 🤖 AI Features

### Task Description Generator
1. Open "Create Issue" or edit an existing issue
2. Type a title
3. Click **"✨ AI Fill"**
4. AI generates description, acceptance criteria, priority, and labels

### Sprint Summary
1. Go to **Dashboard**
2. Click **"AI Sprint Summary"**
3. AI analyzes all issues and generates a structured report

### AI Chatbot
1. Click the **✨ floating bubble** (bottom right)
2. Ask anything: *"What are the critical issues?"*, *"Summarize this sprint"*, *"What tasks are unassigned?"*
3. AI has full awareness of your current project context

---

## 🌐 Deployment

### Backend → Render.com (free)
1. Connect GitHub repo to [render.com](https://render.com)
2. Set env vars: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`
3. Start command: `node server.js`

### Frontend → Vercel (free)
1. Connect GitHub repo to [vercel.com](https://vercel.com)
2. Set `VITE_API_URL=https://your-app.onrender.com/api`
3. Set `VITE_SOCKET_URL=https://your-app.onrender.com`

### Database → MongoDB Atlas (free)
1. Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster → connect → copy URI
3. Set `MONGO_URI=mongodb+srv://...` in env

---

## 📜 License

MIT — built for the Jira-inspired hackathon. 🚀
