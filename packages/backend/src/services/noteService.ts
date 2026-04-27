import { randomUUID } from 'crypto';
import * as noteDao from '../dao/notes';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@personal-assistant/types';

export async function getNotesForUser(userId: string): Promise<Note[]> {
  return noteDao.findAllNotesByUserId(userId);
}

export async function getNoteById(noteId: string, userId: string): Promise<Note | null> {
  return noteDao.findNoteByNoteId(noteId, userId);
}

export async function searchNotes(userId: string, keyword: string): Promise<Note[]> {
  return noteDao.searchNotesByKeyword(userId, keyword);
}

export async function getNotesByTag(userId: string, tag: string): Promise<Note[]> {
  return noteDao.findNotesByTag(userId, tag);
}

export async function createNote(userId: string, data: CreateNoteRequest): Promise<Note> {
  const noteId = randomUUID();

  return noteDao.createNote({
    noteId,
    userId,
    title: data.title,
    content: data.content,
    tags: data.tags,
    isPinned: data.isPinned,
  });
}

export async function updateNote(noteId: string, userId: string, data: UpdateNoteRequest): Promise<Note | null> {
  return noteDao.updateNote(noteId, userId, data);
}

export async function togglePin(noteId: string, userId: string): Promise<Note | null> {
  return noteDao.togglePinNote(noteId, userId);
}

export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  return noteDao.deleteNote(noteId, userId);
}

export async function countNotes(userId: string): Promise<number> {
  return noteDao.countNotesByUserId(userId);
}

export async function getAllTags(userId: string): Promise<string[]> {
  return noteDao.getAllTags(userId);
}

export async function getNotesByDateRange(userId: string, startDate: string, endDate: string): Promise<Note[]> {
  return noteDao.getNotesByDateRange(userId, startDate, endDate);
}
