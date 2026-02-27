import type { ReactNode } from 'react';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authClient } from './lib/auth-client';

// Adapter to let Neon Auth UI components use react-router links.
function Link({ href, ...props }: { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <RouterLink to={href} {...props} />;
}

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={(path) => navigate(path)}
      replace={(path) => navigate(path, { replace: true })}
      onSessionChange={() => {}}
      Link={Link}
      social={{ providers: ['google', 'github'] }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
