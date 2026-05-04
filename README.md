# TaskFlow — Team Task Manager

A full-stack Jira-like team task manager built with **Spring Boot** (Java) + **React** (Vite) + **PostgreSQL**.

## 🚀 Live Demo
> Deployed on Railway — [Coming soon after deployment]

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Frontend | React 18, Vite, React Router, Recharts |
| Database | PostgreSQL |
| Auth | JWT (JJWT 0.12.x) |
| Deployment | Railway |

## ✨ Features
- **Authentication** — Signup/Login with JWT tokens
- **Role-Based Access Control** — Admin & Member roles
- **Projects** — Create, edit, delete projects with deadlines and team members
- **Tasks** — Full CRUD with status tracking (Todo / In Progress / Done / Overdue)
- **Dashboard** — Stats widgets, Pie + Bar charts via Recharts
- **Team Management** — Add/remove members per project (Admin only)
- **Real-time status updates** — Inline status dropdowns in task table

## 🔑 Default Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskmanager.com | admin123 |
| Member | member@taskmanager.com | member123 |

## 🏃 Running Locally

### Prerequisites
- Java 17+
- Maven (or use `mvnw`)
- Node 18+
- PostgreSQL running locally

### Backend
```bash
cd backend
# Create DB: createdb taskmanager_db
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🌐 Deploying to Railway

1. Push to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Add **PostgreSQL** plugin → Railway injects `DATABASE_URL`
4. Set env vars:
   - `JWT_SECRET` — any 64-char hex string
   - `CORS_ORIGINS` — your Railway frontend URL
5. Deploy both services

## 📡 API Endpoints

| Method | URL | Description | Access |
|--------|-----|-------------|--------|
| POST | /api/auth/signup | Register | Public |
| POST | /api/auth/login | Login → JWT | Public |
| GET | /api/projects | List projects | Auth |
| POST | /api/projects | Create project | Admin |
| PUT | /api/projects/{id} | Update project | Admin |
| DELETE | /api/projects/{id} | Delete project | Admin |
| POST | /api/projects/{id}/members | Add member | Admin |
| DELETE | /api/projects/{id}/members/{uid} | Remove member | Admin |
| GET | /api/tasks | List tasks | Auth |
| POST | /api/tasks | Create task | Auth |
| PUT | /api/tasks/{id} | Update task | Auth |
| DELETE | /api/tasks/{id} | Delete task | Admin |
| GET | /api/tasks/dashboard | Dashboard stats | Auth |
| GET | /api/users | List all users | Admin |
| GET | /api/users/me | Current user | Auth |

## 📁 Project Structure
```
Task/
├── backend/              # Spring Boot API
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/       # SecurityConfig, DataSeeder
│   │   ├── controller/   # REST Controllers
│   │   ├── dto/          # Request/Response DTOs
│   │   ├── entity/       # JPA Entities
│   │   ├── repository/   # Spring Data JPA Repos
│   │   ├── security/     # JWT, Filter, UserDetails
│   │   └── service/      # Business Logic
│   └── pom.xml
├── frontend/             # React + Vite
│   └── src/
│       ├── api/          # Axios instance
│       ├── context/      # AuthContext
│       ├── pages/        # Dashboard, Projects, Tasks, Users
│       └── components/   # Sidebar, modals
└── railway.json          # Deployment config
```
