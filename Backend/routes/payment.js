import express from 'express';
import Stripe from 'stripe';
import auth from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const INVESTOR_PRICE = parseInt(process.env.STRIPE_INVESTOR_LISTING_PRICE || '4900'); // $49.00
const CLIENT_URL = process.env.NODE_ENV === 'production'
  ? (process.env.CLIENT_URL_PROD || 'https://fyp-jgfv.vercel.app')
  : (process.env.CLIENT_URL || 'http://localhost:3000');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-investor-checkout-session
// Investor pays once to publish their profile on the platform
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-investor-checkout-session', auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Investor Profile Listing',
              description: 'List your investor profile on PRS so founders can discover and apply to you',
            },
            unit_amount: INVESTOR_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${CLIENT_URL}/investor-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/investor-connect`,
      metadata: {
        type: 'investor_profile',
        user_id: req.user._id.toString(),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Investor checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/webhook  (raw body — registered in index.js BEFORE json middleware)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`Payment confirmed for user ${session.metadata?.user_id}, type: ${session.metadata?.type}`);
    // The profile creation itself happens on the frontend after verify confirms payment
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/verify-investor/:sessionId
// Called by InvestorPaymentSuccess page — confirms payment was made
// ─────────────────────────────────────────────────────────────────────────────
router.get('/verify-investor/:sessionId', auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status === 'paid' && session.metadata?.type === 'investor_profile') {
      res.json({ success: true, userId: session.metadata.user_id });
    } else {
      res.json({ success: false, status: session.payment_status });
    }
  } catch (error) {
    console.error('Verify investor error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
