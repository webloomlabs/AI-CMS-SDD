import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import MediaLibrary from '../components/MediaLibrary';
import MediaGrid from '../components/MediaGrid';
import mediaService, { MediaFile } from '../services/media';

const MediaPage: React.FC = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadMedia();
  }, []);

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

  const handleDelete = async (id: string | number) => {
    try {
      await mediaService.deleteMedia(String(id));
      setMedia((prev) => prev.filter((m) => String(m.id) !== String(id)));
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError('Failed to delete file');
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    loadMedia(); // Reload to show new uploads
  };

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(m => {
        if (filter === 'images') return m.type.startsWith('image/');
        if (filter === 'videos') return m.type.startsWith('video/');
        if (filter === 'documents') return m.type.startsWith('application/');
        return true;
      });

  const stats = {
    total: media.length,
    images: media.filter(m => m.type.startsWith('image/')).length,
    videos: media.filter(m => m.type.startsWith('video/')).length,
    documents: media.filter(m => m.type.startsWith('application/')).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Media Library
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your images, videos, and documents
            </p>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            + Upload Media
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.images}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.videos}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.documents}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'images' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('images')}
          >
            Images
          </Button>
          <Button
            variant={filter === 'videos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('videos')}
          >
            Videos
          </Button>
          <Button
            variant={filter === 'documents' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('documents')}
          >
            Documents
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Media Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading media...</p>
            </div>
          ) : (
            <MediaGrid
              media={filteredMedia}
              onDelete={handleDelete}
              selectable={false}
            />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <MediaLibrary
        isOpen={showUploadModal}
        onClose={handleUploadComplete}
        selectable={false}
      />
    </Layout>
  );
};

export default MediaPage;
