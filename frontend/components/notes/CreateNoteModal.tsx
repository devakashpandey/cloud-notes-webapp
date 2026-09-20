'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Upload, Loader2, Pencil, Pin, Tag } from 'lucide-react';
import { createNoteApi, updateNoteApi } from '@/services/notes.api';
import { useNotesStore } from '@/store/useNotesStore';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { NoteInput, noteSchema } from '@/schemas/note.schema';

export const CreateNoteModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { isCreateModalOpen, setModalOpen, noteToEdit, setNoteToEdit, fetchNotes } = useNotesStore();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<NoteInput>({
    mode: 'onTouched',
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      description: '',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  useEffect(() => {
    if (noteToEdit) {
      setValue('title', noteToEdit.title || '');
      setValue('description', noteToEdit.description || '');
      setImagePreview(noteToEdit.imageUrl || null);
      setTagsInput(noteToEdit.tags ? noteToEdit.tags.join(', ') : '');
    } else {
      reset({ title: '', description: '' });
      setImagePreview(null);
      setTagsInput('');
    }
    setImageFile(null);
  }, [noteToEdit, isCreateModalOpen, setValue, reset]);

  const handleClose = () => {
    clearImageSelection();
    reset({ title: '', description: '' });
    setTagsInput('');
    setNoteToEdit(null);
    setModalOpen(false);
  };

  const onSubmit = async (data: NoteInput) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", data.title.trim());
      if (data.description) {
        formData.append("description", data.description.trim());
      }
      // Append tags and isPinned to FormData
      if (tagsInput.trim()) {
        formData.append("tags", tagsInput.trim());
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const noteId = noteToEdit?._id || noteToEdit?.id;

      const response = noteToEdit && noteId
        ? await updateNoteApi(noteId, formData)
        : await createNoteApi(formData);

      if (response?.success !== false) {
        await fetchNotes();
        handleClose();
        toast.success(noteToEdit ? "Note updated successfully" : "Note created successfully");

        if (pathname !== '/') {
          router.push('/');
        }
      } else {
        toast.error(response?.message || "Failed to save note");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600">
              {noteToEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {noteToEdit ? 'Update Note' : 'Create New Note'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('title')}
              disabled={isSubmitting}
              type="text"
              placeholder="Enter note title..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              {...register('description')}
              disabled={isSubmitting}
              placeholder="Enter note description..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/*  Tags Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-500" />
              <span>Tags (Comma separated)</span>
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="work, react, study, ideas"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/*  Cover Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Cover Image
            </label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-950"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  disabled={isSubmitting}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to upload cover image</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 shadow-md shadow-orange-500/25 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{noteToEdit ? 'Save Changes' : 'Create Note'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
