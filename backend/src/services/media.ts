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
