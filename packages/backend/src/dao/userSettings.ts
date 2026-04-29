import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { userSettings } from '@personal-assistant/drizzle/src/schema';

export interface UserSettingsRow {
  userId: string;
  aiProvider: string;
  aiModel: string;
  aiApiKey: string | null;
  emotionThreshold: number;
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getByUserId(userId: string): Promise<UserSettingsRow | null> {
  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (result.length === 0) return null;
  return result[0] as UserSettingsRow;
}

export async function upsert(userId: string, data: {
  aiProvider?: string;
  aiModel?: string;
  aiApiKey?: string;
  emotionThreshold?: number;
  notificationEnabled?: boolean;
}): Promise<UserSettingsRow> {
  const existing = await getByUserId(userId);

  if (existing) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.aiProvider !== undefined) updateData.aiProvider = data.aiProvider;
    if (data.aiModel !== undefined) updateData.aiModel = data.aiModel;
    if (data.aiApiKey !== undefined) updateData.aiApiKey = data.aiApiKey;
    if (data.emotionThreshold !== undefined) updateData.emotionThreshold = data.emotionThreshold;
    if (data.notificationEnabled !== undefined) updateData.notificationEnabled = data.notificationEnabled;

    const result = await db
      .update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId))
      .returning();

    return result[0] as UserSettingsRow;
  }

  const result = await db
    .insert(userSettings)
    .values({
      userId,
      aiProvider: data.aiProvider ?? 'zhipu',
      aiModel: data.aiModel ?? 'glm-4',
      aiApiKey: data.aiApiKey ?? null,
      emotionThreshold: data.emotionThreshold ?? 25,
      notificationEnabled: data.notificationEnabled ?? true,
    })
    .returning();

  return result[0] as UserSettingsRow;
}
