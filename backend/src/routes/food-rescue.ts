import { Router } from 'express';
import * as rescue from '../controllers/foodRescueController';

const router = Router();

router.get('/', rescue.getFoodListings);
router.post('/', rescue.createFoodListing);
router.patch('/:id/claim', rescue.claimFoodListing);
router.get('/claims/user/:userId', rescue.getRescueClaims);

export default router;
