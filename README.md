# EduPulse demo + AI rubric grader

This Vite + React project ships with a small Express server (in `src/server/`) that calls OpenAI to grade responses. The UI in `src/App.tsx` is purely frontend; it talks to the local Express endpoint during development.

## What’s in the box
- Frontend demo: `src/App.tsx`, styles `src/App.css`, shared types `src/types/grader.ts`.
- Backend (local-only): `src/server/index.ts`, prompt helpers `src/server/prompt.ts`, schemas `src/server/graderSchemas.ts`.
- Vite proxy: `vite.config.ts` proxies `/grade` → `http://localhost:8787` in dev so the frontend can call the backend without CORS issues.

## Quick start (local demo)
- Prereq: Node 20+, set `OPENAI_API_KEY` (`$env:OPENAI_API_KEY="..."` in PowerShell). Optional: `OPENAI_MODEL` (default `gpt-4o-mini`).
- Install deps: `npm install`
- Start backend: `npm run dev:server` (listens on http://localhost:8787)
- Start frontend: `npm run dev` (http://localhost:5173; calls `/grade` via proxy)
- Open the app, edit the fields, click “Grade response”.

## API: POST /grade (served by Express; frontend-only app calls it locally)
- Input JSON:
  - `question_prompt` (string)
  - `user_response_text` (string)
  - `rubric`: `{ context?: string, version?: number, answerBuckets: [{ id: string, classifier: string, toNode?: string }] }`
    - `id` of each bucket represents the grade (expect 0–100 as string/number). `toNode` is ignored for grading.
- Output JSON (strict schema):
  - `bucket_id` (string): id of the selected answer bucket
  - `feedback` (string): concise explanation of what’s missing relative to the best bucket/classifier

### Example request
```json
{
  "question_prompt": "Explain photosynthesis to a 10-year-old.",
  "user_response_text": "Plants use sunlight to make sugar. Leaves take in light and air, roots bring water, and the plant makes food to grow.",
  "rubric": {
    "version": 1,
    "context": "Explain photosynthesis to a 10-year-old.",
    "answerBuckets": [
      {
        "id": "1",
        "classifier": "Good Answer. plants take sunlight, use that sunlight and water and nutrients to make sugar, and break down that sugar to make energy."
      },
      {
        "id": "2",
        "classifier": "Partial Answer. Mentions sunlight and water but misses sugar/energy or is unclear."
      },
      { "id": "3", "classifier": "Off-topic or mostly incorrect." }
    ]
  }
}
```

### Example response
```json
{
  "bucket_id": "75",
  "feedback": "Mostly clear; missing explicit mention of carbon dioxide intake and oxygen release. Consider adding a kid-friendly analogy."
}
```

### Curl test (hits backend directly)
```bash
curl -X POST http://localhost:8787/grade \
  -H "Content-Type: application/json" \
  -d @/path/to/sample-body.json
```

## How grading works (backend)
- Rubric is defined by `answerBuckets` (id + classifier). Model picks the single best bucket; bucket `id` is returned. `toNode` and outer rubric `id` are ignored for grading.
- System prompt: exacting grader; temperature 0.2.
- Uses OpenAI `response_format` with strict JSON schema; if parsing fails, a second “fix JSON to schema” call is attempted.
- Server validates that `bucket_id` exists in the rubric; otherwise defaults to the first bucket. Feedback is whatever the model returns (must be present).

## File map
- Frontend demo: `src/App.tsx`, `src/App.css`, `src/types/grader.ts`
- Backend (local service): `src/server/index.ts`, `src/server/prompt.ts`, `src/server/graderSchemas.ts`
- Scenario graph schemas (unchanged, still use answerBuckets/toNode for routing): `src/scenario/viewer/scenarioNodeSchemas.ts`
- Vite proxy: `vite.config.ts`
