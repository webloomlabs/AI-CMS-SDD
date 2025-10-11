import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import contentService, { ContentField } from '../services/content';

interface FieldDefinition {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'select', label: 'Select' },
  { value: 'image', label: 'Image' },
];

const ContentTypeEditor: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateFieldId = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: generateFieldId(),
        name: '',
        type: 'text',
        required: false,
        description: '',
      },
    ]);
  };

  const updateField = (id: string, key: keyof FieldDefinition, value: any) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, [key]: value } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFields(newFields);
  };

  const moveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Please enter a content type name');
      return false;
    }

    if (fields.length === 0) {
      setError('Please add at least one field');
      return false;
    }

    // Check for duplicate field names
    const fieldNames = fields.map(f => f.name.trim().toLowerCase());
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setError(`Duplicate field names found: ${duplicates.join(', ')}`);
      return false;
    }

    // Check all fields have names
    const emptyFields = fields.filter(f => !f.name.trim());
    if (emptyFields.length > 0) {
      setError('All fields must have a name');
      return false;
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

      await contentService.createContentType({
        name,
        description,
        fields: fields.map(field => ({
          name: field.name.trim(),
          type: field.type,
          required: field.required,
          description: field.description,
        })),
      });

      navigate('/content-types');
    } catch (err: any) {
      console.error('Failed to create content type:', err);
      setError(err.response?.data?.message || 'Failed to create content type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Content Type
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Define a new content type with custom fields
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Blog Post, Product, FAQ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what this content type is for..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fields Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fields</CardTitle>
                <Button type="button" onClick={addField} variant="outline" size="sm">
                  + Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">No fields added yet</p>
                  <p className="text-sm">Click "Add Field" to create your first field</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Field Name *
                          </label>
                          <Input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(field.id, 'name', e.target.value)}
                            placeholder="e.g., title, description, price"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Field Type *
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            {FIELD_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <Input
                          type="text"
                          value={field.description || ''}
                          onChange={(e) => updateField(field.id, 'description', e.target.value)}
                          placeholder="Optional description for this field"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label className="text-sm text-gray-700 dark:text-gray-300">
                            Required field
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveFieldUp(index)}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveFieldDown(index)}
                            disabled={index === fields.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeField(field.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/content-types')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fields.length === 0}>
              {loading ? 'Creating...' : 'Create Content Type'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ContentTypeEditor;
