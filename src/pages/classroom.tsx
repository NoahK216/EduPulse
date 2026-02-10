import { useState } from "react";
import NavBar from "./ui/NavBar";

function Classroom() {
  const [showAssigned, setShowAssigned] = useState(true);

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-100">
      <NavBar />
      <div className="flex pt-16 min-h-screen">
        <aside className="w-64 border-r border-neutral-800 p-4">
          <h2 className="text-sm font-semibold text-neutral-300">Classroom</h2>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => setShowAssigned(true)}
              className="w-full rounded-md px-3 py-2 text-left text-sm">
                Assigned</button>
            <button
              onClick={() => setShowAssigned(false)}
              className="w-full rounded-md px-3 py-2 text-left text-sm">
                Completed</button>
          </div>
        </aside>
        <main className="flex-1 p-6">
          {showAssigned && (
            <div>
              <h1 className="text-2xl font-semibold">Assigned</h1>
              <p className="mt-2 text-sm text-neutral-300">
              Assigned scenarios will be shown here.
            </p>
          </div>)}
          {!showAssigned && (
            <div>
              <h1 className="text-2xl font-semibold">Completed</h1>
              <p className="mt-2 text-sm text-neutral-300">
              Completed scenarios will be shown here.
            </p>
          </div>)}
        </main>
      </div>
    </div>
  );
}

export default Classroom;
