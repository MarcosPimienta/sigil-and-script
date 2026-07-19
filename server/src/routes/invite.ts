import { Router } from 'express';
import { getInviteByToken, submitRsvp, getCanvases, getCanvasById, saveCanvas, deleteCanvas, uploadMedia } from '../controllers/inviteController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/invite/:token', getInviteByToken);
router.post('/invite/:token/rsvp', submitRsvp);

router.get('/canvas', requireAuth, getCanvases);
router.get('/canvas/:id', requireAuth, getCanvasById);
router.post('/canvas', requireAuth, saveCanvas);
router.delete('/canvas/:id', requireAuth, deleteCanvas);
router.post('/upload/media', requireAuth, uploadMedia);

export default router;
