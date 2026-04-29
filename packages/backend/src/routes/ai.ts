import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { recognizeController } from '../controllers/aiController';

const router = express.Router();

const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => void>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.use(authMiddleware);

router.post('/recognize', asHandler(recognizeController));

export default router;
