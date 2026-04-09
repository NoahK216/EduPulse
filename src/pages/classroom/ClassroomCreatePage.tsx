import { useState, type FormEvent } from "react";
import { FiArrowLeft, FiPlusSquare } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import PageShell from "../../components/layout/PageShell";
import { SurfaceCard } from "../../components/ui/Surfaces";
import { createClassroom } from "./classroomMutations";

function ClassroomCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage("Classroom name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const classroom = await createClassroom({
        name: name.trim(),
      });

      navigate(`/classrooms/${classroom.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create classroom.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Create Classroom"
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
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
              Create Classroom
            </h1>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <SurfaceCard>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="classroom-name"
                className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                Classroom name
              </label>
              <input
                id="classroom-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Intro to Clinical Reasoning"
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>

            {message ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-200">
                {message}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <FiPlusSquare />
                {isSubmitting ? "Creating..." : "Create classroom"}
              </button>
              <Link
                to="/classrooms"
                aria-disabled={isSubmitting}
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

export default ClassroomCreatePage;
