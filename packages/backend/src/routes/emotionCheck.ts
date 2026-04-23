import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getStatusController,
  generateQuestionsController,
  submitAnswersController,
  getHistoryController,
  getAnalysisController,
} from '../controllers/emotionCheckController';

const router = express.Router();

// 由于 authMiddleware 保证 user 存在，我们可以安全地将 AuthenticatedRequest 断言为 Request
const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => Promise<express.Response>>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.get('/status', authMiddleware, asHandler(getStatusController));
router.post('/generate', authMiddleware, asHandler(generateQuestionsController));
router.post('/submit', authMiddleware, asHandler(submitAnswersController));
router.get('/history', authMiddleware, asHandler(getHistoryController));
router.get('/analysis', authMiddleware, asHandler(getAnalysisController));

export default router;
