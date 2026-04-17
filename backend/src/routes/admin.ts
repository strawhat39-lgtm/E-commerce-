import { Router } from 'express';
import * as admin from '../controllers/adminController';

const router = Router();

router.get('/summary', admin.getDashboardSummary);
router.get('/listings/count', admin.getAllListingsCount);
router.get('/claims/count', admin.getClaimsCount);
router.get('/impact', admin.getImpactStats);

export default router;
