import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  listUsersController,
  createUserController,
  updateUserController,
  deleteUserController,
} from '../controllers/adminUserController';

const router = express.Router();

// 由于 authMiddleware + adminMiddleware 保证 user 存在，我们可以安全地将 AuthenticatedRequest 断言为 Request
const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => Promise<express.Response>>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.get('/users', authMiddleware, adminMiddleware, listUsersController);
router.post('/users', authMiddleware, adminMiddleware, createUserController);
router.put('/users/:id', authMiddleware, adminMiddleware, asHandler(updateUserController));
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUserController);

export default router;
