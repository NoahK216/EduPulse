import express from 'express';
import type OpenAI from 'openai';

import { requireAuthToken } from "./auth.js";
import { createPublicAssignmentsRouter } from "./assignments.js";
import { createPublicAttemptsRouter } from "./attempts.js";
import { createPublicClassroomMembersRouter } from "./classroomMembers.js";
import { createPublicClassroomsRouter } from "./classrooms.js";
import { createPublicResponsesRouter } from "./responses.js";
import { createPublicScenariosRouter } from "./scenarios.js";
import { createPublicScenarioTemplatesRouter } from "./scenarioTemplates.js";
import { createPublicScenarioVersionsRouter } from "./scenarioVersions.js";
import { createPublicMeRouter } from "./users.js";

export function createPublicRouter(openai: OpenAI) {
  const router = express.Router();

  router.use(requireAuthToken);
  router.use("/me", createPublicMeRouter());
  router.use("/classrooms", createPublicClassroomsRouter());
  router.use("/classroom-members", createPublicClassroomMembersRouter());
  router.use("/scenarios", createPublicScenariosRouter());
  router.use("/scenario-templates", createPublicScenarioTemplatesRouter());
  router.use("/scenario-versions", createPublicScenarioVersionsRouter());
  router.use("/assignments", createPublicAssignmentsRouter());
  router.use("/attempts", createPublicAttemptsRouter(openai));
  router.use("/responses", createPublicResponsesRouter());

  return router;
}
