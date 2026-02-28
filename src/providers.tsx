import type { ReactNode } from 'react';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { Link as RouterLink } from 'react-router-dom';
import { authClient } from './lib/auth-client';

// Adapter to let Neon Auth UI components use react-router links.
function Link({ href, ...props }: { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <RouterLink to={href} {...props} />;
}

export function Providers({ children }: { children: ReactNode }) {
  // use basic browser navigation rather than router hook to avoid needing
  // React Router context at the top level
  const go = (path: string) => {
    window.location.assign(path);
  };
  const replace = (path: string) => {
    window.history.replaceState(null, '', path);
  };

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={go}
      replace={replace}
      onSessionChange={() => {}}
      Link={Link}
      social={{ providers: ['google', 'github'] }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
