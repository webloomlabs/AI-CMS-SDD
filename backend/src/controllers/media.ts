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
