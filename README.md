# EduPulse code map (plain and simple)

This repo is a small Vite + React demo that drives a local Express API to grade free‑response answers with OpenAI. Everything you’re likely to touch is listed below.

## Run it locally
- Requirements: Node 20+, `OPENAI_API_KEY` in your env. Optional: `OPENAI_MODEL` (default `gpt-4o-mini`).
- Install: `npm install`
- Start backend: `npm run dev:server` (Express on http://localhost:8787)
- Start frontend: `npm run dev` (Vite on http://localhost:5173; proxy forwards `/grade` to the backend)

## Where things live
- Frontend entry + routing: `src/main.tsx` (routes `/` and `/scenario` → scenario demo, `/grader` → simple landing).
- Scenario UI: `src/scenario/viewer/`  
  - Node registry: `src/scenario/viewer/NodeRenderer.tsx` (add new node types here).  
  - Built-in nodes: `renderers/VideoNodeRenderer.tsx`, `renderers/ChoiceNodeRenderer.tsx`, `renderers/FreeResponseNodeRenderer.tsx`.  
  - Types/schemas: `scenarioNodeSchemas.ts`, `scenarioTypes.ts`.
- Scenario content (what the user sees): JSON files under `public/scenarios/` (demo is `public/scenarios/demo.json`). Video and assets in `public/`.
- Backend API: `src/server/index.ts` (Express `POST /grade` endpoint).
- Grading + prompts: `src/server/grader.ts` (system prompt, user prompt builder, JSON schema, OpenAI call).
- Shared types: `src/types/grader.ts`.
- Vite proxy config: `vite.config.ts`.

## How to change AI behavior
- Change grading rubric per scenario: edit `rubric.answerBuckets` inside the scenario JSON (e.g., `public/scenarios/demo.json`).
- Change the grader’s instructions/voice: update `graderSystemPrompt` or `buildGradeUserPrompt` in `src/server/grader.ts`.
- Change the model: set `OPENAI_MODEL` env var (default `gpt-4o-mini`). Temperature is set in `callModel` (`temperature: 0.2`).
- Adjust response schema/fields: edit `gradeResultSchema` and `gradeResultJsonSchema` in `src/server/grader.ts` (keep server/client in sync).

## Common edits for programmers
- New scenario step or flow: add a node in `public/scenarios/*.json`, matching the schemas in `scenarioNodeSchemas.ts`.
- New node type or UI treatment: create a renderer in `src/scenario/viewer/renderers/`, then register it in `NodeRenderer.tsx`.
- Frontend styling: `src/index.css`, `src/App.css`, plus `src/scenario/viewer/Scenario.css` for scenario components.
- Backend tweaks (logging, validation, retries): `src/server/index.ts` and `src/server/grader.ts`.

## Quick API reference
- Endpoint: `POST /grade`
- Body: `{ question_prompt: string, user_response_text: string, rubric: { context: string, answerBuckets: [{ id, classifier, toNode? }], ... } }`
- Response: `{ bucket_id: string, feedback: string }` (feedback is concise text from the model).

## Notes
- The frontend expects the backend running locally; deploys will need CORS/proxy changes.
- `dist/` is build output; `node_modules/` is deps—no edits needed there.
