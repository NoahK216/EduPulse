import {
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { DataGuard } from "../../../components/data/DataGuard";
import PageShell from "../../../components/layout/PageShell";
import {
  EmptyStateCard,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "../../../components/ui/Surfaces";
import { cn } from "../../../lib/cn";
import { shortDateFromDateOrText } from "../../../lib/format-dates";
import {
  useHomeDashboardData,
  type DashboardAction,
  type DashboardClassroomListItem,
  type DashboardContinueWork,
} from "../hooks/useHomeDashboardData";

function ActionButton({ action }: { action: DashboardAction }) {
  return (
    <Link
      to={action.to}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
        action.style === "primary"
          ? "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          : "border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900",
      )}
    >
      {action.label}
    </Link>
  );
}

function ClassroomRow({ item }: { item: DashboardClassroomListItem }) {
  return (
    <Link
      to={item.actionLink}
      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50 dark:hover:bg-neutral-900/70"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-semibold text-neutral-950 dark:text-neutral-50">
            {item.classroom.name}
          </p>
          <StatusBadge tone={item.role === "instructor" ? "indigo" : "cyan"}>
            {item.role}
          </StatusBadge>
        </div>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          {item.activeAssignmentCount} assignments
        </p>
      </div>

      <FiArrowRight className="text-neutral-400" />
    </Link>
  );
}

function ContinueWorkCard({ item }: { item: DashboardContinueWork }) {
  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl mb-2 font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">
            {item.title}
          </h3>
          <StatusBadge tone={item.tone}>{item.kind === "draft" ? "Scenario Draft" : "Assignment"}</StatusBadge>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {item.kind === "draft" ? "Updated" : "Last activity"}{" "}
            {shortDateFromDateOrText(item.updatedAt, "recently")}
          </p>
        </div>

        <Link
          to={item.actionLink}
          className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
        >
          {item.actionLabel}
        </Link>
      </div>
    </SurfaceCard>
  );
}

function AuthenticatedHome() {
  const dashboard = useHomeDashboardData();

  return (
    <PageShell
      title="Dashboard"
      widthClassName="max-w-5xl"
      header={
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
                Welcome back, {dashboard.displayName}
              </h1>
            </div>
          </div>

          <SurfaceCard className="p-3">
            <div className="flex flex-wrap gap-3">
              {dashboard.actionBarActions.map((action) => (
                <ActionButton key={`${action.style}:${action.label}`} action={action} />
              ))}
            </div>
          </SurfaceCard>
        </div>
      }
    >
      <DataGuard state={dashboard.guard}>
        <div className="space-y-8">


          {dashboard.showEmptyState ? (
            <EmptyStateCard
              title="Your dashboard is clear for now"
              description="Create a scenario or open classrooms to start building activity in EduPulse."
            />
          ) : null}

          {dashboard.continueWork ? (
            <section className="space-y-4">
              <SectionHeader title="Continue With" />
              <ContinueWorkCard item={dashboard.continueWork} />
            </section>
          ) : null}

          <section className="space-y-4">
            <SectionHeader
              title="Your Classrooms"
              action={
                <Link
                  to="/classrooms"
                  className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-200 dark:hover:text-cyan-100"
                >
                  View all
                </Link>
              }
            />

            {dashboard.classroomList.length > 0 ? (
              <SurfaceCard className="overflow-hidden p-0">
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {dashboard.classroomList.map((item) => (
                    <ClassroomRow key={item.classroom.id} item={item} />
                  ))}
                </div>
              </SurfaceCard>
            ) : (
              <EmptyStateCard
                title="No classrooms yet"
                description="Classrooms will appear here once you join one as a student or instructor."
              />
            )}
          </section>


        </div>
      </DataGuard>
    </PageShell>
  );
}

export default AuthenticatedHome;
