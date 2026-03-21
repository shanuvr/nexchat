import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong'
  });
};