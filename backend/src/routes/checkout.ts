import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import QRCode from 'qrcode';

const router = express.Router();

// Generate UPI Payment Intent for Generic Checkouts (Products/Cart)
router.post('/intent', requireAuth, async (req: Request, res: Response) => {
  try {
    const { amount, note, details } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid checkout amount' });
    }
    
    // Construct standard UPI deep link
    const merchantId = process.env.MERCHANT_UPI_ID || 'ecoloop@upi';
    const merchantName = 'Reuse_mart Checkout';
    const transactionNote = note || `Purchase Validation`;
    const upiString = `upi://pay?pa=${merchantId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;

    // Generate Base64 QR Code
    const qrDataUrl = await QRCode.toDataURL(upiString, { width: 300, margin: 2 });

    res.json({
      success: true,
      amount,
      upiString,
      qrDataUrl
    });
  } catch (error: any) {
    console.error('Checkout Intent Error:', error);
    res.status(500).json({ error: 'Failed to generate checkout intent' });
  }
});

// Finalize generic checkout
router.post('/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    // In a real database we would change the item's status to 'sold' or drop cart items.
    // Accept address details and payment confirmation.
    const { details } = req.body;
    
    // Generate a simple digital receipt payload
    const receiptPayload = `ECO_RECEIPT|${(req as any).user?.id}|${Date.now()}`;
    const receiptUrl = await QRCode.toDataURL(receiptPayload, { width: 300, margin: 2 });

    res.json({
      success: true,
      message: 'Checkout complete. Items secured!',
      receiptUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to finalize checkout' });
  }
});

export default router;
