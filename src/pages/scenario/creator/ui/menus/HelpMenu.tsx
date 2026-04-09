import MenuDropdown, { type MenuDropdownItem } from "./MenuDropdown";
import type { CreatorHelpActions } from "./menuTypes";

type HelpMenuProps = {
  actions: CreatorHelpActions;
};

const HelpMenu = ({ actions }: HelpMenuProps) => {
  const items: MenuDropdownItem[] = [
    {
      type: "item",
      id: "tutorial-scenario",
      label: "Open Tutorial Video",
      onSelect: actions.onOpenTutorial,
    },
    {
      type: "item",
      id: "keyboard-shortcuts",
      label: "Keyboard Shortcuts",
      disabled: true,
      onSelect: actions.onShowKeyboardShortcuts,
    },
  ];

  return <MenuDropdown label="Help" items={items} align="right" />;
};

export default HelpMenu;
