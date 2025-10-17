import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';
import { prisma } from '@/lib/prisma';
import { upsertUserFromClerk } from '@/lib/users';

function getSvixHeaders() {
  const headerList = headers();
  const svixId = headerList.get('svix-id');
  const svixTimestamp = headerList.get('svix-timestamp');
  const svixSignature = headerList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('Missing Svix headers.');
  }

  return {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature
  };
}

export async function POST(req: Request) {
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'CLERK_WEBHOOK_SECRET not configured' }, { status: 500 });
  }

  const payload = await req.text();
  let event: WebhookEvent;

  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headers = getSvixHeaders();
    event = wh.verify(payload, headers) as WebhookEvent;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid webhook signature', details: `${error}` }, { status: 400 });
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const primaryEmailId = event.data.primary_email_address_id;
    const primaryEmail = event.data.email_addresses?.find((email) => email.id === primaryEmailId)?.email_address ??
      event.data.email_addresses?.[0]?.email_address;

    await upsertUserFromClerk({
      id: event.data.id,
      email: primaryEmail ?? `${event.data.id}@users.clerk.dev`,
      firstName: event.data.first_name,
      lastName: event.data.last_name,
      imageUrl: event.data.image_url
    });
  }

  if (event.type === 'user.deleted') {
    await prisma.user.deleteMany({ where: { id: event.data.id } });
  }

  return NextResponse.json({ received: true });
}
