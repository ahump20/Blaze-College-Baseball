import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      appInfo: { name: 'BlazeSportsIntel Web' }
    });
  }

  return stripeClient;
}
