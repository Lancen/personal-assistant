import { Request, Response } from 'express';
import * as noteService from '../services/noteService';
import { success, error } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * 获取所有笔记
 * @requires 登录认证
 */
export async function getAllNotesController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const notes = await noteService.getNotesForUser(userId);
  return res.json(success(notes));
}

/**
 * 获取单个笔记详情
 * @param noteId - 笔记ID
 * @requires 登录认证
 */
export async function getNoteController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const noteId = req.params.noteId as string;

  const note = await noteService.getNoteById(noteId, userId);
  if (!note) {
    return res.status(404).json(error('笔记不存在'));
  }

  return res.json(success(note));
}

/**
 * 搜索笔记
 * @query keyword - 搜索关键词
 * @requires 登录认证
 */
export async function searchNotesController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const keyword = (req.query.keyword as string) || '';

  const notes = await noteService.searchNotes(userId, keyword);
  return res.json(success(notes));
}

/**
 * 按标签筛选笔记
 * @param tag - 标签名称
 * @requires 登录认证
 */
export async function getByTagController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const tag = req.params.tag as string;

  const notes = await noteService.getNotesByTag(userId, tag);
  return res.json(success(notes));
}

/**
 * 获取所有标签
 * @requires 登录认证
 */
export async function getAllTagsController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const tags = await noteService.getAllTags(userId);
  return res.json(success(tags));
}

/**
 * 创建笔记
 * @body title - 笔记标题
 * @body content - 笔记内容
 * @body tags - 标签数组
 * @body isPinned - 是否置顶
 * @requires 登录认证
 */
export async function createNoteController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const { title, content, tags = [], isPinned = false } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json(error('笔记标题不能为空'));
  }

  if (content === undefined || content === null) {
    return res.status(400).json(error('笔记内容不能为空'));
  }

  const note = await noteService.createNote(userId, { title, content, tags, isPinned });
  return res.json(success(note, '笔记创建成功'));
}

/**
 * 更新笔记
 * @param noteId - 笔记ID
 * @body title - 笔记标题（可选）
 * @body content - 笔记内容（可选）
 * @body tags - 标签数组（可选）
 * @body isPinned - 是否置顶（可选）
 * @requires 登录认证
 */
export async function updateNoteController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const noteId = req.params.noteId as string;
  const { title, content, tags, isPinned } = req.body;

  const note = await noteService.updateNote(noteId, userId, {
    title,
    content,
    tags,
    isPinned,
  });

  if (!note) {
    return res.status(404).json(error('笔记不存在'));
  }

  return res.json(success(note, '笔记更新成功'));
}

/**
 * 切换置顶状态
 * @param noteId - 笔记ID
 * @requires 登录认证
 */
export async function togglePinController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const noteId = req.params.noteId as string;

  const note = await noteService.togglePin(noteId, userId);
  if (!note) {
    return res.status(404).json(error('笔记不存在'));
  }

  return res.json(success(note));
}

/**
 * 删除笔记
 * @param noteId - 笔记ID
 * @requires 登录认证
 */
export async function deleteNoteController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const noteId = req.params.noteId as string;

  const deleted = await noteService.deleteNote(noteId, userId);
  if (!deleted) {
    return res.status(404).json(error('笔记不存在'));
  }

  return res.json(success(null, '笔记删除成功'));
}

/**
 * 获取笔记统计
 * @requires 登录认证
 */
export async function getCountController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const count = await noteService.countNotes(userId);
  return res.json(success({ count }));
}

/**
 * 按日期范围获取笔记
 * @query startDate - 开始日期 YYYY-MM-DD
 * @query endDate - 结束日期 YYYY-MM-DD
 * @requires 登录认证
 */
export async function getByDateRangeController(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const notes = await noteService.getNotesByDateRange(userId, startDate, endDate);
  return res.json(success(notes));
}
