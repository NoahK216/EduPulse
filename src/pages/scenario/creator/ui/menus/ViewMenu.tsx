import MenuDropdown, { type MenuDropdownItem } from "./MenuDropdown";
import type { CreatorViewActions } from "./menuTypes";

type ViewMenuProps = {
  actions: CreatorViewActions;
};

const ViewMenu = ({ actions }: ViewMenuProps) => {
  const items: MenuDropdownItem[] = [
    {
      type: "item",
      id: "zoom-in",
      label: "Zoom In",
      disabled: actions.disabled,
      onSelect: actions.onZoomIn,
    },
    {
      type: "item",
      id: "zoom-out",
      label: "Zoom Out",
      disabled: actions.disabled,
      onSelect: actions.onZoomOut,
    },
    {
      type: "item",
      id: "reset-zoom",
      label: "Reset Zoom (100%)",
      disabled: actions.disabled,
      onSelect: actions.onResetZoom,
    },
    {
      type: "item",
      id: "fit-view",
      label: "Fit to Screen",
      disabled: actions.disabled,
      onSelect: actions.onFitView,
    },
  ];

  return <MenuDropdown label="View" items={items} />;
};

export default ViewMenu;
