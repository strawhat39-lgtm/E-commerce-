import { Router } from 'express';
import * as impact from '../controllers/impactController';

const router = Router();

router.get('/user/:userId/metrics', impact.getSustainabilityMetrics);
router.get('/user/:userId/trend', impact.getWeeklyTrend);
router.get('/user/:userId/badges', impact.getBadgesAndPoints);

export default router;
