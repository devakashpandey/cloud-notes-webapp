'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas/auth.schema';
import { forgotPasswordApi } from '@/services/auth.api';
import { ArrowLeft, Mail, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { ThemeToggle } from '@/components/themes/ThemeToggle';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordInput>({
    mode: 'onTouched',
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setSubmittedEmail(data.email);

    try {
      const res = await forgotPasswordApi({ email: data.email });
      if (res.success) {
        setSuccess(true);
        toast.success('Reset link sent to your email!');
      } else {
        toast.error(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      toast.error('An error occurred. Please try again later.');
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Check Your Inbox! 📩</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We sent a password reset link to <span className="font-semibold text-slate-900 dark:text-white">{submittedEmail}</span>.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              The link is valid for 15 minutes. Check spam folder if you can&apos;t find it.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 mx-auto mb-3">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Forgot Password?</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your registered email to receive a password reset link
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    {...register('email')}
                    disabled={loading}
                    type="email"
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>
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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
