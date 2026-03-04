import { useCallback, useRef, useState } from "react";
import {
  ApiRequestError,
  publicApiGet,
  resolvePublicApiToken,
} from "../../../../../lib/public-api-client";
import type { PublicScenarioTemplate } from "../../../../../types/publicApi";
import { importScenarioFromFile, loadScenario } from "../../import";
import MenuDropdown, { type MenuDropdownItem } from "./MenuDropdown";
import TemplateImportModal from "./TemplateImportModal";
import type { CreatorFileActions } from "./menuTypes";

type FileMenuProps = {
  actions: CreatorFileActions;
};

type TemplateListResponse = {
  items: PublicScenarioTemplate[];
};

const FileMenu = ({ actions }: FileMenuProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templateItems, setTemplateItems] = useState<PublicScenarioTemplate[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const loadTemplateItems = useCallback(async () => {
    setTemplateLoading(true);
    setTemplateError(null);

    try {
      const token = await resolvePublicApiToken();
      if (!token) {
        setTemplateError("You must be logged in to import templates.");
        return;
      }

      const response = await publicApiGet<TemplateListResponse>(
        "/api/public/scenario-templates",
        token,
      );
      setTemplateItems(response.items);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setTemplateError(error.message);
        return;
      }

      setTemplateError(error instanceof Error ? error.message : "Import failed");
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  const items: MenuDropdownItem[] = [
    {
      type: "item",
      id: "new",
      label: "New Scenario",
      shortcut: "Ctrl/Cmd+N",
      onSelect: actions.onNewScenario,
    },
    {
      type: "item",
      id: "open-library",
      label: "Open Scenario Library",
      onSelect: actions.onOpenLibrary,
    },
    {
      type: "separator",
      id: "separator-a",
    },
    {
      type: "item",
      id: "import",
      label: "Import JSON...",
      onSelect: () => {
        if (!actions.onBeforeImport()) return;
        fileInputRef.current?.click();
      },
    },
    {
      type: "item",
      id: "import-template",
      label: "Import from template...",
      onSelect: () => {
        setTemplatePickerOpen(true);
        void loadTemplateItems();
      },
    },
    {
      type: "separator",
      id: "separator-b",
    },
    {
      type: "item",
      id: "save",
      label: "Save Draft",
      shortcut: "Ctrl/Cmd+S",
      disabled: actions.saveDisabled,
      onSelect: actions.onSaveDraft,
    },
    {
      type: "item",
      id: "download",
      label: "Download JSON",
      shortcut: "Ctrl/Cmd+Shift+S",
      disabled: actions.downloadDisabled,
      onSelect: actions.onDownloadJson,
    },
  ];

  return (
    <>
      <MenuDropdown label="File" items={items} />
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="application/json,.json"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          try {
            const scenario = await importScenarioFromFile(file);
            actions.onImportScenarioLoaded(scenario);
          } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Import failed");
          } finally {
            event.currentTarget.value = "";
          }
        }}
      />
      <TemplateImportModal
        open={templatePickerOpen}
        loading={templateLoading}
        error={templateError}
        templates={templateItems}
        onClose={() => setTemplatePickerOpen(false)}
        onRetry={() => {
          void loadTemplateItems();
        }}
        onSelectTemplate={(template) => {
          if (!actions.onBeforeImport()) return;

          void loadScenario(template.url)
            .then((scenario) => {
              actions.onImportScenarioLoaded(scenario);
              setTemplatePickerOpen(false);
            })
            .catch((error) => {
              console.error(error);
              alert(error instanceof Error ? error.message : "Import failed");
            });
        }}
      />
    </>
  );
};

export default FileMenu;
