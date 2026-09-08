import express from 'express';
import { createInquiry, getInquiries } from '../controllers/inquiryController.js';

const router = express.Router();

router.post('/', createInquiry);
router.get('/', getInquiries);

export default router;
