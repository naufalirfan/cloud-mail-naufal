import type { RequestEvent } from '@sveltejs/kit';
import { sendEmailViaResend } from './resend.service';

export interface SendEmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function getResendApiKey(db?: D1Database, env?: App.Platform['env']): Promise<string> {
  if (db) {
    try {
      const row = await db
        .prepare("SELECT value FROM worker_settings WHERE key = 'resend_api_key' LIMIT 1")
        .first<{ value: string }>();
      if (row?.value && row.value.trim()) {
        return row.value.trim();
      }
    } catch {
      // ignore
    }
  }

  const envKey = (env as Record<string, unknown> | undefined)?.RESEND_API_KEY;
  if (typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
}

export async function sendUserEmail(
  event: RequestEvent,
  payload: SendEmailPayload
): Promise<{ success: true; emailId: string } | { success: false; error: string; statusCode?: number }> {
  const userId = event.locals.sessionUserId;
  const userEmail = event.locals.sessionEmail;

  if (!userId || !userEmail) {
    return { success: false, error: 'Unauthorized', statusCode: 401 };
  }

  const to = (payload.to ?? '').trim();
  const subject = (payload.subject ?? '').trim();
  const text = (payload.text ?? '').trim();
  const html = (payload.html ?? '').trim();
  const replyTo = (payload.replyTo ?? '').trim();

  if (!to || !to.includes('@')) {
    return { success: false, error: 'Alamat email penerima (To) tidak valid.', statusCode: 400 };
  }

  if (!subject) {
    return { success: false, error: 'Subjek email tidak boleh kosong.', statusCode: 400 };
  }

  if (!text && !html) {
    return { success: false, error: 'Isi pesan email tidak boleh kosong.', statusCode: 400 };
  }

  const db = event.platform?.env?.DB;
  const apiKey = await getResendApiKey(db, event.platform?.env);

  if (!apiKey) {
    return {
      success: false,
      error: 'Resend API Key belum dikonfigurasi. Silakan simpan API Key di Pengaturan Worker terlebih dahulu.',
      statusCode: 400
    };
  }

  // Use user's email as sender
  const sender = userEmail;
  const sendResult = await sendEmailViaResend({
    apiKey,
    from: sender,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
    replyTo: replyTo || undefined
  });

  if (!sendResult.success) {
    return {
      success: false,
      error: sendResult.error,
      statusCode: sendResult.statusCode ?? 500
    };
  }

  const emailId = sendResult.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const bodyText = text || (html ? html.replace(/<[^>]*>/g, '') : '');
  const bodyHtml = html || (text ? `<p>${text.replace(/\n/g, '<br>')}</p>` : '');
  const snippet = bodyText.slice(0, 160).replace(/\s+/g, ' ');
  const rawMime = `From: ${sender}\nTo: ${to}\nSubject: ${subject}\nDate: ${now}\n\n${bodyText}`;

  if (db) {
    try {
      await db
        .prepare(
          `
          INSERT INTO emails (
            id,
            user_id,
            message_id,
            sender,
            recipient,
            subject,
            snippet,
            received_at,
            is_read,
            is_starred,
            is_archived,
            raw_size,
            body_text,
            body_html,
            raw_mime,
            headers_json,
            parsed_message_id,
            parsed_from_email,
            parsed_subject,
            parsed_text,
            parsed_html,
            parsed_to,
            parsed_delivered_to,
            parsed_date
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        )
        .bind(
          emailId,
          userId,
          emailId,
          sender,
          to,
          subject,
          snippet,
          now,
          rawMime.length,
          bodyText,
          bodyHtml,
          rawMime,
          JSON.stringify({ from: sender, to, subject, date: now }),
          emailId,
          sender,
          subject,
          bodyText,
          bodyHtml,
          to,
          to,
          now
        )
        .run();

      await db
        .prepare(
          `
          INSERT INTO email_status_history (
            id,
            email_id,
            action,
            actor,
            from_state,
            to_state,
            created_at
          )
          VALUES (?, ?, 'send', ?, 'draft', 'sent', ?)
        `
        )
        .bind(crypto.randomUUID(), emailId, sender, now)
        .run();
    } catch (dbErr) {
      console.error('Error persisting sent email to DB:', dbErr);
    }
  }

  return {
    success: true,
    emailId
  };
}
