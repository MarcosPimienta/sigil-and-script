import { Router } from 'express';
import { getInviteByToken, submitRsvp, getCanvases, getCanvasById, saveCanvas, deleteCanvas, uploadMedia } from '../controllers/inviteController';
import { inviteCollaborator, listCollaborators, removeCollaborator, getInviteDetails, acceptInvite } from '../controllers/collaboratorController';
import { requireAuth } from '../middleware/auth';
import { rsvpLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/invite/:token', getInviteByToken);
router.post('/invite/:token/rsvp', rsvpLimiter, submitRsvp);

router.get('/canvas', requireAuth, getCanvases);
router.get('/canvas/:id', requireAuth, getCanvasById);
router.post('/canvas', requireAuth, saveCanvas);
router.delete('/canvas/:id', requireAuth, deleteCanvas);
router.post('/upload/media', requireAuth, uploadMedia);

// Collaborator routes
router.post('/canvas/:id/collaborators', requireAuth, inviteCollaborator);
router.get('/canvas/:id/collaborators', requireAuth, listCollaborators);
router.delete('/canvas/:id/collaborators/:collabId', requireAuth, removeCollaborator);
router.get('/collaborators/invite/:token', getInviteDetails);
router.post('/collaborators/invite/:token/accept', requireAuth, acceptInvite);

export default router;

