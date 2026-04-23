import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';
import { error } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        name: string;
        isAdmin: boolean;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    userId: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(error('未授权，请先登录'));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as {
      id: string;
      userId: string;
      email: string;
      name: string;
      isAdmin: boolean;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json(error('令牌无效或已过期'));
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json(error('需要管理员权限'));
  }
  next();
}
