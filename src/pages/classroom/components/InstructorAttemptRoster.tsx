import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type {
  AssignmentProgressState,
  InstructorStudentAttemptGroup,
} from "../hooks/useClassroomData";

type InstructorAttemptRosterProps = {
  classroomId: string;
  assignmentId: string;
  studentAttemptGroups: InstructorStudentAttemptGroup[];
};

function getStatusLabel(status: AssignmentProgressState) {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
  }
}

function getStatusBadgeClassName(status: AssignmentProgressState) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-200";
    case "in_progress":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-200";
    case "not_started":
      return "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
  }
}

function getStatusCardClassName(status: AssignmentProgressState) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-white dark:border-emerald-500/30 dark:bg-neutral-950/40";
    case "in_progress":
      return "border-amber-200 bg-white dark:border-amber-500/30 dark:bg-neutral-950/40";
    case "not_started":
      return "border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950/40";
  }
}

function buildAttemptOptionLabel(attemptNumber: number) {
  return `Attempt ${attemptNumber}`;
}

function InstructorAttemptRoster({
  classroomId,
  assignmentId,
  studentAttemptGroups,
}: InstructorAttemptRosterProps) {
  const [selectedAttemptIds, setSelectedAttemptIds] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setSelectedAttemptIds((currentSelections) => {
      const nextSelections = { ...currentSelections };
      let didChange = false;

      studentAttemptGroups.forEach((group) => {
        const selectedAttemptId = currentSelections[group.student.user_id];
        const defaultAttemptId = group.preferredAttempt?.id ?? null;
        const selectedAttemptStillExists = group.attempts.some(
          (attempt) => attempt.id === selectedAttemptId,
        );

        if (!defaultAttemptId) {
          if (selectedAttemptId) {
            delete nextSelections[group.student.user_id];
            didChange = true;
          }
          return;
        }

        if (!selectedAttemptId || !selectedAttemptStillExists) {
          nextSelections[group.student.user_id] = defaultAttemptId;
          didChange = true;
        }
      });

      Object.keys(nextSelections).forEach((studentId) => {
        const stillExists = studentAttemptGroups.some(
          (group) => group.student.user_id === studentId,
        );

        if (!stillExists) {
          delete nextSelections[studentId];
          didChange = true;
        }
      });

      return didChange ? nextSelections : currentSelections;
    });
  }, [studentAttemptGroups]);

  const summary = useMemo(() => {
    return studentAttemptGroups.reduce(
      (counts, group) => {
        counts[group.status] += 1;
        return counts;
      },
      {
        completed: 0,
        in_progress: 0,
        not_started: 0,
      },
    );
  }, [studentAttemptGroups]);

  if (studentAttemptGroups.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-300 bg-white px-4 py-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300">
        No students have joined this classroom yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-200">
          {summary.completed} completed
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-200">
          {summary.in_progress} in progress
        </span>
        <span className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
          {summary.not_started} not started
        </span>
      </div>

      <div className="space-y-2">
        {studentAttemptGroups.map((group) => {
          const selectedAttemptId = selectedAttemptIds[group.student.user_id];
          const selectedAttempt =
            group.attempts.find((attempt) => attempt.id === selectedAttemptId) ??
            group.preferredAttempt;

          return (
            <article
              key={group.student.user_id}
              className={`rounded-2xl border px-4 py-3 shadow-sm ${getStatusCardClassName(group.status)}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
                  {group.student.user_name}
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClassName(group.status)}`}
                  >
                    {getStatusLabel(group.status)}
                  </span>

                  {selectedAttempt ? (
                    <>
                      <label
                        htmlFor={`attempt-${group.student.user_id}`}
                        className="sr-only"
                      >
                        Attempt
                      </label>
                      <select
                        id={`attempt-${group.student.user_id}`}
                        value={selectedAttempt.id}
                        onChange={(event) =>
                          setSelectedAttemptIds((currentSelections) => ({
                            ...currentSelections,
                            [group.student.user_id]: event.target.value,
                          }))
                        }
                        className="min-w-44 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-950"
                      >
                        {group.attempts.map((attempt) => (
                          <option key={attempt.id} value={attempt.id}>
                            {buildAttemptOptionLabel(attempt.attempt_number)}
                          </option>
                        ))}
                      </select>

                      <Link
                        to={`/classrooms/${classroomId}/assignment/${assignmentId}/attempt/${selectedAttempt.id}`}
                        className="inline-flex justify-center rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                      >
                        View attempt
                      </Link>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      No attempt yet
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default InstructorAttemptRoster;
