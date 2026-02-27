# EduPulse Delivery Plan

## Timeline
This plan assumes work starts on February 27, 2026 and finishes in 6 weeks.

- Iteration 4: February 27 to March 12, 2026
- Iteration 5: March 12 to March 26, 2026
- Iteration 6: March 27 to April 9, 2026

Feature freeze should happen by April 4, 2026. April 5 to April 8 should be stabilization only.

## MVP Definition
By the end of 6 weeks, EduPulse should support this complete flow:

1. Instructor signs in with Microsoft.
2. Instructor creates or edits a scenario and saves it.
3. Instructor creates a classroom and assigns a scenario.
4. Student signs in and sees assigned work.
5. Student completes the scenario.
6. Responses and AI grading are saved.
7. Instructor can see completion and submission status.

## Scope Rules
- Build a single React + Express + Postgres application.
- Support only `student` and `instructor` roles in the product UI.
- Use Microsoft OAuth only. Do not build email/password auth.
- Keep the current scenario engine and store scenario content as JSON/JSONB.
- Leave out admin tools, analytics dashboards, notifications, and real-time collaboration.

## Iteration 4: Foundation
### Goal
Get the platform skeleton working end to end.

### Deliverables
- Finalize MVP scope and explicitly cut non-core features.
- Add database schema and migrations for:
  - `users`
  - `memberships`
  - `classrooms`
  - `classroom_members`
  - `scenarios`
  - `scenario_versions`
  - `assignments`
  - `attempts`
  - `responses`
- Implement Microsoft OAuth and app session handling.
- Replace the placeholder login and signup pages with real authentication flow.
- Add protected routes and role-based route guards.
- Save and load scenarios from the backend.
- Seed one instructor, one classroom, and at least two students for demo use.

### Definition Of Done
- Instructor and student can sign in with Microsoft.
- Session persists across refresh.
- Instructor can save and reload a scenario from the database.
- Student and instructor land on different dashboard views.
- No one is using the old fake login flow anymore.

## Iteration 5: Classroom And Assignment Flow
### Goal
Make the classroom workflow real.

### Deliverables
- Instructor can create a classroom.
- Instructor can add students to a classroom.
- Instructor can publish a scenario version.
- Instructor can assign a published scenario to a classroom.
- Student sees assigned, in-progress, and completed work.
- Starting an assignment creates an attempt.
- Scenario viewer loads from an assignment, not from demo JSON.
- Node responses are persisted as the student progresses.

### Definition Of Done
- Instructor can publish and assign a scenario.
- Student can open an assigned scenario and progress through it.
- Refreshing the browser does not lose progress.
- Students cannot access instructor views or other students' work.

## Iteration 6: Completion And Hardening
### Goal
Make the product demoable and stable.

### Deliverables
- Persist free-response grading results with attempt and response records.
- Show basic feedback and results to the student.
- Give instructors a simple submissions and completion view.
- Add error handling for:
  - auth failures
  - missing assignments
  - failed grading
  - invalid sessions
- Add smoke tests for the two critical flows:
  - instructor creates, publishes, and assigns a scenario
  - student completes a scenario
- Deploy a staging or demo build.
- Populate demo data for the final presentation.

### Definition Of Done
- Full instructor-to-student flow works without manual database edits.
- AI grading is stored and shown in the UI.
- A clean demo path exists from login to assignment completion.
- The final 4 to 5 days are focused mostly on bug fixing, not new features.

## What To Cut If The Team Slips
Cut in this order:

1. Rich classroom UX and polish
2. Anything related to analytics or admin tooling
3. Rich scenario management tools beyond save, publish, and assign
4. Instructor grade overrides

## Iteration Checkpoints
### End Of Iteration 4
- Auth works
- Dashboards exist
- Scenario persistence works
- Database shape is stable enough to build on

### End Of Iteration 5
- Classroom creation works
- Assignment flow works
- Students can launch and resume assigned scenarios

### End Of Iteration 6
- Grading is persisted
- Instructor can review submissions
- Demo deployment is stable
- The project is presentation-ready
