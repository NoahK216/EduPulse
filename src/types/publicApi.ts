import type {
  assignmentModel,
  attemptModel,
  classroom_memberModel,
  classroomModel,
  public_userModel,
  responseModel,
  scenario_versionModel,
  scenarioModel,
} from '../../prisma/generated/models.js';

type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;

export type PublicUserBase = Serialized<public_userModel>;
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

export type PublicClassroom = PublicClassroomBase & {
  created_by_name: string;
  created_by_email: string;
  member_count: number;
  assignment_count: number;
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
  classroom_id: number;
  classroom_name: string;
  student_name: string;
  student_email: string;
  response_count: number;
};

export type PublicResponse = PublicResponseBase & {
  attempt_number: number;
  assignment_id: number;
  assignment_title: string;
  classroom_id: number;
  classroom_name: string;
  student_name: string;
  student_email: string;
  has_response_payload: boolean;
  response_payload?: PublicResponseBase['response_payload'];
};
