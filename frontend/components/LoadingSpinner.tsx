import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`min-h-[400px] flex flex-col items-center justify-center gap-3.5 p-6 text-slate-700 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-orange-500 animate-spin absolute" />
      </div>
      {text && <p className="text-xs sm:text-sm font-medium text-slate-500 animate-pulse tracking-wide">{text}</p>}
    </div>
  );
};
