# EduPulse Architecture

## 1. Product Scope
EduPulse is a classroom-based learning web application where instructors build interactive scenarios, assign them to classes, and review student performance.

Core product capabilities:
- Scenario authoring (creator)
- Scenario delivery (viewer)
- AI-assisted grading (free response)
- Classroom management
- Assignment lifecycle
- Role-based access for students, instructors, and admins

## 2. Current State Snapshot (From Existing Branches)
### Main branch
- React + Vite frontend with scenario creator/viewer demos
- Express backend with `/api/grade` endpoint and OpenAI integration
- Placeholder classroom/login/signup pages
- No production auth, session model, or role-enforced backend permissions

### Database/backend branch direction (`origin/Database`)
- PostgreSQL-backed users/scenarios/submissions tables
- Basic role field on users (`trainee`, `trainer`, `admin`)
- Scenario CRUD and user endpoints
- Still missing secure authentication, institutional tenancy, class entities, and strict authorization policies

## 3. Target Architecture Overview
### Frontend
- React SPA with route groups by role:
  - Student: dashboard, assigned work, in-progress, completed, feedback
  - Instructor: scenario library, assignment builder, class roster, analytics
  - Admin: institution settings, user provisioning, audits

### Backend
- Express API with domain routers:
  - Auth
  - Users/Roles
  - Organizations/Classrooms/Groups
  - Scenarios
  - Assignments
  - Attempts/Submissions/Grades
  - Reporting

### Data + External Services
- PostgreSQL (primary transactional store)
- Object storage for scenario media/assets (video/files)
- OpenAI service for grading
- Microsoft Entra ID (Azure AD) for OAuth sign-in

## 4. Core Domain Model
Recommended primary entities:
- `organizations` (school/department tenant boundary)
- `users`
- `memberships` (user membership in org with role)
- `classrooms`
- `classroom_members` (student/instructor membership in a class)
- `scenarios` (draft/head metadata)
- `scenario_versions` (immutable published versions)
- `assignments` (bind scenario version to classroom + due dates)
- `attempts` (student run state per assignment)
- `responses` (node-level answers, including AI graded information)

Key design rule:
- Assignments should reference immutable `scenario_versions`, not mutable draft scenarios.

## 5. Auth and Identity (Microsoft OAuth)
Use Microsoft Entra ID via OAuth 2.0 / OpenID Connect.

Recommended flow:
1. User signs in with Microsoft account.
2. Backend validates token claims (issuer, audience, expiration, signature/JWKS).
3. App maps identity to local `users` + `memberships`.
4. Backend issues application session (HTTP-only secure cookie or signed JWT session).
5. All protected routes enforce authorization from local role/membership state.

Important decisions:
- Single-tenant vs multi-tenant Entra setup
- Allowed email domains / tenant IDs
- Auto-provisioning rules (first login behavior)
- Account linking strategy if email changes

## 6. Authorization Model
Use RBAC + resource-scoped checks:
- Platform roles: admin, instructor, student
- Resource scopes: organization, classroom, assignment

Examples:
- Instructors can create scenarios and assign to classrooms they teach.
- Students can only access assignments where they are enrolled.
- Admins can manage users/roles across their organization.

Do not trust frontend role checks alone; every sensitive API must enforce server-side authorization.

## 7. Scenario Lifecycle Architecture
Scenario states:
- Draft
- Published
- Archived

Workflow:
1. Instructor edits draft scenario in creator.
2. Publish creates immutable version snapshot.
3. Assignment references published version.
4. Students run attempts against that fixed version.
5. New edits create new version, without breaking historical attempts.

## 8. Classroom and Assignment Workflows
### Instructor workflow
1. Create/import scenario
2. Publish version
3. Assign to classroom with due date and grading settings
4. Monitor progress, completion, and weak concept areas

### Student workflow
1. See assigned work
2. Launch scenario
3. Submit node responses
4. Receive feedback
5. Review completion status and results

## 9. Grading System Architecture
Current synchronous grading is fine for MVP; evolve to queue-based grading for scale/reliability.

MVP:
- API receives response and grades immediately
- Save grade result with prompt/rubric version metadata

Scaled:
- Write response event to queue
- Background worker performs grading with retries/backoff
- Persist graded output and emit completion event/notification

Add guardrails:
- Idempotency keys for grading requests
- Timeout/retry policy
- Fallback for model/API failures
- Cost controls and per-tenant usage limits

## 10. Frontend Architecture by Route Domains
Recommended route domains:
- `/auth/*`
- `/student/*`
- `/instructor/*`
- `/admin/*`
- `/scenario/viewer/:assignmentId`
- `/scenario/creator/:scenarioId`

Shared frontend concerns:
- Session/bootstrap loader
- Role-aware navigation
- API client with auth + error normalization
- Query caching/state management strategy
- Form validation and optimistic updates where safe

## 11. API Architecture Guidelines
Recommended patterns:
- Versioned APIs (`/api/v1/...`)
- Zod validation on all request/response boundaries
- Consistent error format and status codes
- Pagination/filtering for list endpoints
- Request IDs for tracing

Example domain endpoints:
- `POST /api/v1/auth/microsoft/callback`
- `GET  /api/v1/classrooms/:id/assignments`
- `POST /api/v1/scenarios/:id/publish`
- `POST /api/v1/assignments/:id/attempts`
- `POST /api/v1/attempts/:id/responses`

## 12. Data and Migration Strategy
- Use migration tooling (drizzle, knex, or similar)
- Never rely on runtime `CREATE TABLE IF NOT EXISTS` as long-term migration strategy
- Add unique constraints + foreign keys + indexing for high-volume joins
- Support soft deletes/audit where compliance requires history
- Include seed data for local development (demo org/class/users/scenario)

## 13. Security, Privacy, and Compliance
Education context adds extra requirements:
- PII minimization and encrypted data at rest/in transit
- Audit logging for access and role changes
- Retention/deletion policy for student data
- FERPA-aligned data handling practices (if applicable)
- Secret management (no raw keys in frontend)
- Rate limiting and abuse protection on auth and grading endpoints

## 14. Observability and Operations
- Structured logging (JSON logs with request IDs)
- Metrics: request latency, grading latency, failure rates, token errors
- Error tracking/alerting (backend + frontend)
- Health/readiness checks
- Environment separation: local, staging, production
- Backup and recovery plan for PostgreSQL

## 15. Testing Strategy
- Unit tests for scenario engine reducers/schemas
- API integration tests (auth, permissions, assignment access)
- End-to-end tests for key role workflows (student/instructor/admin)
- Contract tests for grading response schema stability

## 16. Suggested Delivery Phases
### Phase 1: Foundation
- Microsoft OAuth + session handling
- RBAC middleware
- Core classroom/assignment schema
- Instructor + student dashboard skeletons

### Phase 2: Instructional Core
- Scenario publish/versioning
- Assignment workflow
- Attempt tracking and progress states
- Basic analytics (completion, score distribution)

### Phase 3: Reliability + Admin
- Queue-based grading pipeline
- Admin tools and audit logs
- Notifications/reminders
- Operational dashboards and SLOs

## 17. Big-Picture Items You Were Missing (or only partially captured)
- Tenant model (organization/school boundaries)
- Real auth/session architecture (not just login forms)
- Server-enforced authorization on every protected route
- Classroom/assignment domain schema
- Scenario versioning strategy for stable assignments
- Attempt lifecycle and progress persistence
- Analytics/reporting model for instructors
- Compliance/security/audit requirements for education data
- Migrations + deployment + observability plan
- Testing strategy across role-based flows
