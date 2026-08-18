# Northline Roofing Estimator

## Overview
A dynamic, configuration-driven full-stack roofing estimator application for **Northline Roofing & Exteriors**.
The platform features a public-facing estimator for homeowners and a secure owner panel for managing questions, pricing parameters, and viewing captured leads.

## Features
- **Public Estimator:** Dynamic form steps rendered purely from the database configuration. Includes client-side validation, contact capture, and secure server-side quote calculation.
- **Owner Panel:** Secure dashboard to view leads and actively edit business pricing rules (multipliers, flat rates, question visibility, option labels).
- **Configuration Versioning:** When an owner modifies pricing parameters, a new configuration version is generated in a database transaction. Historical leads remain firmly tied to the exact version that generated their estimates.

## Architecture & Tech Stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon) accessed via Prisma ORM
- **Authentication:** JWT-based authentication for owner endpoints

---

## Local Setup & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kavishdk/Config-Driven-Estimator-Owner-Panel.git
   cd Config-Driven-Estimator-Owner-Panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside `server/` with your database credentials:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require"
   JWT_SECRET="super-secret-jwt-key"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="password123"
   CLIENT_URL="http://localhost:3000"
   ```

4. **Database Setup:**
   Push the Prisma schema to your database and seed initial configuration (v3) & leads:
   ```bash
   cd server
   npm run db:push
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

---

## Test Credentials
To access the Owner Panel:
- **Username:** `admin`
- **Password:** `password123`

---

## Running Tests
Calculator and business logic tests are implemented in the `server` package:
```bash
cd server
npm test
```

---

## Production Deployment Guide

### 1. Database Deployment (Neon PostgreSQL)
1. Log in to [Neon Console](https://console.neon.tech/) and create a PostgreSQL database.
2. Copy the connection string with `?sslmode=require`.

### 2. Backend Deployment (Render / Railway)
1. Go to [Render](https://render.com/) or [Railway](https://railway.app/) and create a new **Web Service** connected to this GitHub repo.
2. Set the service settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `JWT_SECRET`: *(A secure random string)*
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `password123`
   - `NODE_ENV`: `production`
4. Deploy the service and copy the deployed backend URL (e.g., `https://northline-estimator-api.onrender.com`).

### 3. Frontend Deployment (Vercel / Netlify)
1. Go to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) and import this repository.
2. Set the project configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: *(Your deployed backend API URL, e.g. `https://northline-estimator-api.onrender.com/api`)*
4. Deploy!
