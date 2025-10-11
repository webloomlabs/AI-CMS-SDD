import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import MediaLibrary from '../components/MediaLibrary';
import contentService, { ContentType, ContentItem, ContentField } from '../services/content';
import { MediaFile } from '../services/media';

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [currentMediaField, setCurrentMediaField] = useState<string | null>(null);

  useEffect(() => {
    loadContentTypes();
    if (isEditMode && id) {
      loadContentItem(id);
    } else {
      setInitialLoadComplete(true);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    console.log('useEffect triggered:', { selectedTypeId, isEditMode, initialLoadComplete });
    
    if (selectedTypeId && !isEditMode && initialLoadComplete) {
      const type = contentTypes.find((t) => t.id === selectedTypeId);
      setSelectedType(type || null);
      
      console.log('Initializing field values for new content');
      // Initialize field values only for new content
      if (type) {
        const initialValues: Record<string, any> = {};
        type.fields.forEach((field) => {
          initialValues[field.name] = '';
        });
        setFieldValues(initialValues);
      }
    } else if (selectedTypeId && isEditMode) {
      // Just set the selected type, don't reinitialize field values
      const type = contentTypes.find((t) => t.id === selectedTypeId);
      console.log('Setting selected type for edit mode:', type);
      setSelectedType(type || null);
    }
  }, [selectedTypeId, contentTypes, isEditMode, initialLoadComplete]);

  const loadContentTypes = async () => {
    try {
      const types = await contentService.getContentTypes();
      console.log('Content types loaded:', types);
      setContentTypes(types);
      
      if (types.length === 0) {
        setError('No content types available. Please contact your administrator.');
      }
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      setError('Failed to load content types: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadContentItem = async (itemId: string) => {
    try {
      setLoadingData(true);
      const item = await contentService.getContentItem(itemId);
      
      console.log('Loaded content item:', item);
      console.log('Field values:', item.fieldValues);
      
      setSelectedTypeId(item.contentTypeId);
      setTitle(item.title);
      setSlug(item.slug);
      setStatus(item.status);
      setFieldValues(item.fieldValues || {});
      setInitialLoadComplete(true);
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

  const handleMediaSelect = (fieldName: string) => {
    setCurrentMediaField(fieldName);
    setShowMediaLibrary(true);
  };

  const handleMediaSelected = (media: MediaFile) => {
    if (currentMediaField) {
      handleFieldChange(currentMediaField, media.id);
      setShowMediaLibrary(false);
      setCurrentMediaField(null);
    }
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
        // Pass the selected content type to the service for field type information
        const response = await contentService.createContentItem(
          {
            contentTypeId: selectedTypeId,
            title,
            slug,
            status,
            fieldValues,
          },
          selectedType || undefined // Pass the content type for proper field type mapping
        );
      }

      navigate('/content');
    } catch (err: any) {
      console.error('Failed to save content:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save content');
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
      case 'rich_text':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            rows={field.type === 'rich_text' ? 10 : 4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
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

      case 'image':
        return (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleMediaSelect(field.name)}
            >
              {value ? 'Change Image' : 'Select Image'}
            </Button>
            {value && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Media ID: {value}
              </div>
            )}
          </div>
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
                {(() => {
                  console.log('Rendering fields, selectedType:', selectedType);
                  console.log('Fields array:', selectedType.fields);
                  console.log('Fields count:', selectedType.fields.length);
                  
                  // Remove duplicates by field name
                  const uniqueFields = selectedType.fields.reduce((acc: ContentField[], field) => {
                    if (!acc.find(f => f.name === field.name)) {
                      acc.push(field);
                    }
                    return acc;
                  }, []);
                  
                  console.log('Unique fields:', uniqueFields);
                  console.log('Unique fields count:', uniqueFields.length);
                  
                  return uniqueFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.name} {field.required && '*'}
                        <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                      </label>
                      {renderFieldInput(field)}
                    </div>
                  ));
                })()}
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

        {/* Media Library Modal */}
        <MediaLibrary
          isOpen={showMediaLibrary}
          onClose={() => {
            setShowMediaLibrary(false);
            setCurrentMediaField(null);
          }}
          onSelect={handleMediaSelected}
          selectable={true}
        />
      </div>
    </Layout>
  );
};

export default ContentEditor;
