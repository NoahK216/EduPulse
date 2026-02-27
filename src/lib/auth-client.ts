import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  throw new Error(
    'VITE_NEON_AUTH_URL is missing. Copy the Auth URL from your Neon console (Auth tab) into .env before running the app.'
  );
}

// Shared Neon Auth client with React hooks enabled.
export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});
