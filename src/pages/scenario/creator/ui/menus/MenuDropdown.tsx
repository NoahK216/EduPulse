import { useEffect, useRef, useState } from "react";

export type MenuDropdownItem =
  | {
      type: "item";
      id: string;
      label: string;
      shortcut?: string;
      disabled?: boolean;
      onSelect?: () => void;
    }
  | {
      type: "separator";
      id: string;
    };

type MenuDropdownProps = {
  label: string;
  items: MenuDropdownItem[];
  align?: "left" | "right";
};

const panelAlignment: Record<
  NonNullable<MenuDropdownProps["align"]>,
  string
> = {
  left: "left-0",
  right: "right-0",
};

const MenuDropdown = ({ label, items, align = "left" }: MenuDropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="rounded-md !border !border-transparent !bg-transparent !px-2 !py-1 !text-xs font-medium  transition !text-slate-700 hover:!border-slate-300 hover:!bg-slate-100 dark:!text-slate-100 dark:hover:!border-slate-700 dark:hover:!bg-slate-900/80"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-50 min-w-52 overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-700/90 dark:bg-slate-950/98 py-1 shadow-xl ${panelAlignment[align]}`}
          role="menu"
          aria-label={`${label} menu`}
        >
          {items.map((item) => {
            if (item.type === "separator") {
              return (
                <div
                  key={item.id}
                  className="my-1 h-px bg-slate-300 dark:bg-slate-800/80"
                />
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className="flex w-full items-center justify-between gap-3 !border-0 !bg-transparent !px-3 !py-1.5 text-left !text-xs !text-slate-700 dark:!text-slate-100 transition hover:!bg-slate-100 dark:hover:!bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                <span>{item.label}</span>
                {item.shortcut ? (
                  <span className="text-[11px] uppercase tracking-[0.04em] text-slate-500 text-slate-400">
                    {item.shortcut}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
