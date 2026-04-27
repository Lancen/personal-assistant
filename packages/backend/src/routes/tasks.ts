import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getAllTasksController,
  getTaskController,
  getStatsController,
  searchTasksController,
  createTaskController,
  updateTaskController,
  toggleCompletedController,
  deleteTaskController,
  getByQuadrantController,
  getByDateRangeController,
} from '../controllers/taskController';

const router = express.Router();

// 由于 authMiddleware 保证 user 存在，我们可以安全地将 AuthenticatedRequest 断言为 Request
const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => void>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

// 所有路由都需要认证
router.use(authMiddleware);

router.get('/', asHandler(getAllTasksController));
router.get('/stats', asHandler(getStatsController));
router.get('/search', asHandler(searchTasksController));
router.get('/quadrant/:quadrant', asHandler(getByQuadrantController));
router.get('/date-range', asHandler(getByDateRangeController));
router.get('/:taskId', asHandler(getTaskController));
router.post('/', asHandler(createTaskController));
router.patch('/:taskId', asHandler(updateTaskController));
router.patch('/:taskId/toggle-completed', asHandler(toggleCompletedController));
router.delete('/:taskId', asHandler(deleteTaskController));

export default router;
