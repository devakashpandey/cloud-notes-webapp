'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { verifyEmailApi } from '@/services/auth.api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ThemeToggle } from '@/components/themes/ThemeToggle';
import toast from 'react-hot-toast';

function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Strict Mode duplicate prevention
  const isCalledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setMessage('Verification token is missing.');
      toast.error('Verification token is missing.');
      return;
    }

    if (isCalledRef.current) return;
    isCalledRef.current = true;

    const handleVerify = async () => {
      try {
        const response = await verifyEmailApi(token);

        if (response.success) {
          setSuccess(true);
          const msg = response.message || 'Email verified successfully!';
          setMessage(msg);
          toast.success(msg);

          setTimeout(() => {
            router.push('/login');
          }, 2500);
        } else {
          setSuccess(false);
          const msg = response.message || 'Invalid or expired verification link.';
          setMessage(msg);
          toast.error(msg);
        }
      } catch (error: any) {
        setSuccess(false);
        setMessage('An unexpected error occurred during verification.');
        toast.error('An unexpected error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };

    handleVerify();
  }, [token, router]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/5 dark:shadow-2xl text-center space-y-5 sm:space-y-6 relative z-10 transition-colors duration-200">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-500 mx-auto shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Verifying Email...</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Please wait while we verify your email address</p>
        </div>
      )}

      {/* Success State */}
      {!loading && success && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Email Verified! 🎉</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Redirecting to login in 3 seconds...</p>
          <div className="w-full pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-200"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && !success && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-sm">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Verification Failed</h2>
          <p className="text-xs text-rose-600 dark:text-rose-400">{message}</p>
          <div className="w-full pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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

      <Suspense fallback={<LoadingSpinner />}>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
