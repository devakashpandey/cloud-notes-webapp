import React from 'react';
import Link from 'next/link';
import { LogIn, Sparkles, ShieldCheck, Lock } from 'lucide-react';

export const GuestLandingView: React.FC = () => {
  return (
    <div className="py-6 sm:py-12 space-y-8 sm:space-y-12 text-center">
      {/* Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-12 max-w-4xl mx-auto shadow-xl shadow-orange-500/5 dark:shadow-2xl overflow-hidden transition-colors duration-200">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-200/40 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-200/30 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Cloud Notes Workspace
          </span>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Organize Your Ideas & Notes <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Anywhere, Securely.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Welcome to CloudNotes. Sign in to your account to view, create, and manage all your personal cloud notes.
          </p>

          <div className="pt-2 sm:pt-4 flex items-center justify-center">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Access Notes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 hover:border-orange-300 dark:hover:border-slate-700 transition">
          <ShieldCheck className="w-6 h-6 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Protected Storage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your notes are stored securely and only accessible to you.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 hover:border-orange-300 dark:hover:border-slate-700 transition">
          <Lock className="w-6 h-6 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">JWT Authenticated</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Secure token-based auth keeps your workspace isolated.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 hover:border-orange-300 dark:hover:border-slate-700 transition">
          <Sparkles className="w-6 h-6 text-orange-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Instant Sync</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Create and edit notes in real time with high performance.</p>
        </div>
      </div>
    </div>
  );
};

