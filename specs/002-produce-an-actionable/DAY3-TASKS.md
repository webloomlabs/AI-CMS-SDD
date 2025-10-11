# Day 3 Implementation Guide: Media Upload & Management

**Date**: October 11, 2025  
**Feature**: User Story 3 - Media Upload and Management (Priority P3)  
**Goal**: Enable editors to upload media files, process images with Sharp, and attach them to content items  
**Time Budget**: 8 hours

## Prerequisites ✅

Before starting Day 3, ensure these are complete:

- [x] Phase 1: Setup (T001-T005) - Backend structure, dependencies, TypeScript
- [x] Phase 2: Foundational (T006-T011) - Database schema, auth service, middleware
- [x] Phase 3: User Story 1 (T012-T016) - Authentication working with JWT tokens
- [x] Phase 4: User Story 2 (T017-T023) - Content CRUD API fully functional
- [x] Database has MediaFile, MediaFolder, MediaTransformation, ContentMediaRelation models
- [x] Server running and accessible at http://localhost:3001

## Task Overview

| ID | Type | File | Description | Est. Time |
|---|---|---|---|---|
| T024 | Test | `backend/tests/unit/storage.test.ts` | Unit tests for storage provider | 1h |
| T025 | Test | `backend/tests/unit/media.test.ts` | Unit tests for media service | 1h |
| T026 | Test | `backend/tests/integration/media.test.ts` | Integration tests for media endpoints | 1.5h |
| T027 | Interface | `backend/src/utils/storage/StorageProvider.ts` | Storage provider interface | 0.5h |
| T028 | Implementation | `backend/src/utils/storage/LocalStorage.ts` | LocalStorage with Sharp processing | 1.5h |
| T029 | Service | `backend/src/services/media.ts` | Media CRUD business logic | 1h |
| T030 | Controller | `backend/src/controllers/media.ts` | Media API endpoints | 1h |
| T031 | Middleware | `backend/src/middleware/upload.ts` | Multer file upload config | 0.5h |
| T032 | Routes | `backend/src/index.ts` | Wire media routes to Express | 0.5h |
| T033 | Enhancement | `backend/src/controllers/content.ts` | Add media relations to content | 0.5h |
| T034 | Setup | `backend/uploads/` | Create uploads directory | 0.25h |
| T035 | Config | `backend/.env.sample` | Add media env vars | 0.25h |

**Total Estimated Time**: 8 hours

---

## Task T024: Unit Tests for Storage Provider

**Type**: Test (Unit)  
**File**: `backend/tests/unit/storage.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: None (can start immediately)

### Objective
Create unit tests for the storage provider interface and LocalStorage implementation.

### Implementation Details

```typescript
// backend/tests/unit/storage.test.ts
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
      (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

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
      (fs.stat as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

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

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.stat as jest.Mock)
        .mockResolvedValueOnce({ size: 100 }) // File exists
        .mockRejectedValueOnce({ code: 'ENOENT' }); // Second check - doesn't exist
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

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
```

### Acceptance Criteria
- [ ] All storage provider methods tested
- [ ] Image processing with Sharp mocked and tested
- [ ] File saving with unique names tested
- [ ] File deletion tested
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- unit/storage.test.ts
```

---

## Task T025: Unit Tests for Media Service

**Type**: Test (Unit)  
**File**: `backend/tests/unit/media.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T024 (can run in parallel)

### Objective
Test media service CRUD operations with mocked database and storage.

### Implementation Details

```typescript
// backend/tests/unit/media.test.ts
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
});
```

### Acceptance Criteria
- [ ] All CRUD operations tested
- [ ] Storage provider integration tested
- [ ] Folder support tested
- [ ] Image metadata extraction tested
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- unit/media.test.ts
```

---

## Task T026: Integration Tests for Media Endpoints

**Type**: Test (Integration)  
**File**: `backend/tests/integration/media.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T024, T025 (can run in parallel)

### Objective
Test media API endpoints end-to-end with real file uploads and database.

### Implementation Details

```typescript
// backend/tests/integration/media.test.ts
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

describe('Media API', () => {
  let authToken: string;
  let mediaId: number;
  const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

  beforeAll(async () => {
    // Login to get JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    authToken = loginRes.body.token;

    // Create test image if it doesn't exist
    const testImageDir = path.dirname(testImagePath);
    await fs.mkdir(testImageDir, { recursive: true });
    
    // Create a simple 1x1 red PNG
    const redPixel = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
      0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
      0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    await fs.writeFile(testImagePath, redPixel);
  });

  afterAll(async () => {
    // Cleanup test uploads
    await prisma.mediaFile.deleteMany({
      where: { filename: { contains: 'test' } },
    });
    
    // Clean test image
    try {
      await fs.unlink(testImagePath);
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    await prisma.$disconnect();
  });

  describe('POST /api/v1/media/upload', () => {
    it('should upload image and extract metadata', async () => {
      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('filename');
      expect(res.body).toHaveProperty('path');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('size');
      expect(res.body).toHaveProperty('width');
      expect(res.body).toHaveProperty('height');
      expect(res.body.type).toContain('image');
      
      mediaId = res.body.id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/media/upload')
        .attach('file', testImagePath);

      expect(res.status).toBe(401);
    });

    it('should require file to be uploaded', async () => {
      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate file type', async () => {
      // Create a text file
      const textPath = path.join(__dirname, '../fixtures/test.txt');
      await fs.writeFile(textPath, 'test content');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', textPath);

      // Should accept or reject based on your validation rules
      // Adjust expectation based on your implementation

      await fs.unlink(textPath);
    });
  });

  describe('GET /api/v1/media', () => {
    it('should list all media files', async () => {
      const res = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by folderId', async () => {
      const res = await request(app)
        .get('/api/v1/media?folderId=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/media');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/media/:id', () => {
    it('should get media file by id', async () => {
      const res = await request(app)
        .get(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(mediaId);
      expect(res.body).toHaveProperty('filename');
    });

    it('should return 404 for non-existent media', async () => {
      const res = await request(app)
        .get('/api/v1/media/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('should delete media file', async () => {
      const res = await request(app)
        .delete(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request(app).delete('/api/v1/media/1');

      expect(res.status).toBe(401);
    });
  });

  describe('Content Media Relations', () => {
    let contentId: number;
    let newMediaId: number;

    beforeAll(async () => {
      // Create content item
      const contentType = await prisma.contentType.findUnique({
        where: { name: 'Article' },
      });

      const content = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId: contentType!.id,
          title: 'Test Article with Media',
          slug: 'test-article-with-media',
          status: 'draft',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Content here' },
          ],
        });

      contentId = content.body.id;

      // Upload media
      const media = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      newMediaId = media.body.id;
    });

    it('should attach media to content', async () => {
      const res = await request(app)
        .post(`/api/v1/content/${contentId}/media`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mediaId: newMediaId,
          altText: 'Test image alt text',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.altText).toBe('Test image alt text');
    });

    it('should list content with media', async () => {
      const res = await request(app)
        .get(`/api/v1/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('media');
      expect(Array.isArray(res.body.media)).toBe(true);
      expect(res.body.media.length).toBeGreaterThan(0);
    });

    afterAll(async () => {
      // Cleanup
      await prisma.contentItem.delete({
        where: { id: contentId },
      });
      await prisma.mediaFile.delete({
        where: { id: newMediaId },
      });
    });
  });
});
```

### Acceptance Criteria
- [ ] File upload with multipart/form-data tested
- [ ] Image metadata extraction tested
- [ ] File listing and filtering tested
- [ ] File deletion tested
- [ ] Content-media relations tested
- [ ] Authentication tested
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- integration/media.test.ts
```

---

## Task T027: Storage Provider Interface

**Type**: Interface  
**File**: `backend/src/utils/storage/StorageProvider.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T024-T026 (tests must fail first)

### Objective
Create a storage provider interface to support multiple storage backends (local, S3, etc.).

### Implementation Details

```typescript
// backend/src/utils/storage/StorageProvider.ts
export interface FileMetadata {
  path: string;
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

export interface StorageProvider {
  /**
   * Save a file to storage
   * @param buffer File buffer
   * @param filename Original filename
   * @param mimeType File MIME type
   * @returns File metadata including path and dimensions (for images)
   */
  saveFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<FileMetadata>;

  /**
   * Delete a file from storage
   * @param filePath Path to the file
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Get public URL for a file
   * @param filePath Path to the file
   * @returns Public URL
   */
  getFileUrl(filePath: string): string;
}
```

### Acceptance Criteria
- [ ] Interface defines all required methods
- [ ] TypeScript types properly defined
- [ ] Documentation comments included

### Verification Command
```bash
cd backend && npm run build
```

---

## Task T028: LocalStorage Provider Implementation

**Type**: Implementation  
**File**: `backend/src/utils/storage/LocalStorage.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T027 (interface must exist)

### Objective
Implement local file storage with Sharp for image processing.

### Implementation Details

```typescript
// backend/src/utils/storage/LocalStorage.ts
import { StorageProvider, FileMetadata } from './StorageProvider';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorage implements StorageProvider {
  constructor(private uploadPath: string) {}

  async saveFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<FileMetadata> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadPath, { recursive: true });

    // Generate unique filename to avoid collisions
    const uniqueFilename = await this.generateUniqueFilename(filename);
    const filePath = path.join(this.uploadPath, uniqueFilename);

    let width: number | undefined;
    let height: number | undefined;

    // Process images with Sharp
    if (mimeType.startsWith('image/')) {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      width = metadata.width;
      height = metadata.height;

      // Save processed image
      await image.toFile(filePath);
    } else {
      // Save non-image files directly
      await fs.writeFile(filePath, buffer);
    }

    const stats = await fs.stat(filePath);
    const size = stats.size;

    return {
      path: path.relative(process.cwd(), filePath),
      filename: uniqueFilename,
      size,
      type: mimeType,
      width,
      height,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    try {
      await fs.unlink(absolutePath);
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getFileUrl(filePath: string): string {
    // Return relative URL for local files
    return `/${filePath}`;
  }

  private async generateUniqueFilename(originalFilename: string): Promise<string> {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    let filename = originalFilename;
    let counter = 0;

    // Check if file exists and generate unique name
    while (await this.fileExists(path.join(this.uploadPath, filename))) {
      counter++;
      filename = `${basename}-${counter}${ext}`;
    }

    return filename;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
```

### Acceptance Criteria
- [ ] Implements StorageProvider interface
- [ ] Image processing with Sharp works
- [ ] Unique filename generation works
- [ ] File deletion works
- [ ] Unit tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- unit/storage.test.ts
```

---

## Task T029: Media Service Implementation

**Type**: Service  
**File**: `backend/src/services/media.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T027, T028 (storage provider must exist)

### Objective
Implement media service for upload, list, and delete operations.

### Implementation Details

```typescript
// backend/src/services/media.ts
import { PrismaClient } from '@prisma/client';
import { StorageProvider } from '../utils/storage/StorageProvider';

export interface MediaFile {
  id: number;
  filename: string;
  path: string;
  type: string;
  size: number;
  width?: number | null;
  height?: number | null;
  folderId?: number | null;
  createdAt: Date;
}

export class MediaService {
  constructor(
    private prisma: PrismaClient,
    private storage: StorageProvider
  ) {}

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folderId?: number
  ): Promise<MediaFile> {
    // Save file to storage
    const metadata = await this.storage.saveFile(buffer, filename, mimeType);

    // Save metadata to database
    const media = await this.prisma.mediaFile.create({
      data: {
        filename: metadata.filename,
        path: metadata.path,
        type: metadata.type,
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        folderId: folderId || null,
      },
    });

    return media;
  }

  async listFiles(folderId?: number): Promise<MediaFile[]> {
    return this.prisma.mediaFile.findMany({
      where: folderId !== undefined ? { folderId } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFile(id: number): Promise<MediaFile | null> {
    return this.prisma.mediaFile.findUnique({
      where: { id },
    });
  }

  async deleteFile(id: number): Promise<void> {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('Media file not found');
    }

    // Delete from storage
    await this.storage.deleteFile(file.path);

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id },
    });
  }

  async attachToContent(
    contentId: number,
    mediaId: number,
    altText?: string
  ): Promise<any> {
    return this.prisma.contentMediaRelation.create({
      data: {
        contentId,
        mediaId,
        altText: altText || null,
      },
    });
  }

  async getContentMedia(contentId: number): Promise<any[]> {
    return this.prisma.contentMediaRelation.findMany({
      where: { contentId },
      include: {
        media: true,
      },
    });
  }
}
```

### Acceptance Criteria
- [ ] All CRUD operations implemented
- [ ] Storage provider integration works
- [ ] Content-media relations work
- [ ] Unit tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- unit/media.test.ts
```

---

## Task T030: Media Controller Implementation

**Type**: Controller  
**File**: `backend/src/controllers/media.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T029 (service must exist)

### Objective
Implement Express controllers for media endpoints.

### Implementation Details

```typescript
// backend/src/controllers/media.ts
import { Request, Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { MediaService } from '../services/media';
import { LocalStorage } from '../utils/storage/LocalStorage';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();
const uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
const storage = new LocalStorage(uploadPath);
const mediaService = new MediaService(prisma, storage);

// Validation rules
export const uploadValidation = [
  // File validation handled by Multer
];

export const getMediaValidation = [
  param('id').isInt().withMessage('Media ID must be an integer'),
];

export const deleteMediaValidation = [
  param('id').isInt().withMessage('Media ID must be an integer'),
];

export const listMediaValidation = [
  query('folderId').optional().isInt(),
];

export const attachMediaValidation = [
  param('contentId').isInt(),
  body('mediaId').isInt(),
  body('altText').optional().isString(),
];

// Controllers
export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const folderId = req.body.folderId ? parseInt(req.body.folderId) : undefined;

    const media = await mediaService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folderId
    );

    res.status(201).json(media);
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

export const listMedia = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const folderId = req.query.folderId
      ? parseInt(req.query.folderId as string)
      : undefined;

    const media = await mediaService.listFiles(folderId);
    res.json(media);
  } catch (error) {
    console.error('List media error:', error);
    res.status(500).json({ error: 'Failed to list media' });
  }
};

export const getMedia = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const media = await mediaService.getFile(id);

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    res.json(media);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    
    await mediaService.deleteFile(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Media file not found') {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

export const attachMediaToContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const contentId = parseInt(req.params.contentId);
    const { mediaId, altText } = req.body;

    const relation = await mediaService.attachToContent(
      contentId,
      mediaId,
      altText
    );

    res.status(201).json(relation);
  } catch (error) {
    console.error('Attach media error:', error);
    res.status(500).json({ error: 'Failed to attach media' });
  }
};

export const getContentMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const contentId = parseInt(req.params.contentId);

    const media = await mediaService.getContentMedia(contentId);
    res.json(media);
  } catch (error) {
    console.error('Get content media error:', error);
    res.status(500).json({ error: 'Failed to get content media' });
  }
};
```

### Acceptance Criteria
- [ ] All media endpoints implemented
- [ ] Validation middleware applied
- [ ] Error handling with proper status codes
- [ ] Integration tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- integration/media.test.ts
```

---

## Task T031: Multer Upload Middleware

**Type**: Middleware  
**File**: `backend/src/middleware/upload.ts`  
**Status**: [ ] Not Started  
**Dependencies**: None

### Objective
Configure Multer for handling multipart file uploads.

### Implementation Details

```typescript
// backend/src/middleware/upload.ts
import multer from 'multer';

// Use memory storage - files are stored in memory as Buffer objects
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req: any, file: any, cb: any) => {
  // Allow images and some common file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});
```

### Acceptance Criteria
- [ ] Multer configured for memory storage
- [ ] File type filtering implemented
- [ ] File size limits set
- [ ] Middleware ready for use

### Verification Command
```bash
cd backend && npm run build
```

---

## Task T032: Wire Media Routes to Express

**Type**: Routes  
**File**: `backend/src/index.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T030, T031 (controller and upload middleware must exist)

### Objective
Add media routes to Express app with authentication and upload middleware.

### Implementation Details

```typescript
// Add to backend/src/index.ts after content routes

import {
  uploadMedia,
  listMedia,
  getMedia,
  deleteMedia,
  attachMediaToContent,
  getContentMedia,
  uploadValidation,
  getMediaValidation,
  deleteMediaValidation,
  listMediaValidation,
  attachMediaValidation,
} from './controllers/media';
import { upload } from './middleware/upload';
import path from 'path';

// Serve static files from uploads directory
const uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadPath));

// Media routes - all require authentication
app.post(
  '/api/v1/media/upload',
  authenticateToken,
  requireEditor,
  upload.single('file'),
  uploadValidation,
  uploadMedia
);

app.get(
  '/api/v1/media',
  authenticateToken,
  listMediaValidation,
  listMedia
);

app.get(
  '/api/v1/media/:id',
  authenticateToken,
  getMediaValidation,
  getMedia
);

app.delete(
  '/api/v1/media/:id',
  authenticateToken,
  requireEditor,
  deleteMediaValidation,
  deleteMedia
);

// Content-media relation routes
app.post(
  '/api/v1/content/:contentId/media',
  authenticateToken,
  requireEditor,
  attachMediaValidation,
  attachMediaToContent
);

app.get(
  '/api/v1/content/:contentId/media',
  authenticateToken,
  getContentMedia
);
```

### Acceptance Criteria
- [ ] All media routes wired to Express
- [ ] Upload middleware applied to upload route
- [ ] Static file serving configured
- [ ] Authentication middleware applied
- [ ] All routes accessible via HTTP

### Verification Command
```bash
cd backend && npm run dev
# Then test with curl or integration tests
```

---

## Task T033: Add Media Relations to Content Endpoints

**Type**: Enhancement  
**File**: `backend/src/controllers/content.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T029 (media service must exist)

### Objective
Update content GET endpoint to include media relations.

### Implementation Details

```typescript
// Update backend/src/services/content.ts

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
```

### Acceptance Criteria
- [ ] Content GET includes media relations
- [ ] Content LIST includes media relations
- [ ] Existing tests still pass

### Verification Command
```bash
cd backend && npm test -- integration/content.test.ts
```

---

## Task T034: Create Uploads Directory

**Type**: Setup  
**File**: `backend/uploads/`  
**Status**: [ ] Not Started  
**Dependencies**: None

### Objective
Create uploads directory and configure .gitignore.

### Implementation Details

```bash
# Create uploads directory
mkdir -p backend/uploads

# Add .gitignore
echo "*" > backend/uploads/.gitignore
echo "!.gitignore" >> backend/uploads/.gitignore
```

Update `backend/.gitignore`:
```
# Uploads
uploads/*
!uploads/.gitignore
```

### Acceptance Criteria
- [ ] Uploads directory created
- [ ] .gitignore configured to ignore uploaded files
- [ ] Directory structure committed to git

### Verification Command
```bash
ls -la backend/uploads/
```

---

## Task T035: Update Environment Variables

**Type**: Config  
**File**: `backend/.env.sample`  
**Status**: [ ] Not Started  
**Dependencies**: None

### Objective
Add media-related environment variables to .env.sample.

### Implementation Details

```bash
# Add to backend/.env.sample

# Media Upload Configuration
UPLOAD_PATH=uploads
STORAGE_PROVIDER=local
MAX_FILE_SIZE=10485760
```

Update `backend/.env` with actual values:
```bash
UPLOAD_PATH=uploads
STORAGE_PROVIDER=local
MAX_FILE_SIZE=10485760
```

### Acceptance Criteria
- [ ] Environment variables documented
- [ ] .env.sample updated
- [ ] .env updated with actual values

### Verification Command
```bash
cat backend/.env.sample
```

---

## Execution Order

Follow this exact sequence for Day 3:

1. **RED Phase** (Write failing tests):
   - T024: Unit tests for storage provider
   - T025: Unit tests for media service
   - T026: Integration tests for media endpoints
   - Run tests → Should FAIL ❌

2. **GREEN Phase** (Make tests pass):
   - T027: Create storage provider interface
   - T028: Implement LocalStorage provider
   - T029: Implement media service
   - T030: Implement media controller
   - T031: Configure Multer middleware
   - Run tests → Should PASS ✅

3. **Integration Phase**:
   - T032: Wire routes to Express
   - T033: Add media relations to content
   - T034: Create uploads directory
   - T035: Update .env.sample
   - Test manually with file uploads

4. **Validation Phase**:
   - Run all tests: `npm test`
   - Test file upload with curl/Postman
   - Verify image processing extracts width/height
   - Test end-to-end: auth → upload → attach to content

---

## Testing Checklist

After completing all tasks, verify these scenarios:

### File Upload
- [ ] Can upload JPEG image
- [ ] Can upload PNG image
- [ ] Width and height extracted correctly
- [ ] File saved to uploads directory
- [ ] Database record created
- [ ] Returns 400 for invalid file types
- [ ] Returns 400 for missing file

### File Management
- [ ] Can list all uploaded files
- [ ] Can filter files by folder
- [ ] Can get single file by ID
- [ ] Can delete uploaded file
- [ ] File deleted from both storage and database
- [ ] Returns 404 for non-existent file

### Content-Media Relations
- [ ] Can attach media to content item
- [ ] Can specify alt text when attaching
- [ ] Can list media attached to content
- [ ] Content GET includes media
- [ ] Deleting media cascades properly

### Security
- [ ] Cannot upload without authentication
- [ ] Cannot delete without editor role
- [ ] File size limits enforced
- [ ] File type validation works

---

## Manual Testing Commands

```bash
# Start the server
cd backend && npm run dev

# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Upload an image
curl -X POST http://localhost:3001/api/v1/media/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-image.jpg"

# List all media
curl http://localhost:3001/api/v1/media \
  -H "Authorization: Bearer $TOKEN"

# Get specific media
curl http://localhost:3001/api/v1/media/1 \
  -H "Authorization: Bearer $TOKEN"

# Attach media to content
curl -X POST http://localhost:3001/api/v1/content/1/media \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": 1,
    "altText": "Beautiful landscape"
  }'

# Get content with media
curl http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer $TOKEN"

# Delete media
curl -X DELETE http://localhost:3001/api/v1/media/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Success Criteria

Day 3 is complete when:

- [ ] All 12 tasks (T024-T035) marked complete
- [ ] All tests passing (`npm test`)
- [ ] Server runs without errors (`npm run dev`)
- [ ] Can upload images via API
- [ ] Image width/height extracted correctly
- [ ] Can list uploaded media
- [ ] Can delete media files
- [ ] Can attach media to content
- [ ] Content endpoints include media relations
- [ ] File uploads tested manually
- [ ] End-to-end flow works: auth → create content → upload media → attach → retrieve

---

## Troubleshooting

### Tests Failing
- Ensure Sharp is installed correctly: `npm install sharp`
- Check test fixtures directory exists
- Verify mock implementations match actual code

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Ensure all types are properly imported
- Check Prisma client is generated: `npx prisma generate`

### File Upload Issues
- Check uploads directory exists and is writable
- Verify Multer middleware configured correctly
- Check file size limits in middleware
- Ensure UPLOAD_PATH env var is set

### Image Processing Errors
- Ensure Sharp is installed for your platform
- Check file is valid image format
- Verify Sharp can read the image

---

## Next Steps

After Day 3 completion, proceed to:
- **Day 4**: AI Content Generation (User Story 4)
- Tasks will include AI service with stub, generate endpoint, provider interface
