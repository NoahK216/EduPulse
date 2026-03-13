import { Link } from "react-router-dom";

import { useApiData } from "../../lib/useApiData";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from "../ui/DataStatePanels";
import PageShell from "../ui/PageShell";
import type { PagedResponse, PublicClassroom } from "../../types/publicApi";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ClassroomList() {
  const { data, loading, error, unauthorized, refetch } = useApiData<
    PagedResponse<PublicClassroom>
  >("/api/public/classrooms");

  return (
    <PageShell
      title="Classrooms"
      subtitle="Browse classrooms where you are the creator or a member."
    >
      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && loading ? <LoadingPanel /> : null}
      {!unauthorized && !loading && error ? (
        <ErrorPanel message={error} onRetry={refetch} />
      ) : null}
      {!unauthorized &&
      !loading &&
      !error &&
      data &&
      data.items.length === 0 ? (
        <EmptyPanel message="No classrooms are available yet." />
      ) : null}

      {!unauthorized && !loading && !error && data && data.items.length > 0 ? (
        <div className="space-y-3">
          {data.items.map((classroom) => (
            <Link
              key={classroom.id}
              to={`/classrooms/${classroom.id}`}
              className="block rounded-md border border-neutral-800 bg-neutral-800 p-4 hover:border-neutral-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{classroom.name}</h2>
                  <p className="mt-1 text-sm text-neutral-300">
                    Code: {classroom.code ?? "N/A"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Created by {classroom.created_by_name} on{" "}
                    {formatDate(classroom.created_at)}
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
      ) : null}
    </PageShell>
  );
}

export default ClassroomList;
