import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { useApiData } from "../../lib/useApiData";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from "../ui/DataStatePanels";
import PageShell from "../ui/PageShell";
import {
  ApiRequestError,
  publicApiDelete,
  resolvePublicApiToken,
} from "../../lib/public-api-client";
import type {
  PagedResponse,
  PublicScenario,
  PublicScenarioVersion,
} from "../../types/publicApi";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// TODO this can be moved out
function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function ScenarioLibrary() {
  const scenarios = useApiData<PagedResponse<PublicScenario>>(
    "/api/public/scenarios?pageSize=100",
  );
  const versions = useApiData<PagedResponse<PublicScenarioVersion>>(
    "/api/public/scenario-versions?pageSize=100",
  );
  const [deletingScenarioId, setDeletingScenarioId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const unauthorized = scenarios.unauthorized || versions.unauthorized;
  const isLoading = scenarios.loading || versions.loading;
  const hasError = scenarios.error || versions.error;
  const scenarioItems = scenarios.data?.items ?? [];
  const versionItems = versions.data?.items ?? [];

  const handleDeleteScenario = useCallback(
    async (scenario: PublicScenario) => {
      const scenarioTitle =
        scenario.title.trim().length > 0
          ? scenario.title
          : `Scenario ${scenario.id}`;
      const versionSummary = `${scenario.version_count} ${pluralize(
        scenario.version_count,
        "published version",
        "published versions",
      )}`;

      const shouldDelete = window.confirm(
        `Delete "${scenarioTitle}"?\n\nThis removes the draft and ${versionSummary}. This action cannot be undone.`,
      );
      if (!shouldDelete) {
        return;
      }

      setDeletingScenarioId(scenario.id);
      setActionError(null);
      setActionMessage(null);

      try {
        const token = await resolvePublicApiToken();
        if (!token) {
          setActionError("Your session is missing or expired.");
          return;
        }

        await publicApiDelete<{ deleted: boolean; id: string }>(
          `/api/public/scenarios/${scenario.id}`,
          token,
        );
        setActionMessage(`Deleted "${scenarioTitle}".`);
        scenarios.refetch();
        versions.refetch();
      } catch (error) {
        if (error instanceof ApiRequestError) {
          setActionError(error.message);
          return;
        }

        if (error instanceof Error) {
          setActionError(error.message);
          return;
        }

        setActionError("Failed to delete scenario");
      } finally {
        setDeletingScenarioId(null);
      }
    },
    [scenarios, versions],
  );

  return (
    <PageShell
      title="Scenario Library"
      subtitle="Create, edit, and manage your scenario drafts and published versions."
    >
      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && isLoading ? <LoadingPanel /> : null}
      {!unauthorized && !isLoading && hasError ? (
        <ErrorPanel
          message={hasError}
          onRetry={() => {
            scenarios.refetch();
            versions.refetch();
          }}
        />
      ) : null}

      {!unauthorized && !isLoading && !hasError ? (
        <div className="space-y-6">
          <section
            className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br 
          from-sky-800 via-sky-600 to-cyan-800 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40 p-6"
          >
            {" "}
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Workspace
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-50">
                  Build your next scenario
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Start a blank scenario, continue a draft, or manage published
                  versions.
                </p>
              </div>
              <Link
                to="/scenario/new"
                className="inline-flex items-center justify-center rounded-md border border-cyan-300/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold !text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-400/30"
              >
                New Scenario
              </Link>
            </div>
          </section>

          {actionMessage ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {actionMessage}
            </div>
          ) : null}
          {actionError ? (
            <div className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-neutral-800 dark:bg-neutral-900/80">
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                <h3 className="text-base font-semibold dark:text-neutral-100">
                  Scenarios
                </h3>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                  {scenarioItems.length}
                </span>
              </div>

              {scenarioItems.length === 0 ? (
                <div className="p-4">
                  <EmptyPanel message="No scenarios found. Create one to get started." />
                </div>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {scenarioItems.map((scenario) => {
                    const scenarioTitle =
                      scenario.title.trim().length > 0
                        ? scenario.title
                        : `Scenario ${scenario.id}`;
                    const isDeleting = deletingScenarioId === scenario.id;

                    return (
                      <li
                        key={scenario.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/scenario/${scenario.id}/editor`}
                            className="truncate text-base font-semibold !text-neutral-100 hover:!text-cyan-200"
                          >
                            {scenarioTitle}
                          </Link>
                          <p className="mt-1 text-xs text-neutral-400">
                            Updated {formatDate(scenario.updated_at)} |{" "}
                            {scenario.version_count}{" "}
                            {pluralize(
                              scenario.version_count,
                              "published version",
                              "published versions",
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/scenario/${scenario.id}/editor`}
                            className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-semibold !text-neutral-200 transition hover:border-cyan-400/60 hover:!text-cyan-100"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/scenario/${scenario.id}/viewer`}
                            className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold !text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                          >
                            Test Run
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteScenario(scenario);
                            }}
                            disabled={isDeleting || deletingScenarioId !== null}
                            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-800 dark:bg-neutral-900/80">
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                <h3 className="text-base font-semibold dark:text-neutral-100">
                  Published Versions
                </h3>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                  {versionItems.length}
                </span>
              </div>

              {versionItems.length === 0 ? (
                <div className="p-4">
                  <EmptyPanel message="No scenario versions found." />
                </div>
              ) : (
                <div className="max-h-[34rem] space-y-3 overflow-auto p-4">
                  {versionItems.map((version) => (
                    <Link
                      key={version.id}
                      to={`/scenario/library/version/${version.id}`}
                      className="block rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm transition hover:border-cyan-400/50"
                    >
                      <p className="font-medium !text-neutral-100">
                        {version.scenario_title} - v{version.version_number}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        Published {formatDate(version.published_at)}
                      </p>
                      <p className="mt-2 text-xs text-cyan-200">
                        {version.assignment_count}{" "}
                        {pluralize(
                          version.assignment_count,
                          "assignment",
                          "assignments",
                        )}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

export default ScenarioLibrary;
