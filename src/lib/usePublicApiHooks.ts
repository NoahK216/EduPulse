import type {
  ItemResponse,
  PagedResponse,
  PublicAssignment,
  PublicAttempt,
  PublicClassroom,
  PublicClassroomMember,
  PublicResponse,
  PublicScenario,
  PublicScenarioVersion,
  CurrentUserProfile,
} from "../types/publicApi";

import { useApiData, type ApiState } from "./useApiData";
import { toUuidOrNull } from "./uuid";

type CollectionState<T> = ApiState<PagedResponse<T>> & {
  items: T[];
};

type ItemState<T> = ApiState<ItemResponse<T>> & {
  item: T | null;
};

export type CurrentUserState = ApiState<ItemResponse<CurrentUserProfile>> & {
  user: CurrentUserProfile | null;
};

export type ClassroomState = ItemState<PublicClassroom>;
export type ClassroomsState = CollectionState<PublicClassroom>;
export type AssignmentState = ItemState<PublicAssignment>;
export type AssignmentsState = CollectionState<PublicAssignment>;
export type AttemptState = ItemState<PublicAttempt>;
export type ResponseState = ItemState<PublicResponse>;
export type ScenarioState = ItemState<PublicScenario>;
export type ClassroomMembersState = CollectionState<PublicClassroomMember>;
export type ClassroomMembershipsState = CollectionState<PublicClassroomMember>;
export type ClassroomAssignmentsState = CollectionState<PublicAssignment>;
export type AssignmentAttemptsState = CollectionState<PublicAttempt>;
export type AttemptResponsesState = CollectionState<PublicResponse>;
export type ScenariosState = CollectionState<PublicScenario>;
export type ScenarioVersionsState = CollectionState<PublicScenarioVersion>;
export type AttemptsState = CollectionState<PublicAttempt>;

type AttemptsQuery = {
  assignmentId?: string;
  classroomId?: string;
  pageSize?: number;
};

type AssignmentsQuery = {
  classroomId?: string;
  pageSize?: number;
};

function buildPath(
  basePath: string,
  query?: Record<string, string | number | null | undefined>,
): string {
  if (!query) {
    return basePath;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || typeof value === "undefined") {
      return;
    }

    params.set(key, String(value));
  });

  const search = params.toString();
  return search.length > 0 ? `${basePath}?${search}` : basePath;
}

function useItemResource<T>(
  path: string | null,
): ItemState<T> {
  const state = useApiData<ItemResponse<T>>(path);

  return {
    ...state,
    item: state.data?.item ?? null,
  };
}

function useCollectionResource<T>(path: string | null): CollectionState<T> {
  const state = useApiData<PagedResponse<T>>(path);

  return {
    ...state,
    items: state.data?.items ?? [],
  };
}

export function useCurrentUser(): CurrentUserState {
  const state = useApiData<ItemResponse<CurrentUserProfile>>("/api/public/me");

  return {
    ...state,
    user: state.data?.item ?? null,
  };
}

export function useClassroom(
  classroomId: string | null | undefined,
): ClassroomState {
  const validClassroomId = toUuidOrNull(classroomId);
  const path = validClassroomId ? `/api/public/classrooms/${validClassroomId}` : null;

  return useItemResource<PublicClassroom>(path);
}

export function useClassrooms(pageSize?: number): ClassroomsState {
  return useCollectionResource<PublicClassroom>(
    buildPath("/api/public/classrooms", {
      pageSize,
    }),
  );
}

export function useClassroomMembers(
  classroomId: string | null | undefined,
  pageSize = 100,
): ClassroomMembersState {
  const validClassroomId = toUuidOrNull(classroomId);
  const path = validClassroomId
    ? buildPath("/api/public/classroom-members", {
        classroomId: validClassroomId,
        pageSize,
      })
    : null;

  return useCollectionResource<PublicClassroomMember>(path);
}

export function useClassroomMemberships(
  pageSize = 100,
): ClassroomMembershipsState {
  return useCollectionResource<PublicClassroomMember>(
    buildPath("/api/public/classroom-members", {
      pageSize,
    }),
  );
}

export function useClassroomAssignments(
  classroomId: string | null | undefined,
  pageSize = 100,
): ClassroomAssignmentsState {
  const validClassroomId = toUuidOrNull(classroomId);
  const path = validClassroomId
    ? buildPath("/api/public/assignments", {
        classroomId: validClassroomId,
        pageSize,
      })
    : null;

  return useCollectionResource<PublicAssignment>(path);
}

export function useAssignments(
  query?: AssignmentsQuery | null,
): AssignmentsState {
  const path = query
    ? buildPath("/api/public/assignments", {
        classroomId: query.classroomId,
        pageSize: query.pageSize,
      })
    : null;

  return useCollectionResource<PublicAssignment>(path);
}

export function useAssignment(
  assignmentId: string | null | undefined,
): AssignmentState {
  const validAssignmentId = toUuidOrNull(assignmentId);
  const path = validAssignmentId
    ? `/api/public/assignments/${validAssignmentId}`
    : null;

  return useItemResource<PublicAssignment>(path);
}

export function useAssignmentAttempts(
  assignmentId: string | null | undefined,
  pageSize = 100,
): AssignmentAttemptsState {
  const validAssignmentId = toUuidOrNull(assignmentId);
  const path = validAssignmentId
    ? buildPath("/api/public/attempts", {
        assignmentId: validAssignmentId,
        pageSize,
      })
    : null;

  return useCollectionResource<PublicAttempt>(path);
}

export function useAttempts(query?: AttemptsQuery | null): AttemptsState {
  const path = query
    ? buildPath("/api/public/attempts", {
        assignmentId: query.assignmentId,
        classroomId: query.classroomId,
        pageSize: query.pageSize,
      })
    : null;

  return useCollectionResource<PublicAttempt>(path);
}

export function useAttempt(attemptId: string | null | undefined): AttemptState {
  const validAttemptId = toUuidOrNull(attemptId);
  const path = validAttemptId ? `/api/public/attempts/${validAttemptId}` : null;

  return useItemResource<PublicAttempt>(path);
}

export function useAttemptResponses(
  attemptId: string | null | undefined,
  pageSize = 100,
): AttemptResponsesState {
  const validAttemptId = toUuidOrNull(attemptId);
  const path = validAttemptId
    ? buildPath("/api/public/responses", {
        attemptId: validAttemptId,
        pageSize,
      })
    : null;

  return useCollectionResource<PublicResponse>(path);
}

export function useResponse(
  responseId: string | null | undefined,
): ResponseState {
  const validResponseId = toUuidOrNull(responseId);
  const path = validResponseId ? `/api/public/responses/${validResponseId}` : null;

  return useItemResource<PublicResponse>(path);
}

export function useScenario(
  scenarioId: string | null | undefined,
): ScenarioState {
  const validScenarioId = toUuidOrNull(scenarioId);
  const path = validScenarioId ? `/api/public/scenarios/${validScenarioId}` : null;

  return useItemResource<PublicScenario>(path);
}

export function useScenarios(pageSize = 100): ScenariosState {
  return useCollectionResource<PublicScenario>(
    buildPath("/api/public/scenarios", {
      pageSize,
    }),
  );
}

export function useScenarioVersions(pageSize = 100): ScenarioVersionsState {
  return useCollectionResource<PublicScenarioVersion>(
    buildPath("/api/public/scenario-versions", {
      pageSize,
    }),
  );
}
