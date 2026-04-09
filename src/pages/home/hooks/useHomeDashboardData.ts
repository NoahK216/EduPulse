import { authClient } from "../../../lib/auth-client";
import {
  useAttempts,
  useClassrooms,
  useScenarios,
} from "../../../lib/usePublicApiHooks";

import type {
  PublicAttempt,
  PublicClassroom,
  PublicClassroomRole,
  PublicScenario,
} from "../../../types/publicApi";

import type {
  DashboardAction,
  DashboardContinueWork,
  HomeDashboardData,
} from "./homeDashboardData.types";
import type { DataGuardState } from "../../../components/data/DataGuard";

export type {
  DashboardAction,
  DashboardContinueWork,
  DashboardTone,
  HomeDashboardData,
} from "./homeDashboardData.types";

const CONTENT_GUARD: DataGuardState = { kind: "content" };

type GuardSource = {
  unauthorized: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

type ClassroomRoleSummary = {
  activeRoles: PublicClassroomRole[];
  hasStudentRole: boolean;
  hasInstructorRole: boolean;
};

type RecentWork = {
  latestScenario: PublicScenario | null;
  latestInProgressAttempt: PublicAttempt | null;
  latestKind: "draft" | "attempt" | null;
};

type BuildHomeDashboardDataArgs = {
  displayName: string;
  guard: DataGuardState;
  viewerUserId: string | null;
  classrooms: PublicClassroom[];
  attempts: PublicAttempt[];
  scenarios: PublicScenario[];
};

function formatDisplayName(value: string | null | undefined) {
  if (!value) {
    return "there";
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "there";
  }

  if (trimmed.includes("@")) {
    return trimmed.split("@")[0]!;
  }

  return trimmed.split(/\s+/)[0]!;
}

function createDashboardGuard(sources: GuardSource[]): DataGuardState {
  if (sources.some((source) => source.unauthorized)) {
    return { kind: "unauthorized" };
  }

  if (sources.some((source) => source.loading)) {
    return { kind: "loading" };
  }

  const error = sources.find((source) => source.error)?.error ?? null;
  if (error) {
    return {
      kind: "error",
      message: error,
      onRetry: () => {
        sources.forEach((source) => {
          source.refetch();
        });
      },
    };
  }

  return CONTENT_GUARD;
}

function buildHomeDashboardData({
  displayName,
  guard,
  viewerUserId,
  classrooms,
  attempts,
  scenarios,
}: BuildHomeDashboardDataArgs): HomeDashboardData {
  const classroomRoleSummary = getClassroomRoleSummary(classrooms);
  const ownAttempts = getOwnAttempts(viewerUserId, attempts);
  const recentWork = getRecentWork(scenarios, ownAttempts);
  const continueWork = buildContinueWork(recentWork);

  return {
    displayName,
    activeRoles: classroomRoleSummary.activeRoles,
    guard,
    actionBarActions: buildActionBarActions({
      hasStudentRole: classroomRoleSummary.hasStudentRole,
      hasInstructorRole: classroomRoleSummary.hasInstructorRole,
      recentWork,
    }),
    classroomList: classrooms,
    continueWork,
    showEmptyState:
      guard.kind === "content" &&
      classrooms.length === 0 &&
      continueWork === null,
    hasStudentRole: classroomRoleSummary.hasStudentRole,
    hasInstructorRole: classroomRoleSummary.hasInstructorRole,
  };
}

function getClassroomRoleSummary(
  classrooms: PublicClassroom[],
): ClassroomRoleSummary {
  const hasStudentRole = classrooms.some(
    (classroom) => classroom.viewer_role === "student",
  );
  const hasInstructorRole = classrooms.some(
    (classroom) => classroom.viewer_role === "instructor",
  );
  const activeRoles: PublicClassroomRole[] = [];

  if (hasStudentRole) {
    activeRoles.push("student");
  }

  if (hasInstructorRole) {
    activeRoles.push("instructor");
  }

  return {
    activeRoles,
    hasStudentRole,
    hasInstructorRole,
  };
}

function getOwnAttempts(
  viewerUserId: string | null,
  attempts: PublicAttempt[],
): PublicAttempt[] {
  if (!viewerUserId) {
    return [];
  }

  return attempts.filter(
    (attempt) => attempt.student_user_id === viewerUserId,
  );
}

function getRecentWork(
  scenarios: PublicScenario[],
  ownAttempts: PublicAttempt[],
): RecentWork {
  const latestScenario = [...scenarios].sort(compareByUpdatedAt)[0] ?? null;
  const latestInProgressAttempt =
    [...ownAttempts]
      .filter((attempt) => attempt.status === "in_progress")
      .sort(compareAttemptsByLastActivity)[0] ?? null;

  if (!latestScenario && !latestInProgressAttempt) {
    return {
      latestScenario: null,
      latestInProgressAttempt: null,
      latestKind: null,
    };
  }

  if (!latestScenario) {
    return {
      latestScenario,
      latestInProgressAttempt,
      latestKind: "attempt",
    };
  }

  if (!latestInProgressAttempt) {
    return {
      latestScenario,
      latestInProgressAttempt,
      latestKind: "draft",
    };
  }

  return {
    latestScenario,
    latestInProgressAttempt,
    latestKind:
      new Date(latestInProgressAttempt.last_activity_at).getTime() >
      new Date(latestScenario.updated_at).getTime()
        ? "attempt"
        : "draft",
  };
}

function buildActionBarActions({
  hasStudentRole,
  hasInstructorRole,
  recentWork,
}: {
  hasStudentRole: boolean;
  hasInstructorRole: boolean;
  recentWork: RecentWork;
}): DashboardAction[] {
  const actions: DashboardAction[] = [
    {
      label: "+ Create Scenario",
      to: "/scenario/new",
      style: "primary",
    },
  ];

  if (hasStudentRole || hasInstructorRole) {
    actions.push({
      label: "View Classrooms",
      to: "/classrooms",
      style: "primary",
    });
  } else {
    actions.push({
      label: "Join Classroom",
      to: "/classrooms/join",
      style: "primary",
    });
  }

  const secondaryAction = buildSecondaryAction(recentWork);
  if (secondaryAction) {
    actions.push(secondaryAction);
  }

  return actions;
}

function buildSecondaryAction(recentWork: RecentWork): DashboardAction | null {
  if (
    recentWork.latestKind === "attempt" &&
    recentWork.latestInProgressAttempt
  ) {
    return {
      label: "Continue Assignment",
      to: buildAttemptLink(recentWork.latestInProgressAttempt),
      style: "secondary",
    };
  }

  if (recentWork.latestKind === "draft" && recentWork.latestScenario) {
    return {
      label: "Edit Latest Draft",
      to: `/scenario/${recentWork.latestScenario.id}/editor`,
      style: "secondary",
    };
  }

  return null;
}

function buildContinueWork(
  recentWork: RecentWork,
): DashboardContinueWork | null {
  if (
    recentWork.latestKind === "attempt" &&
    recentWork.latestInProgressAttempt &&
    !recentWork.latestScenario
  ) {
    return {
      kind: "attempt",
      title: recentWork.latestInProgressAttempt.assignment_title,
      subtitle: recentWork.latestInProgressAttempt.classroom_name,
      updatedAt: recentWork.latestInProgressAttempt.last_activity_at,
      actionLabel: "Resume Assignment",
      actionLink: buildAttemptLink(recentWork.latestInProgressAttempt),
      tone: "cyan",
    };
  }

  if (recentWork.latestScenario) {
    return {
      kind: "draft",
      title: recentWork.latestScenario.title,
      subtitle: "Draft scenario",
      updatedAt: recentWork.latestScenario.updated_at,
      actionLabel: "Resume Editing",
      actionLink: `/scenario/${recentWork.latestScenario.id}/editor`,
      tone: "indigo",
    };
  }

  return null;
}

function compareByUpdatedAt<
  T extends { updated_at: string; title?: string; name?: string },
>(left: T, right: T) {
  const timeDifference =
    new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();

  if (timeDifference !== 0) {
    return timeDifference;
  }

  return (left.title ?? left.name ?? "").localeCompare(
    right.title ?? right.name ?? "",
  );
}

function compareAttemptsByLastActivity(
  left: PublicAttempt,
  right: PublicAttempt,
) {
  return (
    new Date(right.last_activity_at).getTime() -
    new Date(left.last_activity_at).getTime()
  );
}

function buildAttemptLink(attempt: PublicAttempt) {
  return `/classrooms/${attempt.classroom_id}/assignment/${attempt.assignment_id}/attempt`;
}

export function useHomeDashboardData(): HomeDashboardData {
  const { data: session } = authClient.useSession();
  const attempts = useAttempts({ pageSize: 100 });
  const classrooms = useClassrooms(100);
  const scenarios = useScenarios(100);
  const viewerUserId = session?.session?.userId ?? null;
  const displayName = formatDisplayName(
    session?.user?.name ?? session?.user?.email,
  );

  const guard = createDashboardGuard([attempts, classrooms]);

  return buildHomeDashboardData({
    displayName,
    guard,
    viewerUserId,
    classrooms: classrooms.items,
    attempts: attempts.items,
    scenarios: scenarios.items,
  });
}
