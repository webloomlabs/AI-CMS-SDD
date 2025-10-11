import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import contentService, { ContentType } from '../services/content';

const ContentTypeList: React.FC = () => {
  const navigate = useNavigate();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContentTypes();
  }, []);

  const loadContentTypes = async () => {
    try {
      setLoading(true);
      const types = await contentService.getContentTypes();
      setContentTypes(types);
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      setError('Failed to load content types');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Content Types
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your content type definitions
            </p>
          </div>
          <Link to="/content-types/new">
            <Button>+ New Content Type</Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Content Types Grid */}
        {contentTypes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No content types found. Create your first content type to get started.
              </p>
              <Link to="/content-types/new">
                <Button>Create Content Type</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  {type.description && (
                    <CardDescription className="mt-1">
                      {type.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Fields:</span>
                      <span className="ml-2">{type.fields.length}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Slug:</span>
                      <span className="ml-2 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {type.slug}
                      </span>
                    </div>

                    {/* Field Types Preview */}
                    {type.fields.length > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Field Types:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {type.fields.slice(0, 4).map((field) => (
                            <span
                              key={field.id}
                              className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                            >
                              {field.name}
                            </span>
                          ))}
                          {type.fields.length > 4 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{type.fields.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 flex space-x-2">
                      <Link to={`/content/new?type=${type.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          Create Content
                        </Button>
                      </Link>
                      <Link to={`/content-types/${type.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentTypeList;
