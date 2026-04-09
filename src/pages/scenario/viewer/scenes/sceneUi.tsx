import type { ReactNode } from "react";

import { SurfaceCard, type SurfaceTone } from "../../../../components/ui/Surfaces";
import { cn } from "../../../../lib/cn";

const tonePanelStyles: Record<SurfaceTone, string> = {
  slate:
    "border-neutral-200 bg-neutral-50/90 dark:border-neutral-800 dark:bg-neutral-900/80",
  cyan:
    "border-cyan-200 bg-cyan-50/90 dark:border-cyan-500/30 dark:bg-cyan-500/10",
  indigo:
    "border-indigo-200 bg-indigo-50/90 dark:border-indigo-500/30 dark:bg-indigo-500/10",
  emerald:
    "border-emerald-200 bg-emerald-50/90 dark:border-emerald-500/30 dark:bg-emerald-500/10",
  amber:
    "border-amber-200 bg-amber-50/90 dark:border-amber-500/30 dark:bg-amber-500/10",
  rose:
    "border-rose-200 bg-rose-50/90 dark:border-rose-500/30 dark:bg-rose-500/10",
};

export const scenePrimaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400";

export const sceneSecondaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900";

export function SceneErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/12 dark:text-rose-100">
      {message}
    </div>
  );
}

export function SceneLayout({
  tone,
  title,
  children,
  footer,
  errorMessage,
}: {
  tone: SurfaceTone;
  label: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  errorMessage?: string | null;
}) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div
        className={cn(
          "border-b px-6 py-5",
          tonePanelStyles[tone],
        )}
      >
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50 sm:text-3xl">
          {title}
        </h2>
      </div>

      <div className="space-y-5 px-6 py-6">
        {children}
        {errorMessage ? <SceneErrorBanner message={errorMessage} /> : null}
        {footer ? (
          <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800">
            {footer}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
