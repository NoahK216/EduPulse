import { Link } from "react-router-dom";

import type { PublicAssignment } from "../../../types/publicApi";
import { stringFromDateOrText } from "../../../lib/format-dates";

type AssignmentCardProps = {
  assignment: PublicAssignment;
};

function AssignmentCard({ assignment }: AssignmentCardProps) {
  return (
    <Link
      to={`/classrooms/${assignment.classroom_id}/assignment/${assignment.id}`}
      className="flex aspect-square w-56 shrink-0 flex-col justify-between rounded-md border border-neutral-300 bg-white p-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-neutral-700"
    >
      <div>
        <p className="line-clamp-2 text-lg font-medium">{assignment.title}</p>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
          {assignment.classroom_name}
        </p>
      </div>

      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        <p className="uppercase tracking-wide">Due</p>
        <p className="mt-1 line-clamp-3">{stringFromDateOrText(assignment.due_at, "No due date")}</p>
      </div>
    </Link>
  );
}

export default AssignmentCard;
