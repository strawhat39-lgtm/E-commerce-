import { Router } from 'express';
import * as listings from '../controllers/listingsController';

const router = Router();

router.get('/', listings.getAllListings);
router.post('/', listings.createListing);
router.get('/:id', listings.getListingById);
router.patch('/:id', listings.updateListingStatus);
router.delete('/:id', listings.deleteListing);

export default router;
