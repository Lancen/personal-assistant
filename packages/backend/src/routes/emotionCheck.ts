import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getStatusController,
  generateController,
  submitController,
  getHistoryController,
} from '../controllers/emotionCheckController';

const router = express.Router();

const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => void>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.use(authMiddleware);

router.get('/status', asHandler(getStatusController));
router.post('/generate', asHandler(generateController));
router.post('/submit', asHandler(submitController));
router.get('/history', asHandler(getHistoryController));

export default router;
