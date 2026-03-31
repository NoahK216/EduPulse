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
  PublicUser,
} from "../types/publicApi";

import { useApiData, type ApiState } from "./useApiData";
import { toUuidOrNull } from "./uuid";

type ValidatedIdState = {
  id: string | null;
  hasValidId: boolean;
  invalidId: boolean;
};

type CollectionState<T> = ApiState<PagedResponse<T>> & {
  items: T[];
  total: number;
  page: number | null;
  pageSize: number | null;
};

type IdBoundItemState<T> = ApiState<ItemResponse<T>> &
  ValidatedIdState & {
    item: T | null;
  };

type IdBoundCollectionState<T> = CollectionState<T> & ValidatedIdState;

export type CurrentUserState = ApiState<ItemResponse<PublicUser>> & {
  user: PublicUser | null;
};

export type ClassroomState = IdBoundItemState<PublicClassroom>;
export type ClassroomsState = CollectionState<PublicClassroom>;
export type AssignmentState = IdBoundItemState<PublicAssignment>;
export type AssignmentsState = CollectionState<PublicAssignment>;
export type AttemptState = IdBoundItemState<PublicAttempt>;
export type ResponseState = IdBoundItemState<PublicResponse>;
export type ScenarioState = IdBoundItemState<PublicScenario>;
export type ClassroomMembersState =
  IdBoundCollectionState<PublicClassroomMember>;
export type ClassroomMembershipsState = CollectionState<PublicClassroomMember>;
export type ClassroomAssignmentsState =
  IdBoundCollectionState<PublicAssignment>;
export type AssignmentAttemptsState = IdBoundCollectionState<PublicAttempt>;
export type AttemptResponsesState = IdBoundCollectionState<PublicResponse>;
export type ScenariosState = CollectionState<PublicScenario>;
export type ScenarioVersionsState = CollectionState<PublicScenarioVersion>;
export type AttemptsState = CollectionState<PublicAttempt>;

export type ClassroomMemberState = ApiState<
  ItemResponse<PublicClassroomMember>
> & {
  item: PublicClassroomMember | null;
};

type AttemptsQuery = {
  assignmentId?: string;
  classroomId?: string;
  pageSize?: number;
};

type AssignmentsQuery = {
  classroomId?: string;
  pageSize?: number;
};

function resolveValidatedId(
  value: string | null | undefined,
): ValidatedIdState {
  const id = toUuidOrNull(value);

  return {
    id,
    hasValidId: id !== null,
    invalidId: value !== null && typeof value !== "undefined" && id === null,
  };
}

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
  validatedId: ValidatedIdState,
): IdBoundItemState<T> {
  const state = useApiData<ItemResponse<T>>(path);

  return {
    ...state,
    ...validatedId,
    item: state.data?.item ?? null,
  };
}

function useCollectionResource<T>(path: string | null): CollectionState<T> {
  const state = useApiData<PagedResponse<T>>(path);

  return {
    ...state,
    items: state.data?.items ?? [],
    total: state.data?.total ?? 0,
    page: state.data?.page ?? null,
    pageSize: state.data?.pageSize ?? null,
  };
}

function useIdBoundCollectionResource<T>(
  path: string | null,
  validatedId: ValidatedIdState,
): IdBoundCollectionState<T> {
  const state = useCollectionResource<T>(path);

  return {
    ...state,
    ...validatedId,
  };
}

export function useCurrentUser(): CurrentUserState {
  const state = useApiData<ItemResponse<PublicUser>>("/api/public/me");

  return {
    ...state,
    user: state.data?.item ?? null,
  };
}

export function useClassroom(
  classroomId: string | null | undefined,
): ClassroomState {
  const validatedId = resolveValidatedId(classroomId);
  const path = validatedId.id
    ? `/api/public/classrooms/${validatedId.id}`
    : null;

  return useItemResource<PublicClassroom>(path, validatedId);
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
  const validatedId = resolveValidatedId(classroomId);
  const path = validatedId.id
    ? buildPath("/api/public/classroom-members", {
        classroomId: validatedId.id,
        pageSize,
      })
    : null;

  return useIdBoundCollectionResource<PublicClassroomMember>(path, validatedId);
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

export function useClassroomMember(
  classroomId: string | null | undefined,
  userId: string | null | undefined,
): ClassroomMemberState {
  const validatedUserId = resolveValidatedId(userId);
  const validatedClassroomId = resolveValidatedId(classroomId);

  const path =
    validatedUserId.hasValidId && validatedClassroomId.hasValidId
      ? `/api/public/classroom-members/${validatedClassroomId.id}/${validatedUserId.id}`
      : null;
  const state = useApiData<ItemResponse<PublicClassroomMember>>(path);

  return {
    ...state,
    item: state.data?.item ?? null,
  };
}

export function useClassroomAssignments(
  classroomId: string | null | undefined,
  pageSize = 100,
): ClassroomAssignmentsState {
  const validatedId = resolveValidatedId(classroomId);
  const path = validatedId.id
    ? buildPath("/api/public/assignments", {
        classroomId: validatedId.id,
        pageSize,
      })
    : null;

  return useIdBoundCollectionResource<PublicAssignment>(path, validatedId);
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
  const validatedId = resolveValidatedId(assignmentId);
  const path = validatedId.id
    ? `/api/public/assignments/${validatedId.id}`
    : null;

  return useItemResource<PublicAssignment>(path, validatedId);
}

export function useAssignmentAttempts(
  assignmentId: string | null | undefined,
  pageSize = 100,
): AssignmentAttemptsState {
  const validatedId = resolveValidatedId(assignmentId);
  const path = validatedId.id
    ? buildPath("/api/public/attempts", {
        assignmentId: validatedId.id,
        pageSize,
      })
    : null;

  return useIdBoundCollectionResource<PublicAttempt>(path, validatedId);
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
  const validatedId = resolveValidatedId(attemptId);
  const path = validatedId.id ? `/api/public/attempts/${validatedId.id}` : null;

  return useItemResource<PublicAttempt>(path, validatedId);
}

export function useAttemptResponses(
  attemptId: string | null | undefined,
  pageSize = 100,
): AttemptResponsesState {
  const validatedId = resolveValidatedId(attemptId);
  const path = validatedId.id
    ? buildPath("/api/public/responses", {
        attemptId: validatedId.id,
        pageSize,
      })
    : null;

  return useIdBoundCollectionResource<PublicResponse>(path, validatedId);
}

export function useResponse(
  responseId: string | null | undefined,
): ResponseState {
  const validatedId = resolveValidatedId(responseId);
  const path = validatedId.id
    ? `/api/public/responses/${validatedId.id}`
    : null;

  return useItemResource<PublicResponse>(path, validatedId);
}

export function useScenario(
  scenarioId: string | null | undefined,
): ScenarioState {
  const validatedId = resolveValidatedId(scenarioId);
  const path = validatedId.id
    ? `/api/public/scenarios/${validatedId.id}`
    : null;

  return useItemResource<PublicScenario>(path, validatedId);
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
