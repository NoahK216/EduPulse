const MenuBar = ({ children }: { children: any }) => {
    return (
        // TODO Clean up UI
        <div className="min-w-full min-h-10 bg-gray-100 text-gray-900 p-3">
           EduPulse
            {children}
        </div>
    );

}

export default MenuBar;
