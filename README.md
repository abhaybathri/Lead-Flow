# LeadFlow — Sales CRM

A production-quality full-stack lead management application for small sales teams.

---

## Product Overview

LeadFlow is a lightweight CRM where:
- **Anyone** can submit a lead through a public form (no account needed)
- **Authenticated sales members** can manage their assigned leads
- **Admins** have full control over all leads, users, and assignments
- Leads move through a configurable sales pipeline
- Every important action is recorded in an activity trail

---

## Features

- Public lead capture form (no auth required)
- JWT authentication with access + refresh token strategy
- Role-based access control (admin / member)
- Lead pipeline management (new → contacted → qualified → proposal → won/lost)
- Lead assignment to team members
- Timestamped notes on leads
- Activity trail for every important event
- Admin team management (create, activate/deactivate)
- Pagination, search, and filtering
- Responsive UI with loading/empty/error states

---

## Architecture

```
leadflow/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/         # Axios API calls
│       ├── components/  # Shared UI components
│       ├── context/     # Auth context
│       └── pages/       # Route pages
└── server/          # Node.js + Express backend
    └── src/
        ├── config/      # DB connection, seed
        ├── controllers/ # Thin request handlers
        ├── middleware/  # Auth, role, error handling
        ├── models/      # Mongoose models
        ├── routes/      # Express routers
        ├── services/    # Business logic
        ├── tests/       # Jest + Supertest tests
        ├── utils/       # JWT helpers, response helpers
        └── validators/  # express-validator rules
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React, Vite, React Router, Tailwind CSS |
| State      | React Context (auth), local component state |
| Backend    | Node.js, Express                        |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT (access + refresh tokens, httpOnly cookies) |
| Passwords  | bcryptjs                                |
| Testing    | Jest, Supertest, mongodb-memory-server  |
| Rate Limit | express-rate-limit                      |

---

## Database Models

### User
| Field    | Type    | Description                        |
|----------|---------|------------------------------------|
| name     | String  | Required                           |
| email    | String  | Unique, normalized lowercase       |
| password | String  | Hashed (never returned in API)     |
| role     | Enum    | `admin` or `member`                |
| isActive | Boolean | Default `true`                     |

### Lead
| Field       | Type   | Description                                  |
|-------------|--------|----------------------------------------------|
| name        | String | Required                                     |
| email       | String | Required, validated                          |
| phone       | String | Optional                                     |
| company     | String | Optional                                     |
| requirement | String | Required                                     |
| source      | String | Optional                                     |
| status      | Enum   | new / contacted / qualified / proposal / won / lost |
| assignedTo  | Ref    | Nullable → User                              |
| createdBy   | Ref    | Nullable → User (null for public submissions) |

### Note
| Field   | Type   | Description       |
|---------|--------|-------------------|
| lead    | Ref    | Required → Lead   |
| author  | Ref    | Required → User   |
| content | String | Required          |

### Activity
| Field    | Type   | Description                            |
|----------|--------|----------------------------------------|
| lead     | Ref    | Required → Lead                        |
| actor    | Ref    | Nullable → User (null for system events) |
| action   | String | e.g. `lead_created`, `status_changed`  |
| metadata | Mixed  | Flexible object (from/to, assignee, etc.) |

---

## Authentication Approach

- **Access token** (JWT, 15 min expiry) sent in httpOnly cookie + returned in response body for Bearer header use
- **Refresh token** (JWT, 7 day expiry) sent in httpOnly cookie
- `POST /api/v1/auth/refresh` issues a new token pair
- Frontend axios interceptor automatically refreshes on 401
- Passwords hashed with bcryptjs (cost factor 12)
- Passwords never returned in any API response (`select: false` + `toJSON` override)

---

## Authorization Rules

| Role   | Can Do                                                    |
|--------|-----------------------------------------------------------|
| Admin  | All CRUD on leads, assign leads, manage team, all activity |
| Member | View/update only assigned leads, add notes, change status on own leads |

**Every protected endpoint independently verifies:**
1. User is authenticated (valid JWT)
2. User has the required role
3. User owns/is assigned the resource when applicable

Frontend role-based UI is a UX enhancement only — never the security layer.

---

## API Documentation

### Auth Endpoints

| Method | Endpoint              | Auth | Role | Description              |
|--------|-----------------------|------|------|--------------------------|
| POST   | /api/v1/auth/login    | No   | —    | Login with email/password |
| POST   | /api/v1/auth/logout   | No   | —    | Clear auth cookies        |
| POST   | /api/v1/auth/refresh  | No   | —    | Refresh tokens            |
| GET    | /api/v1/auth/me       | Yes  | Any  | Get current user          |

### Public Endpoints

| Method | Endpoint              | Auth | Role | Description         |
|--------|-----------------------|------|------|---------------------|
| POST   | /api/v1/public/leads  | No   | —    | Submit a public lead |

### Lead Endpoints

| Method | Endpoint                        | Auth | Role        | Description              |
|--------|---------------------------------|------|-------------|--------------------------|
| GET    | /api/v1/leads                   | Yes  | Any         | List leads (filtered by role) |
| GET    | /api/v1/leads/:leadId           | Yes  | Any         | Get single lead (ownership enforced) |
| POST   | /api/v1/leads                   | Yes  | Admin       | Create lead manually      |
| PATCH  | /api/v1/leads/:leadId           | Yes  | Any         | Update lead (ownership enforced) |
| DELETE | /api/v1/leads/:leadId           | Yes  | Admin       | Delete lead               |
| GET    | /api/v1/leads/:leadId/notes     | Yes  | Any         | Get notes (ownership enforced) |
| POST   | /api/v1/leads/:leadId/notes     | Yes  | Any         | Add note (ownership enforced) |
| GET    | /api/v1/leads/:leadId/activity  | Yes  | Any         | Get activity (ownership enforced) |

Query params for GET /api/v1/leads: `page`, `limit`, `search`, `status`, `assignedTo`, `sort`, `order`

### Admin Endpoints

| Method | Endpoint                           | Auth | Role  | Description              |
|--------|------------------------------------|------|-------|--------------------------|
| GET    | /api/v1/admin/users                | Yes  | Admin | List all users            |
| POST   | /api/v1/admin/users                | Yes  | Admin | Create team member        |
| PATCH  | /api/v1/admin/users/:userId/status | Yes  | Admin | Activate/deactivate user  |

### Request/Response Format

**Login request:**
```json
POST /api/v1/auth/login
{ "email": "admin.demo@example.com", "password": "Admin@1234" }
```

**Success response:**
```json
{ "success": true, "message": "Login successful", "data": { "user": {...}, "accessToken": "..." } }
```

**Error response:**
```json
{ "success": false, "message": "Invalid email or password", "errors": [] }
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone / enter repo
cd leadflow

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/leadflow
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

### Seed Demo Data

```bash
cd server
node src/config/seed.js
```

### Run Development Servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

---

## Running Tests

```bash
cd server
npm test
```

Tests use `mongodb-memory-server` — no running MongoDB instance needed.

---

## Demo Credentials

| Role   | Email                      | Password    |
|--------|----------------------------|-------------|
| Admin  | admin.demo@example.com     | Admin@1234  |
| Member | member.demo@example.com    | Member@1234 |

---

## Deployment

### Backend (e.g. Railway, Render, Fly.io)
1. Set all environment variables from `.env.example`
2. Set `NODE_ENV=production`
3. Set `CLIENT_URL` to your deployed frontend URL
4. Deploy the `server/` directory, start command: `node src/server.js`

### Frontend (e.g. Vercel, Netlify)
1. Build: `npm run build` in `client/`
2. Set the API base URL to your backend URL (update `vite.config.js` proxy or set `VITE_API_URL`)
3. Deploy the `client/dist/` directory

### Database
Use MongoDB Atlas (free tier works fine). Set `DATABASE_URL` to your Atlas connection string.

---

## Known Limitations & Future Improvements

- **Email notifications** — no email on lead assignment or status change (could add Nodemailer)
- **File attachments** — leads don't support file uploads (could add S3/Cloudinary)
- **Real-time updates** — no WebSocket push (could add Socket.io for live activity feed)
- **Refresh token rotation + blocklist** — current refresh tokens aren't invalidated on logout (could use Redis blocklist)
- **Lead scoring** — no automated lead scoring
- **Export** — no CSV/Excel export for leads
- **2FA** — no two-factor authentication
