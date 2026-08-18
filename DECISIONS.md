# Architecture & Implementation Decisions

## 1. Stack decision
I chose **React + Express + PostgreSQL + Prisma**.
- React/Vite/Tailwind allows rapid frontend development with modern tooling.
- Express provides a simple, robust backend.
- PostgreSQL + Prisma guarantees strong relational schema safety, simple migrations, and type-safe database queries. The strict assignment requirement dictated PostgreSQL.

## 2. Configuration architecture
The assignment's primary requirement was ensuring **no business configuration is hardcoded in the frontend**. I designed the database to store questions, choices, multipliers, and rates. The frontend merely acts as a dumb renderer that parses `/api/config` and displays the inputs. 

## 3. Calculation design
The pricing engine lives exclusively in `server/src/utils/calculator.ts`.
The formula calculates:
1. **Base Material Cost** = `roofArea * materialRate * (1 + wasteFactor)`
2. **Tear-Off Cost** = `roofArea * tearOffRate`
3. **Adjusted Subtotal** = `(Base + TearOff) * pitchMultiplier * storiesMultiplier`
4. **Midpoint Estimate** = `Adjusted Subtotal + permitFlatFee`
5. **Estimate Low/High** = `Midpoint +/- spreadPercentage`

The client passes user answers, and the server calculates everything natively to prevent frontend tampering.

## 4. Versioning
When the owner updates the configuration (e.g. changes a rate) and clicks "Save Changes", the system **does not mutate the active configuration**. Instead, it generates a new `ConfigVersion` (incrementing the version number), marks it as active, and deactivates the previous version. This preserves historical integrity so that old leads retain accurate references to the pricing parameters active at the time they were submitted.

## 5. Historical seed data
The seed script inserts `ld_0917` (Bill Tanner), which uses a legacy configuration structure with fields like `chimney_count` and `slate_natural`. By keeping `answers` as a dynamic JSON object in the `Lead` model, the UI gracefully renders unknown legacy fields rather than crashing. A legacy `ConfigVersion (v1)` was created just for this lead to reference.

## 6. Scope decisions
To ensure a high-quality delivery within the 24-hour window, I deliberately scoped out:
- Complex Role-Based Access Control (RBAC). Only a single admin user exists via environment variables.
- Multi-tenancy or complex organizational structures.
- Customer accounts or payment processing.
- Automated email integrations.
My primary focus was delivering the core estimator and the configuration engine reliably.

## 7. Production questions
Before a real production launch, I would ask the business owner:
- How are roof measurements normally obtained? Do customers overestimate?
- Are these estimates intended to include labor, or just materials?
- Should estimates differ by ZIP code or county?
- Are permit costs strictly flat fees, or do they scale based on municipality?
- Should we send the customer an automated email/SMS with their quote?

## 8. Next week
Realistic immediate improvements would include:
- A configuration history UI to view past configurations and how rates have evolved.
- CSV export for the leads table.
- Webhook integrations to pipe leads automatically into a CRM.
- Automated email notifications using SendGrid.
