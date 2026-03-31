import { Link } from 'react-router-dom';
import { stringFromDateOrText } from '../../../lib/format-dates';

type StudentProgressCardProps = {
  attemptsUsed: number;
  attemptsRemaining: number | null;
  isOpen: boolean;
  isClosed: boolean;
  openAt: string | null;
  closeAt: string | null;
  hasRunnableAttempt: boolean;
  inProgressAttemptNumber: number | null;
  canStartNewAttempt: boolean;
  runnerLink: string | null;
};

function StudentProgressCard({
  attemptsUsed,
  attemptsRemaining,
  isOpen,
  isClosed,
  openAt,
  closeAt,
  hasRunnableAttempt,
  inProgressAttemptNumber,
  canStartNewAttempt,
  runnerLink,
}: StudentProgressCardProps) {
  return (
    <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Your Progress</h3>
          <p className="mt-2 text-sm text-neutral-300">
            Attempts used: {attemptsUsed}
            {attemptsRemaining !== null ? ` | Remaining: ${attemptsRemaining}` : ''}
          </p>
          {!isOpen && openAt ? (
            <p className="mt-2 text-sm text-neutral-400">
              This assignment opens on {stringFromDateOrText(openAt, "N/A")}.
            </p>
          ) : null}
          {isClosed ? (
            <p className="mt-2 text-sm text-neutral-400">
              This assignment closed on {stringFromDateOrText(closeAt, "N/A")}.
            </p>
          ) : null}
          {isOpen && !isClosed && hasRunnableAttempt ? (
            <p className="mt-2 text-sm text-neutral-400">
              Resume attempt {inProgressAttemptNumber} where you left off.
            </p>
          ) : null}
          {isOpen && !isClosed && !hasRunnableAttempt && !canStartNewAttempt ? (
            <p className="mt-2 text-sm text-neutral-400">
              You have used all available attempts for this assignment.
            </p>
          ) : null}
        </div>

        {runnerLink && (hasRunnableAttempt || canStartNewAttempt) ? (
          <Link
            to={runnerLink}
            className="inline-flex rounded-md border border-neutral-300 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:border-neutral-700"
          >
            {hasRunnableAttempt ? 'Continue Attempt' : 'Start Attempt'}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default StudentProgressCard;
