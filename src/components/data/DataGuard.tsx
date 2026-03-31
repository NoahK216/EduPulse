import type { ReactNode } from 'react';

import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from './DataStatePanels';

export type DataGuardState =
  | { kind: 'content' }
  | { kind: 'loading' }
  | { kind: 'unauthorized' }
  | { kind: 'invalid'; message: string }
  | { kind: 'empty'; message: string }
  | { kind: 'error'; message: string; onRetry?: () => void };

type DataGuardProps = {
  state: DataGuardState;
  children: ReactNode;
};

export function DataGuard({ state, children }: DataGuardProps) {
  switch (state.kind) {
    case 'loading':
      return <LoadingPanel />;
    case 'unauthorized':
      return <UnauthorizedPanel />;
    case 'invalid':
      return <ErrorPanel message={state.message} />;
    case 'error':
      return <ErrorPanel message={state.message} onRetry={state.onRetry} />;
    case 'empty':
      return <EmptyPanel message={state.message} />;
    case 'content':
      return <>{children}</>;
    default:
      return null;
  }
}
