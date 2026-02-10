import NavBar from "./pages/ui/NavBar";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="pt-12 min-h-screen bg-neutral-900 text-neutral-100">
      <NavBar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mt-2 text-4xl font-semibold">EduPulse</h1>
        <p className="mt-4 max-w-2xl text-neutral-200">
          Interactive training scenarios with AI grading.</p>
        <div className="mt-16 flex flex-wrap gap-6">
          <Link
            to="/scenario"
            className="rounded-md bg-blue-950 text-white! px-4 py-2 text-sm font-medium hover:bg-blue-500">
            Open Scenario Demo
          </Link>
          <Link
            to="/scenario/creator"
            className="rounded-md bg-neutral-800 text-white! px-4 py-2 text-sm font-medium hover:bg-neutral-600">
            Open Creator Demo
          </Link>
        </div>
      </main>
    </div>
  );
}

export default App;
