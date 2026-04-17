import { Router } from 'express';
import * as upcycle from '../controllers/upcycleController';

const router = Router();

router.get('/', upcycle.getMaterials);
router.post('/', upcycle.createMaterial);
router.patch('/:id/claim', upcycle.claimMaterial);
router.get('/summary', upcycle.getReuseSummary);

export default router;
