import NavBar from "../../components/layout/NavBar";
import { toggleTheme } from "../../lib/theme";
import { useState } from "react";

function SettingsPage() {
  const [activeSection, setActiveSection] = useState("appearance");

  return (
    <div className="pt-12 min-h-screen bg-white text-black dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <NavBar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mt-2 text-4xl font-semibold">Settings</h1>

        <div className="mt-10 flex gap-6">
          <aside className="w-64 shrink-0 border-r border-neutral-300 pr-4 dark:border-neutral-700">
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection("account")}
                className={
                  activeSection === "account"
                    ? "w-full rounded-md px-3 py-2 text-left text-sm bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-300 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }
              >
                Account
              </button>
              <button
                onClick={() => setActiveSection("appearance")}
                className={
                  activeSection === "appearance"
                    ? "w-full rounded-md px-3 py-2 text-left text-sm bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-300 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }
              >
                Appearance
              </button>

              <button
                onClick={() => setActiveSection("notification")}
                className={
                  activeSection === "notification"
                    ? "w-full rounded-md px-3 py-2 text-left text-sm bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-300 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }
              >
                Notifications
              </button>

              <button
                onClick={() => setActiveSection("accessibility")}
                className={
                  activeSection === "accessibility"
                    ? "w-full rounded-md px-3 py-2 text-left text-sm bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-300 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }
              >
                Accessibility
              </button>
            </div>
          </aside>

          <section className="flex-1 pl-8">
            {activeSection === "appearance" && (
              <>
                <h2 className="text-2xl font-semibold">Appearance</h2>

                <div className="mt-6">
                  <button
                    onClick={toggleTheme}
                    className="rounded-md px-4 py-2 text-sm font-medium border bg-neutral-300 text-neutral-800 border-neutral-300 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:border-neutral-700"
                  >
                    Change theme
                  </button>
                </div>
              </>
            )}
            {activeSection === "account" && (
              <>
                <h2 className="text-2xl font-semibold">Account</h2>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Manage account settings.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Your email"
                      className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <div className="border-t border-neutral-300 pt-6 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold">Change Password</h3>

                    <div className="mt-4 space-y-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                      <div className="flex items-center justify-between">
                        <button className="rounded-md border border-neutral-300 bg-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
                          Update Password
                        </button>

                        <button
                          type="button"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-400"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-300 pt-6 space-y-3 gap-3 dark:border-neutral-700">
                    <button className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800">
                      Log Out
                    </button>

                    <button className="w-full rounded-md border border-red-400 px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20">
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeSection === "notification" && (
              <>
                <h2 className="text-2xl font-semibold">Notifications</h2>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Choose which updates you would like to receive.
                </p>

                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <span className="text-sm">Email notifications</span>
                      <input type="checkbox" />
                    </label>

                    <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <span className="text-sm">Assignment updates</span>
                      <input type="checkbox" />
                    </label>

                    <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <span className="text-sm">Grading feedback</span>
                      <input type="checkbox" />
                    </label>

                    <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <span className="text-sm">Classroom announcements</span>
                      <input type="checkbox" />
                    </label>

                    <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <span className="text-sm">Discussions</span>
                      <input type="checkbox" />
                    </label>
                  </div>

                  <button className="rounded-md border border-neutral-300 bg-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
                    Save Preferences
                  </button>
                </div>
              </>
            )}

            {activeSection === "accessibility" && (
              <>
                <h2 className="text-2xl font-semibold">Accessibility</h2>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Adjust accessibility preferences. More coming soon.
                </p>

                <div className="mt-6 space-y-3">
                  <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="text-sm">Larger text</span>
                    <input type="checkbox" />
                  </label>

                  <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="text-sm">High contrast mode</span>
                    <input type="checkbox" />
                  </label>

                  <label className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                    <span className="text-sm">Always show captions</span>
                    <input type="checkbox" />
                  </label>
                </div>

                <button className="mt-6 rounded-md border border-neutral-300 bg-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
                  Save Preferences
                </button>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
