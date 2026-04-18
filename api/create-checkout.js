const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  starter:    'price_1TNaYmQQWLlCwY2QvbwK8Sj0',
  growth:     'price_1TNad5QQWLlCwY2QlAfs6NjX',
  enterprise: 'price_1TNadoQQWLlCwY2Qo9Y7OHli',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan, email } = req.body;
  const priceId = PLANS[plan];

  if (!priceId) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://restox-six.vercel.app'}/?success=true&plan=${plan}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL || 'https://restox-six.vercel.app'}/?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};
