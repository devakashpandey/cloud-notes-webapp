'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/schemas/auth.schema';
import {
  StickyNote,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { registerUserApi } from '@/services/auth.api';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/themes/ThemeToggle';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterInput>({
    mode: 'onTouched',
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Avatar image must be less than 5MB');
      toast.error('Avatar image must be less than 5MB');
      return;
    }

    setFileError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: RegisterInput) => {
    if (isLoading) return;

    // Build FormData to support file upload for multer on backend
    const dataToSend = new FormData();
    dataToSend.append('username', data.username.trim());
    dataToSend.append('email', data.email.trim());
    dataToSend.append('password', data.password);

    if (avatarFile) {
      dataToSend.append('avatar', avatarFile);
    }

    try {
      setIsLoading(true);
      const response = await registerUserApi(dataToSend);

      if (response?.success) {
        toast.success(response.message || 'Account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const errorMsg = response?.message || 'Registration failed';
        const lower = errorMsg.toLowerCase();
        if (lower.includes('username')) {
          setError('username', { type: 'server', message: errorMsg });
        } else if (lower.includes('email')) {
          setError('email', { type: 'server', message: errorMsg });
        }
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Ambient background warm glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-orange-200/40 dark:bg-orange-600/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-amber-200/30 dark:bg-amber-600/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      {/* Top Navigation */}
      <div className="w-full max-w-md mb-4 sm:mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Register Card UI */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/5 dark:shadow-2xl space-y-5 sm:space-y-6 relative z-10 transition-colors duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 mx-auto mb-3">
            <StickyNote className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Join CloudNotes to store & manage your notes</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                {...register('username')}
                disabled={isLoading}
                type="text"
                placeholder="Choose a username"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${errors.username
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                  }`}
              />
            </div>
            {errors.username && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
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
                disabled={isLoading}
                type="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                {...register('password')}
                disabled={isLoading}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password (min. 6 chars)"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10'
                  }`}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Avatar Upload (Optional with Live Preview) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Avatar (Optional)</label>

            {avatarPreview ? (
              <div className="relative flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-orange-300 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {avatarFile?.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {avatarFile ? (avatarFile.size / 1024).toFixed(1) + ' KB' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={clearAvatarSelection}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  ref={fileInputRef}
                  disabled={isLoading}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full pl-10 pr-4 py-2 text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            )}
            {fileError && (
              <p className="text-[11px] text-rose-500 font-medium">{fileError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <span>Already have an account? </span>
          <Link href="/login" className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}


