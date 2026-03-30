import { useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';

import { publicApiPost, resolvePublicApiToken } from '../../../lib/public-api-client';
import { useApiData } from '../../../lib/useApiData';
import type {
  ItemResponse,
  PagedResponse,
  PublicAssignment,
  PublicScenario,
  PublicScenarioVersion,
} from '../../../types/publicApi';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../../ui/DataStatePanels';

type AssignScenarioModalProps = {
  classroomId: string;
  onClose: () => void;
  onAssigned?: () => void;
};

type ScenarioOption = {
  id: string;
  label: string;
  meta: string;
  assignmentTitle: string;
  sourceType: 'scenario' | 'scenarioVersion';
  scenarioId: string;
  scenarioVersionId: string | null;
  publishHint: string;
};

function padDateTimePart(value: number) {
  return value.toString().padStart(2, '0');
}

function toDateTimeLocalValue(value: Date) {
  return `${value.getFullYear()}-${padDateTimePart(value.getMonth() + 1)}-${padDateTimePart(
    value.getDate(),
  )}T${padDateTimePart(value.getHours())}:${padDateTimePart(value.getMinutes())}`;
}

function defaultDueAtValue() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 0, 0);
  return toDateTimeLocalValue(date);
}

function toOptionalIsoString(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function parseOptionalPositiveInteger(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

function AssignScenarioModal({
  classroomId,
  onClose,
  onAssigned,
}: AssignScenarioModalProps) {
  const [query, setQuery] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);
  const [openAt, setOpenAt] = useState('');
  const [dueAt, setDueAt] = useState(defaultDueAtValue);
  const [closeAt, setCloseAt] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const scenarios = useApiData<PagedResponse<PublicScenario>>(
    '/api/public/scenarios?pageSize=100',
  );
  const versions = useApiData<PagedResponse<PublicScenarioVersion>>(
    '/api/public/scenario-versions?pageSize=100',
  );

  const allOptions = useMemo(() => {
    const draftOptions: ScenarioOption[] = (scenarios.data?.items ?? []).map((scenario) => ({
      id: `scenario:${scenario.id}`,
      label: scenario.title,
      meta: `Draft scenario | ${scenario.version_count} published versions`,
      assignmentTitle: scenario.title,
      sourceType: 'scenario',
      scenarioId: scenario.id,
      scenarioVersionId: null,
      publishHint: 'A new published scenario version will be created when this assignment is sent.',
    }));

    const versionOptions: ScenarioOption[] = (versions.data?.items ?? []).map((version) => ({
      id: `version:${version.id}`,
      label: version.scenario_title,
      meta: `${version.title} | Published version v${version.version_number}`,
      assignmentTitle: version.scenario_title,
      sourceType: 'scenarioVersion',
      scenarioId: version.scenario_id,
      scenarioVersionId: version.id,
      publishHint: `This will assign existing published version v${version.version_number}.`,
    }));

    return [...draftOptions, ...versionOptions].sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }, [scenarios.data, versions.data]);

  const search = query.trim().toLowerCase();
  const filteredOptions = allOptions.filter((option) => {
    if (search.length === 0) {
      return true;
    }

    const haystack = `${option.label} ${option.meta}`.toLowerCase();
    return haystack.includes(search);
  });

  const selectedOption =
    allOptions.find((option) => option.id === selectedOptionId) ?? null;
  const effectiveTitle =
    title.trim().length > 0 ? title.trim() : selectedOption?.assignmentTitle ?? '';
  const parsedMaxAttempts = parseOptionalPositiveInteger(maxAttempts);
  const hasError = scenarios.error || versions.error;
  const isLoading = scenarios.loading || versions.loading;

  function clearMessages() {
    setFormError(null);
  }

  function handleSelectOption(optionId: string) {
    clearMessages();
    const option = allOptions.find((candidate) => candidate.id === optionId) ?? null;
    setSelectedOptionId(optionId);
    if (!titleEdited) {
      setTitle(option?.assignmentTitle ?? '');
    }
  }

  async function handleAssign() {
    clearMessages();

    if (!selectedOption) {
      setFormError('Select a scenario or published scenario version first.');
      return;
    }

    if (effectiveTitle.length === 0) {
      setFormError('Assignment title is required.');
      return;
    }

    if (!dueAt) {
      setFormError('Due at is required.');
      return;
    }

    if (parsedMaxAttempts === null) {
      setFormError('Max attempts must be a positive integer when provided.');
      return;
    }

    const openAtDate = openAt ? new Date(openAt) : null;
    const dueAtDate = dueAt ? new Date(dueAt) : null;
    const closeAtDate = closeAt ? new Date(closeAt) : null;

    if (openAtDate && Number.isNaN(openAtDate.getTime())) {
      setFormError('Open at must be a valid datetime.');
      return;
    }

    if (!dueAtDate || Number.isNaN(dueAtDate.getTime())) {
      setFormError('Due at must be a valid datetime.');
      return;
    }

    if (closeAtDate && Number.isNaN(closeAtDate.getTime())) {
      setFormError('Close at must be a valid datetime.');
      return;
    }

    if (openAtDate && openAtDate.getTime() > dueAtDate.getTime()) {
      setFormError('Open at must be before due at.');
      return;
    }

    if (closeAtDate && closeAtDate.getTime() < dueAtDate.getTime()) {
      setFormError('Close at must be after due at.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await resolvePublicApiToken();
      if (!token) {
        setFormError('You must be logged in to assign a scenario.');
        return;
      }

      await publicApiPost<ItemResponse<PublicAssignment>>('/api/public/assignments', token, {
        classroom_id: classroomId,
        scenario_id:
          selectedOption.sourceType === 'scenario' ? selectedOption.scenarioId : undefined,
        scenario_version_id:
          selectedOption.sourceType === 'scenarioVersion'
            ? selectedOption.scenarioVersionId
            : undefined,
        title: title.trim().length > 0 ? title.trim() : undefined,
        instructions: instructions.trim().length > 0 ? instructions.trim() : undefined,
        open_at: toOptionalIsoString(openAt),
        due_at: toOptionalIsoString(dueAt),
        close_at: toOptionalIsoString(closeAt),
        max_attempts: parsedMaxAttempts,
      });

      onAssigned?.();
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to assign the selected scenario.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Assign Scenario</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Configure the assignment fields that map to the assignment schema before publishing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FaMagnifyingGlass className="text-neutral-500" />
                <span>Search scenarios</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Search by scenario title or published version name.
              </p>

              <div className="relative mt-3">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    clearMessages();
                    setQuery(event.target.value);
                  }}
                  placeholder="Search scenarios and published versions"
                  className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Search results</p>
                <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-neutral-300 p-3 dark:border-neutral-800">
                  {isLoading ? <LoadingPanel /> : null}
                  {!isLoading && hasError ? (
                    <ErrorPanel
                      message={hasError}
                      onRetry={() => {
                        scenarios.refetch();
                        versions.refetch();
                      }}
                    />
                  ) : null}
                  {!isLoading && !hasError && filteredOptions.length === 0 ? (
                    <EmptyPanel message="No scenarios match your search." />
                  ) : null}
                  {!isLoading && !hasError && filteredOptions.length > 0
                    ? filteredOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        className={`block w-full rounded-xl border px-4 py-3 text-left transition ${selectedOptionId === option.id
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                          : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                              {option.meta}
                            </p>
                          </div>
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            {option.sourceType === 'scenario' ? 'Draft' : 'Published'}
                          </span>
                        </div>
                      </button>
                    ))
                    : null}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <h3 className="text-sm font-medium">Assignment details</h3>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Assignment title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => {
                      clearMessages();
                      setTitle(event.target.value);
                      setTitleEdited(event.target.value.trim().length > 0);
                    }}
                    placeholder={
                      selectedOption?.assignmentTitle ?? 'Defaults to the selected scenario title'
                    }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    If left blank, the selected scenario title will be used.
                  </p>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Open at</span>
                    <input
                      type="datetime-local"
                      value={openAt}
                      onChange={(event) => {
                        clearMessages();
                        setOpenAt(event.target.value);
                      }}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Leave blank to open immediately.
                    </p>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Due at</span>
                    <input
                      type="datetime-local"
                      value={dueAt}
                      onChange={(event) => {
                        clearMessages();
                        setDueAt(event.target.value);
                      }}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Close at</span>
                    <input
                      type="datetime-local"
                      value={closeAt}
                      onChange={(event) => {
                        clearMessages();
                        setCloseAt(event.target.value);
                      }}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Leave blank to keep the assignment accessible after the due time.
                    </p>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Max attempts (optional)</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={maxAttempts}
                      onChange={(event) => {
                        clearMessages();
                        setMaxAttempts(event.target.value);
                      }}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Leave blank for unlimited attempts.
                    </p>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Instructions</span>
                  <textarea
                    value={instructions}
                    onChange={(event) => {
                      clearMessages();
                      setInstructions(event.target.value);
                    }}
                    rows={5}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>
              </div>
            </section>
            {formError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                {formError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={submitting || !selectedOption || !dueAt || parsedMaxAttempts === null}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {submitting ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
}

export default AssignScenarioModal;
