import FileMenu from "./menus/FileMenu";
import EditMenu from "./menus/EditMenu";
import ViewMenu from "./menus/ViewMenu";
import HelpMenu from "./menus/HelpMenu";
import type {
  CreatorEditActions,
  CreatorFileActions,
  CreatorHelpActions,
  CreatorStatusTone,
  CreatorViewActions,
} from "./menus/menuTypes";

import { FaMagnifyingGlassMinus, FaMagnifyingGlassPlus } from "react-icons/fa6";

type CreatorTopBarProps = {
  title: string;
  titleDisabled: boolean;
  onLogoClick: () => void;
  onTitleChange: (title: string) => void;
  fileActions: CreatorFileActions;
  editActions: CreatorEditActions;
  viewActions: CreatorViewActions;
  helpActions: CreatorHelpActions;
  statusMessage: string;
  statusTone: CreatorStatusTone;
};

const statusToneClass: Record<CreatorStatusTone, string> = {
  neutral: "text-slate-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  error: "text-red-300",
};

function ToolbarButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  const labelStyle =
    "rounded-md !border !border-slate-700/90 !bg-slate-900/70 !px-2.5 !py-1 !text-[11px] font-semibold uppercase tracking-[0.08em] !text-slate-100 transition hover:!border-sky-500/70 hover:!bg-slate-800/90 disabled:cursor-not-allowed disabled:opacity-50";
  const iconStyle =
    "rounded-md !border-transparent !bg-transparent !p-1 outline-none focus:!border-transparent focus-visible:!border-transparent focus:!outline-none focus-visible:!outline-none disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button
      type="button"
      className={icon ? iconStyle : labelStyle}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
      {icon}
    </button>
  );
}

const CreatorTopBar = ({
  title,
  titleDisabled,
  onLogoClick,
  onTitleChange,
  fileActions,
  editActions,
  viewActions,
  helpActions,
  statusMessage,
  statusTone,
}: CreatorTopBarProps) => {
  return (
    <header className="w-full shrink-0 border-b border-slate-700/80 bg-slate-950 text-slate-100">
      <div className="w-full flex column pb-1 border-b border-slate-800/90 ">
        <img
          src="/vite.svg"
          alt="Vite logo"
          className="cursor-pointer pl-4 pr-2"
          onClick={onLogoClick}
        />

        <div className="w-full">
          <div className="flex pt-2 items-center">
            <input
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Untitled Scenario"
              disabled={titleDisabled}
              className="w-96 max-w-full rounded-md px-2 text-xl text-slate-100 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex items-center gap-1 pr-3">
            <nav
              className="flex items-center gap-1"
              aria-label="Creator menu bar"
            >
              <FileMenu actions={fileActions} />
              <EditMenu actions={editActions} />
              <ViewMenu actions={viewActions} />
              <HelpMenu actions={helpActions} />
            </nav>

            <span
              className={`ml-auto max-w-md truncate text-xs ${statusToneClass[statusTone]}`}
              title={statusMessage}
            >
              {statusMessage}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-10 items-center gap-1 px-3">
        <ToolbarButton
          label={fileActions.saveLabel}
          disabled={fileActions.saveDisabled}
          onClick={fileActions.onSaveDraft}
        />
        <ToolbarButton
          label="Test Scenario"
          onClick={fileActions.onTestScenario}
        />
        <ToolbarButton
          label="Download"
          disabled={fileActions.downloadDisabled}
          onClick={fileActions.onDownloadJson}
        />
        <div className="mx-1 h-4 w-px bg-slate-700/90" />
        <ToolbarButton
          icon={<FaMagnifyingGlassMinus />}
          disabled={viewActions.disabled}
          onClick={viewActions.onZoomOut}
        />
        <ToolbarButton
          icon={<FaMagnifyingGlassPlus />}
          disabled={viewActions.disabled}
          onClick={viewActions.onZoomIn}
        />
        <ToolbarButton
          label="100%"
          disabled={viewActions.disabled}
          onClick={viewActions.onResetZoom}
        />
        <ToolbarButton
          label="Fit View"
          disabled={viewActions.disabled}
          onClick={viewActions.onFitView}
        />
      </div>
    </header>
  );
};

export default CreatorTopBar;
export type { CreatorTopBarProps };
