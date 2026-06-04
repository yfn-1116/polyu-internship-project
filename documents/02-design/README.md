# Design

This folder stores architecture and system design documents.

## Architecture Position

Each design document should explain where the module sits in the whole system:

- Is it a frontend page, backend service, data pipeline, model component, integration layer, or deployment tool?
- What modules depend on it?
- What modules does it depend on?
- What data enters and leaves this module?
- What should be isolated so it can be changed later?

## Frontend Analysis

Use this section when the project includes a frontend:

- Main pages and user workflows.
- Component structure.
- State management.
- API contracts needed from the backend.
- Error, loading, empty, and permission states.
- Accessibility and responsive layout requirements.

## Backend Analysis

Use this section when the project includes a backend:

- API endpoints and service boundaries.
- Business logic modules.
- Database or storage design.
- Authentication and authorization.
- External service integration.
- Logging, validation, and error handling.

## Suggested Files

- `01-system-overview.md`
- `02-module-breakdown.md`
- `03-frontend-design.md`
- `04-backend-design.md`
- `05-data-design.md`
- `06-api-contracts.md`
- `07-deployment-design.md`

