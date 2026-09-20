'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useNotesStore } from '@/store/useNotesStore';

export const SearchBar: React.FC = () => {
  const { getParam, setParams } = useQueryParams();
  const { pagination } = useNotesStore();

  const urlSearch = getParam('search', '');
  const [localSearch, setLocalSearch] = useState(urlSearch);

  // Jab URL badle toh input box update ho
  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  // 400ms Debounce: Input change hote hi URL update hoga
  useEffect(() => {
    if (localSearch === urlSearch) return;

    const timer = setTimeout(() => {
      setParams({ search: localSearch.trim() || undefined, page: 1 });
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, urlSearch, setParams]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search notes by title or description..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 shadow-sm"
        />
        {localSearch && (
          <button
            onClick={() => {
              setLocalSearch('');
              setParams({ search: undefined, page: 1 });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {pagination && (
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            Total Notes: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pagination.totalNotes}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
