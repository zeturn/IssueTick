# IssueTick

IssueTick is a BasaltPass-integrated ticket management system for issue intake, assignment, discussion, and resolution tracking. The app includes a FastAPI backend, a React/Vite frontend, role-aware navigation, ticket workflows, admin stats, category management, and user role management.

## Stack

- Backend: Python, FastAPI, SQLAlchemy, SQLite
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Auth: BasaltPass OAuth2 with a signed session cookie
- Default backend port: `8112`
- Default frontend port: `5115`

## Project Layout

```text
IssueTick/
  backend/
    app/
      models/
      routers/
      schemas/
      services/
      main.py
    requirements.txt
  frontend/
    src/
      components/
      hooks/
      pages/
    package.json
  .basalt/
    app.json
    rbac.json
    resources.json
  project.meta.json
```

## Backend Setup

Create a Python environment, install dependencies, then start the API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8112
```

Health check:

```text
http://localhost:8112/api/health
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5115
```

Open:

```text
http://localhost:5115
```

## Environment

The backend reads configuration from `backend/.env`. Do not commit real secrets.

Common values:

```env
BASALTPASS_BASE_URL=http://localhost:8101
BASALTPASS_CLIENT_ID=
BASALTPASS_CLIENT_SECRET=
BASALTPASS_REDIRECT_URI=http://localhost:8112/api/auth/callback
FRONTEND_URL=http://localhost:5115
JWT_SECRET=change-me
DATABASE_URL=sqlite:///./issuetick.db
UPLOAD_DIR=./uploads
```

## Useful Commands

```powershell
# Frontend production build
cd frontend
npm run build

# Frontend lint
cd frontend
npm run lint

# Backend development server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8112
```

## Notes

- The local SQLite database (`backend/issuetick.db`) and local `.env` files are ignored by git.
- BasaltPass app metadata is stored under `.basalt/`.
- The root `project.meta.json` records local ports, health checks, stack details, and common commands.
