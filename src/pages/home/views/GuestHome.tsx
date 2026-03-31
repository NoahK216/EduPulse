import { Link } from "react-router-dom";

import NavBar from "../../../components/layout/NavBar";

function GuestHome() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <NavBar />

      <main className="mx-auto max-w-5xl px-6 pb-10 pt-24">
        <h1 className="text-4xl font-semibold">EduPulse</h1>
        <p className="mt-4 max-w-2xl text-neutral-700 dark:text-neutral-200">
          Interactive training scenarios with AI grading.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/classrooms"
            className="rounded-md border border-neutral-300 bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            Browse Classrooms
          </Link>
          <Link
            to="/scenario/library"
            className="rounded-md border border-neutral-300 bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            Scenario Library
          </Link>
        </div>
      </main>
    </div>
  );
}

export default GuestHome;
