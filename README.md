# Northline Roofing Estimator

## Overview
A dynamic, configuration-driven full-stack roofing estimator application for Northline Roofing & Exteriors.
The platform features a public-facing estimator and a secure owner panel for managing questions, pricing parameters, and viewing captured leads.

## Features
- **Public Estimator:** Dynamic form steps rendered purely from the database configuration. Includes real-time validation and server-side quote calculation.
- **Owner Panel:** Secure dashboard to view leads and actively edit the business pricing configuration (multipliers, flat rates, enabled questions).
- **Configuration Versioning:** When an owner modifies the pricing parameters, a new configuration version is generated. Existing submitted leads are firmly tied to the version that generated their estimates.

## Architecture
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL accessed via Prisma ORM

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wantace-roof-estimator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   A `.env.example` file is provided in both `client/` and `server/`.
   Copy them to `.env` if not already set.

4. **Database Setup:**
   Run the Prisma migration and seed script to populate the initial configuration and historical leads.
   ```bash
   cd server
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Start the Application:**
   Run both frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```

   - Public Estimator: `http://localhost:3000`
   - Owner Panel: `http://localhost:3000/admin`
   - Backend API: `http://localhost:5000`

## Test Credentials
To access the Owner Panel locally:
- **Username:** `admin`
- **Password:** `password123`

*(These are configured in `server/.env` via `ADMIN_USERNAME` and `ADMIN_PASSWORD`)*

## Running Tests
Calculator and business logic tests are implemented in the `server` package.
```bash
cd server
npm test
```

## API Endpoints

### Public
- `GET /api/config`: Fetch the currently active configuration.
- `POST /api/estimate`: Submit customer answers and receive calculated estimates.

### Admin (Requires JWT)
- `POST /api/admin/login`: Authenticate owner.
- `GET /api/admin/config`: Fetch active configuration (including editable pricing rates).
- `PUT /api/admin/config`: Save a new configuration version.
- `GET /api/admin/leads`: Fetch all captured leads.

## Deployment
- **Frontend:** Can be deployed statically to Vercel or Netlify. Set `VITE_API_URL` to your production backend URL.
- **Backend:** Can be deployed to Render, Railway, or Heroku as a standard Node.js server. Provide `DATABASE_URL` and `JWT_SECRET`.
- **Database:** Provision a PostgreSQL instance using Supabase or Neon.
