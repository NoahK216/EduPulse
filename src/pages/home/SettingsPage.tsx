import PageShell from "../../components/layout/PageShell";
import { toggleTheme } from "../../lib/theme";

function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      subtitle="Appearance preferences for your current browser session."
      widthClassName="max-w-3xl"
    >
      <section className="rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Appearance
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-neutral-50">
          Theme
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
          Switch between the current light and dark themes. No account-level
          settings are stored here.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            Change theme
          </button>
        </div>
      </section>
    </PageShell>
  );
}

export default SettingsPage;
