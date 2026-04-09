import { queryClient } from "../../lib/query-client-instance";
import { publicApiPost, resolvePublicApiToken } from "../../lib/public-api-client";
import type { ItemResponse, PublicClassroom } from "../../types/publicApi";

type CreateClassroomInput = {
  name: string;
};

type JoinClassroomInput = {
  code: string;
};

async function resolveRequiredToken() {
  const token = await resolvePublicApiToken();
  if (!token) {
    throw new Error("You must be logged in to manage classrooms.");
  }

  return token;
}

async function invalidatePublicApiQueries() {
  await queryClient.invalidateQueries({
    queryKey: ["public-api"],
  });
}

export async function createClassroom(input: CreateClassroomInput) {
  const token = await resolveRequiredToken();
  const response = await publicApiPost<ItemResponse<PublicClassroom>>(
    "/api/public/classrooms",
    token,
    {
      name: input.name,
    },
  );

  await invalidatePublicApiQueries();
  return response.item;
}

export async function joinClassroom(input: JoinClassroomInput) {
  const token = await resolveRequiredToken();
  const response = await publicApiPost<ItemResponse<PublicClassroom>>(
    "/api/public/classrooms/join",
    token,
    {
      code: input.code.trim(),
    },
  );

  await invalidatePublicApiQueries();
  return response.item;
}
