import type { ReactNode } from "react";

const MenuBar = ({ children }: { children: ReactNode }) => {
    return (
        <header className="flex min-h-12 w-full items-center justify-between border-b border-slate-700/80 bg-slate-950 px-4 py-2 text-slate-100">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">
                EduPulse Creator
            </p>
            <div className="flex items-center gap-2">{children}</div>
        </header>
    );

}

export default MenuBar;
