import type { ReactNode } from "react";

import {
  EmptyPanel,
} from "../../../components/data/DataStatePanels";
import { DataGuard } from "../../../components/data/DataGuard";
import PageShell from "../../../components/layout/PageShell";
import { useHomeDashboardData } from "../hooks/useHomeDashboardData";
import AssignmentCard from "../dashboard/AssignmentCard";
import ClassroomCard from "../dashboard/ClassroomCard";
import ContinueAttemptCard from "../dashboard/ContinueAttemptCard";

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
  const dashboard = useHomeDashboardData();

  return (
    <PageShell
      title={`Welcome back, ${dashboard.displayName}`}
      subtitle="A quick view of your active work."
    >
      <DataGuard state={dashboard.guard}>
        <div className="space-y-8">
          {dashboard.attemptsGuard.kind !== "content" ? (
            <DataGuard state={dashboard.attemptsGuard}>{null}</DataGuard>
          ) : null}

          {dashboard.attemptsGuard.kind === "content" && dashboard.inProgressAttempt ? (
            <Section title="Continue where you left off">
              <ContinueAttemptCard attempt={dashboard.inProgressAttempt} />
            </Section>
          ) : null}

          <DataGuard state={dashboard.membershipsGuard}>
            {dashboard.showEmptyState ? (
              <EmptyPanel message="You are not enrolled in or instructing any classrooms yet." />
            ) : null}
          </DataGuard>

          {dashboard.showStudentAssignments ? (
            <Section title="Your Assignments">
              <DataGuard state={dashboard.assignmentsGuard}>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {dashboard.upcomingAssignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </DataGuard>
            </Section>
          ) : null}

          {dashboard.showInstructorClassrooms ? (
            <Section title="Your Classrooms">
              <DataGuard state={dashboard.classroomsGuard}>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {dashboard.instructorClassrooms.map((classroom) => (
                    <ClassroomCard key={classroom.id} classroom={classroom} />
                  ))}
                </div>
              </DataGuard>
            </Section>
          ) : null}
        </div>
      </DataGuard>
    </PageShell>
  );
}

export default AuthenticatedHome;
