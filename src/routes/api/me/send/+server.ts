import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendUserEmail } from '$lib/server/services/send-email.service';

export const POST: RequestHandler = async (event) => {
  if (!event.locals.authenticated || !event.locals.sessionUserId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = event.request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return json({ error: 'Expected application/json' }, { status: 400 });
  }

  const body = (await event.request.json().catch(() => null)) as
    | {
        to?: string;
        subject?: string;
        text?: string;
        html?: string;
        replyTo?: string;
      }
    | null;

  if (!body) {
    return json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const result = await sendUserEmail(event, {
    to: body.to ?? '',
    subject: body.subject ?? '',
    text: body.text,
    html: body.html,
    replyTo: body.replyTo
  });

  if (!result.success) {
    return json({ error: result.error }, { status: result.statusCode ?? 500 });
  }

  return json({
    ok: true,
    emailId: result.emailId,
    message: 'Email berhasil dikirim via Resend!'
  });
};
