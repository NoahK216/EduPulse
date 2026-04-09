import { Link } from "react-router-dom";

import { SurfaceCard } from "../ui/Surfaces";

export function LoadingPanel() {
  return (
    <SurfaceCard>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">Loading...</p>
    </SurfaceCard>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <SurfaceCard className="border-dashed">
      <p className="text-sm text-neutral-700 dark:text-neutral-300">{message}</p>
    </SurfaceCard>
  );
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <SurfaceCard className="border-red-300 bg-red-50/90 dark:border-red-900/70 dark:bg-red-950/40">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
        >
          Retry
        </button>
      ) : null}
    </SurfaceCard>
  );
}

export function UnauthorizedPanel() {
  return (
    <SurfaceCard className="border-amber-300 bg-amber-50/90 dark:border-amber-900/70 dark:bg-amber-950/35">
      <p>Your session is missing or expired.</p>
      <Link
        to="/login"
        className="mt-3 inline-block rounded-full bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
      >
        Log in
      </Link>
    </SurfaceCard>
  );
}
