import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../../components/ui/Surfaces";
import type { PublicClassroom } from "../../../types/publicApi";

function ClassroomRow({ classroom }: { classroom: PublicClassroom }) {
  const activeAssignmentLabel =
    classroom.active_assignment_count === 1
      ? "1 active assignment"
      : `${classroom.active_assignment_count} active assignments`;

  return (
    <Link
      to={`/classrooms/${classroom.id}`}
      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50 dark:hover:bg-neutral-900/70"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-semibold text-neutral-950 dark:text-neutral-50">
            {classroom.name}
          </p>
          <StatusBadge
            tone={classroom.viewer_role === "instructor" ? "indigo" : "cyan"}
          >
            {classroom.viewer_role}
          </StatusBadge>
        </div>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          {activeAssignmentLabel}
        </p>
      </div>

      <FiArrowRight className="text-neutral-400" />
    </Link>
  );
}

export default ClassroomRow;
