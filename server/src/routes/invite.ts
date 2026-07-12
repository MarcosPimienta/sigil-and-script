import { Router } from 'express';
import { getInviteByToken } from '../controllers/inviteController';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/invite/:token', getInviteByToken);

// Simple secured route for testing RBAC middleware
router.post('/canvas', requireRole('HOST'), (req, res) => {
  res.json({ success: true, message: 'Authorized host access' });
});

export default router;
