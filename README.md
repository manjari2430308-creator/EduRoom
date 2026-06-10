# EduRoom — Full Stack Classroom App

A Google Classroom-inspired platform with AI-powered features built with MERN stack.

## Features
- Role-based auth (Teacher / Student) with JWT + refresh tokens
- Create/join classrooms with auto-generated codes
- Post assignments with file uploads (Cloudinary)
- Real-time notifications via Socket.io
- Grade submissions with AI-generated feedback (OpenAI)
- AI Doubt Solver chatbot for students
- AI Class Performance Summarizer for teachers
- Deadline email reminders via cron job
- Student progress dashboard with Recharts

## Quick Start

### 1. Clone & install
```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Fill in your MONGO_URI, JWT secrets, Cloudinary keys, OpenAI key, email creds
```

### 3. Seed demo data
```bash
cd server && npm run seed
```

### 4. Run
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit http://localhost:5173

## Demo Accounts
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Teacher | teacher@eduroom.com    | password123 |
| Student | rahul@eduroom.com      | password123 |
| Student | priya@eduroom.com      | password123 |

## Project Structure
```
eduroom/
├── server/          Node.js + Express + MongoDB
│   ├── models/      Mongoose schemas
│   ├── controllers/ Business logic
│   ├── routes/      API endpoints
│   ├── middleware/  Auth, role, upload guards
│   ├── utils/       Token, email, AI helpers
│   ├── jobs/        node-cron deadline reminders
│   └── sockets/     Socket.io real-time events
└── client/          React + Tailwind CSS
    └── src/
        ├── pages/   Login, Dashboard, Classroom, Assignment, Grading, Progress
        ├── components/ Reusable UI + AI chat widget
        ├── context/ Auth global state
        └── utils/   Date helpers
```
