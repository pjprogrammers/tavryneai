'use client';

import { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Camera,
  X,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  ImageIcon,
  Link2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

/* =========================================================
   📱 AVATAR UPLOAD - GITHUB-STYLE DESIGN
========================================================= */

interface AvatarUploadProps {
  onUploadSuccess?: (url: string) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  id?: string;
  showLabel?: boolean;
}

const SIZE_CLASSES = {
  small: 'avatar-upload-small',
  medium: 'avatar-upload-medium',
  large: 'avatar-upload-large',
};

const PRESET_AVATARS = [
  { seed: 'Adventurous', color: '#22c55e', src: '/avatars_preset/aiden.svg' },
  { seed: 'Creative', color: '#3b82f6', src: '/avatars_preset/brian.svg' },
  { seed: 'Dreamy', color: '#8b5cf6', src: '/avatars_preset/girl.svg' },
  { seed: 'Energetic', color: '#f59e0b', src: '/avatars_preset/oliver.svg' },
  { seed: 'Friendly', color: '#ec4899', src: '/avatars_preset/sara.svg' },
  { seed: 'Gentle', color: '#06b6d4', src: '/avatars_preset/robo.svg' },
  { seed: 'Happy', color: '#10b981', src: '/avatars_preset/memo_4.png' },
  { seed: 'Idealistic', color: '#6366f1', src: '/avatars_preset/3d_4.png' },
  { seed: 'Joyful', color: '#f43f5e', src: '/avatars_preset/memo_5.png' },
  { seed: 'Kind', color: '#d946ef', src: '/avatars_preset/memo_7.png' },
  { seed: 'Lively', color: '#f97316', src: '/avatars_preset/memo_16.png' },
  { seed: 'Magical', color: '#14b8a6', src: '/avatars_preset/memo_17.png' },
  { seed: 'Noble', color: '#eab308', src: '/avatars_preset/memo_22.png' },
  { seed: 'Optimistic', color: '#a855f7', src: '/avatars_preset/memo_26.png' },
  { seed: 'Peaceful', color: '#0ea5e9', src: '/avatars_preset/memo_29.png' },
  { seed: 'Quirky', color: '#84cc16', src: '/avatars_preset/memo_30.png' },
  { seed: 'Radiant', color: '#06b6d4', src: '/avatars_preset/memo_31.png' },
  { seed: 'Serene', color: '#8b5cf6', src: '/avatars_preset/memo_32.png' },
  { seed: 'Tranquil', color: '#10b981', src: '/avatars_preset/memo_35.png' },
];

type TabType = 'upload' | 'choose' | 'url';

interface TabConfig {
  id: TabType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'upload', label: 'Upload', description: 'Upload from your device', icon: <Upload size={18} /> },
  { id: 'choose', label: 'Choose', description: 'Pick a preset avatar', icon: <ImageIcon size={18} /> },
  { id: 'url', label: 'URL', description: 'Use image from link', icon: <Link2 size={18} /> },
];

const validateImageFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a JPEG, PNG, WebP, or AVIF image.' };
  }
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 10MB.' };
  }
  return { valid: true };
};

export const AvatarUpload = ({
  onUploadSuccess,
  size = 'medium',
  className = '',
  id,
  showLabel = false,
}: AvatarUploadProps) => {
  const { firebaseUser, user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [urlError, setUrlError] = useState(false);
  const [urlProcessing, setUrlProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!showModal) {
      setError(null);
      setUploadProgress(0);
      setUrlInput('');
      setUrlPreview(null);
      setUrlError(false);
    }
  }, [showModal]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const saveAvatarUrl = async (url: string) => {
    if (!firebaseUser) return;
    await updateProfile({ avatarUrl: url });
  };

  const processFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 90));
    }, 80);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.imageUrl) {
        throw new Error(data.error || 'Upload failed');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      await saveAvatarUrl(data.imageUrl);

      if (onUploadSuccess) onUploadSuccess(data.imageUrl);

      setTimeout(() => {
        setShowModal(false);
        setIsUploading(false);
        setUploadProgress(0);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void processFile(file);
  };

  const handleUrlSubmit = async () => {
    if (!firebaseUser) return;
    if (!urlInput.trim()) return;

    setIsUploading(true);
    setError(null);
    setUrlProcessing(true);

    try {
      if (!urlInput.match(/^https:\/\/.+/i)) {
        throw new Error('Please enter a valid HTTPS URL');
      }

      const response = await fetch('/api/reupload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: urlInput.trim() }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.imageUrl) {
        throw new Error(data.error || 'Failed to process image URL');
      }

      const cloudinaryUrl = data.imageUrl;
      setUrlPreview(cloudinaryUrl);
      await saveAvatarUrl(cloudinaryUrl);

      if (onUploadSuccess) onUploadSuccess(cloudinaryUrl);

      setShowModal(false);
      setUrlInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process and save URL');
    } finally {
      setIsUploading(false);
      setUrlProcessing(false);
    }
  };

  const handleAvatarSelect = async (seed: string) => {
    if (!firebaseUser) return;
    setIsUploading(true);
    setError(null);

    try {
      const preset = PRESET_AVATARS.find((p) => p.seed === seed);
      const avatarUrl = preset?.src || '/avatars_preset/aiden.svg';
      await saveAvatarUrl(avatarUrl);

      if (onUploadSuccess) onUploadSuccess(avatarUrl);

      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlPreview = (url: string) => {
    setUrlInput(url);
    if (url.match(/^https:\/\/.+/i)) {
      setUrlPreview(null);
      setUrlError(false);
    } else {
      setUrlPreview(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (showModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative z-50 w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Upload Avatar</h2>
            <button
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 px-6 pt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'upload' && (
              <div>
                <div
                  ref={dropZoneRef}
                  className={`relative flex flex-col items-center justify-center p-10 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : isUploading
                        ? 'border-muted-foreground/30 bg-secondary/30'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {isUploading ? (
                    <div className="w-full text-center">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-4 rounded-full bg-secondary/50 text-muted-foreground">
                        <Upload size={32} />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Drag and drop your image here
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        or click to browse files
                      </p>
                      <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                        PNG, JPG, WebP, AVIF up to 10MB
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'choose' && (
              <div>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.seed}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary ${
                        user?.avatarUrl === avatar.src
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAvatarSelect(avatar.seed)}
                      disabled={isUploading}
                      title={avatar.seed}
                    >
                      <NextImage
                        src={avatar.src}
                        alt={avatar.seed}
                        width={64}
                        height={64}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Click to select a preset avatar
                </p>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => handleUrlPreview(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isUploading}
                  />
                </div>

                {urlProcessing && (
                  <div className="text-center py-4">
                    <Loader2 size={24} className="animate-spin text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Downloading and rehosting image...
                    </p>
                  </div>
                )}

                {!urlProcessing && urlPreview && !urlError && (
                  <div>
                    <span className="text-xs text-muted-foreground">Preview</span>
                    <div className="mt-1 w-20 h-20 rounded-xl overflow-hidden border border-border relative">
                      <NextImage
                        src={urlPreview}
                        alt="Preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                        onError={() => setUrlError(true)}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUrlSubmit}
                  disabled={isUploading || !urlInput.trim() || urlError}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Set as avatar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex ${SIZE_CLASSES[size]} ${className}`} id={id}>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-border transition-colors"
        title="Change profile picture"
        id={id ? `${id}-btn` : undefined}
      >
        <Camera size={size === 'small' ? 14 : 18} />
        {showLabel && <span>Change</span>}
      </button>
    </div>
  );
};

export default AvatarUpload;
