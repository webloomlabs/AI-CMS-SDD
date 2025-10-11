import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/auth';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Invalid input', details: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Attempt login
    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
