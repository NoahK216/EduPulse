import { stringFromDateOrText } from "../../../lib/format-dates";
import type { PublicAttempt } from "../../../types/publicApi";

type AttemptSummaryCardProps = {
  attempt: PublicAttempt;
};

function AttemptSummaryCard({ attempt }: AttemptSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-neutral-300 bg-white p-5 text-neutral-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-100">
      <h2 className="text-xl font-semibold">
        Attempt {attempt.attempt_number} - {attempt.student_name}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Status: {attempt.status}
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Last activity: {stringFromDateOrText(attempt.last_activity_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Started: {stringFromDateOrText(attempt.started_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Submitted: {stringFromDateOrText(attempt.submitted_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        Responses saved: {attempt.response_count}
      </p>
      {attempt.current_node_id ? (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Current node: {attempt.current_node_id}
        </p>
      ) : null}
    </section>
  );
}

export default AttemptSummaryCard;
