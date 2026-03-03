import MenuDropdown, { type MenuDropdownItem } from "./MenuDropdown";
import type { CreatorEditActions } from "./menuTypes";

type EditMenuProps = {
  actions: CreatorEditActions;
};

const EditMenu = ({ actions }: EditMenuProps) => {
  const items: MenuDropdownItem[] = [
    {
      type: "item",
      id: "undo",
      label: "Undo",
      disabled: true,
      onSelect: actions.onUndo,
    },
    {
      type: "item",
      id: "redo",
      label: "Redo",
      disabled: true,
      onSelect: actions.onRedo,
    },
  ];

  return <MenuDropdown label="Edit" items={items} />;
};

export default EditMenu;
