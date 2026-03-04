import type { PublicScenarioTemplate } from "../../../../../types/publicApi";

type TemplateImportModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  templates: PublicScenarioTemplate[];
  onClose: () => void;
  onRetry: () => void;
  onSelectTemplate: (template: PublicScenarioTemplate) => void;
};

const TemplateImportModal = ({
  open,
  loading,
  error,
  templates,
  onClose,
  onRetry,
  onSelectTemplate,
}: TemplateImportModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import from template"
    >
      <div className="w-full max-w-lg rounded-lg border border-slate-700/90 bg-slate-950 text-slate-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Import from template</p>
            <p className="text-xs text-slate-400">Templates from /public/scenarios</p>
          </div>
          <button
            type="button"
            className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800/90"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {loading ? (
            <p className="px-1 py-2 text-sm text-slate-300">Loading templates...</p>
          ) : null}

          {!loading && error ? (
            <div className="space-y-2 px-1 py-2 text-sm text-red-300">
              <p>{error}</p>
              <button
                type="button"
                className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800/90"
                onClick={onRetry}
              >
                Retry
              </button>
            </div>
          ) : null}

          {!loading && !error && templates.length === 0 ? (
            <p className="px-1 py-2 text-sm text-slate-300">No templates found.</p>
          ) : null}

          {!loading && !error && templates.length > 0 ? (
            <div className="space-y-1 py-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded border border-transparent px-2 py-2 text-left text-sm transition hover:border-slate-700 hover:bg-slate-800/70"
                  onClick={() => onSelectTemplate(template)}
                >
                  <span>{template.title}</span>
                  <span className="text-xs text-slate-400">{template.file_name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TemplateImportModal;
