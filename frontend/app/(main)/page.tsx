// frontend/app/(main)/page.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { Note } from '@/types/note';
import { deleteNoteApi } from '@/services/notes.api';
import { NoteGrid } from '@/components/notes/NoteGrid';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotesStore } from '@/store/useNotesStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { GuestLandingView } from '@/components/GuestLandingView';
import { SearchBar } from '@/components/SearchBar';
import { TagFilterBar } from '@/components/notes/TagFilterBar';
import { PaginationControls } from '@/components/notes/PaginationControls';
import toast from 'react-hot-toast';

function HomeContent() {
  const { getParam } = useQueryParams();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { notes, isLoading, setModalOpen, setNoteToEdit, fetchNotes } = useNotesStore();

  // URL ke params utha kar fetchNotes ko pass karein
  const loadNotesFromUrl = useCallback(() => {
    if (!isAuthenticated) return;

    const search = getParam('search') || undefined;
    const tag = getParam('tag') || undefined;
    const sortBy = (getParam('sortBy') as 'createdAt' | 'title') || 'createdAt';
    const order = (getParam('order') as 'asc' | 'desc') || 'desc';
    const page = parseInt(getParam('page') || '1', 10);

    fetchNotes({
      search,
      tag: tag === 'all' ? undefined : tag,
      sortBy,
      order,
      page,
      limit: 9,
    });
  }, [isAuthenticated, getParam, fetchNotes]);

  // Jab bhi URL change hoga (search, tag, sort, page badlega) ya refresh hoga, yeh run hoga!
  useEffect(() => {
    loadNotesFromUrl();
  }, [loadNotesFromUrl]);

  const handleEditNote = useCallback((note: Note) => {
    setNoteToEdit(note);
    setModalOpen(true);
  }, [setModalOpen, setNoteToEdit]);

  const handleDeleteNote = useCallback(async (id?: string) => {
    if (!id) return;
    try {
      const res = await deleteNoteApi(id);
      if (res?.success !== false) {
        toast.success("Note deleted successfully");
        loadNotesFromUrl();
      } else {
        toast.error(res?.message || "Failed to delete note");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }, [loadNotesFromUrl]);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {!isInitialized ? (
          <LoadingSpinner text="Loading CloudNotes..." />
        ) : isAuthenticated ? (
          <div>
            <SearchBar />
            <TagFilterBar />

            {isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <LoadingSpinner text="Fetching your notes..." />
              </div>
            ) : (
              <NoteGrid
                notes={notes}
                onDelete={handleDeleteNote}
                onEdit={handleEditNote}
              />
            )}

            <PaginationControls />
          </div>
        ) : (
          <GuestLandingView />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<LoadingSpinner text="Loading CloudNotes..." />}>
      <HomeContent />
    </React.Suspense>
  );
}
