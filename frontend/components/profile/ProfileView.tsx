import React from 'react';
import Link from 'next/link';
import { User as UserType } from '@/types/user';
import {
  User as UserIcon,
  Mail,
  LogOut,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  KeyRound,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserType | null;
  formData: {
    username: string;
    email: string;
    avatar: string;
  };
  initials: string;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  formData,
  initials,
  onLogout,
}) => {
  return (
    <>
      {/* Top Hero Section of Card */}
      <div className="pb-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        {/* Avatar with Glow Ring */}
        <div className="relative group shrink-0">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
          {formData.avatar || user?.avatar ? (
            <img
              src={formData.avatar || user?.avatar}
              alt={formData.username || 'User Avatar'}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xl bg-slate-50 dark:bg-slate-800"
            />
          ) : (
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-4xl font-extrabold text-white border-2 border-orange-300 shadow-xl">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-1.5 rounded-xl border-2 border-white dark:border-slate-900 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                {formData.username || user?.username || 'User'}
                <ShieldCheck className="w-5 h-5 text-orange-500 inline" />
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{formData.email || user?.email || 'N/A'}</span>
              </p>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 active:scale-95 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Status Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
              Email Verified
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Cloud Notes Member
            </span>
          </div>
        </div>
      </div>

      {/* Account Overview Grid */}
      <div className="pt-8 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          <span>Account Credentials & Overview</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Username Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition hover:border-orange-300 dark:hover:border-slate-700">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Username</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">{formData.username || 'N/A'}</p>
            </div>
          </div>

          {/* Email Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition hover:border-orange-300 dark:hover:border-slate-700">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email Address</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">{formData.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security / Actions */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Security & Password</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Account protected with JWT Auth</p>
          </div>
        </div>

        <Link
          href="/change-password"
          className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 transition active:scale-95"
        >
          Change Password
        </Link>
      </div>
    </>
  );
};
