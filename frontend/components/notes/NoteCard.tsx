'use client';

import React, { useState } from 'react';
import { Calendar, Trash2, Pencil, Pin, Tag, Sparkles } from 'lucide-react';
import { Note } from '@/types/note';
import { useNotesStore } from '@/store/useNotesStore';
import { DeleteModal } from './DeleteModal';

interface NoteCardProps {
  note: Note;
  onDelete: (id?: string) => void;
  onEdit?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit }) => {
  const noteId = note._id || note.id;

  const { togglePin } = useNotesStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Recent';

  return (
    <div className={`relative group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col shadow-sm ${note.isPinned
      ? 'border-orange-500/60 dark:border-orange-500/50 shadow-orange-500/5 ring-1 ring-orange-500/20'
      : 'border-slate-200/90 dark:border-slate-800 hover:border-orange-500/40'
      }`}>

      {/* Top Banner / Image Container (Exact same fixed height h-52 sm:h-56 for 100% aligned titles) */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
        {note.imageUrl ? (
          <img
            src={note.imageUrl}
            alt={note.title}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-orange-100/30 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-orange-950/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-orange-200/50 dark:border-orange-500/20 flex items-center justify-center text-orange-400 dark:text-orange-500 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Date Badge Overlay (Consistent for both) */}
        <span className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-white border border-white/10 shadow-sm">
          <Calendar className="w-3 h-3 text-orange-400" />
          {formattedDate}
        </span>

        {/* Action Buttons Overlay (Consistent for both) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            title={note.isPinned ? "Unpin Note" : "Pin Note"}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all duration-200 cursor-pointer shadow-md ${note.isPinned
              ? 'bg-orange-500 text-white border-orange-600'
              : 'bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-500'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              if (noteId) togglePin(noteId);
            }}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-white' : ''}`} />
          </button>
          <button
            type="button"
            title="Edit Note"
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-all duration-200 cursor-pointer shadow-md"
            onClick={() => onEdit?.(note)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Delete Note"
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-200 cursor-pointer shadow-md"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Title, Description & Tags (Now 100% Horizontally Aligned!) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {note.title}
          </h3>
          {note.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
              {note.description}
            </p>
          )}
        </div>

        {/*  Tags Badges List on Note Card */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showConfirm}
        title={note.title}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          onDelete(noteId);
          setShowConfirm(false);
        }}
      />
    </div>
  );
};
