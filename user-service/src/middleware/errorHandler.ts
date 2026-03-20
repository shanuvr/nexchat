import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  res.status(500).json({ message: err.message || 'Something went wrong' });
};