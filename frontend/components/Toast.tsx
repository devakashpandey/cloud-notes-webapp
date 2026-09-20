'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 max-w-sm mx-auto sm:mx-0 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl shadow-2xl border transition-all duration-300 animate-in slide-in-from-bottom-5 ${
        type === 'success'
          ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          : 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
