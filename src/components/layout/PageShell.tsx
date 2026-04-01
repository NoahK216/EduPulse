import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import NavBar from "./NavBar";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  header?: ReactNode;
  widthClassName?: string;
};

function PageShell({
  title,
  subtitle,
  children,
  header,
  widthClassName,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <NavBar />
      <main className={cn("mx-auto w-full px-6 pb-14 pt-24", widthClassName ?? "max-w-5xl")}>
        {header ?? (
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
            {subtitle ? (
              <p className="mt-2 max-w-3xl text-sm text-neutral-700 dark:text-neutral-300">
                {subtitle}
              </p>
            ) : null}
          </div>
        )}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export default PageShell;
