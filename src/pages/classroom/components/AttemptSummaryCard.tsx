import { stringFromDateOrText } from '../../../lib/format-dates';
import type { PublicAttempt } from '../../../types/publicApi';

type AttemptSummaryCardProps = {
  attempt: PublicAttempt;
};


function AttemptSummaryCard({ attempt }: AttemptSummaryCardProps) {
  return (
    <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
      <h2 className="text-xl font-semibold">
        Attempt {attempt.attempt_number} - {attempt.student_name}
      </h2>
      <p className="mt-1 text-sm text-neutral-300">
        Status: {attempt.status}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Started: {stringFromDateOrText(attempt.started_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Submitted: {stringFromDateOrText(attempt.submitted_at, "N/A")}
      </p>
    </section>
  );
}

export default AttemptSummaryCard;
