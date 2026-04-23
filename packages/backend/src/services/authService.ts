import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@personal-assistant/types';
import { findUserByEmail, createUser } from '../dao/userDao';
import { JWT_CONFIG } from '../config/jwt';
import { users } from '@personal-assistant/drizzle/src/schema';
import { db } from '../config/db';
import { and, eq, isNull } from 'drizzle-orm';

/** bcrypt 盐值轮数 */
const SALT_ROUNDS = 10;

/** 登录请求参数 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 登录响应结果 */
export interface LoginResult {
  token: string;
  user: User;
}

/**
 * 用户登录验证
 * @param login - 登录请求 { email, password }
 * @returns 验证成功返回 token 和用户信息，失败返回 null
 * @description 先查找用户，验证密码，成功后生成 JWT token 返回
 */
export async function login({ email, password }: LoginRequest): Promise<LoginResult | null> {
  const user = await findUserByEmail(email);

  if (!user || !user.isActive) {
    return null;
  }

  // Need to get password hash from database
  // We need to query the raw row for that
  const rawUser = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (rawUser.length === 0) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, rawUser[0].passwordHash);
  if (!passwordMatch) {
    return null;
  }

  const token = generateToken(user);
  return { token, user };
}

/**
 * 生成 JWT 访问令牌
 * @param user - 用户信息
 * @returns 签名后的 JWT 字符串
 * @description 将用户基本信息编码到 token 中，设置过期时间
 */
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions['expiresIn'] }
  );
}

/**
 * 对密码进行哈希加密
 * @param password - 原始密码明文
 * @returns bcrypt 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
