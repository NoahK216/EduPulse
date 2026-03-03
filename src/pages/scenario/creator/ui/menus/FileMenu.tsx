import { useRef } from "react";
import { importScenarioFromFile } from "../../import";
import MenuDropdown, { type MenuDropdownItem } from "./MenuDropdown";
import type { CreatorFileActions } from "./menuTypes";

type FileMenuProps = {
  actions: CreatorFileActions;
};

const FileMenu = ({ actions }: FileMenuProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    </>
  );
};

export default FileMenu;
