import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import contentService, { ContentType, ContentItem, ContentField } from '../services/content';

const ContentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContentTypes();
    if (isEditMode && id) {
      loadContentItem(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (selectedTypeId) {
      const type = contentTypes.find((t) => t.id === selectedTypeId);
      setSelectedType(type || null);
      
      // Initialize field values
      if (type && !isEditMode) {
        const initialValues: Record<string, any> = {};
        type.fields.forEach((field) => {
          initialValues[field.name] = '';
        });
        setFieldValues(initialValues);
      }
    }
  }, [selectedTypeId, contentTypes, isEditMode]);

  const loadContentTypes = async () => {
    try {
      const types = await contentService.getContentTypes();
      setContentTypes(types);
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      setError('Failed to load content types');
    }
  };

  const loadContentItem = async (itemId: string) => {
    try {
      setLoadingData(true);
      const item = await contentService.getContentItem(itemId);
      
      setSelectedTypeId(item.contentTypeId);
      setTitle(item.title);
      setSlug(item.slug);
      setStatus(item.status);
      setFieldValues(item.fieldValues || {});
    } catch (err: any) {
      console.error('Failed to load content item:', err);
      setError('Failed to load content item');
    } finally {
      setLoadingData(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditMode || !slug) {
      setSlug(contentService.generateSlug(value));
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues({
      ...fieldValues,
      [fieldName]: value,
    });
  };

  const validateForm = (): boolean => {
    if (!selectedTypeId) {
      setError('Please select a content type');
      return false;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return false;
    }

    if (!slug.trim()) {
      setError('Please enter a slug');
      return false;
    }

    // Validate required fields
    if (selectedType) {
      for (const field of selectedType.fields) {
        if (field.required && !fieldValues[field.name]) {
          setError(`${field.name} is required`);
          return false;
        }

        if (fieldValues[field.name] && !contentService.validateFieldValue(field, fieldValues[field.name])) {
          setError(`Invalid value for ${field.name}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await contentService.updateContentItem(id, {
          title,
          slug,
          status,
          fieldValues,
        });
      } else {
        await contentService.createContentItem({
          contentTypeId: selectedTypeId,
          title,
          slug,
          status,
          fieldValues,
        });
      }

      navigate('/content');
    } catch (err: any) {
      console.error('Failed to save content:', err);
      setError(err.response?.data?.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldInput = (field: ContentField) => {
    const value = fieldValues[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value))}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              {field.required ? 'Required' : 'Optional'}
            </label>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  if (loadingData) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Content' : 'Create Content'}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isEditMode ? 'Update your content item' : 'Create a new content item'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type *
                  </label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a content type</option>
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="auto-generated-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Fields Card */}
          {selectedType && selectedType.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedType.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.name} {field.required && '*'}
                      <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/content')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ContentEditor;
