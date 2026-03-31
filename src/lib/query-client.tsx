import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { authClient } from './auth-client';
import { clearPublicApiTokenCache } from './public-api-client';
import { queryClient } from './query-client-instance';

type PublicApiQueryProviderProps = {
  children: ReactNode;
};

export function PublicApiQueryProvider({
  children,
}: PublicApiQueryProviderProps) {
  const { data: session, isPending } = authClient.useSession();
  const previousIdentityRef = useRef<string | null | undefined>(undefined);
  const currentIdentity = session?.session?.userId ?? null;

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (previousIdentityRef.current === undefined) {
      previousIdentityRef.current = currentIdentity;
      return;
    }

    if (previousIdentityRef.current !== currentIdentity) {
      clearPublicApiTokenCache();
      queryClient.clear();
    }

    previousIdentityRef.current = currentIdentity;
  }, [currentIdentity, isPending]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
