import NavBar from "../ui/NavBar";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="pt-12 min-h-screen  dark:bg-neutral-900 dark:text-neutral-100">
      <NavBar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mt-2 text-4xl font-semibold">EduPulse</h1>
        <p className="mt-4 max-w-2xl dark:text-neutral-200">
          Interactive training scenarios with AI grading.
        </p>
        <div className="mt-16 flex flex-wrap gap-6">
          <Link
            to="/classrooms"
            className="rounded-md px-4 py-2 text-sm font-medium border transition-colors bg-neutral-300 text-neutral-900 border-neutral-300 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700"
          >
            Browse Classrooms
          </Link>
          <Link
            to="/scenario/library"
            className="rounded-md px-4 py-2 text-sm font-medium border transition-colors bg-neutral-300 text-neutral-900 border-neutral-300 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700"
          >
            Scenario Library
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Home;
