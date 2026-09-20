'use client';

import React from 'react';
import { StickyNote, Plus, Sparkles } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { Note } from '@/types/note';
import { useNotesStore } from '@/store/useNotesStore';

interface NoteGridProps {
  notes: Note[];
  onDelete: (id?: string) => void;
  onEdit?: (note: Note) => void;
}

export const NoteGrid: React.FC<NoteGridProps> = ({
  notes,
  onDelete,
  onEdit,
}) => {
  const { setModalOpen, setNoteToEdit } = useNotesStore();

  // 1. Empty State UI when user has 0 notes
  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center p-8 sm:p-12 rounded-3xl border-2 border-dashed border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-xl shadow-orange-500/5 dark:shadow-none transition-all duration-300 my-4">
        {/* Glow Icon Container */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-3xl blur-xl opacity-30 dark:opacity-20 animate-pulse pointer-events-none" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25">
            <StickyNote className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-orange-500 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Text Information */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          No Notes Yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-8 leading-relaxed">
          Your personal cloud workspace is currently empty. Start organizing your thoughts, ideas, tasks, and notes today!
        </p>

        {/* Create Your First Note Action Button */}
        <button
          type="button"
          onClick={() => {
            setNoteToEdit(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Your First Note</span>
        </button>
      </div>
    );
  }

  // 2. Grid Display when notes exist
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note._id || note.id}
          note={note}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

