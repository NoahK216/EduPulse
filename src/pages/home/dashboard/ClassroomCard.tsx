import { Link } from "react-router-dom";

import type { PublicClassroom } from "../../../types/publicApi";

type ClassroomCardProps = {
  classroom: PublicClassroom;
};

function ClassroomCard({ classroom }: ClassroomCardProps) {
  return (
    <Link
      to={`/classrooms/${classroom.id}`}
      className="flex aspect-square w-56 shrink-0 flex-col justify-between rounded-md border border-neutral-300 bg-white p-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-neutral-700"
    >
      <div>
        <p className="line-clamp-3 text-lg font-medium">{classroom.name}</p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Code: {classroom.code ?? "N/A"}
        </p>
      </div>

      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        <p>{classroom.member_count} members</p>
        <p className="mt-1">{classroom.assignment_count} assignments</p>
      </div>
    </Link>
  );
}

export default ClassroomCard;
