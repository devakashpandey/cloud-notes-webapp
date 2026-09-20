// frontend/components/notes/PaginationControls.tsx
'use client';

import React from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useQueryParams } from '@/hooks/useQueryParams';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationControls: React.FC = () => {
    const { pagination } = useNotesStore();
    const { getParam, setParams } = useQueryParams();

    const currentPage = parseInt(getParam('page', '1'), 10);

    if (!pagination || pagination.totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800 pt-5 mt-8">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing Page <strong className="text-slate-900 dark:text-white font-semibold">{currentPage}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">{pagination.totalPages}</strong> ({pagination.totalNotes} total notes)
            </p>

            <div className="flex items-center gap-2">
                <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setParams({ page: currentPage - 1 })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                </button>

                <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setParams({ page: currentPage + 1 })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};
