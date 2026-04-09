import { Link } from 'react-router-dom';

import type { PublicResponse } from '../../../types/publicApi';

type ResponseListProps = {
  responses: PublicResponse[];
  classroomId: string;
  assignmentId: string;
  attemptId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ResponseList({
  responses,
  classroomId,
  assignmentId,
  attemptId,
}: ResponseListProps) {
  return (
    <div className="mt-3 space-y-2">
      {responses.map((response) => (
        <Link
          key={response.id}
          to={`/classrooms/${classroomId}/assignment/${assignmentId}/attempt/${attemptId}/response/${response.id}`}
          className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
        >
          <p className="font-medium">Node: {response.node_id}</p>
          <p className="text-xs text-neutral-400">
            Created: {formatDate(response.created_at)}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default ResponseList;
