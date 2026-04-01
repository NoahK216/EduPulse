import type { DataGuardState } from "../../../components/data/DataGuard";
import type {
  PublicClassroom,
} from "../../../types/publicApi";

export type DashboardTone =
  | "slate"
  | "cyan"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose";

export type DashboardRole = "student" | "instructor";

export type DashboardAction = {
  label: string;
  to: string;
  style: "primary" | "secondary";
};

export type DashboardClassroomListItem = {
  classroom: PublicClassroom;
  role: DashboardRole;
  activeAssignmentCount: number;
  actionLink: string;
};

export type DashboardContinueWork =
  | {
      kind: "draft";
      title: string;
      subtitle: string;
      updatedAt: string;
      actionLabel: string;
      actionLink: string;
      tone: DashboardTone;
    }
  | {
      kind: "attempt";
      title: string;
      subtitle: string;
      updatedAt: string;
      actionLabel: string;
      actionLink: string;
      tone: DashboardTone;
    };

export type HomeDashboardData = {
  displayName: string;
  activeRoles: DashboardRole[];
  guard: DataGuardState;
  actionBarActions: DashboardAction[];
  classroomList: DashboardClassroomListItem[];
  continueWork: DashboardContinueWork | null;
  showEmptyState: boolean;
  hasStudentRole: boolean;
  hasInstructorRole: boolean;
};
