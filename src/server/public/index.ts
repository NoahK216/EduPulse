import express from 'express';

import { requireSession } from './auth.js';
import { createPublicAssignmentsRouter } from './assignments.js';
import { createPublicAttemptsRouter } from './attempts.js';
import { createPublicClassroomMembersRouter } from './classroomMembers.js';
import { createPublicClassroomsRouter } from './classrooms.js';
import { createPublicResponsesRouter } from './responses.js';
import { createPublicScenariosRouter } from './scenarios.js';
import { createPublicScenarioVersionsRouter } from './scenarioVersions.js';
import { createPublicUsersRouter } from './users.js';

export function createPublicRouter() {
  const router = express.Router();

  router.use(requireSession);
  router.use('/users', createPublicUsersRouter());
  router.use('/classrooms', createPublicClassroomsRouter());
  router.use('/classroom-members', createPublicClassroomMembersRouter());
  router.use('/scenarios', createPublicScenariosRouter());
  router.use('/scenario-versions', createPublicScenarioVersionsRouter());
  router.use('/assignments', createPublicAssignmentsRouter());
  router.use('/attempts', createPublicAttemptsRouter());
  router.use('/responses', createPublicResponsesRouter());

  return router;
}
