import { StorageProvider, FileMetadata } from './StorageProvider';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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
