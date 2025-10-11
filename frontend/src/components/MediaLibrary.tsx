import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import MediaGrid from './MediaGrid';
import mediaService, { MediaFile } from '../services/media';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (media: MediaFile) => void;
  selectable?: boolean;
  multiSelect?: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectable = false,
  multiSelect = false,
}) => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError('');
      const files = await mediaService.listMedia();
      setMedia(files);
    } catch (err: any) {
      console.error('Failed to load media:', err);
      setError('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        // Validate file
        const validation = mediaService.validateFile(file);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          continue;
        }

        // Upload file
        const uploadedMedia = await mediaService.uploadFile(file);
        setMedia((prev) => [uploadedMedia, ...prev]);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  }, []);

  const handleMediaSelect = (item: MediaFile) => {
    if (!selectable) return;

    const itemId = String(item.id);

    if (multiSelect) {
      setSelectedIds((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedIds([itemId]);
      if (onSelect) {
        onSelect(item);
        onClose();
      }
    }
  };

  const handleConfirmSelection = () => {
    if (multiSelect && selectedIds.length > 0 && onSelect) {
      const selectedMedia = media.filter((m) => selectedIds.includes(String(m.id)));
      // For multi-select, we'll pass the first one for now
      // You could modify the interface to support multiple selections
      onSelect(selectedMedia[0]);
    }
    onClose();
  };

  const handleDelete = async (id: string | number) => {
    try {
      await mediaService.deleteMedia(String(id));
      setMedia((prev) => prev.filter((m) => String(m.id) !== String(id)));
      setSelectedIds((prev) => prev.filter((sid) => sid !== String(id)));
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError('Failed to delete file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-6xl">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Media Library</CardTitle>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Upload Section */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <input
                  type="file"
                  id="media-upload"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Images, videos, or PDFs (max 10MB)
                  </p>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="text-center py-4">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                </div>
              )}

              {/* Media Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading media...</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <MediaGrid
                    media={media}
                    onSelect={handleMediaSelect}
                    onDelete={handleDelete}
                    selectable={selectable}
                    selectedIds={selectedIds}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {multiSelect && selectedIds.length > 0 && (
                  <Button onClick={handleConfirmSelection}>
                    Select ({selectedIds.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
