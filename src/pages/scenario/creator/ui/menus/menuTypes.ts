import type { Scenario } from "../../../scenarioSchemas";

export type CreatorFileActions = {
  onNewScenario: () => void;
  onOpenLibrary: () => void;
  onBeforeImport: () => boolean;
  onImportScenarioLoaded: (scenario: Scenario) => void;
  onSaveDraft: () => void;
  onTestScenario: () => void;
  onDownloadJson: () => void;
  saveDisabled: boolean;
  downloadDisabled: boolean;
  saveLabel: string;
};

export type CreatorViewActions = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  disabled: boolean;
};

export type CreatorHelpActions = {
  onOpenTutorial: () => void;
  onShowKeyboardShortcuts?: () => void;
};

export type CreatorEditActions = {
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoLayout: () => void;
  autoLayoutDisabled: boolean;
};

export type CreatorStatusTone = "neutral" | "success" | "warning" | "error";
