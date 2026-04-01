import { FiArrowRight, FiMessageSquare, FiPlayCircle, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";

import NavBar from "../../../components/layout/NavBar";
import { StatusBadge, SurfaceCard } from "../../../components/ui/Surfaces";

const featureCards = [
  {
    title: "Interactive scenarios",
    description:
      "Build branching learning flows that guide students through decisions, context, and consequences instead of static prompt screens.",
    icon: FiPlayCircle,
  },
  {
    title: "AI-assisted free response evaluation",
    description:
      "Capture student reasoning inside the scenario and provide structured AI feedback for written responses where it counts.",
    icon: FiMessageSquare,
  },
  {
    title: "Classroom assignment tracking",
    description:
      "Just as you expect.",
    icon: FiUsers,
  },
];

const workflowSteps = [
  {
    step: "1",
    title: "Author a scenario",
    description: "Create a branching scenario draft, refine the flow, and publish a stable version when it is ready to assign.",
  },
  {
    step: "2",
    title: "Assign it to a classroom",
    description: "Choose the scenario version, set timing rules, and push the assignment into the classrooms where it belongs.",
  },
  {
    step: "3",
    title: "Review student reasoning",
    description: "Track attempts, open submissions, and use AI-assisted feedback to support faster and more consistent review.",
  },
];

function GuestHome() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <NavBar showMenu={false} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-24">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[linear-gradient(135deg,#0f172a_0%,#12314a_42%,#0b5b6d_100%)] px-6 py-8 text-white shadow-[0_28px_90px_-42px_rgba(14,116,144,0.55)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-[-10%] w-[48%] bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.2),transparent_62%)]" />
          <div className="pointer-events-none absolute left-[-8%] top-[-18%] h-52 w-52 rounded-full bg-cyan-300/14 blur-3xl" />

          <div className="relative">
            <img
              src="/logos/edupulse-with-wordmark.svg"
              alt="EduPulse"
              className="h-12 w-auto"
            />

            <div className="mt-8 flex flex-wrap gap-2">
              <StatusBadge tone="cyan" className="border-white/10">
                Scenario-based learning
              </StatusBadge>
              <StatusBadge tone="emerald" className="border-white/10">
                Structured feedback
              </StatusBadge>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Scenario-based learning with structured feedback
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50/88">
              Build interactive training scenarios, assign them to classrooms, and review
              student reasoning with AI-assisted evaluation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
              >
                Sign in
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
              Why EduPulse
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) =>
              <SurfaceCard key={feature.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-lg text-cyan-700 dark:bg-neutral-900 dark:text-cyan-200">
                  <feature.icon />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {feature.description}
                </p>
              </SurfaceCard>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-neutral-300/80 bg-white/90 p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.4)] dark:border-neutral-800 dark:bg-neutral-950/65">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            How it works
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.5rem] border border-neutral-200 bg-neutral-100/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/80"
              >
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                  Step {item.step}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="flex flex-col items-center w-full"
        >
          <SurfaceCard className="flex flex-col w-fit">
            <div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
                See the editor and student flow in action
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Sign in to create classrooms, scenarios, and a better learning experience.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Sign in to EduPulse
                <FiArrowRight />
              </Link>
            </div>
          </SurfaceCard>
        </section>
      </main>
    </div>
  );
}

export default GuestHome;
