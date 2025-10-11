import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AIService } from '../services/ai';

const aiService = new AIService();

// Validation rules
export const generateValidation = [
  body('mode')
    .isIn(['draft', 'seo', 'alt_text'])
    .withMessage('Mode must be one of: draft, seo, alt_text'),
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isString()
    .withMessage('Prompt must be a string'),
  body('context')
    .optional()
    .isString()
    .withMessage('Context must be a string'),
];

// Controllers
export const generate = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { mode, prompt, context } = req.body;

    let result: any;

    switch (mode) {
      case 'draft':
        result = await aiService.generateDraft(prompt, context);
        break;

      case 'seo':
        // For SEO, prompt should be title and context should be content
        result = await aiService.generateSEO(prompt, context || '');
        break;

      case 'alt_text':
        result = await aiService.generateAltText(prompt, context);
        break;

      default:
        res.status(400).json({ error: 'Invalid mode' });
        return;
    }

    // Normalize response format
    res.json({
      result: typeof result === 'string' ? result : JSON.stringify(result),
      mode,
      provider: process.env.AI_PROVIDER || 'gemini'
    });
  } catch (error: any) {
    console.error('AI generate error:', error);
    
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to generate content';
    
    res.status(500).json({ error: message });
  }
};
