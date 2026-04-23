import { Request, Response } from 'express';
import { login } from '../services/authService';
import { success, error } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(error('邮箱和密码不能为空'));
  }

  const result = await login({ email, password });

  if (!result) {
    return res.status(401).json(error('邮箱或密码错误'));
  }

  return res.json(success(result));
}

export function meController(req: AuthenticatedRequest, res: Response) {
  return res.json(success({ user: req.user }));
}

export function logoutController(_req: Request, res: Response) {
  return res.json(success(null, '登出成功'));
}
