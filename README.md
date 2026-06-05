# Team Task Manager

A full-stack task management app built for teams. Users can register, create teams, add members, and create/assign/track tasks — all behind authenticated, protected routes.

Built with React, Node.js, Express, and PostgreSQL.

---

## Features

- Register and login with session-based authentication
- Create teams and add other users as members
- Create tasks, assign them to team members, set due dates and status
- Filter tasks by team or assignee
- Only the team creator can delete their team
- Sessions stored in PostgreSQL (falls back to MemoryStore in dev if PG is unavailable)
- HTTP-only cookies — no token handling on the frontend

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express                    |
| Database   | PostgreSQL                          |
| Auth       | PassportJS (local strategy), express-session |
| Validation | Joi                                 |
| Passwords  | bcrypt                              |

---

## Project Structure

```
├── backend/
│   ├── routes/         # auth, teams, tasks
│   ├── middleware/     # isAuth session guard
│   ├── validators/     # Joi schemas
│   ├── db.js           # pg Pool
│   ├── passport.js     # local strategy setup
│   ├── schema.sql      # database tables
│   └── index.js        # Express app entry
├── frontend/
│   ├── src/
│   │   ├── api/        # fetch wrapper
│   │   ├── components/ # Navbar, TaskCard, TaskModal, TeamList
│   │   └── pages/      # Login, Register, Dashboard
│   └── index.html
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

## Environment Variables

Copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
SESSION_SECRET=pick-a-long-random-string-here
CLIENT_URL=http://localhost:5173
PORT=4000
```

> Never commit `.env`. It's in `.gitignore`.

---

## Database Setup

Connect to PostgreSQL and create the database, then run the schema:

```bash
psql -U postgres -c "CREATE DATABASE taskmanager;"
psql -U postgres -d taskmanager -f backend/schema.sql
```

This creates four tables: `users`, `teams`, `team_members`, `tasks`.  
The session table (`session`) is created automatically by `connect-pg-simple` on first run.

---

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev      # uses nodemon, restarts on file changes
```

Server starts on `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens on `http://localhost:5173`

---

## API Overview

| Method | Route                     | Description              | Auth required |
|--------|---------------------------|--------------------------|---------------|
| POST   | /auth/register            | Create account           | No            |
| POST   | /auth/login               | Login                    | No            |
| POST   | /auth/logout              | Logout                   | Yes           |
| GET    | /auth/me                  | Get current user         | Yes           |
| GET    | /teams                    | List your teams          | Yes           |
| POST   | /teams                    | Create a team            | Yes           |
| PUT    | /teams/:id                | Rename team (creator only)| Yes          |
| DELETE | /teams/:id                | Delete team (creator only)| Yes          |
| GET    | /teams/:id/members        | List team members        | Yes           |
| POST   | /teams/:id/members        | Add a member             | Yes           |
| GET    | /tasks                    | List tasks (filterable)  | Yes           |
| POST   | /tasks                    | Create a task            | Yes           |
| PUT    | /tasks/:id                | Update a task            | Yes           |
| DELETE | /tasks/:id                | Delete a task            | Yes           |

---

## Deployment

The backend has a `Dockerfile` ready for containerized deployment (e.g. Google Cloud Run, Railway, Render).

```bash
# Build and run the backend container
docker build -t task-manager-backend ./backend
docker run -p 4000:4000 --env-file ./backend/.env task-manager-backend
```

For the frontend, build the static files and serve them from any CDN or static host (Vercel, Netlify, etc.):

```bash
cd frontend
npm run build    # outputs to frontend/dist/
```

Make sure to set `VITE_API_URL` or update `BASE_URL` in `src/api/index.js` to point at your deployed backend.

---

## Future Improvements

- Team management UI (rename/delete teams, add members from the dashboard)
- Email invitations for adding team members
- Task comments
- Notifications for due dates
- Role system beyond creator/member (e.g. admin)
- Dark mode

---

## License

MIT
