import { stringFromDateOrText } from '../../../lib/format-dates';
import type { PublicAssignment } from '../../../types/publicApi';

type AssignmentSummaryCardProps = {
  assignment: PublicAssignment;
};

function AssignmentSummaryCard({ assignment }: AssignmentSummaryCardProps) {
  return (
    <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
      <h2 className="text-xl font-semibold">{assignment.title}</h2>
      <p className="mt-1 text-sm text-neutral-300">
        Scenario version: {assignment.scenario_version_title} (v
        {assignment.scenario_version_number})
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Assigned by: {assignment.assigned_by_name}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Opens: {stringFromDateOrText(assignment.open_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Due: {stringFromDateOrText(assignment.due_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Closes: {stringFromDateOrText(assignment.close_at, "N/A")}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Max attempts: {assignment.max_attempts === null ? 'Unlimited' : assignment.max_attempts}
      </p>
      {assignment.instructions ? (
        <p className="mt-3 text-sm text-neutral-200">{assignment.instructions}</p>
      ) : null}
    </section>
  );
}

export default AssignmentSummaryCard;
