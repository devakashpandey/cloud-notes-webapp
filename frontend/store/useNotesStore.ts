
import { create } from 'zustand';
import { Note, PaginationData, GetNotesParams } from '@/types/note';
import { getNotesApi, togglePinApi } from '@/services/notes.api';
import toast from 'react-hot-toast';

interface NotesState {
  notes: Note[];
  allTags: string[];
  pagination: PaginationData | null;
  isLoading: boolean;
  isCreateModalOpen: boolean;
  noteToEdit: Note | null;

  // Setters
  setNotes: (notes: Note[]) => void;
  setIsLoading: (loading: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setNoteToEdit: (note: Note | null) => void;

  // Actions
  fetchNotes: (params?: GetNotesParams) => Promise<void>;
  togglePin: (noteId: string) => Promise<void>;

  // Realtime Socket Handlers 
  handleRealtimeCreated: (newNote: Note) => void;
  // handleRealtimeUpdated: (updatedNote: Note) => void;
  handleRealtimeDeleted: (deletedId: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  allTags: [],
  pagination: null,
  isLoading: false,
  isCreateModalOpen: false,
  noteToEdit: null,

  setNotes: (notes) => set({ notes }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setNoteToEdit: (noteToEdit) => set({ noteToEdit }),


  fetchNotes: async (params?: GetNotesParams) => {
    set({ isLoading: true });

    try {
      const response = await getNotesApi(params);

      if (response?.data) {
        set({
          notes: response.data.notes || [],
          allTags: response.data.allTags || response.data.tags || [],
          pagination: response.data.pagination || null,
        });
      }
    } catch (error) {
      console.error("Fetch notes error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  togglePin: async (noteId: string) => {
    const previousNotes = get().notes;
    set({
      notes: previousNotes.map((n) =>
        (n._id === noteId || n.id === noteId) ? { ...n, isPinned: !n.isPinned } : n
      ),
    });

    try {
      const res = await togglePinApi(noteId);
      if (res?.success !== false) {
        toast.success(res?.message || 'Updated pin');
      } else {
        set({ notes: previousNotes });
        toast.error(res?.message || 'Failed to pin');
      }
    } catch {
      set({ notes: previousNotes });
      toast.error('Failed to pin');
    }
  },

  // 1. Live Create Note
  handleRealtimeCreated: (newNote: Note) => {
    set((state) => {
      const exists = state.notes.some(
        (cn) => (cn._id || cn.id) === (newNote._id || newNote.id)
      );
      if (exists) return state;

      return {
        notes: [newNote, ...state.notes],
        pagination: state.pagination
          ? { ...state.pagination, totalNotes: state.pagination.totalNotes + 1 }
          : null,
      };
    });
  },

  // 2. Live Update Note (Title, Description, Tags, Image)
  // handleRealtimeUpdated: (updatedNote: Note) => {
  //   set((state) => ({
  //     notes: state.notes.map((n) =>
  //       (n._id || n.id) === (updatedNote._id || updatedNote.id) ? updatedNote : n
  //     ),
  //   }));
  // },

  // 3. Live Delete Note
  handleRealtimeDeleted: (deletedId: string) => {
    set((state) => ({
      notes: state.notes.filter((cn) => (cn._id || cn.id) !== deletedId),
      pagination: state.pagination
        ? { ...state.pagination, totalNotes: Math.max(0, state.pagination.totalNotes - 1) }
        : null,
    }));
  },

}));
