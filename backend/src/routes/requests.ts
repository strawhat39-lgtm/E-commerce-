import { Router } from 'express';
import * as requests from '../controllers/requestsController';

const router = Router();

router.post('/swap', requests.createSwapRequest);
router.post('/rent', requests.createRentRequest);
router.get('/user/:userId', requests.getRequestsByUser);
router.patch('/:id', requests.updateRequestStatus);

export default router;
