import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const returnUrl = process.env.STRIPE_PORTAL_RETURN_URL ?? process.env.STRIPE_SUCCESS_URL;

  if (!returnUrl) {
    return NextResponse.json({ error: 'Portal return URL missing' }, { status: 500 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer on file' }, { status: 400 });
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl
  });

  return NextResponse.json({ url: session.url, id: session.id });
}
