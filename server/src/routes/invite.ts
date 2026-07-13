import { Router } from 'express';
import { getInviteByToken, getCanvases, saveCanvas, deleteCanvas } from '../controllers/inviteController';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/invite/:token', getInviteByToken);

router.get('/canvas', requireRole('HOST'), getCanvases);
router.post('/canvas', requireRole('HOST'), saveCanvas);
router.delete('/canvas/:id', requireRole('HOST'), deleteCanvas);

export default router;
