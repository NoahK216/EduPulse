import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../../lib/auth-client";

function NavBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const userName = session?.user?.name || session?.user?.email;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 px-6 flex items-center justify-between dark:bg-neutral-900 dark:border-neutral-800">
      <Link to="/" className="font-semibold">
        <img src="/logos/edupulse-with-wordmark.svg" className="h-10" />
      </Link>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded hover:bg-neutral-200 flex items-center justify-center dark:bg-gray-800 dark:hover:bg-gray-600"
          aria-label="Menu"
          aria-expanded={open}
        >
          <div className="flex flex-col gap-1">
            <span className="block w-4 h-[2px] bg-black dark:bg-white" />
            <span className="block w-4 h-[2px] bg-black dark:bg-white" />
            <span className="block w-4 h-[2px] bg-black dark:bg-white" />
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-white border border-neutral-200 shadow-lg overflow-hidden dark:bg-neutral-800 dark:border-gray-700">
            {isPending ? (
              <p className="block !text-white px-3 py-2 text-sm">Loading…</p>
            ) : session?.session ? (
              // logged-in menu
              <>
                <p className="block !text-white px-3 py-2 text-sm">
                  {userName}
                </p>
                  <Link
                    to="/"
                    onClick={async () => {
                    await authClient.signOut();
                  }}
                    className="block px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-gray-700"
                >
                  Logout
                  </Link>
                  <Link
                    to="/classrooms"
                    className="block px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-gray-700"
                  >
                    Classroom
                  </Link>
                  <div className="h-px bg-neutral-500 dark:bg-gray-700" />
                  <Link
                    to="/settings"
                    className="block px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-gray-700"
                  >
                    Settings
                  </Link>
              </>
            ) : (
              // not logged in
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-200 dark:text-white dark:hover:bg-gray-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
