import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getController,
  updateController,
  testAIController,
} from '../controllers/settingsController';

const router = express.Router();

const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => void>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.use(authMiddleware);

router.get('/', asHandler(getController));
router.put('/', asHandler(updateController));
router.post('/test-ai', asHandler(testAIController));

export default router;
