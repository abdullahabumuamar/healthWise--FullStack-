## HealthCareProject (HealthWise) - Brief README

A full‑stack healthcare web application with a Node.js/Express + MongoDB backend and a React (Vite) + Tailwind CSS frontend. It provides authentication, patient/admin features, articles, health tips, symptom checking, and AI-assisted recommendations (via optional local Ollama).

### Tech Stack
- Backend: Node.js, Express, Mongoose, JWT, Helmet, CORS, Multer, express-validator
- Frontend: React (Vite), React Router, Axios, Tailwind CSS
- Database: MongoDB
- Optional AI: Ollama (`llama3.2:3b`)

### Repository Structure
- `healthcare-backend/` — Express API (`server.js`), routes under `/api/*`, MongoDB models, middleware, services.
- `healthcare-frontend/` — React app (Vite), components, pages, contexts, hooks, and API client.



### Environment Variables
Create `healthcare-backend/.env` with:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_db
FRONTEND_URL=http://localhost:5173
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
JWT_SECRET=replace_with_a_strong_secret
```

Create `healthcare-frontend/.env` (optional) with:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Install
- Backend:
  ```
  cd healthcare-backend
  npm install
  ```
- Frontend:
  ```
  cd healthcare-frontend
  npm install
  ```

### Run (Development)
In two terminals:
1) Backend (default port 5000):
```
cd healthcare-backend
npm run dev
```
2) Frontend (default port 5173):
```
cd healthcare-frontend
npm run dev
```

Open the app at: `http://localhost:5173`

### API Base URL
- Default: `http://localhost:5000/api`
- Frontend reads from `VITE_API_BASE_URL` if set.

### Key Endpoints (examples)
- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- Users: `GET /api/users`, `GET /api/users/:id`
- Patients: `GET /api/patients`
- Articles: `GET /api/articles`
- Tips: `GET /api/tips`
- Symptoms: `POST /api/symptoms/check`
- Diet: `POST /api/diet/recommendations`
- Exercise: `POST /api/exercise/recommendations`
- Health: `GET /api/health`

Note: Protected endpoints require `Authorization: Bearer <token>`.

### Building for Production
- Frontend:
```
cd healthcare-frontend
npm run build
```
Artifacts are generated under `dist/`.

### Notes
- Ensure MongoDB is running and `MONGODB_URI` is correct before starting the backend.
- AI features require Ollama to be running or set valid `OLLAMA_BASE_URL` and `OLLAMA_MODEL`.
- CORS is configured to allow the frontend origin (`FRONTEND_URL`).

### License
ISC (see package metadata). Update as needed.

