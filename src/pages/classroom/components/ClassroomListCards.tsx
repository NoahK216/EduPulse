import { Link } from 'react-router-dom';

import type { PublicClassroom } from '../../../types/publicApi';

type ClassroomListCardsProps = {
  classrooms: PublicClassroom[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ClassroomListCards({ classrooms }: ClassroomListCardsProps) {
  return (
    <div className="space-y-3">
      {classrooms.map((classroom) => (
        <Link
          key={classroom.id}
          to={`/classrooms/${classroom.id}`}
          className="block rounded-md border border-neutral-800 bg-neutral-800 p-4 hover:border-neutral-700"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{classroom.name}</h2>
              <p className="mt-1 text-sm text-neutral-300">
                Code: {classroom.code ?? 'N/A'}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Created by {classroom.created_by_name} on {formatDate(classroom.created_at)}
              </p>
            </div>
            <div className="text-right text-sm text-neutral-300">
              <p>{classroom.member_count} members</p>
              <p>{classroom.assignment_count} assignments</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ClassroomListCards;
