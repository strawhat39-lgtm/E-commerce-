import express from 'express';

const router = express.Router();

router.post('/send-order-message', async (req, res) => {
  try {
    const { userEmail, orderItems, buyerDetails } = req.body;

    if (!userEmail || !orderItems || !Array.isArray(orderItems)) {
      return res.status(400).json({ error: 'Missing required buyer email or item arrays' });
    }

    const buyerInfoHtml = buyerDetails ? `
      <div style="background-color: #2a2a2a; color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #39FF14; border-bottom: 1px solid #444; padding-bottom: 10px;">Delivery Profile</h3>
        <p><strong>Mobile:</strong> ${buyerDetails.mobile || 'N/A'}</p>
        <p><strong>Location:</strong> ${buyerDetails.address || 'N/A'}</p>
        <p><strong>Payment Method:</strong> ${req.body.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid UPI'}</p>
        <p><strong>Bio/Notes:</strong> ${buyerDetails.bio || 'Eco-Warrior in action!'}</p>
      </div>
    ` : '';

    require('dotenv').config();
    const brevoKey = process.env.BREVO_API_KEY;

    if (!brevoKey) {
      console.warn("BREVO_API_KEY missing - skipping live email push");
      return res.status(200).json({ status: 'simulated', message: 'Brevo key missing, transaction succeeded organically.' });
    }

    // Compile dynamic HTML block iterating over purchased items
    let itemsHtml = '';
    let totalCarbonSaved = 0;

    orderItems.forEach((item: any) => {
        const cost = item.price || 0;
        const lat = item.latitude || '40.7128';  // default to New York mock if empty
        const lng = item.longitude || '-74.0060';
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        const carbon = item.estimated_carbon_kg || 0;
        totalCarbonSaved += Number(carbon);

        itemsHtml += `
          <div style="background-color: #f6f8f5; border-radius: 8px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #39FF14;">
              <h3 style="margin-top: 0; color: #1a1a1a;">${item.product_name || item.name || 'Sustainable Item'}</h3>
              <p><strong>Price:</strong> ₹${cost}</p>
              <p><strong>Seller:</strong> ${item.sellerName || 'Verified Eco-Seller'}</p>
              <p><strong>Contact:</strong> ${item.sellerWhatsapp || 'N/A'}</p>
              <p><strong>CO₂ Target:</strong> Saved ~${carbon}kg emitting footprint! 🌱</p>
              <a href="${mapsLink}" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #BF5AF2; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">📍 Open Pickup Location on Maps</a>
          </div>
        `;
    });

    const emailHtmlBody = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaebed; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0a0a0a; color: #39FF14; padding: 25px; text-align: center;">
          <h1 style="margin: 0; letter-spacing: 2px; text-transform: uppercase;">Reuse_Mart Receipt</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a1a1a;">Order Confirmed! 🎉</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Thank you for driving the circular economy! Your recent order has successfully secured <strong>${totalCarbonSaved}kg of CO₂</strong> offsets!</p>
          <hr style="border: none; border-top: 1px solid #eaebed; margin: 30px 0;" />
          
          ${buyerInfoHtml}
          
          <h3 style="color: #1a1a1a; margin-bottom: 15px;">Item Summary</h3>
          ${itemsHtml}
          <div style="background-color: #1a1a1a; color: #fff; padding: 20px; text-align: center; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px;"><strong>Support Local. Save the Planet.</strong></p>
          </div>
        </div>
      </div>
    `;

    // Dispatch Native Request securely to Enterprise Brevo Hub
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoKey
      },
      body: JSON.stringify({
        sender: { name: 'Reuse_Mart Eco-Hub', email: 'no-reply@reusemart.app' },
        to: [{ email: userEmail }],
        subject: 'Your Sustainable Purchase Receipt 🌱',
        htmlContent: emailHtmlBody
      })
    });

    const body = await brevoResponse.json();
    
    if (!brevoResponse.ok) {
      console.error('Brevo Drop Error:', body);
      return res.status(500).json({ error: 'Communications matrix failed.' });
    }

    res.status(200).json({ status: 'sent', message: 'Transaction dispatched to Brevo servers natively!' });

    // --- SECONDARY: BREVO SMS DISPATCH ---
    if (buyerDetails?.mobile) {
      try {
        const cleanMobile = buyerDetails.mobile.replace(/\D/g, ''); // Ensure only numbers
        const smsContent = `♻️ Reuse_Mart: Order Confirmed! Your sustainable items are secured. Type: ${req.body.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid UPI'}. Saved ~${totalCarbonSaved}kg CO2! 🌱`;

        await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoKey
          },
          body: JSON.stringify({
            sender: 'ReuseMart',
            recipient: cleanMobile,
            content: smsContent,
            type: 'transactional'
          })
        });
        console.log(`SMS Dispatched to ${cleanMobile}`);
      } catch (smsErr) {
        console.error('Brevo SMS Dispatch Failed:', smsErr);
      }
    }

  } catch (error: any) {
    console.error('Brevo Network Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
