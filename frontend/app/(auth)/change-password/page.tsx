'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordInput } from '@/schemas/auth.schema';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Save,
  Loader2
} from 'lucide-react';
import { changePasswordApi } from '@/services/auth.api';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ChangePasswordInput>({
    mode: 'onChange',
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      setIsSubmitting(true);
      const result = await changePasswordApi({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      if (result?.success) {
        await logout();
        const successMsg = `${result.message || 'Password changed successfully'}! Redirecting to login...`;
        toast.success(successMsg);

        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const errorMsg = result.message || 'Current password is wrong';
        
        if (errorMsg.toLowerCase().includes('password') || errorMsg.toLowerCase().includes('wrong') || errorMsg.toLowerCase().includes('invalid')) {
          setError('oldPassword', {
            type: 'server',
            message: errorMsg
          });
        }
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Something went wrong';
      setError('oldPassword', {
        type: 'server',
        message: errorMsg
      });
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fafaf9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden transition-colors duration-200">

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-orange-200/40 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-200/30 dark:bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Profile Link */}
      <div className="w-full max-w-md mb-6 relative z-10 flex justify-between items-center">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all hover:text-slate-900 dark:hover:text-white active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back to Profile</span>
        </Link>
      </div>

      {/* Change Password Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/5 dark:shadow-2xl relative z-10 space-y-6 transition-colors duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Change Password</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password for enhanced security</p>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Old Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-500" />
                Current Password
              </span>
            </label>
            <div className="relative">
              <input
                {...register('oldPassword')}
                disabled={isSubmitting}
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.oldPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                }`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.oldPassword.message}</p>
            )}
          </div>

          {/* New Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                New Password
              </span>
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                disabled={isSubmitting}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password (min. 6 chars)"
                className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.newPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                }`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Confirm New Password</span>
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                disabled={isSubmitting}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.confirmPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                }`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Security Checklist */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Password requirements:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
              <li>Minimum 6 characters long</li>
              <li>New password and confirm password must match</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
