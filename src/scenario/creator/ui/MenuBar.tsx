import type { ReactNode } from "react";

const MenuBar = ({ children }: { children: ReactNode }) => {
    return (
        // TODO Clean up UI
        <div className="min-w-full min-h-10 bg-gray-100 text-gray-900 p-3">
            EduPulse
            {children}
        </div>
    );

}

export default MenuBar;
