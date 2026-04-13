import { Link } from "react-router-dom";

import type { PublicAttempt } from "../../../types/publicApi";
import { stringFromDateOrText } from "../../../lib/format-dates";

type AttemptListProps = {
  attempts: PublicAttempt[];
  classroomId: string;
  assignmentId: string;
  role: "instructor" | "student";
  latestAttemptId?: string | null;
};

function AttemptList({
  attempts,
  classroomId,
  assignmentId,
  role,
  latestAttemptId = null,
}: AttemptListProps) {
  return (
    <div className="mt-3 space-y-2">
      {attempts.map((attempt) => (
        <Link
          key={attempt.id}
          to={`/classrooms/${classroomId}/assignment/${assignmentId}/attempt/${attempt.id}`}
          className="block rounded border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-neutral-700"
        >
          <p className="font-medium">
            Attempt {attempt.attempt_number}
            {role === "instructor" ? ` - ${attempt.student_name}` : ""}
          </p>
          <p className="text-xs text-neutral-400">
            Status: {attempt.status} | Last saved:{" "}
            {stringFromDateOrText(attempt.last_activity_at, "N/A")}
          </p>
          {role === "student" && latestAttemptId === attempt.id ? (
            <p className="mt-1 text-xs text-neutral-500">Latest attempt</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export default AttemptList;
