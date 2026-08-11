# AssignmentSubmissionSystem

Lightweight assignment submission platform with a .NET 8 Web API backend, a Next.js + React frontend and PostgresSQL for Database.

## Overview

- Backend: AssignmentSubmissionSystem.Api — .NET 8 Web API (REST endpoints, EF Core for data access, auth & validation services).
- Frontend: AssignmentSubmissionSystem.React — Next.js (App Router) + React + Tailwind CSS.
- Purpose: Enable admins, teachers, and students to manage courses, assignments and submissions.

## Project Structure

````````
````````markdown

## Getting Started

Prerequisites:
- .NET 8 SDK
- Node.js (LTS)
- pnpm/npm/yarn (optional — uses npm below)
- A database supported by EF Core (e.g., SQL Server, PostgreSQL)

Backend (from repository root):
1. Open a terminal in AssignmentSubmissionSystem.Api
2. Configure appsettings.json or appsettings.Development.json with a valid ConnectionString.
3. Run migrations (if using EF Core migrations):
   - dotnet ef database update
4. Run the API:
   - dotnet run

Frontend:
1. Open a terminal in AssignmentSubmissionSystem.React
2. Create .env.local with NEXT_PUBLIC_API_BASE_URL pointing to the running API (e.g., http://localhost:5000).
3. Install deps and run:
   - npm install
   - npm run dev

API contract and DTOs are documented in Models/api-reference.md — keep backend DTOs and frontend types in sync.

## Development Notes

- Target framework: .NET 8.
- Follow layered architecture: Controllers → Services → Data (DbContext).
- Keep DTOs in AssignmentSubmissionSystem.Api/DTOs and mirror required types in AssignmentSubmissionSystem.React/types.
- Use middleware for centralized error handling and auth.

## Testing & CI

- Unit tests (if present) can be run with:
  - dotnet test
- Add CI workflow to run build, tests, and optional linting for frontend.

## Contribution

- Fork, create a feature branch, make changes, add tests, and submit a PR with description and screenshots (if UI).
- Keep commits small and descriptive.

## License

Specify your license (e.g., MIT) in a LICENSE file.

