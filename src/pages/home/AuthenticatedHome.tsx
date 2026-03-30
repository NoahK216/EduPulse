import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { authClient } from "../../lib/auth-client";
import { useApiData } from "../../lib/useApiData";
import type {
  PagedResponse,
  PublicAssignment,
  PublicAttempt,
  PublicClassroom,
  PublicClassroomMember,
  PublicUser,
} from "../../types/publicApi";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from "../ui/DataStatePanels";
import PageShell from "../ui/PageShell";
import AssignmentCard from "./dashboard/AssignmentCard";
import ClassroomCard from "./dashboard/ClassroomCard";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  return new Date(value).toLocaleString();
}

function getGreetingName(value: string | null | undefined) {
  if (!value) return "there";

  const trimmed = value.trim();
  if (trimmed.length === 0) return "there";

  if (trimmed.includes("@")) {
    return trimmed.split("@")[0];
  }

  return trimmed.split(/\s+/)[0];
}

function compareByDueDate(a: PublicAssignment, b: PublicAssignment) {
  if (!a.due_at && !b.due_at) return a.title.localeCompare(b.title);
  if (!a.due_at) return 1;
  if (!b.due_at) return -1;

  return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-neutral-200 pt-8 dark:border-neutral-800">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AuthenticatedHome() {
  const { data: session } = authClient.useSession();
  const currentUser = useApiData<PagedResponse<PublicUser>>(
    "/api/public/users?pageSize=1",
  );
  const classroomMembers = useApiData<PagedResponse<PublicClassroomMember>>(
    "/api/public/classroom-members?pageSize=100",
  );
  const assignments = useApiData<PagedResponse<PublicAssignment>>(
    "/api/public/assignments?pageSize=100",
  );
  const attempts = useApiData<PagedResponse<PublicAttempt>>(
    "/api/public/attempts?pageSize=100",
  );
  const classrooms = useApiData<PagedResponse<PublicClassroom>>(
    "/api/public/classrooms?pageSize=100",
  );

  const unauthorized =
    currentUser.unauthorized ||
    classroomMembers.unauthorized ||
    assignments.unauthorized ||
    attempts.unauthorized ||
    classrooms.unauthorized;

  const publicUser = currentUser.data?.items[0] ?? null;
  const displayName = getGreetingName(
    publicUser?.name ?? session?.user?.name ?? session?.user?.email,
  );

  if (unauthorized) {
    return (
      <PageShell
        title={`Welcome back, ${displayName}`}
        subtitle="Your session is missing or expired."
      >
        <UnauthorizedPanel />
      </PageShell>
    );
  }

  if (currentUser.loading) {
    return (
      <PageShell title={`Welcome back, ${displayName}`} subtitle="Loading your dashboard">
        <LoadingPanel />
      </PageShell>
    );
  }

  if (currentUser.error) {
    return (
      <PageShell
        title={`Welcome back, ${displayName}`}
        subtitle="We couldn't load your home page."
      >
        <ErrorPanel message={currentUser.error} onRetry={currentUser.refetch} />
      </PageShell>
    );
  }

  if (!publicUser) {
    return (
      <PageShell title={`Welcome back, ${displayName}`} subtitle="Your profile is not ready yet.">
        <EmptyPanel message="No profile data is available for this account yet." />
      </PageShell>
    );
  }

  const memberships = classroomMembers.data?.items ?? [];
  const currentMemberships = memberships.filter(
    (member) => member.user_id === publicUser.id,
  );

  const studentClassroomIds = new Set(
    currentMemberships
      .filter((member) => member.role === "student")
      .map((member) => member.classroom_id),
  );
  const instructorClassroomIds = new Set(
    currentMemberships
      .filter((member) => member.role === "instructor")
      .map((member) => member.classroom_id),
  );

  const now = Date.now();
  const upcomingAssignments = (assignments.data?.items ?? [])
    .filter((assignment) => {
      if (!studentClassroomIds.has(assignment.classroom_id)) return false;
      if (!assignment.due_at) return true;
      return new Date(assignment.due_at).getTime() >= now;
    })
    .sort(compareByDueDate);

  const inProgressAttempt =
    (attempts.data?.items ?? []).find(
      (attempt) =>
        attempt.student_user_id === publicUser.id &&
        attempt.status === "in_progress",
    ) ?? null;

  const instructorClassrooms = (classrooms.data?.items ?? []).filter((classroom) =>
    instructorClassroomIds.has(classroom.id),
  );

  const showStudentAssignments = studentClassroomIds.size > 0;
  const showInstructorClassrooms = instructorClassroomIds.size > 0;
  const hasVisibleDashboardSections =
    Boolean(inProgressAttempt) || showStudentAssignments || showInstructorClassrooms;

  return (
    <PageShell
      title={`Welcome back, ${displayName}`}
      subtitle="A quick view of your active work."
    >
      <div className="space-y-8">
        {attempts.loading ? <LoadingPanel /> : null}
        {!attempts.loading && attempts.error ? (
          <ErrorPanel message={attempts.error} onRetry={attempts.refetch} />
        ) : null}
        {!attempts.loading && !attempts.error && inProgressAttempt ? (
          <Section title="Continue where you left off">
            <div className="rounded-md border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-800">
              <p className="text-lg font-medium">{inProgressAttempt.assignment_title}</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {inProgressAttempt.classroom_name}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Started {formatDate(inProgressAttempt.started_at)}
              </p>
              <Link
                to={`/classrooms/${inProgressAttempt.classroom_id}/assignment/${inProgressAttempt.assignment_id}/attempt/${inProgressAttempt.id}`}
                className="mt-4 inline-flex rounded-md border border-neutral-300 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:border-neutral-700"
              >
                Continue Assignment
              </Link>
            </div>
          </Section>
        ) : null}

        {classroomMembers.loading ? <LoadingPanel /> : null}
        {!classroomMembers.loading && classroomMembers.error ? (
          <ErrorPanel
            message={classroomMembers.error}
            onRetry={classroomMembers.refetch}
          />
        ) : null}
        {!attempts.loading &&
          !attempts.error &&
          !classroomMembers.loading &&
          !classroomMembers.error &&
          !hasVisibleDashboardSections ? (
          <EmptyPanel message="You are not enrolled in or instructing any classrooms yet." />
        ) : null}

        {!classroomMembers.loading &&
          !classroomMembers.error &&
          showStudentAssignments ? (
          <Section title="Your Assignments">
            {assignments.loading ? <LoadingPanel /> : null}
            {!assignments.loading && assignments.error ? (
              <ErrorPanel message={assignments.error} onRetry={assignments.refetch} />
            ) : null}
            {!assignments.loading && !assignments.error && upcomingAssignments.length === 0 ? (
              <EmptyPanel message="You have no upcoming assignments right now." />
            ) : null}
            {!assignments.loading && !assignments.error && upcomingAssignments.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {upcomingAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : null}
          </Section>
        ) : null}

        {!classroomMembers.loading &&
          !classroomMembers.error &&
          showInstructorClassrooms ? (
          <Section title="Your Classrooms">
            {classrooms.loading ? <LoadingPanel /> : null}
            {!classrooms.loading && classrooms.error ? (
              <ErrorPanel message={classrooms.error} onRetry={classrooms.refetch} />
            ) : null}
            {!classrooms.loading && !classrooms.error && instructorClassrooms.length === 0 ? (
              <EmptyPanel message="You are not instructing any classrooms yet." />
            ) : null}
            {!classrooms.loading && !classrooms.error && instructorClassrooms.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {instructorClassrooms.map((classroom) => (
                  <ClassroomCard key={classroom.id} classroom={classroom} />
                ))}
              </div>
            ) : null}
          </Section>
        ) : null}
      </div>
    </PageShell>
  );
}

export default AuthenticatedHome;
