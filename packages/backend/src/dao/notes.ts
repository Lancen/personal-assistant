import { and, count, eq, desc, isNull, ilike } from 'drizzle-orm';
import { db } from '../config/db';
import { notes } from '@personal-assistant/drizzle/src/schema';
import { Note } from '@personal-assistant/types';

export async function findAllNotesByUserId(userId: string): Promise<Note[]> {
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)))
    .orderBy(desc(notes.isPinned), desc(notes.updatedAt));

  return result.map(rowToNote);
}

export async function findNoteByNoteId(noteId: string, userId: string): Promise<Note | null> {
  const result = await db
    .select()
    .from(notes)
    .where(and(
      eq(notes.noteId, noteId),
      eq(notes.userId, userId),
      isNull(notes.deletedAt)
    ))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return rowToNote(result[0]);
}

export async function searchNotesByKeyword(userId: string, keyword: string): Promise<Note[]> {
  const result = await db
    .select()
    .from(notes)
    .where(and(
      eq(notes.userId, userId),
      isNull(notes.deletedAt),
      keyword
        ? (ilike(notes.title, `%${keyword}%`) as any)
        : undefined
    ))
    .orderBy(desc(notes.isPinned), desc(notes.updatedAt));

  return result.map(rowToNote);
}

export async function findNotesByTag(userId: string, tag: string): Promise<Note[]> {
  // PostgreSQL jsonb contains 操作需要特殊处理
  // 这里简单返回所有，过滤在应用层完成
  const all = await findAllNotesByUserId(userId);
  return all.filter(note => note.tags.includes(tag));
}

export async function createNote(data: {
  noteId: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
}): Promise<Note> {
  const result = await db
    .insert(notes)
    .values({
      noteId: data.noteId,
      userId: data.userId,
      title: data.title,
      content: data.content,
      tags: data.tags,
      isPinned: data.isPinned,
    })
    .returning();

  return rowToNote(result[0]);
}

export async function updateNote(
  noteId: string,
  userId: string,
  data: {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
  }
): Promise<Note | null> {
  const result = await db
    .update(notes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(notes.noteId, noteId),
      eq(notes.userId, userId),
      isNull(notes.deletedAt)
    ))
    .returning();

  if (result.length === 0) {
    return null;
  }

  return rowToNote(result[0]);
}

export async function togglePinNote(noteId: string, userId: string): Promise<Note | null> {
  const existing = await findNoteByNoteId(noteId, userId);
  if (!existing) return null;

  const result = await db
    .update(notes)
    .set({
      isPinned: !existing.isPinned,
      updatedAt: new Date(),
    })
    .where(and(
      eq(notes.noteId, noteId),
      eq(notes.userId, userId),
      isNull(notes.deletedAt)
    ))
    .returning();

  if (result.length === 0) {
    return null;
  }

  return rowToNote(result[0]);
}

export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  const result = await db
    .update(notes)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(notes.noteId, noteId),
      eq(notes.userId, userId),
      isNull(notes.deletedAt)
    ))
    .returning({ id: notes.id });

  return result.length > 0;
}

export async function countNotesByUserId(userId: string): Promise<number> {
  const result = await db
    .select({ count: count(notes.id) })
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)));

  return result[0]?.count ?? 0;
}

export async function getAllTags(userId: string): Promise<string[]> {
  const notes = await findAllNotesByUserId(userId);
  const tags = new Set<string>();
  notes.forEach(note => {
    note.tags.forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags);
}

export async function getNotesByDateRange(userId: string, startDate: string, endDate: string): Promise<Note[]> {
  const result = await db
    .select()
    .from(notes)
    .where(and(
      eq(notes.userId, userId),
      isNull(notes.deletedAt),
    ));

  // 在内存中按创建日期过滤
  return result
    .filter(row => {
      const noteDate = row.createdAt.toISOString().split('T')[0];
      return noteDate >= startDate && noteDate <= endDate;
    })
    .map(rowToNote);
}

function rowToNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id.toString(),
    noteId: row.noteId,
    userId: row.userId,
    title: row.title,
    content: row.content,
    tags: row.tags,
    isPinned: row.isPinned,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
