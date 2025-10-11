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
