# StudentIQ — Full-Stack MERN Student + Admin Dashboard

A complete student performance platform with a **Student Dashboard** and a full **Admin Control Panel**, both connected to the same MongoDB backend.

---

## Login Credentials (after seeding)

| Role    | Email                    | Password     | Redirects to  |
|---------|--------------------------|--------------|---------------|
| Admin   | admin@studentiq.com      | password123  | /admin        |
| Student | alex@student.com         | password123  | /             |
| Student | priya@student.com        | password123  | /             |
| Student | marcus@student.com       | password123  | /             |
| Student | sofia@student.com        | password123  | /             |

---

## Project Structure

```
student-dashboard/
│
├── package.json                        ← Root: run both with concurrently
│
├── backend/
│   ├── server.js                       ← Express app entry point
│   ├── .env.example                    ← Copy to .env and fill MONGO_URI
│   ├── package.json
│   │
│   ├── config/
│   │   ├── db.js                       ← MongoDB connection
│   │   └── seed.js                     ← Seeds admin + 4 students + assessments + scores
│   │
│   ├── models/
│   │   ├── User.js                     ← role: 'student' | 'admin'
│   │   ├── Score.js                    ← score, subject, month, student ref
│   │   └── Assessment.js               ← title, subject, status, difficulty, dueDate
│   │
│   ├── controllers/
│   │   ├── authController.js           ← register, login (returns role in JWT payload)
│   │   ├── adminController.js          ← all admin CRUD: students, assessments, scores, stats
│   │   ├── scoreController.js          ← student score views (my scores, trends, stats)
│   │   └── assessmentController.js     ← public read (students can view available ones)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js           ← protect (JWT), adminOnly (role check)
│   │
│   └── routes/
│       ├── authRoutes.js               ← POST /api/auth/login, /register, GET /me
│       ├── studentRoutes.js            ← GET/PUT /api/students/profile
│       ├── scoreRoutes.js              ← GET /api/scores, /stats, /trends, /recent
│       ├── assessmentRoutes.js         ← GET /api/assessments (students read only)
│       └── adminRoutes.js              ← /api/admin/* (all protected by adminOnly)
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── index.jsx                   ← React entry point
        ├── index.css                   ← Global CSS variables, animations, utilities
        ├── App.jsx                     ← Routes: student (/) and admin (/admin) with role guards
        │
        ├── context/
        │   └── AuthContext.jsx         ← login, register, logout, updateUser — persists role
        │
        ├── utils/
        │   ├── api.js                  ← Axios instance, scoreAPI, assessmentAPI, adminAPI
        │   └── helpers.js              ← getPerformanceLevel, getSubjectColor, getScoreGrade...
        │
        ├── components/
        │   ├── Layout/
        │   │   ├── Layout.jsx          ← Student sidebar nav (shows Admin Panel btn for admins)
        │   │   └── Layout.css
        │   ├── Admin/
        │   │   ├── AdminLayout.jsx     ← Admin sidebar nav + "Student View" back button
        │   │   └── AdminLayout.css
        │   ├── Cards/
        │   │   ├── Cards.jsx           ← StatCard, BestScoreCard, TimeCard, RecentResultCard
        │   │   └── Cards.css
        │   └── Charts/
        │       ├── Charts.jsx          ← TrendChart, MonthlyAvgChart, DistributionChart
        │       └── Charts.css
        │
        └── pages/
            │
            ├── LoginPage.jsx           ← Login + Register, demo fill buttons for both roles
            ├── LoginPage.css
            │
            ├── DashboardPage.jsx       ← Student: stats, trends, recent results, assessments
            ├── DashboardPage.css
            │
            ├── AssessmentsPage.jsx     ← Student: view + take assessments (with timer modal)
            ├── AssessmentsPage.css
            │
            ├── ScoresPage.jsx          ← Student: full history with grade, sort, filter
            ├── ScoresPage.css
            │
            └── admin/
                ├── AdminDashboard.jsx  ← Overview: 4 stats, trend charts, distribution, recents
                ├── AdminDashboard.css
                │
                ├── AdminStudents.jsx   ← Full student CRUD: create, edit, delete, search
                ├── AdminStudents.css
                │
                ├── StudentDetail.jsx   ← Per-student: profile, chart, full score table
                ├── StudentDetail.css
                │
                ├── AdminAssessments.jsx ← Full assessment CRUD + quick publish status toggle
                ├── AdminAssessments.css
                │
                ├── AdminScores.jsx     ← All scores across students, add/edit/delete + filter
                └── AdminScores.css
```

---

## API Routes

### Auth
| Method | Route              | Access  |
|--------|--------------------|---------|
| POST   | /api/auth/register | Public  |
| POST   | /api/auth/login    | Public  |
| GET    | /api/auth/me       | Private |

### Student
| Method | Route                  | Access  |
|--------|------------------------|---------|
| GET    | /api/students/profile  | Private |
| PUT    | /api/students/profile  | Private |
| GET    | /api/assessments       | Private |
| GET    | /api/scores            | Private |
| GET    | /api/scores/stats      | Private |
| GET    | /api/scores/trends     | Private |
| GET    | /api/scores/recent     | Private |

### Admin (all require admin role)
| Method | Route                      | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | /api/admin/stats           | Platform-wide stats            |
| GET    | /api/admin/trends          | Monthly + subject avg trends   |
| GET    | /api/admin/students        | All students with score stats  |
| POST   | /api/admin/students        | Create student                 |
| GET    | /api/admin/students/:id    | Student + all their scores     |
| PUT    | /api/admin/students/:id    | Update student                 |
| DELETE | /api/admin/students/:id    | Delete student + their scores  |
| POST   | /api/admin/assessments     | Create assessment               |
| PUT    | /api/admin/assessments/:id | Update (incl. publish status)  |
| DELETE | /api/admin/assessments/:id | Delete assessment + scores     |
| GET    | /api/admin/scores          | All scores across all students |
| POST   | /api/admin/scores          | Add score for a student        |
| PUT    | /api/admin/scores/:id      | Edit score                     |
| DELETE | /api/admin/scores/:id      | Delete score                   |

---

## Setup & Run

### 1. Install

```bash
# From root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI if not localhost
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

### 4. Start Both Servers

```bash
# From root directory
npm install        # installs concurrently
npm run dev        # starts backend :5000 + frontend :3000
```

Or separately:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

---

## How Admin → Student Access Works

1. **Admin creates assessments** via `/admin/assessments`
2. Admin sets status to **"Available"** → instantly visible to all students
3. **Students** see them under `/assessments` and can start with the built-in timer
4. Admin **adds scores** via `/admin/scores` after grading
5. Students see scores reflected immediately on their `/` dashboard and `/scores` page

---

## Performance Levels

| Level     | Threshold | Color  |
|-----------|-----------|--------|
| Excellent | ≥ 85%     | Green  |
| Good      | 70–84%    | Cyan   |
| Average   | < 70%     | Amber  |

## Grade Scale

| Grade | Range  |
|-------|--------|
| A+    | 90–100 |
| A     | 85–89  |
| B+    | 80–84  |
| B     | 75–79  |
| C+    | 70–74  |
| C     | 65–69  |
| D     | < 65   |
