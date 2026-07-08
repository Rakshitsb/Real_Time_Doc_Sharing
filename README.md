<div align="center">

# 📝 CollabDocs — Real-Time Collaborative Workspace

**A production-grade SaaS collaborative document platform built with the MERN stack.**
Rich text editing, real-time co-authorship, threaded comments, and instant chat — all in one workspace.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black?logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)

[Live Demo](#) · [API Reference](#-api-reference) · [Socket Events](#-socket-events)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Rich Text Editor** | TipTap-based editor with formatting, tables, code blocks, and images |
| 🤝 **Real-Time Co-Authoring** | Yjs CRDT-powered conflict-free collaborative editing with live cursors |
| 💬 **Threaded Comments** | Inline comment anchors with @mentions and thread resolution |
| 📣 **Live Chat** | Per-document chat with @mentions, typing indicators, and online presence |
| 🔔 **Notifications** | Real-time mention and activity notifications via Socket.IO |
| 📜 **Version History** | Automatic snapshots with diff-aware restore |
| 🔐 **Authentication** | JWT with auto-logout on session expiry (HTTP + socket layer) |
| 🌐 **Multi-Tab Sync** | Cross-tab session invalidation via `localStorage` events |
| 📊 **Activity Log** | Document-level activity feed (create, edit, rename, delete) |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI framework with lazy loading + Suspense
- **Vite** — Build tool with manual chunk splitting
- **TipTap** — ProseMirror-based rich text editor
- **Yjs** — CRDT for conflict-free real-time collaboration
- **Socket.IO Client** — Real-time communication
- **Tailwind CSS + Radix UI** — Design system
- **Framer Motion** — Animations and transitions

### Backend
- **Node.js + Express** — HTTP server
- **Socket.IO** — WebSocket server with room-based broadcasting
- **MongoDB + Mongoose** — Database with compound indexes
- **JWT** — Stateless authentication
- **Helmet** — Security headers
- **Winston** — Structured logging
- **Yjs (server)** — CRDT state management per room

### Infrastructure
- **Docker** — Multi-stage containerized builds
- **GitHub Actions** — CI/CD pipeline
- **Vercel** — Frontend deployment
- **Render / Railway** — Backend deployment
- **MongoDB Atlas** — Managed database

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  TipTap +    │  │ Collaboration │  │  Chat /   │  │
│  │  Yjs Editor  │  │  Sidebar      │  │ Comments  │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                 │        │
│         └─────────────────┼─────────────────┘        │
│                           │ Socket.IO                │
└───────────────────────────┼──────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────┐
│                  Node.js Server                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Socket.IO Server                    │ │
│  │  ┌────────────┐ ┌──────────┐ ┌────────────────┐ │ │
│  │  │ Collab     │ │ Document │ │ Communication  │ │ │
│  │  │ Handler    │ │ Handler  │ │ Handler        │ │ │
│  │  │ (Yjs CRDT) │ │          │ │ (Chat/Comments)│ │ │
│  │  └────────────┘ └──────────┘ └────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │              REST API (Express)                  │ │
│  │  Auth · Documents · Notifications                │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────┘
                            │ Mongoose
                    ┌───────┴──────┐
                    │   MongoDB    │
                    └──────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/Rakshitsb1/Real_Time_Doc_Sharing.git
cd Real_Time_Doc_Sharing

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGO_URI and JWT_SECRET

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if your backend runs on a non-default port
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🐳 Docker (Full Stack)

```bash
# Copy and configure env
cp backend/.env.example backend/.env
# Set JWT_SECRET in backend/.env

# Build and start all services
docker compose up --build

# Open http://localhost:8080
```

Services started:
- **MongoDB** — port 27017
- **Backend** — port 5000
- **Frontend** — port 8080

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Set **Framework Preset** to `Vite`
3. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

### Backend → Render

1. Create a **Web Service** connected to the `/backend` directory
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `node index.js`
4. Add environment variables from `backend/.env.example`
5. Set `NODE_ENV=production`

### Database → MongoDB Atlas

1. Create a free M0 cluster
2. Add your Render IP to the IP Allowlist (or allow all: `0.0.0.0/0`)
3. Set `MONGO_URI` to your Atlas connection string

---

## 📁 Project Structure

```
Real_Time_Doc_Sharing/
├── backend/
│   ├── server/
│   │   ├── config/          # Environment config
│   │   ├── constants/       # HTTP status, routes, event names
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, rate limiting, logging, errors
│   │   ├── models/          # Mongoose schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic
│   │   ├── socket/          # Socket.IO handlers + rooms + events
│   │   └── utils/           # Logger, pagination, hashing
│   └── index.js             # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client + endpoints
│   │   ├── collaboration/   # Yjs provider + awareness
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-level pages
│   │   ├── services/        # API service functions
│   │   ├── socket/          # Socket.IO client
│   │   └── utils/           # Storage, error helpers
│   └── vite.config.js
```

---

## 🔌 API Reference

Core REST routes are defined under `backend/server/routes`.

## 📡 Socket Events

Socket.IO events are defined under `backend/server/socket/events` and `frontend/src/collaboration/socket`.

---

## 🔮 Future Improvements

- [ ] AI-powered writing assistant integration
- [ ] Document sharing with external users (public links)
- [ ] Export to PDF / Markdown
- [ ] Workspace-level member management
- [ ] Offline-first with IndexedDB sync
- [ ] End-to-end encryption for private documents

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
