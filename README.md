# BIT CMS — College Management System

A full-stack College Management System for Bhagwant Institute of Technology, built with React (web PWA), React Native (mobile), Node.js/Express (backend), and MongoDB.

---

## Architecture

```
bit-cms/
├── client/
│   ├── web/        # React PWA (create-react-app)
│   └── mobile/     # React Native app
└── server/         # Express API + Socket.IO
```

---

## Quick Start (Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Start the backend

```bash
cd server
npm install
npm run seed      # First-time setup: creates admin, sample data
npm run dev       # Starts with nodemon on port 5000
```

### 3. Start the web frontend

```bash
cd client/web
npm install
# Create client/web/.env
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm start         # Starts on port 3000
```

---

## Default Login Credentials (after seeding)

> **Important:** Change all passwords immediately after first login in production.

| Role    | Email               | Password        |
|---------|---------------------|-----------------|
| Admin   | admin@bit.edu       | Admin@123456    |
| Faculty | faculty@bit.edu     | Faculty@123456  |
| Student | student@bit.edu     | Student@123456  |

---

## API Endpoints

### Auth
| Method | Path                        | Access  | Description            |
|--------|-----------------------------|---------|------------------------|
| POST   | /api/auth/login             | Public  | Login                  |
| POST   | /api/auth/register          | Public  | Register (pending approval) |
| GET    | /api/auth/me                | Private | Get current user       |
| PUT    | /api/auth/change-password   | Private | Change own password    |

### Students, Faculty, Courses, Fees, Notices, Timetable, Attendance, Exams, Results, Approvals
All follow standard REST patterns. See route files in `server/routes/`.

---

## Environment Variables

| Variable         | Required | Description                                   |
|-----------------|----------|-----------------------------------------------|
| MONGODB_URI      | ✅       | MongoDB connection string                     |
| JWT_SECRET       | ✅       | Long random string for signing JWTs           |
| JWT_EXPIRE       |          | Token expiry (default: `7d`)                  |
| PORT             |          | Server port (default: `5000`)                 |
| NODE_ENV         |          | `development` or `production`                 |
| CORS_ORIGIN      |          | Comma-separated list of allowed frontend origins |

---

## Security Notes

- All `.env` files are gitignored. Never commit secrets.
- Passwords hashed with bcrypt (12 rounds).
- Auth endpoints rate-limited to 20 requests/15 min.
- JWT tokens expire in 7 days by default.
- Role-based access control on all protected routes.
- Students/Faculty can only access their own data.

---

## Deployment

### Vercel (Frontend)
Set `REACT_APP_API_URL` to your backend URL in Vercel environment variables.

### Render / Railway / Heroku (Backend)
Set all environment variables in the platform dashboard. Ensure `NODE_ENV=production`.

---

## License
MIT
