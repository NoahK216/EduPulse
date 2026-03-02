import type { ReactNode } from 'react';

import NavBar from './NavBar';

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-100">
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 pb-10 pt-20">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-neutral-300">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export default PageShell;
