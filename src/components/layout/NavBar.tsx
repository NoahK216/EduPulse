import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiHome, FiLayers, FiSettings, FiUsers } from "react-icons/fi";

import { authClient } from "../../lib/auth-client";
import { cn } from "../../lib/cn";

interface NavBarProps {
  showMenu?: boolean;
}

const appLinks = [
  { to: "/", label: "Home", icon: FiHome },
  { to: "/classrooms", label: "Classrooms", icon: FiUsers },
  { to: "/scenario/library", label: "Scenarios", icon: FiLayers },
];

function getDisplayName(value: string | null | undefined) {
  if (!value) {
    return "Account";
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "Account";
  }

  if (trimmed.includes("@")) {
    return trimmed.split("@")[0];
  }

  return trimmed.split(/\s+/)[0];
}

function getInitial(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized[0]!.toUpperCase() : "A";
}

function isActivePath(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavBar({ showMenu }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const isAuthed = Boolean(session?.session);
  const userName = session?.user?.name || session?.user?.email;
  const displayName = getDisplayName(userName);
  const navigate = useNavigate();

  useEffect(() => {
    function onDown(event: MouseEvent) {
      if (!open || !ref.current) {
        return;
      }

      if (!ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-950/82">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="shrink-0">
            <img
              src="/logos/edupulse-with-wordmark.svg"
              className="h-10 w-auto"
              alt="EduPulse"
            />
          </Link>

          {isAuthed ? (
            <nav className="hidden items-center gap-1 md:flex">
              {appLinks.map((link) => {
                const active = isActivePath(location.pathname, link.to);

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "rounded-full px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-cyan-50 text-cyan-800 dark:bg-cyan-500/12 dark:text-cyan-100"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        <div className="relative" ref={ref}>
          {typeof showMenu === "undefined" || showMenu ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-2 py-1.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <span className="hidden pl-2 sm:block">{isAuthed ? displayName : "Account"}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-800 dark:bg-cyan-500/18 dark:text-cyan-100">
                {getInitial(isAuthed ? displayName : "Account")}
              </span>
              <FiChevronDown
                className={cn("text-sm", open ? "rotate-180" : undefined)}
              />
            </button>
          ) : null}

          {open ? (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-neutral-200 bg-white/95 p-2 shadow-[0_26px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/96">
              {isPending ? (
                <p className="px-3 py-3 text-sm text-neutral-600 dark:text-neutral-300">
                  Loading...
                </p>
              ) : isAuthed ? (
                <>
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                        Signed in
                      </p>
                      <p className="mt-2 text-sm font-medium text-neutral-950 dark:text-neutral-50">
                        {userName}
                      </p>
                    </div>

                    <div className="mt-2 space-y-1">
                      {appLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white"
                          >
                            <Icon className="text-base" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}

                      <Link
                        to="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white"
                      >
                        <FiSettings className="text-base" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={async () => {
                          setOpen(false);
                          await authClient.signOut();
                          navigate("/");
                        }}
                        className="w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                ) : (
                    <div className="space-y-1">
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block rounded-2xl px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setOpen(false)}
                        className="block rounded-2xl px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white"
                      >
                        Create account
                      </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
