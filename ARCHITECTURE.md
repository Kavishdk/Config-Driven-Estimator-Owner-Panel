# Northline Roofing Estimator Architecture

## 1. System Architecture
The application is a standard three-tier full-stack web application:
- **Client (Frontend):** React + Vite + TypeScript + Tailwind CSS. A configuration-driven single-page application (SPA).
- **Server (Backend):** Node.js + Express + TypeScript. Exposes a REST API, handles authentication, validation, and business logic (pricing calculation).
- **Database:** PostgreSQL accessed via Prisma ORM.

## 2. Database Design
The schema is designed to separate configuration from transactional data (leads) while maintaining references to ensure data integrity over time.

- `ConfigVersion`: Represents a snapshot of the business configuration.
  - Fields: `id`, `version`, `businessName`, `region`, `currency`, `wasteFactor`, `permitFlatFee`, `rangeSpreadPct`, `isActive`, `createdAt`, `updatedAt`
- `Question`: Belongs to a `ConfigVersion`. Represents a dynamic field in the estimator.
  - Fields: `id`, `configVersionId`, `key`, `label`, `type`, `unit`, `required`, `min`, `max`, `active`, `order`
- `QuestionOption`: Belongs to a `Question` (for `select` type questions).
  - Fields: `id`, `questionId`, `value`, `label`, `ratePerSqft`, `multiplier`, `tearOffPerSqft`
- `Lead`: A submitted customer estimate request.
  - Fields: `id`, `capturedAt`, `configVersionId`, `name`, `phone`, `email`, `answers` (JSON), `estimateLow`, `estimateHigh`

## 3. Data Flow & Configuration Versioning
- **Public Flow:** The client requests `/api/config`. The server returns the currently active `ConfigVersion` (and its active questions/options). The client renders the form. Upon submission, the client sends answers to `/api/estimate`. The server recalculates based on the *active* config, saves the lead referencing that config's ID, and returns the estimate range.
- **Admin Flow:** The admin requests `/api/admin/config` to view the editable active config. When the admin saves changes via `PUT /api/admin/config`, the server **creates a new `ConfigVersion`** (incrementing the version number) and marks it as active, archiving the previous one. This ensures that historical leads remain tied to the exact configuration rules that generated their estimates.

## 4. API Design
**Public API:**
- `GET /api/config`: Retrieves active questions and global settings (excluding secrets).
- `POST /api/estimate`: Submits lead data, calculates estimate, and returns the result.

**Admin API (Protected):**
- `POST /api/auth/login`: Authenticates owner and returns JWT.
- `GET /api/admin/config`: Retrieves the active configuration in an editable format.
- `PUT /api/admin/config`: Submits a modified configuration, triggering the creation of a new version.
- `GET /api/admin/leads`: Retrieves a paginated/sorted list of historical leads.

## 5. Security Approach
- **Authentication:** JWT-based authentication for all `/api/admin/*` routes.
- **Server-Side Integrity:** The pricing formula is executed exclusively on the server. The client never receives individual material prices, and the server never trusts client-provided prices.
- **Validation:** Server-side validation using Zod ensures incoming answers match the types and constraints of the active configuration.

## 6. Monorepo Structure
- `client/`: React frontend app.
- `server/`: Express backend app with Prisma.
- Shared logic (if any) is minimal; the API is the explicit contract between them.
