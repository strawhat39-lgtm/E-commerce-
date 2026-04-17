import { Router } from 'express';
import { getUsers, getUser, createOrUpdateProfile } from '../controllers/userController';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createOrUpdateProfile);

export default router;
