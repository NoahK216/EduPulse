import { useState } from "react";

import { authClient } from "../../../lib/auth-client";
import {
  useAssignments,
  useAttempts,
  useClassroomMemberships,
  useClassrooms,
  useCurrentUser,
  useScenarios,
} from "../../../lib/usePublicApiHooks";

import type {
  PublicAssignment,
  PublicAttempt,
  PublicClassroom,
  PublicClassroomMember,
  PublicScenario,
  PublicUser,
} from "../../../types/publicApi";

import type {
  DashboardAction,
  DashboardClassroomListItem,
  DashboardContinueWork,
  DashboardRole,
  HomeDashboardData,
} from "./homeDashboardData.types";
import type { DataGuardState } from "../../../components/data/DataGuard";

export type {
  DashboardAction,
  DashboardClassroomListItem,
  DashboardContinueWork,
  DashboardRole,
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

type MembershipSummary = {
  activeRoles: DashboardRole[];
  hasStudentRole: boolean;
  hasInstructorRole: boolean;
  relevantClassroomIds: Set<string>;
  instructorClassroomIds: Set<string>;
};

type RecentWork = {
  latestScenario: PublicScenario | null;
  latestInProgressAttempt: PublicAttempt | null;
  latestKind: "draft" | "attempt" | null;
};

type BuildHomeDashboardDataArgs = {
  displayName: string;
  guard: DataGuardState;
  publicUser: PublicUser | null;
  memberships: PublicClassroomMember[];
  assignments: PublicAssignment[];
  attempts: PublicAttempt[];
  classrooms: PublicClassroom[];
  scenarios: PublicScenario[];
  pageLoadedAt: number;
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
  publicUser,
  memberships,
  assignments,
  attempts,
  classrooms,
  scenarios,
  pageLoadedAt,
}: BuildHomeDashboardDataArgs): HomeDashboardData {
  if (guard.kind === "content" && !publicUser) {
    return createProfileEmptyState(displayName);
  }

  const membershipSummary = getMembershipSummary(publicUser, memberships);
  const ownAttempts = getOwnAttempts(publicUser, attempts);
  const activeAssignmentCountByClassroom =
    buildActiveAssignmentCountByClassroom(
      assignments,
      membershipSummary.relevantClassroomIds,
      pageLoadedAt,
    );
  const classroomList = buildClassroomList(
    classrooms,
    membershipSummary.relevantClassroomIds,
    membershipSummary.instructorClassroomIds,
    activeAssignmentCountByClassroom,
  );
  const recentWork = getRecentWork(scenarios, ownAttempts);
  const continueWork = buildContinueWork(
    recentWork,
    membershipSummary.hasInstructorRole,
  );

  return {
    displayName,
    activeRoles: membershipSummary.activeRoles,
    guard,
    actionBarActions: buildActionBarActions({
      hasStudentRole: membershipSummary.hasStudentRole,
      hasInstructorRole: membershipSummary.hasInstructorRole,
      recentWork,
    }),
    classroomList,
    continueWork,
    showEmptyState:
      guard.kind === "content" &&
      classroomList.length === 0 &&
      continueWork === null,
    hasStudentRole: membershipSummary.hasStudentRole,
    hasInstructorRole: membershipSummary.hasInstructorRole,
  };
}

function createProfileEmptyState(displayName: string): HomeDashboardData {
  return {
    displayName,
    activeRoles: [],
    guard: {
      kind: "empty",
      message: "No profile data is available for this account yet.",
    },
    actionBarActions: [],
    classroomList: [],
    continueWork: null,
    showEmptyState: true,
    hasStudentRole: false,
    hasInstructorRole: false,
  };
}

function getMembershipSummary(
  publicUser: PublicUser | null,
  memberships: PublicClassroomMember[],
): MembershipSummary {
  const ownMemberships = publicUser
    ? memberships.filter((member) => member.user_id === publicUser.id)
    : [];
  const studentClassroomIds = new Set(
    ownMemberships
      .filter((member) => member.role === "student")
      .map((member) => member.classroom_id),
  );
  const instructorClassroomIds = new Set(
    ownMemberships
      .filter((member) => member.role === "instructor")
      .map((member) => member.classroom_id),
  );
  const hasStudentRole = studentClassroomIds.size > 0;
  const hasInstructorRole = instructorClassroomIds.size > 0;

  return {
    activeRoles: [
      ...(hasStudentRole ? (["student"] as const) : []),
      ...(hasInstructorRole ? (["instructor"] as const) : []),
    ],
    hasStudentRole,
    hasInstructorRole,
    relevantClassroomIds: new Set([
      ...studentClassroomIds,
      ...instructorClassroomIds,
    ]),
    instructorClassroomIds,
  };
}

function getOwnAttempts(
  publicUser: PublicUser | null,
  attempts: PublicAttempt[],
): PublicAttempt[] {
  if (!publicUser) {
    return [];
  }

  return attempts.filter(
    (attempt) => attempt.student_user_id === publicUser.id,
  );
}

function buildActiveAssignmentCountByClassroom(
  assignments: PublicAssignment[],
  relevantClassroomIds: Set<string>,
  now: number,
) {
  const counts = new Map<string, number>();

  assignments
    .filter((assignment) => relevantClassroomIds.has(assignment.classroom_id))
    .forEach((assignment) => {
      if (isAssignmentClosed(assignment, now)) {
        return;
      }

      counts.set(
        assignment.classroom_id,
        (counts.get(assignment.classroom_id) ?? 0) + 1,
      );
    });

  return counts;
}

function buildClassroomList(
  classrooms: PublicClassroom[],
  relevantClassroomIds: Set<string>,
  instructorClassroomIds: Set<string>,
  activeAssignmentCountByClassroom: Map<string, number>,
): DashboardClassroomListItem[] {
  return classrooms
    .filter((classroom) => relevantClassroomIds.has(classroom.id))
    .map(
      (classroom): DashboardClassroomListItem => ({
        classroom,
        role: instructorClassroomIds.has(classroom.id)
          ? "instructor"
          : "student",
        activeAssignmentCount:
          activeAssignmentCountByClassroom.get(classroom.id) ?? 0,
        actionLink: `/classrooms/${classroom.id}`,
      }),
    )
    .sort(compareClassroomListItems);
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
  hasInstructorRole: boolean,
): DashboardContinueWork | null {
  if (
    recentWork.latestKind === "attempt" &&
    recentWork.latestInProgressAttempt
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

  if (hasInstructorRole && recentWork.latestScenario) {
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

  if (recentWork.latestInProgressAttempt) {
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

  return null;
}

function rolePriority(role: DashboardRole) {
  return role === "instructor" ? 0 : 1;
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

function compareClassroomListItems(
  left: DashboardClassroomListItem,
  right: DashboardClassroomListItem,
) {
  if (left.activeAssignmentCount !== right.activeAssignmentCount) {
    return right.activeAssignmentCount - left.activeAssignmentCount;
  }

  const roleDifference = rolePriority(left.role) - rolePriority(right.role);
  if (roleDifference !== 0) {
    return roleDifference;
  }

  return left.classroom.name.localeCompare(right.classroom.name);
}

function isAssignmentClosed(assignment: PublicAssignment, now: number) {
  return (
    Boolean(assignment.close_at) &&
    new Date(assignment.close_at!).getTime() <= now
  );
}

function buildAttemptLink(attempt: PublicAttempt) {
  return `/classrooms/${attempt.classroom_id}/assignment/${attempt.assignment_id}/attempt`;
}

export function useHomeDashboardData(): HomeDashboardData {
  const [pageLoadedAt] = useState(() => Date.now());
  const { data: session } = authClient.useSession();
  const currentUser = useCurrentUser();
  const classroomMembers = useClassroomMemberships();
  const assignments = useAssignments({ pageSize: 100 });
  const attempts = useAttempts({ pageSize: 100 });
  const classrooms = useClassrooms(100);
  const scenarios = useScenarios(100);
  const publicUser = currentUser.user;
  const displayName = formatDisplayName(
    publicUser?.name ?? session?.user?.name ?? session?.user?.email,
  );

  const guard = createDashboardGuard([
    currentUser,
    classroomMembers,
    assignments,
    attempts,
    classrooms,
  ]);

  return buildHomeDashboardData({
    displayName,
    guard,
    publicUser,
    memberships: classroomMembers.items,
    assignments: assignments.items,
    attempts: attempts.items,
    classrooms: classrooms.items,
    scenarios: scenarios.items,
    pageLoadedAt,
  });
}
