# [View on GitHub](https://github.com/NoahK216/EduPulse/blob/main/architecture.md)
# EduPulse Architecture

## 1. Current System Summary
EduPulse is a full-stack classroom and scenario platform built as a React SPA plus an Express API. Instructors can create branching scenario drafts, publish them into immutable scenario versions, assign them to classrooms, and review student attempts. Students can join classrooms, open assignments, progress through scenarios, and submit free responses that are graded through OpenAI.

The current stack is:
- Frontend: Vite, React 19, React Router, TanStack Query, Tailwind CSS 4, XYFlow/React Flow, Dagre.
- Backend: Express 5, Prisma 7, PostgreSQL via Neon, Neon Auth, OpenAI.
- Build/deploy shape: Vite builds the client, TypeScript compiles the server to `dist/`, and Express serves both API routes and the built SPA on a heroku dyno.

## 2. Current Runtime Shape

### Frontend route tree
- `/`
  - `src/pages/home/HomePage.tsx`
  - Chooses between guest landing and authenticated dashboard using `authClient.useSession()`.
- `/login`
  - `src/pages/home/LoginPage.tsx`
  - Email/password sign-in through Neon Auth.
- `/signup`
  - `src/pages/home/SignupPage.tsx`
  - Email/password sign-up with verification callback back to `/login`.
- `/settings`
  - `src/pages/home/SettingsPage.tsx`
  - Routed, but mostly a UI shell; only theme toggling is currently wired.
- `/classrooms`
  - `src/pages/classroom/ClassroomListPage.tsx`
- `/classrooms/create`
  - `src/pages/classroom/ClassroomCreatePage.tsx`
- `/classrooms/join`
  - `src/pages/classroom/ClassroomJoinPage.tsx`
- `/classrooms/:classroomId`
  - `src/pages/classroom/ClassroomPage.tsx`
  - Switches between instructor and student classroom views based on `viewer_role`.
- `/classrooms/:classroomId/assignment/:assignmentId`
  - `src/pages/classroom/AssignmentPage.tsx`
- `/classrooms/:classroomId/assignment/:assignmentId/attempt`
  - `src/pages/classroom/AssignmentRunnerPage.tsx`
  - Starts or resumes a student attempt session and runs `ScenarioViewer` in persisted mode.
- `/classrooms/:classroomId/assignment/:assignmentId/attempt/:attemptId`
  - `src/pages/classroom/AttemptPage.tsx`
- `/classrooms/:classroomId/assignment/:assignmentId/attempt/:attemptId/response/:responseId`
  - `src/pages/classroom/ResponsePage.tsx`
- `/scenario`
  - `src/pages/scenario/ScenarioLibraryPage.tsx`
- `/scenario/library`
  - `src/pages/scenario/ScenarioLibraryPage.tsx`
- `/scenario/new`
  - `src/pages/scenario/ScenarioNewPage.tsx`
- `/scenario/:scenarioId/editor`
  - `src/pages/scenario/ScenarioEditorPage.tsx`
- `/scenario/:scenarioId/viewer`
  - `src/pages/scenario/ScenarioTestRunPage.tsx`

### Backend route tree
- `/api/public/*`
  - Protected API namespace.
  - Every route uses `requireSession` in `src/server/public/auth.ts`.
  - Auth accepts JWT bearer tokens verified against `neon_auth.jwks`.
  - After auth, the server attaches `userId` to the request.

Protected resources currently mounted under `/api/public`:
- `/classrooms`
- `/classroom-members`
- `/scenarios`
- `/scenario-templates`
- `/scenario-versions`
- `/assignments`
- `/attempts`
- `/responses`
- `/grade`

## 3. Repository Hierarchy

### Root
- `.github/`
  - `dependabot.yml`
    - Weekly npm dependency update configuration.
- `dist/`
  - Generated build output for the client and compiled server.
- `node_modules/`
  - Installed dependencies.
- `prisma/`
  - Prisma schema and migration history.
- `public/`
  - Static assets served directly by Vite/Express.
- `src/`
  - Application source code for frontend, backend, shared types.
- `.env`
  - Local environment file. Required values are inferred from code, including `DATABASE_URL`, `OPENAI_API_KEY`, and `VITE_NEON_AUTH_URL`.
  - DO NOT COMMIT YOUR .env!!!
- `.gitignore`
  - Git ignore rules.
- `eslint.config.js`
  - Flat ESLint config for TypeScript and React hooks.
- `index.html`
  - SPA shell, favicon/manifest wiring, and client entry bootstrap.
- `package.json`
  - Project scripts and dependency manifest.
  - Key scripts:
    - `dev`: runs Prisma generation, backend watch server, and Vite client together.
    - `build`: builds client and server.
    - `start`: runs compiled Express server from `dist/src/server/index.js`.
- `package-lock.json`
  - npm lockfile.
- `prisma.config.ts`
  - Prisma CLI config pointing to `prisma/schema.prisma` and `DATABASE_URL`.
- `tsconfig.json`
  - Root TypeScript project references.
- `tsconfig.app.json`
  - Frontend TypeScript config.
- `tsconfig.node.json`
  - Server TypeScript config;.
- `vite.config.ts`
  - Vite config with React SWC, Tailwind plugin, and `/api` proxy to `http://localhost:8787`.

### `public/`
- `manifest.json`
  - PWA-style manifest and icon metadata.
- `logos/`
  - Brand assets used by the frontend.
- `scenarios/`
  - `tutorial.json`
    - Importable starter/tutorial scenario.
    - Also exposed by the backend as a scenario template via `/api/public/scenario-templates`.

### `prisma/`
- `schema.prisma`
  - Current source of truth for database structure.
  - Two schemas are in play:
    - `public`: EduPulse application tables.
    - `neon_auth`: Neon-managed auth/session/JWKS tables.
- `generated/`
  - Referenced by the app via generated Prisma client/model imports.
- `migrations/`
  - Each directory represents a change to the Neon DB.

### `src/`
- `index.css`
  - Tailwind import and global CSS defaults.
- `main.tsx`
  - Frontend entrypoint.
  - Initializes theme.
  - Wraps the app in the React Query provider.
  - Builds the lazy route tree described above.

#### `src/components/`
- `data/`
  - `DataStatePanels.tsx`
    - Loading, empty, error, and unauthorized panels.
  - `DataGuard.tsx`
    - Small state machine that chooses which panel or content to render.
- `layout/`
  - `NavBar.tsx`
    - Shared top navigation.
    - Session-aware app links and account dropdown.
  - `PageShell.tsx`
    - Shared authenticated page frame with NavBar and page header.
- `ui/`
  - `Surfaces.tsx`
    - Shared visual primitives like `SurfaceCard`, `SectionHeader`, `StatusBadge`, and `EmptyStateCard`.

#### `src/lib/`
- `auth-client.ts`
  - Shared Neon Auth client.
  - Depends on `VITE_NEON_AUTH_URL`.
- `cn.ts`
  - Small class-name join helper.
- `format-dates.ts`
  - Shared date formatting helpers.
- `public-api-client.ts`
  - Low-level fetch wrapper for `/api/public`.
  - Resolves and caches bearer tokens from Neon Auth session state.
  - Normalizes API errors into `ApiRequestError`.
- `query-client-instance.ts`
  - Singleton TanStack Query client configuration.
- `query-client.tsx`
  - `PublicApiQueryProvider`.
  - Clears token/query cache when authenticated identity changes.
- `theme.ts`
  - LocalStorage-backed light/dark theme initialization and toggle helpers.
- `useApiData.ts`
  - Generic React Query wrapper for authenticated public API reads.
- `usePublicApiHooks.ts`
  - Typed read hooks for the `/api/public` resources:
    - classrooms
    - classroom members
    - assignments
    - attempts
    - responses
    - scenarios
    - scenario versions
- `uuid.ts`
  - UUID validation helpers for route params and query construction.

#### `src/types/`
- `grader.ts`
  - Basic standalone grading request/response interfaces.
- `publicApi.ts`
  - Shared public API response contracts used by the frontend.
  - Extends base Prisma model shapes with computed fields like role, counts, names, and related titles.

#### `src/server/`
- `index.ts`
  - Express server bootstrap.
  - Mounts `/api/public`.
  - Serves static build artifacts from `dist/`.
  - Falls back to `index.html` for SPA routes.
- `prisma.ts`
  - Prisma client creation using Neon adapter and `DATABASE_URL`.

##### `src/server/public/`
- `index.ts`
  - Composes the protected routers under `/api/public`.
  - Mounts the protected standalone grader at `/api/public/grade`.
- `auth.ts`
  - Bearer-token auth middleware.
  - Verifies JWTs against Neon JWKs.
  - Requires an existing `public.user_profile` created by database sync.
- `common.ts`
  - Shared request parsing, pagination, UUID validation, auth context typing, and error helpers.
- `grader.ts`
  - Protected OpenAI grading implementation used by `/api/public/grade` and assignment progress grading.
  - Contains:
    - Zod request/response validation.
    - JSON-schema constrained model output.
    - prompt-injection hardening.
    - retry/fix-up pass for malformed JSON.
  - Default model is `gpt-4o-mini` unless `OPENAI_MODEL` is set.
- `scopes.ts`
  - Prisma `where` helpers for classroom-, assignment-, attempt-, and response-level access control.
- `classrooms.ts`
  - Classroom listing, detail lookup, creation, and join-by-code behavior.
  - Classroom creation auto-creates an instructor membership.
  - Join flow adds the user as a student if not already enrolled.
- `classroomMembers.ts`
  - Lists classroom memberships visible to the requester.
- `scenarios.ts`
  - Owned-scenario CRUD surface for drafts.
  - Supports:
    - list owned scenarios
    - fetch one owned scenario
    - create/update draft (`draft_content`)
    - delete scenario if no published version has assignments
- `scenarioVersions.ts`
  - Lists published versions for the authenticated user's scenarios.
- `scenarioTemplates.ts`
  - Discovers JSON templates in `public/scenarios` or `dist/scenarios`.
- `assignments.ts`
  - Assignment listing, detail lookup, creation, and student attempt-session startup.
  - Key behavior:
    - instructors can assign either an existing published version or a draft scenario
    - assigning a draft auto-publishes a new immutable `scenario_version`
    - students opening an assignment get an existing in-progress attempt or a new attempt
    - the response includes assignment metadata, attempt metadata, prior responses, and published scenario content
- `attempts.ts`
  - Attempt listing, detail lookup, and persisted attempt progress updates.
  - Key behavior:
    - validates that the requester owns the attempt as a student
    - re-parses the published scenario document on each progress request
    - advances start/text/video nodes without storing a response
    - stores choice and free-response payloads into `response`
    - grades free responses synchronously through OpenAI
    - marks attempts `submitted` when no next node exists
- `responses.ts`
  - Lists and fetches stored node-level responses for accessible attempts.

#### `src/pages/`

##### `src/pages/home/`
- `HomePage.tsx`
  - Session-aware home switch between guest and authenticated views.
- `LoginPage.tsx`
  - Email/password login.
  - Handles verification-required and verification-success query states.
- `SignupPage.tsx`
  - Email/password account creation with email verification.
- `SettingsPage.tsx`
  - Routed settings shell.
  - Currently only theme toggle is functionally wired; account, password, notification, accessibility, and delete-account controls are mostly placeholders.
- `hooks/`
  - `homeDashboardData.types.ts`
    - View-model types for the authenticated dashboard.
  - `useHomeDashboardData.ts`
    - Aggregates classrooms, attempts, scenarios, and session state into dashboard content.
- `views/`
  - `GuestHome.tsx`
    - Marketing-style landing page for signed-out users.
  - `AuthenticatedHome.tsx`
    - Dashboard showing action buttons, continue-work card, and classroom list.

##### `src/pages/classroom/`
- `ClassroomListPage.tsx`
  - Lists classrooms the viewer belongs to.
- `ClassroomCreatePage.tsx`
  - Instructor flow for classroom creation.
- `ClassroomJoinPage.tsx`
  - Student flow for classroom-code join.
- `ClassroomPage.tsx`
  - Classroom-level switch between instructor and student views.
- `AssignmentPage.tsx`
  - Assignment summary plus attempts list.
- `AssignmentRunnerPage.tsx`
  - Fetches attempt session data and runs `ScenarioViewer` in assignment mode.
- `AttemptPage.tsx`
  - Attempt summary plus response list.
- `ResponsePage.tsx`
  - Full detail view for a single stored response.
- `classroomMutations.ts`
  - Frontend mutations for classroom create/join.
- `hooks/`
  - `useClassroomData.ts`
    - View-model composition for classroom, assignment, attempt, and response pages.
- `views/`
  - `InstructorClassroom.tsx`
    - Instructor dashboard with assignments and students tabs.
    - Opens `AssignScenarioModal`.
  - `StudentClassroom.tsx`
    - Student classroom view showing assignment list and instructors.
- `components/`
  - `AssignScenarioModal.tsx`
    - Search/select UI for draft scenarios and published versions.
    - Sends assignment-create requests and captures scheduling, instructions, and attempt limit.
  - `ClassroomRow.tsx`
    - Reusable classroom list row.
  - `InstructorAssignmentCard.tsx`
    - Instructor assignment summary card.
  - `AssignmentSummaryCard.tsx`
    - Shared assignment metadata summary.
  - `StudentProgressCard.tsx`
    - Student-specific assignment status and start/resume controls.
  - `AttemptList.tsx`
    - Attempt table/list.
  - `AttemptSummaryCard.tsx`
    - Attempt metadata summary.
  - `ResponseList.tsx`
    - Response table/list.
  - `ResponseDetailCard.tsx`
    - Detailed stored-response display.

##### `src/pages/scenario/`
- `nodeSchemas.ts`
  - Zod schemas for the five current node types:
    - `start`
    - `text`
    - `video`
    - `choice`
    - `free_response`
- `scenarioSchemas.ts`
  - Zod schema for whole scenario documents.
  - Defines node edges and layout records.
  - Contains traversal helpers such as `getScenarioNode()` and `getNextNodeIdForScenarioNode()`.
- `nodeRegistry.ts`
  - Generic registry typing utilities used to bind schemas, cards, tabs, scenes, and factories together.
- `nodes.ts`
  - Concrete node registry.
  - The single place where node type is mapped to:
    - schema
    - runtime scene
    - editor card
    - editor tab
    - node factory
- `ScenarioLibraryPage.tsx`
  - Scenario library view for drafts and published versions.
  - Supports scenario deletion and links to editor/test run.
- `ScenarioNewPage.tsx`
  - Boots the editor with a fresh starter document.
- `ScenarioEditorPage.tsx`
  - Loads a persisted scenario draft into the editor.
- `ScenarioTestRunPage.tsx`
  - Loads a persisted draft into the runtime viewer for local test runs.
- `hooks/`
  - `useScenarioPageData.ts`
    - Converts stored draft JSON into validated scenario documents or starter documents.

###### `src/pages/scenario/creator/`
- `ScenarioCreator.tsx`
  - Main scenario editor.
  - Uses React Flow as the canvas.
  - Uses reducer state as the source of truth.
  - Supports:
    - title editing
    - node insertion
    - node inspection
    - edge creation/replacement
    - auto layout
    - JSON download
    - template/file import
    - backend draft sync
    - test-run navigation
    - unsaved-change tracking
- `Creator.css`
  - Creator-specific styles.
- `ScenarioCreatorCallbacks.ts`
  - Adapters between React Flow change events and reducer actions.
  - Enforces single outgoing edge per node handle.
- `starterScenario.ts`
  - Creates the initial single-start-node scenario document.
- `scenarioImport.ts`
  - Loads/imports/validates scenario JSON and converts documents into React Flow nodes/edges.
- `autoLayout.ts`
  - Dagre-based left-to-right layout helper for the editor graph.
- `DownloadJson.ts`
  - Browser download helper for scenario export.
- `editor-store/`
  - `EditorStore.ts`
    - Reducer and actions for scenario editing state.
  - `EditorDispatchContext.tsx`
    - Dispatch context/provider hook for child editor components.
- `ui/`
  - `CreatorTopBar.tsx`
    - Top toolbar and menu integration.
  - `NodeAddPanel.tsx`
    - Palette of addable node types.
  - `NodeEditorPanel.tsx`
    - Resizable side panel for editing the selected node.
  - `menus/`
    - `FileMenu.tsx`
      - New/open/import/save/test/download commands.
    - `EditMenu.tsx`
      - Edit menu shell.
    - `ViewMenu.tsx`
      - Zoom/layout commands.
    - `HelpMenu.tsx`
      - Tutorial/help entry points.
    - `MenuDropdown.tsx`
      - Shared dropdown primitive.
    - `TemplateImportModal.tsx`
      - Modal that lists backend-discovered templates from `public/scenarios`.
    - `menuTypes.ts`
      - Shared menu action typings.
- `cards/`
  - React Flow node renderers for creator canvas nodes.
  - `Start.Card.tsx`
  - `Text.Card.tsx`
  - `Video.Card.tsx`
  - `Choice.Card.tsx`
  - `FreeResponse.Card.tsx`
  - `NodeCardFrame.tsx`
    - Shared shell with inspection and delete affordances.
  - `Cards.ts`
    - Card-export utility module.
- `tabs/`
  - Inspector/editor forms for each node type.
  - `Start.Tab.tsx`
  - `Text.Tab.tsx`
  - `Video.Tab.tsx`
  - `Choice.Tab.tsx`
  - `FreeResponse.Tab.tsx`
  - `NodeDispatchFields.tsx`
    - Common field wiring for reducer-backed updates.
  - `TabRenderer.tsx`
    - Registry-based tab dispatch.
  - `tabStyles.ts`
    - Shared tab styling helpers.

###### `src/pages/scenario/viewer/`
- `ScenarioViewer.tsx`
  - Scenario runtime component.
  - Supports two modes:
    - local mode for test runs and template URLs
    - persisted assignment mode using `/api/public/attempts/:id/progress`
  - Handles feedback modal display for graded free-response nodes.
- `viewerTypes.ts`
  - Runtime event and scene prop types.
- `scenes/`
  - `SceneRenderer.tsx`
    - Registry-based runtime scene dispatch.
  - `Start.Scene.tsx`
    - Runtime UI for `start`.
  - `Text.Scene.tsx`
    - Runtime UI for `text`.
  - `Video.Scene.tsx`
    - Runtime UI for `video`.
  - `Choice.Scene.tsx`
    - Runtime UI for `choice`.
  - `FreeResponse.Scene.tsx`
    - Runtime UI for `free_response`.
  - `FreeResponseGrader.ts`
    - Direct `/api/public/grade` client used for local, non-assignment runs.
  - `sceneUi.tsx`
    - Shared runtime scene UI helpers.

## 4. Current Domain Model

### Application tables in `public`
- `user_profile`
  - App-facing user identity keyed to Neon auth user id.
- `classroom`
  - Classroom shell created by an instructor; includes unique join code.
- `classroom_member`
  - Membership relation with role `instructor` or `student`.
- `scenario`
  - Mutable draft head owned by an instructor.
  - Stores `draft_content` JSON and `latest_version_number`.
- `scenario_version`
  - Immutable published snapshot of a scenario draft.
- `assignment`
  - Binds a classroom to a scenario version with title, instructions, open/due/close dates, and optional attempt limit.
- `attempt`
  - Student run state for a single assignment attempt.
  - Tracks `current_node_id`, `status`, timestamps, and attempt number.
- `response`
  - Node-level persisted answer/feedback record for an attempt.

### Auth/session tables in `neon_auth`
- `user`
- `account`
- `session`
- `jwks`
- `verification`
- `organization`
- `member`
- `invitation`
- `project_config`

These are not EduPulse feature tables, but the app depends on them for JWT verification and auth-user bootstrap.
