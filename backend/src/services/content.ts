import { PrismaClient } from '@prisma/client';

export interface ContentWithFields {
  id: number;
  contentTypeId: number;
  title: string;
  slug: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  fields: Array<{
    id: number;
    contentTypeId: number | null;
    contentItemId: number | null;
    name: string;
    type: string;
    value: string;
  }>;
  contentType?: any;
  media?: any[];
}

export interface CreateContentInput {
  contentTypeId: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  fields: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export interface UpdateContentInput {
  title?: string;
  slug?: string;
  status?: 'draft' | 'published';
  fields?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export class ContentService {
  constructor(private prisma: PrismaClient) {}

  async createContent(input: CreateContentInput): Promise<ContentWithFields> {
    const { fields, ...contentData } = input;

    // Create content item with fields in a transaction
    const content = await this.prisma.contentItem.create({
      data: {
        ...contentData,
        fields: {
          create: fields.map(field => ({
            ...field,
            contentTypeId: input.contentTypeId,
          })),
        },
      },
      include: {
        fields: true,
        contentType: true,
      },
    });

    return content as ContentWithFields;
  }

  async getContent(id: number): Promise<ContentWithFields | null> {
    const content = await this.prisma.contentItem.findUnique({
      where: { id },
      include: {
        fields: true,
        contentType: true,
        media: {
          include: {
            media: true,
          },
        },
      },
    });

    return content as ContentWithFields | null;
  }

  async listContent(filters?: {
    contentTypeId?: number;
    status?: 'draft' | 'published';
  }): Promise<ContentWithFields[]> {
    const content = await this.prisma.contentItem.findMany({
      where: filters,
      include: {
        fields: true,
        contentType: true,
        media: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return content as ContentWithFields[];
  }

  async updateContent(
    id: number,
    input: UpdateContentInput
  ): Promise<ContentWithFields> {
    const { fields, ...contentData } = input;

    // Update in transaction
    return this.prisma.$transaction(async (tx: any) => {
      // Update content item
      const content = await tx.contentItem.update({
        where: { id },
        data: contentData,
      });

      // If fields provided, replace them
      if (fields) {
        // Delete existing fields
        await tx.contentField.deleteMany({
          where: { contentItemId: id },
        });

        // Create new fields
        await tx.contentField.createMany({
          data: fields.map(field => ({
            ...field,
            contentItemId: id,
            contentTypeId: content.contentTypeId,
          })),
        });
      }

      // Return updated content with fields
      const updatedContent = await tx.contentItem.findUnique({
        where: { id },
        include: {
          fields: true,
          contentType: true,
        },
      });

      return updatedContent as ContentWithFields;
    });
  }

  async deleteContent(id: number): Promise<void> {
    // Cascade delete handled by Prisma schema
    await this.prisma.contentItem.delete({
      where: { id },
    });
  }

  async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check for uniqueness
    const existing = await this.prisma.contentItem.findUnique({
      where: { slug: baseSlug },
    });

    if (!existing) {
      return baseSlug;
    }

    // Append number if duplicate
    let counter = 1;
    let slug = `${baseSlug}-${counter}`;
    while (await this.prisma.contentItem.findUnique({ where: { slug } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}
