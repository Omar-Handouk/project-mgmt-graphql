import { Router } from 'express';

import healthAPI from './api/health-api.js';

const router = Router();

router.use('/health', healthAPI);

export default router;