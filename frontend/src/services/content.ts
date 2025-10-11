import api from './api';

export interface ContentField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  value?: any;
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fields: ContentField[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  contentTypeId: string;
  contentType?: ContentType;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  fieldValues: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentData {
  contentTypeId: string;
  title: string;
  slug: string;
  status?: 'draft' | 'published' | 'archived';
  fieldValues?: Record<string, any>;
}

export interface UpdateContentData {
  title?: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
  fieldValues?: Record<string, any>;
}

class ContentService {
  /**
   * Get all content types
   */
  async getContentTypes(): Promise<ContentType[]> {
    const response = await api.get<ContentType[]>('/content/types');
    return response.data;
  }

  /**
   * Get a single content type by ID
   */
  async getContentType(id: string): Promise<ContentType> {
    const response = await api.get<ContentType>(`/content/types/${id}`);
    return response.data;
  }

  /**
   * Get all content items
   */
  async getContentItems(params?: {
    contentTypeId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentItem[]> {
    const response = await api.get<ContentItem[]>('/content', { params });
    return response.data;
  }

  /**
   * Get a single content item by ID
   */
  async getContentItem(id: string): Promise<ContentItem> {
    const response = await api.get<ContentItem>(`/content/${id}`);
    return response.data;
  }

  /**
   * Create a new content item
   */
  async createContentItem(data: CreateContentData): Promise<ContentItem> {
    const response = await api.post<ContentItem>('/content', data);
    return response.data;
  }

  /**
   * Update an existing content item
   */
  async updateContentItem(id: string, data: UpdateContentData): Promise<ContentItem> {
    const response = await api.put<ContentItem>(`/content/${id}`, data);
    return response.data;
  }

  /**
   * Delete a content item
   */
  async deleteContentItem(id: string): Promise<void> {
    await api.delete(`/content/${id}`);
  }

  /**
   * Generate slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Validate field value based on field type
   */
  validateFieldValue(field: ContentField, value: any): boolean {
    if (field.required && (value === undefined || value === null || value === '')) {
      return false;
    }

    if (!field.required && (value === undefined || value === null || value === '')) {
      return true;
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return !isNaN(Date.parse(value));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }
}

export default new ContentService();
