import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { listUsers, updateUser, deleteUser } from '../dao/adminUserDao';
import { createUser } from '../dao/userDao';
import { hashPassword } from '../services/authService';
import { success, error, paginated } from '../utils/response';
import { DEFAULT_PAGE_SIZE } from '@personal-assistant/types';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * 获取用户列表（管理员功能）
 * @query page - 页码，默认 1
 * @query pageSize - 每页条数，默认 DEFAULT_PAGE_SIZE
 * @returns 分页用户列表
 */
export async function listUsersController(req: Request, res: Response) {
  const page = parseInt((req.query.page as string | undefined) || '1') || 1;
  const pageSize = parseInt((req.query.pageSize as string | undefined) || String(DEFAULT_PAGE_SIZE)) || DEFAULT_PAGE_SIZE;

  const { users, total } = await listUsers(page, pageSize);
  return res.json(paginated(users, page, total, pageSize));
}

/**
 * 创建新用户（管理员功能）
 * @body email - 用户邮箱（必填）
 * @body name - 用户姓名（必填）
 * @body password - 密码（必填）
 * @body isAdmin - 是否为管理员，默认 false
 * @returns 创建成功返回用户信息
 */
export async function createUserController(req: Request, res: Response) {
  const { email, name, password, isAdmin = false } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json(error('邮箱、姓名、密码不能为空'));
  }

  const passwordHash = await hashPassword(password);
  const userId = randomUUID();

  try {
    const user = await createUser({
      userId,
      email,
      passwordHash,
      name,
      isAdmin: !!isAdmin,
    });
    return res.json(success({ user }));
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json(error('邮箱已存在'));
    }
    throw err;
  }
}

/**
 * 更新用户信息（管理员功能）
 * @param id - 用户ID
 * @body name - 姓名（可选）
 * @body password - 密码（可选）
 * @body isAdmin - 是否管理员（可选）
 * @body isActive - 是否启用（可选）
 * @returns 更新成功返回用户信息
 */
export async function updateUserController(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { name, password, isAdmin, isActive } = req.body;

  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (isAdmin !== undefined) updates.isAdmin = isAdmin;
  if (isActive !== undefined) updates.isActive = isActive;
  if (password !== undefined) {
    updates.passwordHash = await hashPassword(password);
  }

  const updated = await updateUser(parseInt(id as string), updates);

  if (!updated) {
    return res.status(404).json(error('用户不存在'));
  }

  return res.json(success({ user: updated }));
}

/**
 * 删除用户（软删除，管理员功能）
 * @param id - 用户ID
 * @returns 删除成功
 */
export async function deleteUserController(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await deleteUser(parseInt(id as string));

  if (!deleted) {
    return res.status(404).json(error('用户不存在'));
  }

  return res.json(success(null, '删除成功'));
}
