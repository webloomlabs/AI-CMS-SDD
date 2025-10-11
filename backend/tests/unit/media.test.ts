import { MediaService } from '../../src/services/media';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    mediaFile: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock storage provider
const mockStorage = {
  saveFile: jest.fn(),
  deleteFile: jest.fn(),
  getFileUrl: jest.fn(),
};

describe('MediaService', () => {
  let mediaService: MediaService;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    mediaService = new MediaService(prisma, mockStorage as any);
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file and save metadata', async () => {
      const mockBuffer = Buffer.from('test data');
      const mockMetadata = {
        path: 'uploads/test.jpg',
        size: 1024,
        width: 800,
        height: 600,
        type: 'image/jpeg',
        filename: 'test.jpg',
      };

      mockStorage.saveFile.mockResolvedValue(mockMetadata);
      mockStorage.getFileUrl.mockReturnValue('/uploads/test.jpg');

      prisma.mediaFile.create.mockResolvedValue({
        id: 1,
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
        type: 'image/jpeg',
        size: 1024,
        width: 800,
        height: 600,
        folderId: null,
        createdAt: new Date(),
      });

      const result = await mediaService.uploadFile(
        mockBuffer,
        'test.jpg',
        'image/jpeg'
      );

      expect(mockStorage.saveFile).toHaveBeenCalledWith(
        mockBuffer,
        'test.jpg',
        'image/jpeg'
      );
      expect(prisma.mediaFile.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should upload file to specific folder', async () => {
      const mockBuffer = Buffer.from('test data');
      const mockMetadata = {
        path: 'uploads/folder/test.jpg',
        size: 1024,
        type: 'image/jpeg',
        filename: 'test.jpg',
      };

      mockStorage.saveFile.mockResolvedValue(mockMetadata);
      mockStorage.getFileUrl.mockReturnValue('/uploads/folder/test.jpg');

      prisma.mediaFile.create.mockResolvedValue({
        id: 1,
        folderId: 5,
      });

      const result = await mediaService.uploadFile(
        mockBuffer,
        'test.jpg',
        'image/jpeg',
        5
      );

      expect(result.folderId).toBe(5);
    });
  });

  describe('listFiles', () => {
    it('should list all media files', async () => {
      const mockFiles = [
        {
          id: 1,
          filename: 'image1.jpg',
          path: 'uploads/image1.jpg',
          type: 'image/jpeg',
          size: 1024,
          width: 800,
          height: 600,
        },
        {
          id: 2,
          filename: 'image2.png',
          path: 'uploads/image2.png',
          type: 'image/png',
          size: 2048,
          width: 1024,
          height: 768,
        },
      ];

      prisma.mediaFile.findMany.mockResolvedValue(mockFiles);

      const result = await mediaService.listFiles();

      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('image1.jpg');
    });

    it('should filter files by folder', async () => {
      const mockFiles = [
        {
          id: 1,
          filename: 'image1.jpg',
          folderId: 5,
        },
      ];

      prisma.mediaFile.findMany.mockResolvedValue(mockFiles);

      const result = await mediaService.listFiles(5);

      expect(prisma.mediaFile.findMany).toHaveBeenCalledWith({
        where: { folderId: 5 },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getFile', () => {
    it('should return file by id', async () => {
      const mockFile = {
        id: 1,
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
      };

      prisma.mediaFile.findUnique.mockResolvedValue(mockFile);

      const result = await mediaService.getFile(1);

      expect(result).toEqual(mockFile);
    });

    it('should return null for non-existent file', async () => {
      prisma.mediaFile.findUnique.mockResolvedValue(null);

      const result = await mediaService.getFile(999);

      expect(result).toBeNull();
    });
  });

  describe('deleteFile', () => {
    it('should delete file from storage and database', async () => {
      const mockFile = {
        id: 1,
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
      };

      prisma.mediaFile.findUnique.mockResolvedValue(mockFile);
      prisma.mediaFile.delete.mockResolvedValue(mockFile);
      mockStorage.deleteFile.mockResolvedValue(undefined);

      await mediaService.deleteFile(1);

      expect(mockStorage.deleteFile).toHaveBeenCalledWith('uploads/test.jpg');
      expect(prisma.mediaFile.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error if file not found', async () => {
      prisma.mediaFile.findUnique.mockResolvedValue(null);

      await expect(mediaService.deleteFile(999)).rejects.toThrow(
        'Media file not found'
      );
    });
  });

  describe('attachToContent', () => {
    it('should attach media to content item', async () => {
      const mockRelation = {
        id: 1,
        contentId: 10,
        mediaId: 5,
        altText: 'Test image',
      };

      prisma.contentMediaRelation = {
        create: jest.fn().mockResolvedValue(mockRelation),
      };

      const result = await mediaService.attachToContent(10, 5, 'Test image');

      expect(prisma.contentMediaRelation.create).toHaveBeenCalledWith({
        data: {
          contentId: 10,
          mediaId: 5,
          altText: 'Test image',
        },
      });
      expect(result).toEqual(mockRelation);
    });
  });

  describe('getContentMedia', () => {
    it('should get all media attached to content', async () => {
      const mockRelations = [
        {
          id: 1,
          contentId: 10,
          mediaId: 5,
          media: {
            id: 5,
            filename: 'image1.jpg',
            path: 'uploads/image1.jpg',
          },
        },
      ];

      prisma.contentMediaRelation = {
        findMany: jest.fn().mockResolvedValue(mockRelations),
      };

      const result = await mediaService.getContentMedia(10);

      expect(prisma.contentMediaRelation.findMany).toHaveBeenCalledWith({
        where: { contentId: 10 },
        include: {
          media: true,
        },
      });
      expect(result).toEqual(mockRelations);
    });
  });
});
