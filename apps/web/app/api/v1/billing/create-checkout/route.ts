import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = process.env.STRIPE_CANCEL_URL;

  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'Stripe environment variables missing' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stripe = getStripeClient();

  let customerId = user.subscription?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
      metadata: { userId }
    });

    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId }
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    allow_promotion_codes: true,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: { userId }
    }
  });

  return NextResponse.json({ url: session.url, id: session.id });
}
