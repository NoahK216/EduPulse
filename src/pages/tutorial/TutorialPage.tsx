import { Link } from 'react-router-dom';

import NavBar from '../../components/layout/NavBar';
import ScenarioViewer from '../scenario/viewer/ScenarioViewer';

function TutorialPage() {
  return (
    <div className="min-h-screen w-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-20">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            Getting Started
          </p>
          <h1 className="mt-1 text-3xl font-semibold">EduPulse Tutorial</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Walk through this interactive scenario to learn how EduPulse works — no sign-in
            required.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950/60 p-4">
          <ScenarioViewer scenarioUrl="/scenarios/tutorial.json" />
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Ready to get started?{' '}
          <Link
            to="/login"
            className="font-semibold !text-cyan-600 hover:!text-cyan-500 dark:!text-cyan-400 dark:hover:!text-cyan-300"
          >
            Sign in to EduPulse
          </Link>
        </p>
      </main>
    </div>
  );
}

export default TutorialPage;
