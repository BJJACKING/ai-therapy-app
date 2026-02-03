import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '验证错误',
      message: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: '未授权',
      message: err.message
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: '禁止访问',
      message: err.message
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: '资源未找到',
      message: err.message
    });
  }

  // Default error
  return res.status(500).json({
    error: '服务器错误',
    message: process.env.NODE_ENV === 'production' ? '发生未知错误' : err.message
  });
};
