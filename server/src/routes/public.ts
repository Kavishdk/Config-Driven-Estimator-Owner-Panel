import { Router } from 'express';
import { getPublicConfig, submitEstimate } from '../controllers/publicController';

const router = Router();

router.get('/config', getPublicConfig);
router.post('/estimate', submitEstimate);

export default router;
