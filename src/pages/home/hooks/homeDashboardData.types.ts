import type { DataGuardState } from "../../../components/data/DataGuard";
import type {
  PublicClassroom,
  PublicClassroomRole,
} from "../../../types/publicApi";

export type DashboardTone =
  | "slate"
  | "cyan"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose";


export type DashboardAction = {
  label: string;
  to: string;
  style: "primary" | "secondary";
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
  activeRoles: PublicClassroomRole[];
  guard: DataGuardState;
  actionBarActions: DashboardAction[];
  classroomList: PublicClassroom[];
  continueWork: DashboardContinueWork | null;
  showEmptyState: boolean;
  hasStudentRole: boolean;
  hasInstructorRole: boolean;
};
