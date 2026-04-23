import { Request, Response } from 'express';
import { login } from '../services/authService';
import { success, error } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * 用户登录
 * @body email - 用户邮箱（必填）
 * @body password - 密码（必填）
 * @returns 成功返回 token 和用户信息
 */
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

/**
 * 获取当前登录用户信息
 * @requires 登录认证
 * @returns 当前用户信息
 */
export function meController(req: AuthenticatedRequest, res: Response) {
  return res.json(success({ user: req.user }));
}

/**
 * 用户登出（前端清除 token 即可，后端无状态）
 * @returns 登出成功
 */
export function logoutController(_req: Request, res: Response) {
  return res.json(success(null, '登出成功'));
}
