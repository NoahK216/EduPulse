import NavBar from "../ui/NavBar";
import { useState } from "react";

function Settings() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);

    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };

  return (
    <div className="pt-12 min-h-screen bg-white text-black dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mt-2 text-4xl font-semibold">Settings</h1>
        <p className="mt-4 max-w-2xl text-neutral-200">
          Interactive training scenarios with AI grading.
        </p>
        <div className="mt-16 flex flex-wrap gap-6">
          <button
            onClick={toggleTheme}
            className="rounded-md px-4 py-2 text-sm font-medium cursor-pointer border bg-neutral-300 text-neutral-800 border-neutral-300 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white  dark:hover:bg-neutral-700  dark:border-neutral-700"
          >
            {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Settings;
