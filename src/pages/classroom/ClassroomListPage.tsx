import ClassroomListCards from './components/ClassroomListCards';
import { useClassroomListData } from './hooks/useClassroomData';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';

function ClassroomListPage() {
  const data = useClassroomListData();

  return (
    <PageShell
      title="Classrooms"
      subtitle="Browse classrooms where you are the creator or a member."
    >
      <DataGuard state={data.guard}>
        <ClassroomListCards classrooms={data.classrooms} />
      </DataGuard>
    </PageShell>
  );
}

export default ClassroomListPage;
