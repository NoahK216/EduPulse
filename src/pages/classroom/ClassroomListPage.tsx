import { Link } from "react-router-dom";

import ClassroomListCards from './components/ClassroomListCards';
import { useClassroomListData } from './hooks/useClassroomData';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';
import { SectionHeader, SurfaceCard } from "../../components/ui/Surfaces";

function ClassroomListPage() {
  const data = useClassroomListData();

  return (
    <PageShell
      title="Classrooms"
      widthClassName="max-w-5xl"
      header={
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
              Classrooms
            </h1>
          </div>

          <SurfaceCard className="p-3">
            <div className="flex flex-wrap gap-3">
              <Link
                to="/classrooms/create"
                className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                + Create Classroom
              </Link>
              <Link
                to="/classrooms/join"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
              >
                Join classroom
              </Link>
            </div>
          </SurfaceCard>
        </div>
      }
    >
      <section className="space-y-4">
        <SectionHeader title="Your Classrooms" />
        <DataGuard state={data.guard}>
          <ClassroomListCards classrooms={data.classrooms} />
        </DataGuard>
      </section>
    </PageShell>
  );
}

export default ClassroomListPage;
