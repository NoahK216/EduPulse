import { Link } from 'react-router-dom';

export function LoadingPanel() {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-800 p-4 text-sm text-neutral-300">
      Loading...
    </div>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-800 p-4 text-sm text-neutral-300">
      {message}
    </div>
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
    <div className="rounded-md border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded bg-red-800 px-3 py-1 text-xs font-medium hover:bg-red-700"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function UnauthorizedPanel() {
  return (
    <div className="rounded-md border border-yellow-900 bg-yellow-950/40 p-4 text-sm text-yellow-200">
      <p>Your session is missing or expired.</p>
      <Link
        to="/login"
        className="mt-3 inline-block rounded bg-yellow-800 px-3 py-1 text-xs font-medium text-yellow-50 hover:bg-yellow-700"
      >
        Log in
      </Link>
    </div>
  );
}
