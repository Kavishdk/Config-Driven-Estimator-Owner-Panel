import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { login } from '../controllers/authController';
import { getAdminConfig, updateAdminConfig, getLeads } from '../controllers/adminController';

const router = Router();

router.post('/login', login);

router.use(authMiddleware);

router.get('/config', getAdminConfig);
router.put('/config', updateAdminConfig);
router.get('/leads', getLeads);

export default router;
