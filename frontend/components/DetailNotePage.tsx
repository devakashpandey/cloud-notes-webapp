'use client';

import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Note } from '../types/note';

interface DetailNoteModalProps {
  note: Note | null;
  onClose: () => void;
  onDelete: (id?: string) => void;
}

export const DetailNoteModal: React.FC<DetailNoteModalProps> = ({
  note,
  onClose,
  onDelete,
}) => {
  if (!note) return null;

  const noteId = note._id || note.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200">
        {/* Cover Image */}
        {note.imageUrl && (
          <div className="relative h-64 sm:h-72 w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
            <img
              src={note.imageUrl}
              alt={note.title}
              className="w-full h-full object-contain"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition cursor-pointer shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!note.imageUrl && (
            <div className="flex justify-end mb-2">
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{note.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap mb-6">
            {note.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Created: {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Recent'}
            </span>
            <button
              onClick={() => onDelete(noteId)}
              className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
