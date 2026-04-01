import { useState } from "react";
import { FiArrowLeft, FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";

import PageShell from "../../components/layout/PageShell";
import { SectionHeader, StatusBadge, SurfaceCard } from "../../components/ui/Surfaces";

function ClassroomJoinPage() {
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <PageShell
      title="Join Classroom"
      widthClassName="max-w-4xl"
      header={
        <div className="space-y-4">
          <Link
            to="/classrooms"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-200 dark:hover:text-cyan-100"
          >
            <FiArrowLeft />
            Back to classrooms
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge tone="cyan">Route scaffolded</StatusBadge>
                <StatusBadge tone="slate">Backend pending</StatusBadge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
                Join Classroom
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
                Enter a classroom code here once the join flow is connected. For now this route
                exists purely as frontend scaffolding.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <SurfaceCard>
          <SectionHeader
            title="Enter Join Code"
            description="This submit path is intentionally not connected yet."
          />

          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("Join classroom is not wired to the backend yet.");
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="join-code"
                className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                Classroom code
              </label>
              <input
                id="join-code"
                type="text"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="Enter classroom code"
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>

            {message ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-200">
                {message}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <FiLogIn />
                Join classroom
              </button>
              <Link
                to="/classrooms"
                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
              >
                Cancel
              </Link>
            </div>
          </form>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}

export default ClassroomJoinPage;
