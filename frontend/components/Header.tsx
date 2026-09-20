'use client';

import React, { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { StickyNote, Plus, User as UserIcon, LogIn, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotesStore } from '@/store/useNotesStore';
import { useTheme } from 'next-themes';

export const Header: React.FC = memo(() => {
  const { isAuthenticated, user } = useAuthStore();
  const { setModalOpen, setNoteToEdit } = useNotesStore()

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const isDarkMode = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 sm:py-4 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <StickyNote className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                Cloud<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Notes</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">Upload & Manage Notes</p>
          </div>
        </Link>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all shrink-0"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mounted ? (
              isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {isAuthenticated ? (
            /* Logged-In User Header Controls */
            <>
              {/* Create Note CTA */}
              <button
                onClick={() => {
                  setNoteToEdit(null);
                  setModalOpen(true);
                }}
                className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 active:scale-95 transition-all duration-200 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:rotate-90 duration-300" />
                <span className="hidden sm:inline">Create Note</span>
                <span className="sm:hidden">New</span>
              </button>

              {/* User Profile Button */}
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all shrink-0"
                title="User Profile"
              >
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                <span className="hidden md:inline">{user?.username || 'Profile'}</span>
              </Link>
            </>
          ) : (
            /* Logged-Out Guest Header Controls */
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                className="hidden xs:inline-flex sm:inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
