import type { classroom_role } from "../../prisma/generated/enums.js";
import type {
  assignmentModel,
  attemptModel,
  classroom_memberModel,
  classroomModel,
  responseModel,
  scenarioModel,
} from "../../prisma/generated/models.js";

type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

export type PublicClassroomBase = Serialized<classroomModel>;
export type PublicClassroomMemberBase = Serialized<classroom_memberModel>;
export type PublicScenarioBase = Serialized<scenarioModel>;
export type PublicAssignmentBase = Serialized<assignmentModel>;
export type PublicAttemptBase = Serialized<attemptModel>;
export type PublicResponseBase = Serialized<responseModel>;

export type CurrentUserProfile = {
  id: string;
  email: string;
  name: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ItemResponse<T> = {
  item: T;
};

export type PublicApiError = {
  error: string;
  message: string;
};

export type PublicClassroomRole = classroom_role;

export type PublicClassroom = PublicClassroomBase & {
  member_count: number;
  assignment_count: number;
  viewer_role: PublicClassroomRole;
  active_assignment_count: number;
};

export type PublicClassroomMember = PublicClassroomMemberBase & {
  classroom_name: string;
  user_name: string;
  user_email: string;
};

export type PublicScenario = PublicScenarioBase & {
  owner_name: string;
  owner_email: string;
  version_count: number;
};

export type PublicScenarioTemplate = {
  id: string;
  file_name: string;
  title: string;
  url: string;
};

export type PublicScenarioVersion = {
  id: string;
  scenario_id: string;
  version_number: number;
  title: string;
  published_by_user_id: string;
  published_at: string;
  scenario_title: string;
  assignment_count: number;
};

export type PublicAssignment = PublicAssignmentBase & {
  classroom_name: string;
  viewer_role: PublicClassroomRole;
  scenario_version_title: string;
  scenario_version_number: number;
  assigned_by_name: string;
  attempt_count: number;
};

export type PublicAttempt = PublicAttemptBase & {
  assignment_title: string;
  classroom_id: string;
  classroom_name: string;
  student_name: string;
  student_email: string;
  response_count: number;
};

export type PublicResponse = Omit<PublicResponseBase, "response_payload"> & {
  attempt_number: number;
  assignment_id: string;
  assignment_title: string;
  classroom_id: string;
  classroom_name: string;
  student_name: string;
  student_email: string;
  has_response_payload: boolean;
  response_payload?: PublicResponseBase["response_payload"];
};

export type PublicAssignmentAttemptSession = {
  assignment: PublicAssignment;
  attempt: PublicAttempt;
  responses: PublicResponse[];
  scenario_content: unknown;
};

export type PublicAttemptProgressResult = {
  attempt: PublicAttempt;
  response: PublicResponse | null;
  next_node_id: string | null;
  completed: boolean;
};
