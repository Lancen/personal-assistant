import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@personal-assistant/types';
import { findUserByEmail, createUser } from '../dao/userDao';
import { JWT_CONFIG } from '../config/jwt';
import { users } from '@personal-assistant/drizzle/src/schema';
import { db } from '../config/db';
import { and, eq, isNull } from 'drizzle-orm';

const SALT_ROUNDS = 10;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
