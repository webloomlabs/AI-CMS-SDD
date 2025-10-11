import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentCard from '../components/ContentCard';
import { Button } from '../components/ui/button';
import { useToast } from '../components/Toast';
import contentService, { ContentItem, ContentType } from '../services/content';

const ContentList: React.FC = () => {
  const toast = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedType, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load content types
      const types = await contentService.getContentTypes();
      setContentTypes(types);

      // Load content items with filters
      const params: any = {};
      if (selectedType !== 'all') {
        params.contentTypeId = selectedType;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const items = await contentService.listContentItems(params);
      setContentItems(items);
    } catch (err: any) {
      console.error('Failed to load content:', err);
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content item?')) {
      return;
    }

    try {
      await contentService.deleteContentItem(id);
      setContentItems(contentItems.filter((item) => item.id !== id));
      toast.success('Content deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete content:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete content';
      toast.error(errorMessage);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Content
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your content items
            </p>
          </div>
          <Link to="/content/new">
            <Button>
              <span className="mr-2">➕</span>
              Create Content
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                {contentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner w-8 h-8 border-4 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading content...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && contentItems.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No content found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first content item
            </p>
            <Link to="/content/new">
              <Button>Create Content</Button>
            </Link>
          </div>
        )}

        {/* Content Grid */}
        {!loading && contentItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentItems.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && contentItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing <span className="font-semibold">{contentItems.length}</span>{' '}
              {contentItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentList;
