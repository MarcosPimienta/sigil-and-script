import { Router } from 'express';
import { getInviteByToken, getCanvases, getCanvasById, saveCanvas, deleteCanvas } from '../controllers/inviteController';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/invite/:token', getInviteByToken);

router.get('/canvas', requireRole('HOST'), getCanvases);
router.get('/canvas/:id', requireRole('HOST'), getCanvasById);
router.post('/canvas', requireRole('HOST'), saveCanvas);
router.delete('/canvas/:id', requireRole('HOST'), deleteCanvas);

export default router;
