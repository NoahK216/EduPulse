import type { EditorScenario } from "../EditorScenarioSchemas";
import { importScenarioFromFile } from "../import";

export function ScenarioImportButton({ onLoaded }: { onLoaded: (v: EditorScenario) => void }) {
    return (
        <input
            // TODO update this UI
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
    );
}
