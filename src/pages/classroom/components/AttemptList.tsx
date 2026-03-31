import { Link } from 'react-router-dom';

import type { PublicAttempt } from '../../../types/publicApi';

type AttemptListProps = {
  attempts: PublicAttempt[];
  classroomId: string;
  assignmentId: string;
  role: 'instructor' | 'student';
  latestAttemptId?: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
}

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
          className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
        >
          <p className="font-medium">
            Attempt {attempt.attempt_number}
            {role === 'instructor' ? ` - ${attempt.student_name}` : ''}
          </p>
          <p className="text-xs text-neutral-400">
            Status: {attempt.status} | Last saved: {formatDate(attempt.last_activity_at)}
          </p>
          {role === 'student' && latestAttemptId === attempt.id ? (
            <p className="mt-1 text-xs text-neutral-500">Latest attempt</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export default AttemptList;
