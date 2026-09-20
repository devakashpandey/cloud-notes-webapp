import React from 'react';
import {
  User as UserIcon,
  Mail,
  Edit3,
  Camera,
  Save,
  Upload,
  Trash2,
  Link2,
} from 'lucide-react';

interface ProfileEditFormProps {
  formData: {
    username: string;
    email: string;
    avatar: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      username: string;
      email: string;
      avatar: string;
    }>
  >;
  initials: string;
  uploadMode: 'file' | 'url';
  setUploadMode: (mode: 'file' | 'url') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleRemoveAvatar: () => void;
  handleSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  formData,
  setFormData,
  initials,
  uploadMode,
  setUploadMode,
  fileInputRef,
  handleRemoveAvatar,
  handleSave,
  onCancel,
  isSaving = false,
}) => {

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-orange-500" />
            <span>Edit Profile Information</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update your profile details and avatar picture
          </p>
        </div>
      </div>

      {/* HIGH-UX AVATAR UPLOAD SECTION */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <span>Profile Photo / Avatar</span>
        </label>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
          {/* Clickable Image Avatar Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group shrink-0 cursor-pointer"
            title="Click to change photo"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-3xl blur opacity-50 group-hover:opacity-90 transition duration-300" />
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar Preview"
                className="relative w-28 h-28 rounded-2xl object-cover border-2 border-orange-400 shadow-xl bg-white dark:bg-slate-900"
              />
            ) : (
              <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-4xl font-extrabold text-white border-2 border-orange-300 shadow-xl">
                {initials}
              </div>
            )}
            {/* Hover Camera Icon Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200 z-10 text-white">
              <Camera className="w-6 h-6 text-orange-300" />
              <span className="text-[10px] font-semibold">Change Photo</span>
            </div>
          </div>

          {/* Mode Options: Upload File vs Image Link */}
          <div className="flex-1 w-full space-y-4">
            {/* Mode Toggle Buttons */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${uploadMode === 'file'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${uploadMode === 'url'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {uploadMode === 'file' ? (
              /* Mode 1: Device File Upload Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-900 hover:bg-orange-50/30 dark:hover:bg-slate-900/80 transition duration-200 group text-center"
              >
                <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 group-hover:scale-110 transition duration-300">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    Click to select image from your computer
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Supports PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              </div>
            ) : (
              /* Mode 2: Paste Direct Image Link */
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Paste any public image link (Unsplash, Cloudinary, etc.)
                </p>
              </div>
            )}

            {/* Remove Photo Action */}
            {formData.avatar && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Username Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-orange-500" />
            <span>Username</span>
          </label>
          <input
            type="text"
            required
            disabled={isSaving}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            required
            disabled={isSaving}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
