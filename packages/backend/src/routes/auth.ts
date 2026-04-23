import express from 'express';
import { RequestHandler } from 'express';
import { loginController, meController, logoutController } from '../controllers/authController';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// 由于 authMiddleware 保证 user 存在，我们可以安全地将 AuthenticatedRequest 断言为 Request
const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => express.Response>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.post('/login', loginController);
router.get('/me', authMiddleware, asHandler(meController));
router.post('/logout', authMiddleware, logoutController);

export default router;
