'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/schemas/auth.schema';
import { resetPasswordApi } from '@/services/auth.api';
import { Lock, Loader2, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/themes/ThemeToggle';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordInput>({
    mode: 'onChange',
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);

    try {
      const res = await resetPasswordApi(token, data);
      if (res.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(res.message || 'Invalid or expired reset link.');
      }
    } catch (err: any) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-orange-200/40 dark:bg-orange-600/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-amber-200/30 dark:bg-amber-600/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      {/* Top Navigation */}
      <div className="w-full max-w-md mb-4 sm:mb-6 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back to Login</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Card UI */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/5 dark:shadow-2xl space-y-5 sm:space-y-6 relative z-10 transition-colors duration-200">
        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Password Reset! 🎉</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Redirecting to login in 3 seconds...</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-200"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Password</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please enter a strong password for your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register('newPassword')}
                    disabled={loading}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.newPassword
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    disabled={loading}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
