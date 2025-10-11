import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all content types
 */
export const listContentTypes = async (_req: Request, res: Response) => {
  try {
    const contentTypes = await prisma.contentType.findMany({
      include: {
        fields: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(contentTypes);
  } catch (error) {
    console.error('Error listing content types:', error);
    res.status(500).json({ message: 'Failed to list content types' });
  }
};

/**
 * Get a single content type by ID
 */
export const getContentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contentType = await prisma.contentType.findUnique({
      where: { id: parseInt(id) },
      include: {
        fields: true,
      },
    });

    if (!contentType) {
      return res.status(404).json({ message: 'Content type not found' });
    }

    return res.json(contentType);
  } catch (error) {
    console.error('Error getting content type:', error);
    return res.status(500).json({ message: 'Failed to get content type' });
  }
};

/**
 * Create a new content type
 */
export const createContentType = async (req: Request, res: Response) => {
  try {
    const { name, fields } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    // Check if content type with same name already exists
    const existing = await prisma.contentType.findFirst({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'Content type with this name already exists'
      });
    }

    // Create content type with fields
    const contentType = await prisma.contentType.create({
      data: {
        name,
        fields: {
          create: fields.map((field: any) => ({
            name: field.name,
            type: field.type,
            value: field.required ? 'true' : 'false', // Store required flag in value field for now
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    return res.status(201).json(contentType);
  } catch (error) {
    console.error('Error creating content type:', error);
    return res.status(500).json({ message: 'Failed to create content type' });
  }
};
