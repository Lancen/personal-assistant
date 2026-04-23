import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  listRecordsController,
  getRecordController,
  createRecordController,
  updateRecordController,
  deleteRecordController,
} from '../controllers/emotionController';
import { recognizeEmotionController } from '../controllers/emotionRecognitionController';

const router = express.Router();

// 由于 authMiddleware 保证 user 存在，我们可以安全地将 AuthenticatedRequest 断言为 Request
const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => Promise<express.Response>>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.get('/records', authMiddleware, asHandler(listRecordsController));
router.get('/records/:id', authMiddleware, asHandler(getRecordController));
router.post('/records', authMiddleware, asHandler(createRecordController));
router.put('/records/:id', authMiddleware, asHandler(updateRecordController));
router.delete('/records/:id', authMiddleware, asHandler(deleteRecordController));
router.post('/recognize', authMiddleware, asHandler(recognizeEmotionController));

export default router;
