import { Link } from 'react-router-dom';

import type { PublicAttempt } from '../../../types/publicApi';
import { stringFromDateOrText } from '../../../lib/format-dates';

type ContinueAttemptCardProps = {
  attempt: PublicAttempt;
};

function ContinueAttemptCard({ attempt }: ContinueAttemptCardProps) {
  return (
    <div className="rounded-md border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-800">
      <p className="text-lg font-medium">{attempt.assignment_title}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        {attempt.classroom_name}
      </p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Started {stringFromDateOrText(attempt.started_at, "No due date")}
      </p>
      <Link
        to={`/classrooms/${attempt.classroom_id}/assignment/${attempt.assignment_id}/attempt`}
        className="mt-4 inline-flex rounded-md border border-neutral-300 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:border-neutral-700"
      >
        Continue Assignment
      </Link>
    </div>
  );
}

export default ContinueAttemptCard;
