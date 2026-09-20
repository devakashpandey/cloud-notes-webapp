export const Footer = () => {
    return (
        <footer className="flex flex-col items-center justify-center py-6 mt-6 px-4 text-center border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Akash Pandey. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                <span className="hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">Terms of Service</span>
                <span className="hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">Privacy Policy</span>
                <span className="hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">Contact</span>
            </div>
        </footer>
    );
}