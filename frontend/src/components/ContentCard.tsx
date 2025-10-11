import React from 'react';
import { Link } from 'react-router-dom';
import { ContentItem } from '../services/content';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';

interface ContentCardProps {
  content: ContentItem;
  onDelete?: (id: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onDelete }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return badges[status as keyof typeof badges] || badges.draft;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete && window.confirm('Are you sure you want to delete this content?')) {
      onDelete(content.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{content.title}</CardTitle>
            <CardDescription className="mt-1">
              {content.contentType?.name || 'Unknown Type'}
            </CardDescription>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
              content.status
            )}`}
          >
            {content.status}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Slug:</span>
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {content.slug}
            </span>
          </div>
          
          {content.createdBy && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Author:</span>
              <span>{content.createdBy.name}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="font-medium">Created:</span>
            <span>{formatDate(content.createdAt)}</span>
          </div>

          {content.publishedAt && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Published:</span>
              <span>{formatDate(content.publishedAt)}</span>
            </div>
          )}
        </div>

        {/* Preview of field values */}
        {content.fieldValues && Object.keys(content.fieldValues).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Fields: {Object.keys(content.fieldValues).length}
            </p>
            <div className="flex flex-wrap gap-1">
              {Object.keys(content.fieldValues).slice(0, 3).map((key) => (
                <span
                  key={key}
                  className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                >
                  {key}
                </span>
              ))}
              {Object.keys(content.fieldValues).length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{Object.keys(content.fieldValues).length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Link to={`/content/edit/${content.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Edit
          </Button>
        </Link>
        {onDelete && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
