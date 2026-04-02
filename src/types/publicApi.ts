import type { classroom_role } from "../../prisma/generated/enums.js";
import type {
  assignmentModel,
  attemptModel,
  classroom_memberModel,
  classroomModel,
  responseModel,
  scenario_versionModel,
  scenarioModel,
} from "../../prisma/generated/models.js";

type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

export type PublicUser = {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_classroom_count: number;
  classroom_membership_count: number;
  owned_scenario_count: number;
  attempt_count: number;
};
export type PublicClassroomBase = Serialized<classroomModel>;
export type PublicClassroomMemberBase = Serialized<classroom_memberModel>;
export type PublicScenarioBase = Serialized<scenarioModel>;
export type PublicScenarioVersionBase = Serialized<scenario_versionModel>;
export type PublicAssignmentBase = Serialized<assignmentModel>;
export type PublicAttemptBase = Serialized<attemptModel>;
export type PublicResponseBase = Serialized<responseModel>;

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
  created_by_name: string;
  created_by_email: string;
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

export type PublicScenarioVersion = PublicScenarioVersionBase & {
  scenario_title: string;
  published_by_name: string;
  published_by_email: string;
  assignment_count: number;
  has_content: boolean;
};

export type PublicAssignment = PublicAssignmentBase & {
  classroom_name: string;
  scenario_version_title: string;
  scenario_version_number: number;
  assigned_by_name: string;
  assigned_by_email: string;
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
