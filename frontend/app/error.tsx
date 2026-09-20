// frontend/app/error.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Unhandled Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#fafaf9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans transition-colors duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-rose-500/5 text-center space-y-6">

                {/* Warning Icon Badge */}
                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/10">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Something went wrong!
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        {error?.message || "An unexpected error occurred. Please try again or return to the home page."}
                    </p>
                    {error?.digest && (
                        <p className="text-[10px] text-slate-400 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                    </button>

                    <Link
                        href="/"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>Back to Home</span>
                    </Link>
                </div>

            </div>
        </div>
    );
}
