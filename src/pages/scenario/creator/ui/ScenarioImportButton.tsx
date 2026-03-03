import type { Scenario } from "../../scenarioSchemas";
import { importScenarioFromFile } from "../import";

export function ScenarioImportButton({ onLoaded }: { onLoaded: (v: Scenario) => void }) {
    return (
        <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-500/75 bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 transition hover:border-sky-400/70 hover:bg-slate-800">
            Import JSON
            <input
                className="hidden"
                type="file"
                accept="application/json,.json"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                        const scenario = await importScenarioFromFile(file);
                        onLoaded(scenario);
                    } catch (err) {
                        console.error(err);
                        alert(err instanceof Error ? err.message : "Import failed");
                    } finally {
                        // allows re-selecting the same file
                        e.currentTarget.value = "";
                    }
                }}
            />
        </label>
    );
}
