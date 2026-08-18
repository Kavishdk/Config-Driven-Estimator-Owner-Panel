# AI Usage Log

I used AI (Claude 3.5 Sonnet / Copilot) to help scaffold this project and accelerate development, while keeping tight control over the architecture and core business logic.

## What AI helped with:
- **Scaffolding:** I used AI to quickly generate the initial React + Vite + Express monorepo boilerplate and set up Tailwind CSS.
- **Prisma Schema Generation:** I wrote the initial data models on a whiteboard, and used AI to translate them into the Prisma schema syntax quickly.
- **UI Components:** I leaned on AI to style the React components using Tailwind, saving time on CSS class wrangling.

## Where I intervened and overwrote AI:
- **Configuration Versioning:** The AI initially suggested a simple `UPDATE` operation for changing configuration rates. I had to reject this and manually implement the transactional version-bumping logic. If we just updated rates in place, historical leads would suddenly appear to have wrong estimate calculations when viewed in the dashboard.
- **Business Logic Extraction:** The AI initially tried to put the calculation formula inside the Express route handler. I manually refactored this out into `server/src/utils/calculator.ts` so it could be properly unit-tested in isolation.
- **JSON Serialization Bug:** During testing, the AI generated a Prisma seed script that incorrectly passed objects to a String field (because SQLite doesn't natively support the `Json` type like Postgres does). I had to step in and fix the `JSON.stringify` logic across the seed file and the API endpoints to make sure the answers serialized correctly in the local DB.

Overall, AI was a great typing assistant, but the system design and core logic required manual oversight to meet the assignment's strict constraints.
