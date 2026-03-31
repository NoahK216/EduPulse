import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import {
  EmptyPanel,
} from "../../components/data/DataStatePanels";
import { useScenarioLibraryData } from "./hooks/useScenarioPageData";
import { DataGuard } from "../../components/data/DataGuard";
import PageShell from "../../components/layout/PageShell";
import {
  ApiRequestError,
  publicApiDelete,
  resolvePublicApiToken,
} from "../../lib/public-api-client";
import type {
  PublicScenario,
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

function ScenarioLibraryPage() {
  const library = useScenarioLibraryData();
  const [deletingScenarioId, setDeletingScenarioId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const scenarioItems = library.scenarios;
  const versionItems = library.versions;

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
          setActionError("Your token is missing or expired.");
          return;
        }

        await publicApiDelete<{ deleted: boolean; id: string }>(
          `/api/public/scenarios/${scenario.id}`,
          token,
        );
        setActionMessage(`Deleted "${scenarioTitle}".`);
        library.refetch();
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
    [library],
  );

  return (
    <PageShell
      title="Scenario Library"
      subtitle="Create, edit, and manage your scenario drafts and published versions."
    >
      <DataGuard state={library.guard}>
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
                <p className="mt-2 text-sm text-white">
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
            <section className="rounded-2xl border border-neutral-300 bg-white/90 dark:border-neutral-800 dark:bg-neutral-900/80">
              <div className="flex items-center justify-between border-b border-neutral-300 px-4 py-3 dark:border-neutral-800">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {" "}
                  Scenarios
                </h3>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                  {scenarioItems.length}
                </span>
              </div>

              {scenarioItems.length === 0 ? (
                <div className="p-4">
                  <EmptyPanel message="No scenarios found. Create one to get started." />
                </div>
              ) : (
                <ul className="divide-y divide-neutral-300 dark:divide-neutral-800">
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
                            className="truncate text-base font-semibold !text-neutral-900 hover:!text-cyan-700 dark:!text-neutral-100 dark:hover:!text-cyan-200"
                          >
                            {scenarioTitle}
                          </Link>
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
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
                            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold !text-neutral-700 transition hover:border-cyan-500 hover:!text-cyan-700 dark:border-neutral-700 dark:!text-neutral-200 dark:hover:border-cyan-400/60 dark:hover:!text-cyan-100"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/scenario/${scenario.id}/viewer`}
                            className="rounded-md border border-emerald-400/50 bg-emerald-50 px-3 py-1.5 text-xs font-semibold !text-emerald-800 transition hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:!text-emerald-200 dark:hover:border-emerald-400 dark:hover:bg-emerald-500/20"
                          >
                            Test Run
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteScenario(scenario);
                            }}
                            disabled={isDeleting || deletingScenarioId !== null}
                            className="rounded-md border border-red-400/50 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400 dark:hover:bg-red-500/20"
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

            <section className="rounded-2xl border border-neutral-300 bg-white/90 dark:border-neutral-800 dark:bg-neutral-900/80">
              <div className="flex items-center justify-between border-b border-neutral-300 px-4 py-3 dark:border-neutral-800">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Published Versions
                </h3>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
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
                      className="block rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm transition hover:border-cyan-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-cyan-400/50"
                    >
                      <p className="font-medium !text-neutral-900 dark:!text-neutral-100">
                        {version.scenario_title} - v{version.version_number}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Published {formatDate(version.published_at)}
                      </p>
                      <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-200">
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
      </DataGuard>
    </PageShell>
  );
}

export default ScenarioLibraryPage;
