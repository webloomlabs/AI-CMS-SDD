import api from './api';

// Helper function to transform backend response with fields array to frontend format with fieldValues object
const transformContentItem = (item: any): ContentItem => {
  const fieldValues: Record<string, any> = {};
  
  // Transform fields array to fieldValues object
  if (item.fields && Array.isArray(item.fields)) {
    item.fields.forEach((field: any) => {
      fieldValues[field.name] = field.value;
    });
  }

  return {
    ...item,
    fieldValues,
  };
};

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
  fieldValues?: Record<string, any>;
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
   * Create a new content type
   */
  async createContentType(data: {
    name: string;
    description?: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
  }): Promise<ContentType> {
    const response = await api.post<ContentType>('/content/types', data);
    return response.data;
  }

  /**
   * List all content items with optional filters
   */
  async listContentItems(params?: {
    contentTypeId?: string;
    status?: string;
  }): Promise<ContentItem[]> {
    const response = await api.get<any[]>('/content', { params });
    return response.data.map(transformContentItem);
  }

  /**
   * Get a single content item by ID
   */
  async getContentItem(id: string): Promise<ContentItem> {
    const response = await api.get<any>(`/content/${id}`);
    return transformContentItem(response.data);
  }

  /**
   * Create a new content item
   */
  async createContentItem(data: CreateContentData, contentType?: ContentType): Promise<ContentItem> {
    // Transform fieldValues object into fields array expected by backend
    const fields = data.fieldValues 
      ? Object.entries(data.fieldValues).map(([name, value]) => {
          // Find the field definition to get the correct type
          const fieldDef = contentType?.fields.find(f => f.name === name);
          return {
            name,
            type: fieldDef?.type || 'text',
            value: String(value),
          };
        })
      : [];

    const requestData = {
      contentTypeId: data.contentTypeId,
      title: data.title,
      slug: data.slug,
      status: data.status || 'draft',
      fields,
    };

    const response = await api.post<any>('/content', requestData);
    return transformContentItem(response.data);
  }

  /**
   * Update an existing content item
   */
  async updateContentItem(
    id: string,
    data: UpdateContentData,
    contentType?: ContentType
  ): Promise<ContentItem> {
    // Transform fieldValues object into fields array expected by backend
    const fields = data.fieldValues 
      ? Object.entries(data.fieldValues).map(([name, value]) => {
          // Find the field definition to get the correct type
          const fieldDef = contentType?.fields.find(f => f.name === name);
          return {
            name,
            type: fieldDef?.type || 'text',
            value: String(value),
          };
        })
      : undefined;

    const requestData: any = {
      title: data.title,
      slug: data.slug,
      status: data.status,
    };

    // Only include fields if they exist
    if (fields && fields.length > 0) {
      requestData.fields = fields;
    }

    const response = await api.put<any>(`/content/${id}`, requestData);
    return transformContentItem(response.data);
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
