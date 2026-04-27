import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getAllNotesController,
  getNoteController,
  searchNotesController,
  getByTagController,
  getAllTagsController,
  createNoteController,
  updateNoteController,
  togglePinController,
  deleteNoteController,
  getCountController,
  getByDateRangeController,
} from '../controllers/noteController';

const router = express.Router();

// 由于 authMiddleware 保证 user 存在，我们可以安全地将 AuthenticatedRequest 断言为 Request
const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => void>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

// 所有路由都需要认证
router.use(authMiddleware);

router.get('/', asHandler(getAllNotesController));
router.get('/tags', asHandler(getAllTagsController));
router.get('/count', asHandler(getCountController));
router.get('/search', asHandler(searchNotesController));
router.get('/date-range', asHandler(getByDateRangeController));
router.get('/tag/:tag', asHandler(getByTagController));
router.get('/:noteId', asHandler(getNoteController));
router.post('/', asHandler(createNoteController));
router.patch('/:noteId', asHandler(updateNoteController));
router.patch('/:noteId/toggle-pin', asHandler(togglePinController));
router.delete('/:noteId', asHandler(deleteNoteController));

export default router;
