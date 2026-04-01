import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export type SurfaceTone =
  | "slate"
  | "cyan"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose";

const toneStyles: Record<SurfaceTone, string> = {
  slate:
    "border-neutral-300/80 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200",
  cyan:
    "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/12 dark:text-cyan-200",
  indigo:
    "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/12 dark:text-indigo-200",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-200",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-200",
  rose:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/12 dark:text-rose-200",
};

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-neutral-300/80 bg-white/90 p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/65",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: SurfaceTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyStateCard({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <SurfaceCard className={cn("border-dashed", className)}>
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">
        {title}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </SurfaceCard>
  );
}
