# Mess Dekho

Full-stack MERN project for PG (Paying Guest) listings and bookings.

## Features
- Browse PG listings
- Owner dashboard to manage PGs and bookings
- Admin dashboard for approvals
- Authentication with JWT (example)
- Image uploads (Cloudinary optional)

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT
- Dev tools: nodemon, vite

## Repository Structure

project-root/
- frontend/        # React frontend (Vite)
- backend/         # Express backend
- README.md
- .gitignore
- frontend/.env.example
- backend/.env.example

## Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)

## Installation (root)
1. Clone the repo
	git clone <repo-url>
	cd <repo-folder>

2. Install dependencies for frontend and backend
	# Frontend
	cd frontend
	npm install

	# Backend
	cd ../backend
	npm install

## Frontend setup
1. Copy example env
	cp frontend/.env.example frontend/.env
2. Edit `frontend/.env` if your backend runs on a different port or host.
3. Run frontend (development)
	cd frontend
	npm run dev

## Backend setup
1. Copy example env
	cp backend/.env.example backend/.env
2. Update `backend/.env` with your MongoDB URI and JWT secret.
3. Run backend (development)
	cd backend
	npm run dev

## Environment variables
See `frontend/.env.example` and `backend/.env.example` for examples.

## Run commands
- Frontend dev: `cd frontend && npm run dev`
- Frontend build: `cd frontend && npm run build`
- Backend dev: `cd backend && npm run dev`
- Backend start: `cd backend && npm start`

## Screenshots
Add screenshots of the app here (client, owner dashboard, admin panel).

## Security / Secrets
- Never commit `.env` files or secrets. Use the provided `.env.example` files as a template.
- If secrets are accidentally committed, rotate them immediately (change JWT secret, DB credentials).

## GitHub checklist before push
1. Ensure `.gitignore` contains `node_modules`, `.env`, `dist`, `build`, `coverage`, `logs`.
2. Remove secrets from history if necessary (use `git filter-repo` or `git filter-branch`).
3. Commit and push:
	git add .
	git commit -m "Prepare repo: add backend, env examples, gitignore"
	git push origin main

## Contributing
Please open issues or PRs for improvements.

---
This README is a starter template. Update it with project-specific details and screenshots.
