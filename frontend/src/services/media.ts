import api from './api';

export interface MediaFile {
  id: string | number;
  filename: string;
  path: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  folderId?: string | number;
  createdAt: string;
}

export interface UploadResponse {
  media: MediaFile;
  message?: string;
}

// Helper function to normalize media file IDs to strings
const normalizeMediaFile = (file: any): MediaFile => {
  return {
    ...file,
    id: String(file.id),
    folderId: file.folderId ? String(file.folderId) : undefined,
  };
};

class MediaService {
  /**
   * Upload a media file
   */
  async uploadFile(file: File, folderId?: string): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const response = await api.post<any>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Handle both {media: {...}} and direct {...} response formats
    const mediaData = response.data.media || response.data;
    return normalizeMediaFile(mediaData);
  }

  /**
   * List all media files
   */
  async listMedia(params?: {
    folderId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<MediaFile[]> {
    const response = await api.get<any[]>('/media', { params });
    return response.data.map(normalizeMediaFile);
  }

  /**
   * Get a single media file by ID
   */
  async getMedia(id: string): Promise<MediaFile> {
    const response = await api.get<any>(`/media/${id}`);
    return normalizeMediaFile(response.data);
  }

  /**
   * Delete a media file
   */
  async deleteMedia(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  }

  /**
   * Attach media to content
   */
  async attachToContent(contentId: string, mediaId: string): Promise<void> {
    await api.post(`/content/${contentId}/media`, { mediaId });
  }

  /**
   * Get media attached to content
   */
  async getContentMedia(contentId: string): Promise<MediaFile[]> {
    const response = await api.get<MediaFile[]>(`/content/${contentId}/media`);
    return response.data;
  }

  /**
   * Get media URL for display
   */
  getMediaUrl(path: string): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    return `${baseUrl}${path}`;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(maxSize)}`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }
}

const mediaService = new MediaService();
export default mediaService;
