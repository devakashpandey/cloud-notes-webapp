'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Edit3, X } from 'lucide-react';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUserDetails, updateUserAvatar } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Mode & Avatar Upload UI State
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  // User store update hote hi formData sync karo
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar image must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update Profile Details
      const profileRes = await updateUserDetails({
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      if (!profileRes.success) {
        toast.error(profileRes.message || 'Failed to update profile');
        return;
      }

      // 2. Update Avatar if selected
      if (selectedFile) {
        const avatarRes = await updateUserAvatar(selectedFile);
        if (!avatarRes.success) {
          toast.error(avatarRes.message || 'Failed to update avatar');
          return;
        }
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fafaf9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white py-10 px-4 sm:px-6 relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-200/40 via-amber-200/30 to-orange-100/20 dark:from-orange-600/10 dark:via-amber-600/10 dark:to-transparent rounded-full blur-[120px] pointer-events-none" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <main className="max-w-4xl w-full mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all hover:text-slate-900 dark:hover:text-white active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <button
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing && user) {
                setFormData({
                  username: user.username,
                  email: user.email,
                  avatar: user.avatar || '',
                });
                setSelectedFile(null);
              }
            }}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-md ${
              isEditing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 text-slate-500" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-10 shadow-xl shadow-orange-500/5 dark:shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
          {!isEditing ? (
            <ProfileView
              user={user}
              formData={formData}
              initials={initials}
              onLogout={handleLogout}
            />
          ) : (
            <ProfileEditForm
              formData={formData}
              setFormData={setFormData}
              initials={initials}
              uploadMode={uploadMode}
              setUploadMode={setUploadMode}
              fileInputRef={fileInputRef}
              handleRemoveAvatar={handleRemoveAvatar}
              handleSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setSelectedFile(null);
              }}
              isSaving={isSaving}
            />
          )}
        </div>
      </main>
    </div>
  );
}
