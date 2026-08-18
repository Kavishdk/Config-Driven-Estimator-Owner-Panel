# Interview Guide: Northline Roofing Estimator

## 1. Architecture Overview
**Data Flow:**
1. **Frontend Init:** React calls `GET /api/config`. The Express server queries the database (via Prisma) for the active `ConfigVersion` and returns the questions, options, and business details. Sensitive rates are stripped out.
2. **User Input:** The homeowner answers questions dynamically rendered by `QuestionField.tsx`.
3. **Submission:** React calls `POST /api/estimate` with contact details and JSON answers.
4. **Backend Calculation:** Express validates the answers, retrieves the *full* active configuration (with pricing rates), and passes them to `calculateEstimate()` in `calculator.ts`.
5. **Persistence:** The calculated estimate is saved to the database as a new `Lead`, attached to the `ConfigVersion` ID that generated it.
6. **Response:** The estimate bounds are returned to the frontend.

## 2. Important Models (Prisma Schema)
* **`ConfigVersion`:** Represents a snapshot of the business's pricing configuration. Includes modifiers (waste factor, permit fee) and `isActive`.
* **`Question` / `QuestionOption`:** The dynamic fields rendered on the frontend. Linked to a `ConfigVersion`. Options contain the actual pricing multipliers and rates.
* **`Lead`:** A submitted customer estimate. Stores the raw answers as JSON, the final calculated estimate range, and a foreign key to the `ConfigVersion` that produced it.

## 3. The Calculator
**File:** `server/src/utils/calculator.ts`
The pricing formula explicitly isolates the steps:
- Resolve selected options (material, pitch, stories, layers).
- Calculate Material Cost = `area * materialRate * (1 + wasteFactor)`.
- Calculate Tear-Off Cost = `area * tearOffRate`.
- Subtotal = `(Material + Tear-Off) * pitchMultiplier * storiesMultiplier`.
- Midpoint = `Subtotal + permitFee`.
- Final Range = `Midpoint +/- spreadPercentage`.

## 4. Why the Frontend is "Dumb"
The assignment specifically requested that no business logic or pricing data live in the frontend. `QuestionField.tsx` determines how to render an input strictly based on `question.type` ("number" vs "select"). It doesn't know what "asphalt" is or how much it costs. This allows the business owner to add a new material option through the DB without ever touching React code.

## 5. Configuration Versioning
Instead of updating prices in-place (which would corrupt historical leads), the `PUT /api/admin/config` route uses a Prisma `$transaction`. It marks the current active configuration as inactive, and creates a full deep clone of the configuration (with the new prices) as the new active version. Leads are tied to versions, ensuring data integrity.

## 6. Authentication
The Admin panel requires basic JWT authentication. The React app checks for `adminToken` in `localStorage` and redirects to `/admin/login` if missing. API routes under `/api/admin/*` are protected by `authMiddleware.ts` which verifies the JWT signature.

## 7. AI Usage
- **Where it helped:** Rapidly scaffolding Vite + Express, building out the initial Prisma models, styling Tailwind CSS, and writing boilerplate HTTP routes.
- **Where I intervened:** Extracting the calculator logic into a clean, testable service, implementing the configuration versioning logic (AI initially wanted to just UPDATE the row), and dealing with SQLite's lack of native JSON support by stringifying the payload.

---

## Likely Interview Questions & Answers

**Q1: Why did you choose PostgreSQL?**
**Short Answer:** Relational data integrity.
**Deeper:** The data is highly relational: a `Lead` belongs to a `ConfigVersion`, which has many `Question`s, which have many `QuestionOption`s. Postgres with Prisma provides strict referential integrity and type safety, ensuring we never have orphaned options or broken lead references.

**Q2: Why is the calculation on the backend?**
**Short Answer:** Security and flexibility.
**Deeper:** If the calculation was on the frontend, the pricing multipliers and rates would have to be sent over the wire, exposing proprietary business logic. Furthermore, a savvy user could tamper with the payload and generate a low estimate. 

**Q3: What happens if the owner changes pricing while a customer is using the estimator?**
**Short Answer:** The customer gets the *old* pricing.
**Deeper:** When the frontend loads, it caches the configuration it's displaying. When the customer submits the estimate, the backend uses the *currently active* configuration. If the owner changed it mid-flight, the backend will calculate using the *new* active configuration. (Note: In a more robust system, we would pass the `configVersionId` from the frontend to ensure we calculate against the version the user actually saw, but for this MVP we calculate against the latest active version).

**Q4: How would you add a new question without modifying React code?**
**Short Answer:** Add a new row to the `Question` table.
**Deeper:** The frontend maps over the `config.questions` array. If you insert a new question of type "select", the `QuestionField` component will automatically render radio buttons for it. You would just need to update the backend calculator to handle the new multiplier or rate if it affects pricing.

---

## Live Change Exercises (How to handle them)

1. **Add a new pricing modifier (e.g. "urgent fee"):**
   - **DB:** Add `urgentFee Int` to `ConfigVersion` in `schema.prisma`. Run migration.
   - **Calculator:** Update `calculator.ts` to add `config.urgentFee` to the midpoint.
   - **Admin UI:** Add a new `<Input>` in `ConfigEditor.tsx` to let the owner edit it.
   
2. **Add CSV export:**
   - **Backend:** Add a route `GET /api/admin/leads/export`. Fetch leads, use a library like `json2csv`, set headers `Content-Disposition: attachment; filename=leads.csv`, and send the CSV string.
   - **Frontend:** Add a generic "Export CSV" anchor tag linking to that endpoint (or trigger a blob download).
