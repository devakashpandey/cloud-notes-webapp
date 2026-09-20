'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3500,
        className: '!bg-white dark:!bg-slate-900 !text-slate-900 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-2xl !text-xs !font-medium !py-3 !px-4',
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};
