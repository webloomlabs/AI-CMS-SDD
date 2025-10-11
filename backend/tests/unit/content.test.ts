import { ContentService } from '../../src/services/content';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    contentItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contentField: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}));

describe('ContentService', () => {
  let contentService: ContentService;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    contentService = new ContentService(prisma);
    jest.clearAllMocks();
  });

  describe('createContent', () => {
    it('should create content item with fields', async () => {
      const mockContent = {
        id: 1,
        contentTypeId: 1,
        title: 'Test Article',
        slug: 'test-article',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            id: 1,
            contentTypeId: 1,
            contentItemId: 1,
            name: 'body',
            type: 'rich_text',
            value: 'Test content',
          },
        ],
      };

      prisma.contentItem.create.mockResolvedValue(mockContent);

      const input = {
        contentTypeId: 1,
        title: 'Test Article',
        slug: 'test-article',
        status: 'draft' as const,
        fields: [
          { name: 'body', type: 'rich_text', value: 'Test content' },
        ],
      };

      const result = await contentService.createContent(input);

      expect(prisma.contentItem.create).toHaveBeenCalledWith({
        data: {
          contentTypeId: 1,
          title: 'Test Article',
          slug: 'test-article',
          status: 'draft',
          fields: {
            create: [
              {
                name: 'body',
                type: 'rich_text',
                value: 'Test content',
                contentTypeId: 1,
              },
            ],
          },
        },
        include: {
          fields: true,
          contentType: true,
        },
      });
      expect(result).toEqual(mockContent);
    });

    it('should handle multiple fields', async () => {
      const mockContent = {
        id: 1,
        contentTypeId: 1,
        title: 'Multi-field Article',
        slug: 'multi-field-article',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            id: 1,
            contentTypeId: 1,
            contentItemId: 1,
            name: 'body',
            type: 'rich_text',
            value: 'Body content',
          },
          {
            id: 2,
            contentTypeId: 1,
            contentItemId: 1,
            name: 'excerpt',
            type: 'text',
            value: 'Short excerpt',
          },
        ],
      };

      prisma.contentItem.create.mockResolvedValue(mockContent);

      const input = {
        contentTypeId: 1,
        title: 'Multi-field Article',
        slug: 'multi-field-article',
        status: 'draft' as const,
        fields: [
          { name: 'body', type: 'rich_text', value: 'Body content' },
          { name: 'excerpt', type: 'text', value: 'Short excerpt' },
        ],
      };

      const result = await contentService.createContent(input);

      expect(result.fields).toHaveLength(2);
    });
  });

  describe('getContent', () => {
    it('should return content by id with fields', async () => {
      const mockContent = {
        id: 1,
        contentTypeId: 1,
        title: 'Test Article',
        slug: 'test-article',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            id: 1,
            contentTypeId: 1,
            contentItemId: 1,
            name: 'body',
            type: 'rich_text',
            value: 'Test content',
          },
        ],
        contentType: { id: 1, name: 'Article' },
        media: [],
      };

      prisma.contentItem.findUnique.mockResolvedValue(mockContent);

      const result = await contentService.getContent(1);

      expect(prisma.contentItem.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(result).toEqual(mockContent);
    });

    it('should return null for non-existent content', async () => {
      prisma.contentItem.findUnique.mockResolvedValue(null);

      const result = await contentService.getContent(99999);

      expect(result).toBeNull();
    });
  });

  describe('listContent', () => {
    it('should return all content items', async () => {
      const mockContent = [
        {
          id: 1,
          contentTypeId: 1,
          title: 'Article 1',
          slug: 'article-1',
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          fields: [],
          contentType: { id: 1, name: 'Article' },
        },
        {
          id: 2,
          contentTypeId: 1,
          title: 'Article 2',
          slug: 'article-2',
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          fields: [],
          contentType: { id: 1, name: 'Article' },
        },
      ];

      prisma.contentItem.findMany.mockResolvedValue(mockContent);

      const result = await contentService.listContent();

      expect(prisma.contentItem.findMany).toHaveBeenCalledWith({
        where: undefined,
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
      expect(result).toHaveLength(2);
    });

    it('should filter by contentTypeId', async () => {
      const mockContent = [
        {
          id: 1,
          contentTypeId: 1,
          title: 'Article 1',
          slug: 'article-1',
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          fields: [],
          contentType: { id: 1, name: 'Article' },
        },
      ];

      prisma.contentItem.findMany.mockResolvedValue(mockContent);

      const result = await contentService.listContent({ contentTypeId: 1 });

      expect(prisma.contentItem.findMany).toHaveBeenCalledWith({
        where: { contentTypeId: 1 },
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
      expect(result).toHaveLength(1);
      expect(result[0].contentTypeId).toBe(1);
    });

    it('should filter by status', async () => {
      const mockContent = [
        {
          id: 1,
          contentTypeId: 1,
          title: 'Published Article',
          slug: 'published-article',
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          fields: [],
          contentType: { id: 1, name: 'Article' },
        },
      ];

      prisma.contentItem.findMany.mockResolvedValue(mockContent);

      const result = await contentService.listContent({ status: 'published' });

      expect(prisma.contentItem.findMany).toHaveBeenCalledWith({
        where: { status: 'published' },
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
      expect(result[0].status).toBe('published');
    });

    it('should filter by both contentTypeId and status', async () => {
      const mockContent = [
        {
          id: 1,
          contentTypeId: 1,
          title: 'Published Article',
          slug: 'published-article',
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
          fields: [],
          contentType: { id: 1, name: 'Article' },
        },
      ];

      prisma.contentItem.findMany.mockResolvedValue(mockContent);

      const result = await contentService.listContent({
        contentTypeId: 1,
        status: 'published',
      });

      expect(prisma.contentItem.findMany).toHaveBeenCalledWith({
        where: { contentTypeId: 1, status: 'published' },
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
    });
  });

  describe('updateContent', () => {
    it('should update content item', async () => {
      const mockUpdatedContent = {
        id: 1,
        contentTypeId: 1,
        title: 'Updated Title',
        slug: 'test-article',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [],
        contentType: { id: 1, name: 'Article' },
      };

      const mockTransaction = jest.fn(async (callback) => {
        const tx = {
          contentItem: {
            update: jest.fn().mockResolvedValue({
              id: 1,
              contentTypeId: 1,
              title: 'Updated Title',
              slug: 'test-article',
              status: 'published',
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedContent),
          },
          contentField: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
          },
        };
        return callback(tx);
      });

      prisma.$transaction.mockImplementation(mockTransaction);

      const input = {
        title: 'Updated Title',
        status: 'published' as const,
      };

      const result = await contentService.updateContent(1, input);

      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe('published');
    });

    it('should handle field updates', async () => {
      const mockUpdatedContent = {
        id: 1,
        contentTypeId: 1,
        title: 'Test Article',
        slug: 'test-article',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        fields: [
          {
            id: 2,
            contentTypeId: 1,
            contentItemId: 1,
            name: 'body',
            type: 'rich_text',
            value: 'Updated content',
          },
        ],
        contentType: { id: 1, name: 'Article' },
      };

      const mockTransaction = jest.fn(async (callback) => {
        const tx = {
          contentItem: {
            update: jest.fn().mockResolvedValue({
              id: 1,
              contentTypeId: 1,
              title: 'Test Article',
              slug: 'test-article',
              status: 'draft',
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedContent),
          },
          contentField: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
          },
        };
        return callback(tx);
      });

      prisma.$transaction.mockImplementation(mockTransaction);

      const input = {
        fields: [
          { name: 'body', type: 'rich_text', value: 'Updated content' },
        ],
      };

      const result = await contentService.updateContent(1, input);

      expect(result.fields).toHaveLength(1);
      expect(result.fields[0].value).toBe('Updated content');
    });
  });

  describe('deleteContent', () => {
    it('should delete content item', async () => {
      prisma.contentItem.delete.mockResolvedValue({
        id: 1,
        contentTypeId: 1,
        title: 'Test Article',
        slug: 'test-article',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await contentService.deleteContent(1);

      expect(prisma.contentItem.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error for non-existent content', async () => {
      prisma.contentItem.delete.mockRejectedValue(
        new Error('Record to delete does not exist')
      );

      await expect(contentService.deleteContent(99999)).rejects.toThrow();
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from title', async () => {
      prisma.contentItem.findUnique.mockResolvedValue(null);

      const slug = await contentService.generateSlug('Test Article Title');

      expect(slug).toBe('test-article-title');
    });

    it('should handle special characters', async () => {
      prisma.contentItem.findUnique.mockResolvedValue(null);

      const slug = await contentService.generateSlug(
        'Test & Article: With Special-Characters!'
      );

      expect(slug).toBe('test-article-with-special-characters');
    });

    it('should append number if slug exists', async () => {
      prisma.contentItem.findUnique
        .mockResolvedValueOnce({ id: 1, slug: 'test-article' }) // First check finds existing
        .mockResolvedValueOnce(null); // Second check (with -1) is available

      const slug = await contentService.generateSlug('Test Article');

      expect(slug).toBe('test-article-1');
    });

    it('should increment until unique slug found', async () => {
      prisma.contentItem.findUnique
        .mockResolvedValueOnce({ id: 1, slug: 'test-article' }) // Base exists
        .mockResolvedValueOnce({ id: 2, slug: 'test-article-1' }) // -1 exists
        .mockResolvedValueOnce({ id: 3, slug: 'test-article-2' }) // -2 exists
        .mockResolvedValueOnce(null); // -3 is available

      const slug = await contentService.generateSlug('Test Article');

      expect(slug).toBe('test-article-3');
    });

    it('should handle empty title', async () => {
      prisma.contentItem.findUnique.mockResolvedValue(null);

      const slug = await contentService.generateSlug('');

      expect(slug).toBe('');
    });

    it('should trim leading and trailing hyphens', async () => {
      prisma.contentItem.findUnique.mockResolvedValue(null);

      const slug = await contentService.generateSlug('---Test Article---');

      expect(slug).toBe('test-article');
    });
  });
});
