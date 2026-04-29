import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getAllController,
  getByIdController,
  createController,
  updateController,
  deleteController,
} from '../controllers/emotionController';

const router = express.Router();

const asHandler = <T extends (req: AuthenticatedRequest, res: express.Response) => void>(
  handler: T
): RequestHandler => {
  return handler as unknown as RequestHandler;
};

router.use(authMiddleware);

router.get('/', asHandler(getAllController));
router.post('/', asHandler(createController));
router.get('/:id', asHandler(getByIdController));
router.put('/:id', asHandler(updateController));
router.delete('/:id', asHandler(deleteController));

export default router;
