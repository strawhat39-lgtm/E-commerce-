import { Router } from 'express';
import * as cart from '../controllers/cartController';

const router = Router();

router.get('/user/:userId', cart.getCartItems);
router.post('/', cart.addCartItem);
router.delete('/:id', cart.removeCartItem);
router.get('/user/:userId/summary', cart.getCarbonSummary);

export default router;
