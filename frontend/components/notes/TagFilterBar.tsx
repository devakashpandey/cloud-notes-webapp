// frontend/components/notes/TagFilterBar.tsx
'use client';

import React from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useQueryParams } from '@/hooks/useQueryParams';
import { ArrowUpDown, Tag } from 'lucide-react';

export const TagFilterBar: React.FC = () => {
    const { allTags } = useNotesStore();
    const { getParam, setParams } = useQueryParams();

    const selectedTag = getParam('tag', 'all');
    const sortBy = getParam('sortBy', 'createdAt');
    const sortOrder = getParam('order', 'desc');

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [newSortBy, newSortOrder] = e.target.value.split('-');
        setParams({ sortBy: newSortBy, order: newSortOrder, page: 1 });
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            {/* Tag Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                <button
                    onClick={() => setParams({ tag: 'all', page: 1 })}
                    className={`px-3 py-1.5 cursor-pointer rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${selectedTag === 'all'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    All Notes
                </button>

                {allTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setParams({ tag, page: 1 })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${selectedTag === tag
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{tag}</span>
                    </button>
                ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={handleSortChange}
                    className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm"
                >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="title-asc">Title (A - Z)</option>
                    <option value="title-desc">Title (Z - A)</option>
                </select>
            </div>
        </div>
    );
};
