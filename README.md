# StaffSync – Modern Human Resource Management Solution

StaffSync is a web-based HR management portal built with the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. It gives separate roles and access levels to **HR personnel, managers and employees** and digitizes core HR work: employee records, leave approvals, attendance, announcements and training programs.

**Live demo:** _add your Render link here_

## Features

| Role | What they can do |
|------|------------------|
| **HR** | Add / edit / delete / search employees, assign roles and reporting managers, approve or reject all leave requests, view attendance of everyone by date, post announcements & news, view all training programs, dashboard with department-wise stats |
| **Manager** | View own team, approve or reject team leave requests, view team attendance, create and manage training & development programs for the team, apply for own leave, mark own attendance |
| **Employee** | Mark daily attendance (check-in / check-out), apply for leave and track status, cancel pending leave, view leave balance, update personal records, see enrolled trainings, read company announcements |

Common: JWT login, role-based protected routes (frontend + backend), password change, responsive Bootstrap UI.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Axios, Bootstrap 5, Bootstrap Icons
- **Backend:** Node.js, Express.js, JSON Web Token (JWT), bcryptjs
- **Database:** MongoDB (Mongoose ODM), hosted on MongoDB Atlas
- **Deployment:** Render (single web service serves both API and React build)

## Project Structure

```
staffsync/
├── package.json          # backend dependencies + build/start scripts
├── server/
│   ├── index.js          # Express app entry point
│   ├── seed.js           # creates demo data on first run
│   ├── config/db.js      # MongoDB connection
│   ├── middleware/auth.js# JWT protect + role check
│   ├── models/           # User, Leave, Attendance, Announcement, Training
│   └── routes/           # auth, users, leaves, attendance, announcements, trainings, dashboard
└── client/               # React frontend (Vite)
    └── src/
        ├── pages/        # Login, Dashboard, Employees, Team, Leaves, LeaveRequests,
        │                 # Attendance, AttendanceReport, Announcements, Trainings, Profile
        ├── components/   # Layout (sidebar), Modal
        ├── AuthContext.jsx
        └── api.js
```

## Demo Accounts

Created automatically the first time the app connects to an empty database. Password for all: **password123**

| Role | Email |
|------|-------|
| HR | hr@staffsync.com |
| Manager | manager@staffsync.com |
| Employee | employee@staffsync.com |

## Run Locally

Requirements: Node.js 18+ and a MongoDB connection string (MongoDB Atlas free cluster or local MongoDB).

```bash
# 1. Install backend packages
npm install

# 2. Create .env from the example and fill MONGO_URI and JWT_SECRET
cp .env.example .env

# 3. Build the React frontend
npm run build

# 4. Start the server
npm start
```

Open http://localhost:5000

For frontend development with hot reload, run `npm run dev` in one terminal and `npm run client` in another, then open http://localhost:5173.

## Deploy on Render

1. Create a free MongoDB Atlas cluster, a database user, and allow network access from `0.0.0.0/0`.
2. On Render: **New → Web Service → connect this GitHub repo**.
3. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment variables: `MONGO_URI` (Atlas connection string), `JWT_SECRET` (any long random text)
4. Deploy. Free instances sleep after inactivity, so the first visit may take about a minute.

## API Overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Logged in |
| GET/POST | /api/users | HR |
| PUT/DELETE | /api/users/:id | HR |
| GET | /api/users/team | Manager, HR |
| PUT | /api/users/me | Logged in |
| POST | /api/leaves | Employee, Manager |
| GET | /api/leaves/my | Logged in |
| GET | /api/leaves | HR (all), Manager (team) |
| PUT | /api/leaves/:id/status | HR, Manager |
| POST | /api/attendance/check-in, /check-out | Logged in |
| GET | /api/attendance | HR, Manager |
| GET/POST/PUT/DELETE | /api/announcements | Read: all, Write: HR |
| GET/POST/PUT/DELETE | /api/trainings | Read: all (filtered), Write: Manager, HR |
| GET | /api/dashboard | Logged in |
