export interface SendEmailViaResendOptions {
  apiKey: string;
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface ResendSendSuccess {
  id: string;
}

export interface ResendSendError {
  statusCode?: number;
  message: string;
  name?: string;
}

export async function sendEmailViaResend(
  options: SendEmailViaResendOptions
): Promise<{ success: true; id: string } | { success: false; error: string; statusCode?: number }> {
  const { apiKey, from, to, subject, text, html, replyTo, cc, bcc } = options;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: 'Resend API Key is missing. Please configure it in Worker Settings.'
    };
  }

  const toList = Array.isArray(to) ? to : [to];
  const payload: Record<string, unknown> = {
    from,
    to: toList,
    subject,
    text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    html: html || (text ? text.replace(/\n/g, '<br>') : '')
  };

  if (replyTo) {
    payload.reply_to = replyTo;
  }
  if (cc) {
    payload.cc = Array.isArray(cc) ? cc : [cc];
  }
  if (bcc) {
    payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseBody = (await response.json().catch(() => null)) as
      | ResendSendSuccess
      | ResendSendError
      | null;

    if (!response.ok) {
      const errObj = responseBody as ResendSendError | null;
      const errorMessage =
        errObj?.message || `Resend API returned HTTP ${response.status} ${response.statusText}`;
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }

    const successObj = responseBody as ResendSendSuccess | null;
    if (!successObj?.id) {
      return {
        success: false,
        error: 'Resend API did not return an email ID.'
      };
    }

    return {
      success: true,
      id: successObj.id
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Network error connecting to Resend: ${message}`
    };
  }
}
