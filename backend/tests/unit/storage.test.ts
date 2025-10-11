import { LocalStorage } from '../../src/utils/storage/LocalStorage';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Mock Sharp and fs
jest.mock('sharp');
jest.mock('fs/promises');

describe('LocalStorage', () => {
  let storage: LocalStorage;
  const uploadPath = '/tmp/test-uploads';

  beforeEach(() => {
    storage = new LocalStorage(uploadPath);
    jest.clearAllMocks();
  });

  describe('saveFile', () => {
    it('should save file and return metadata for images', async () => {
      const mockBuffer = Buffer.from('test image data');
      const mockMetadata = { width: 800, height: 600, format: 'jpeg' };
      
      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockResolvedValue(mockMetadata),
        toFile: jest.fn().mockResolvedValue({}),
      });

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.stat as jest.Mock)
        .mockRejectedValueOnce({ code: 'ENOENT' }) // File doesn't exist check
        .mockResolvedValueOnce({ size: 1024 }); // Get file stats after saving

      const result = await storage.saveFile(
        mockBuffer,
        'test-image.jpg',
        'image/jpeg'
      );

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('size');
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.type).toBe('image/jpeg');
    });

    it('should save non-image files without processing', async () => {
      const mockBuffer = Buffer.from('test pdf data');

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.stat as jest.Mock)
        .mockRejectedValueOnce({ code: 'ENOENT' }) // File doesn't exist check
        .mockResolvedValueOnce({ size: 100 }); // Get file stats after saving

      const result = await storage.saveFile(
        mockBuffer,
        'document.pdf',
        'application/pdf'
      );

      expect(result).toHaveProperty('path');
      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
      expect(sharp).not.toHaveBeenCalled();
    });

    it('should generate unique filename if file exists', async () => {
      const mockBuffer = Buffer.from('test data');

      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        toFile: jest.fn().mockResolvedValue({}),
      });

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.stat as jest.Mock)
        .mockResolvedValueOnce({ size: 100 }) // File exists check
        .mockRejectedValueOnce({ code: 'ENOENT' }) // Second check - doesn't exist
        .mockResolvedValueOnce({ size: 200 }); // Get file stats after saving

      const result = await storage.saveFile(
        mockBuffer,
        'test.jpg',
        'image/jpeg'
      );

      expect(result.filename).toMatch(/test-\d+\.jpg/);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await expect(
        storage.deleteFile('uploads/test-image.jpg')
      ).resolves.not.toThrow();

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-image.jpg')
      );
    });

    it('should handle file not found error gracefully', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      await expect(
        storage.deleteFile('uploads/nonexistent.jpg')
      ).resolves.not.toThrow();
    });
  });

  describe('getFileUrl', () => {
    it('should return correct file URL', () => {
      const url = storage.getFileUrl('uploads/test-image.jpg');

      expect(url).toBe('/uploads/test-image.jpg');
    });
  });
});
