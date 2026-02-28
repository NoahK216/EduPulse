import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";

function NavBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const loc = useLocation();
  const navigate = useNavigate();
  const session = authClient.useSession();
  const userName = session?.user?.name || session?.user?.email;

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

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
    <div className="fixed top-0 left-0 right-0 h-14 bg-neutral-900 text-white px-6 flex items-center justify-between">
      <Link to="/" className="font-semibold">
        EduPulse
      </Link>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded bg-gray-800 hover:bg-gray-600 flex items-center justify-center"
          aria-label="Menu"
          aria-expanded={open}
        >
          <div className="flex flex-col gap-1">
            <span className="block w-4 h-[2px] bg-white" />
            <span className="block w-4 h-[2px] bg-white" />
            <span className="block w-4 h-[2px] bg-white" />
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-neutral-800 border border-gray-700 shadow-lg overflow-hidden">
            {session?.session ? (
              // logged-in menu
              <>
                <p className="block !text-white px-3 py-2 text-sm">
                  {userName}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.signOut();
                    navigate("/");
                  }}
                  className="block w-full text-left !text-white px-3 py-2 text-sm hover:bg-gray-700">
                  Logout
                </button>
              </>
            ) : (
              // not logged in
              <>
                <Link
                  to="/login"
                  className="block !text-white px-3 py-2 text-sm hover:bg-gray-700">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block !text-white px-3 py-2 text-sm hover:bg-gray-700">
                  Sign up
                </Link>
              </>
            )}
            <Link
              to="/classroom"
              className="block !text-white px-3 py-2 text-sm hover:bg-gray-700">
              Classroom
            </Link>
            <div className="h-px bg-gray-700" />
              <p className="block px-3 py-2 text-sm">
                Settings</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;