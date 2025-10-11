import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ContentService } from '../services/content';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const contentService = new ContentService(prisma);

// Validation rules
export const createContentValidation = [
  body('contentTypeId').isInt().withMessage('Content type ID must be an integer'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('slug').optional().trim(),
  body('status').isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.name').notEmpty().withMessage('Field name is required'),
  body('fields.*.type').notEmpty().withMessage('Field type is required'),
  body('fields.*.value').exists().withMessage('Field value is required'),
];

export const updateContentValidation = [
  param('id').isInt().withMessage('Content ID must be an integer'),
  body('title').optional().trim(),
  body('slug').optional().trim(),
  body('status').optional().isIn(['draft', 'published']),
  body('fields').optional().isArray(),
];

export const getContentValidation = [
  param('id').isInt().withMessage('Content ID must be an integer'),
];

export const deleteContentValidation = [
  param('id').isInt().withMessage('Content ID must be an integer'),
];

export const listContentValidation = [
  query('contentTypeId').optional().isInt(),
  query('status').optional().isIn(['draft', 'published']),
];

// Controllers
export const createContent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { slug, contentTypeId, ...input } = req.body;

    // Generate slug if not provided
    const finalSlug = slug || await contentService.generateSlug(input.title);

    const content = await contentService.createContent({
      ...input,
      contentTypeId: parseInt(contentTypeId, 10), // Parse string to integer
      slug: finalSlug,
    });

    res.status(201).json(content);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
};

export const getContent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const content = await contentService.getContent(id);

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
};

export const listContent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const filters: any = {};

    if (req.query.contentTypeId) {
      filters.contentTypeId = parseInt(req.query.contentTypeId as string);
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const content = await contentService.listContent(filters);
    res.json(content);
  } catch (error) {
    console.error('List content error:', error);
    res.status(500).json({ error: 'Failed to list content' });
  }
};

export const updateContent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    
    // Check if content exists
    const existing = await contentService.getContent(id);
    if (!existing) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    const content = await contentService.updateContent(id, req.body);
    res.json(content);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
};

export const deleteContent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    
    // Check if content exists
    const existing = await contentService.getContent(id);
    if (!existing) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    await contentService.deleteContent(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};
