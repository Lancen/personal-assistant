import { and, count, eq, isNull } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '@personal-assistant/drizzle/src/schema';
import { User } from '@personal-assistant/types';
import { getPaginationOffset } from '../utils/response';

export async function listUsers(
  page: number = 1,
  pageSize: number = 20
): Promise<{ users: User[]; total: number }> {
  const offset = getPaginationOffset(page, pageSize);

  const [result, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        userId: users.userId,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(users).where(isNull(users.deletedAt)),
  ]);

  const total = totalResult[0]?.count ?? 0;

  const mappedUsers: User[] = result.map((row: any) => ({
    id: row.id.toString(),
    userId: row.userId,
    email: row.email,
    name: row.name,
    isAdmin: row.isAdmin,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));

  return { users: mappedUsers, total };
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    passwordHash?: string;
    isAdmin?: boolean;
    isActive?: boolean;
  }
): Promise<User | null> {
  const result = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning();

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

export async function deleteUser(id: number): Promise<boolean> {
  const result = await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning();

  return result.length > 0;
}
