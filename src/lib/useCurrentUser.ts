import type { ItemResponse, PublicUser } from '../types/publicApi';

import { useApiData, type ApiState } from './useApiData';

export type CurrentUserState = ApiState<ItemResponse<PublicUser>> & {
  user: PublicUser | null;
};

export function useCurrentUser(): CurrentUserState {
  const state = useApiData<ItemResponse<PublicUser>>('/api/public/me');

  return {
    ...state,
    user: state.data?.item ?? null,
  };
}
