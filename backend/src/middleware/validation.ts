import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateContentType = async (
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  // Validate that contentTypeId exists
  // This can be extended later with actual database validation
  next();
};
