import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '@personal-assistant/drizzle/src/schema';
import { User } from '@personal-assistant/types';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    email: row.email,
    name: row.name,
    isAdmin: row.isAdmin,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findUserByUserId(userId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.userId, userId), isNull(users.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    email: row.email,
    name: row.name,
    isAdmin: row.isAdmin,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createUser(data: {
  userId: string;
  email: string;
  passwordHash: string;
  name: string;
  isAdmin: boolean;
}): Promise<User> {
  const result = await db
    .insert(users)
    .values({
      userId: data.userId,
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      isAdmin: data.isAdmin,
    })
    .returning();

  const row = result[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    email: row.email,
    name: row.name,
    isAdmin: row.isAdmin,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}
