import React from 'react';
import { MediaFile } from '../services/media';
import mediaService from '../services/media';
import { Button } from './ui/button';

interface MediaGridProps {
  media: MediaFile[];
  onSelect?: (media: MediaFile) => void;
  onDelete?: (id: string | number) => void;
  selectable?: boolean;
  selectedIds?: string[];
}

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  onSelect,
  onDelete,
  selectable = false,
  selectedIds = [],
}) => {
  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  const handleMediaClick = (item: MediaFile) => {
    if (selectable && onSelect) {
      onSelect(item);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this file?')) {
      onDelete(id);
    }
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">No media files yet</p>
        <p className="text-sm">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {media.filter(item => item && item.id).map((item) => {
        const isSelected = selectedIds.includes(String(item.id));
        
        return (
          <div
            key={item.id}
            onClick={() => handleMediaClick(item)}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
              selectable ? 'cursor-pointer hover:border-blue-500' : ''
            } ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Media Preview */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {isImage(item.type) ? (
                <img
                  src={mediaService.getMediaUrl(item.path)}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : isVideo(item.type) ? (
                <video
                  src={mediaService.getMediaUrl(item.path)}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-xs">{item.type.split('/')[1]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => handleDelete(e, item.id)}
                  className="mx-1"
                >
                  Delete
                </Button>
              )}
            </div>

            {/* Selection indicator */}
            {selectable && isSelected && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* File info */}
            <div className="p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={item.filename}>
                {item.filename}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {mediaService.formatFileSize(item.size)}
                </span>
                {item.width && item.height && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.width}×{item.height}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MediaGrid;
