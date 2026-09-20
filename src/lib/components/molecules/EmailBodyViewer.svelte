<script lang="ts">
  import Icon from '$lib/components/atoms/Icon.svelte';

  export let bodyHtml = '';
  export let bodyText = '';
  export let snippet = '';

  function decodeQuotedPrintable(str: string): string {
    return str
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
        try {
          return decodeURIComponent('%' + hex);
        } catch {
          return String.fromCharCode(parseInt(hex, 16));
        }
      });
  }

  function extractPartsFromRawMime(raw: string): { text: string; html: string } {
    if (!raw || !raw.includes('--') || !raw.toLowerCase().includes('content-type:')) {
      return { text: raw, html: '' };
    }

    let textPart = '';
    let htmlPart = '';

    const boundaryMatch = raw.match(/--([^\r\n\s]+)/);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1];
      const escaped = boundary.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const parts = raw.split(new RegExp('--' + escaped));

      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower.includes('content-type: text/plain') || lower.includes('content-type:text/plain')) {
          const split = part.split(/\r?\n\r?\n/);
          if (split.length > 1) {
            textPart = decodeQuotedPrintable(split.slice(1).join('\n\n').trim());
          }
        } else if (lower.includes('content-type: text/html') || lower.includes('content-type:text/html')) {
          const split = part.split(/\r?\n\r?\n/);
          if (split.length > 1) {
            htmlPart = decodeQuotedPrintable(split.slice(1).join('\n\n').trim());
          }
        }
      }
    }

    return {
      text: textPart || raw,
      html: htmlPart
    };
  }

  function stripHtmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/div>|<\/p>|<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  function buildFrameSrcDoc(rawHtml: string): string {
    const html = rawHtml.trim();
    if (!html) return '';

    const metaTag = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    const defaultStyles = `
      <style>
        :root { color-scheme: light; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background: #ffffff;
          padding: 1.25rem;
          margin: 0;
          word-break: break-word;
        }
        a { color: #0284c7; }
        img { max-width: 100%; height: auto; }
        pre, code { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        blockquote {
          margin: 0.8rem 0;
          padding-left: 0.8rem;
          border-left: 3px solid #cbd5e1;
          color: #64748b;
        }
      </style>
    `;

    if (/<html[\s>]/i.test(html)) {
      if (/<head[\s>]/i.test(html)) {
        return html.replace(/<head[\s>]/i, `$&${metaTag}${defaultStyles}`);
      }
      return html.replace(/<html[\s>]/i, `$&<head>${metaTag}${defaultStyles}</head>`);
    }

    return `<!doctype html><html><head>${metaTag}${defaultStyles}</head><body>${html}</body></html>`;
  }

  $: rawTextCandidate = (bodyText || snippet || '').trim();
  $: rawHtmlCandidate = (bodyHtml || '').trim();

  $: parsedFromText = extractPartsFromRawMime(rawTextCandidate);
  $: resolvedHtml = rawHtmlCandidate || parsedFromText.html;
  $: resolvedText = (parsedFromText.text || (resolvedHtml ? stripHtmlToText(resolvedHtml) : '') || snippet || '(Tidak ada konten teks)').trim();

  $: hasHtml = resolvedHtml.trim().length > 0;
  $: hasText = resolvedText.trim().length > 0 && resolvedText !== '(Tidak ada konten teks)';

  let activeMode: 'html' | 'text' = 'text';
  let initialized = false;

  $: if (!initialized && (hasHtml || hasText)) {
    activeMode = hasHtml ? 'html' : 'text';
    initialized = true;
  }

  $: frameSrcDoc = buildFrameSrcDoc(resolvedHtml);

  let copied = false;
  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(resolvedText);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1800);
    } catch {
      // fallback
    }
  }
</script>

<div class="email-body-container">
  <div class="viewer-toolbar">
    <div class="mode-tabs">
      {#if hasHtml}
        <button
          type="button"
          class="tab-btn"
          class:active={activeMode === 'html'}
          on:click={() => (activeMode = 'html')}
        >
          <Icon name="language" size={16} />
          <span>Versi HTML</span>
        </button>
      {/if}
      <button
        type="button"
        class="tab-btn"
        class:active={activeMode === 'text'}
        on:click={() => (activeMode = 'text')}
      >
        <Icon name="description" size={16} />
        <span>Teks Biasa (Non-HTML)</span>
      </button>
    </div>

    <div class="viewer-actions">
      <button
        type="button"
        class="action-pill-btn"
        on:click={handleCopyText}
        title="Salin isi pesan teks"
      >
        <Icon name={copied ? 'check' : 'content_copy'} size={14} />
        <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
      </button>
    </div>
  </div>

  <div class="viewer-content">
    {#if activeMode === 'html' && hasHtml}
      <div class="frame-wrapper">
        <iframe
          title="Email HTML Preview"
          class="email-frame"
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          referrerpolicy="no-referrer"
          srcdoc={frameSrcDoc}
        ></iframe>
      </div>
    {:else}
      <div class="plain-text-box">
        <pre>{resolvedText}</pre>
      </div>
    {/if}
  </div>
</div>

<style>
  .email-body-container {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }

  .viewer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.35rem 0.5rem;
    background: var(--color-surface-low, rgba(255, 255, 255, 0.03));
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 75%);
    border-radius: var(--radius-md, 8px);
  }

  .mode-tabs {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md, 6px);
    background: transparent;
    color: var(--color-text-muted, #94a3b8);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .tab-btn:hover {
    color: var(--color-text, #f8fafc);
    background: color-mix(in srgb, var(--color-text), transparent 93%);
  }

  .tab-btn.active {
    background: var(--color-surface-card, #1e293b);
    color: var(--color-primary-500, #0ea5e9);
    border-color: color-mix(in srgb, var(--color-outline), transparent 70%);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .viewer-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .action-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 70%);
    border-radius: var(--radius-pill, 9999px);
    background: transparent;
    color: var(--color-text-muted, #94a3b8);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .action-pill-btn:hover {
    background: color-mix(in srgb, var(--color-text), transparent 90%);
    color: var(--color-text, #f8fafc);
  }

  .frame-wrapper {
    position: relative;
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 65%);
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .email-frame {
    display: block;
    width: 100%;
    min-height: 480px;
    height: 60vh;
    border: 0;
    background: #ffffff;
  }

  .plain-text-box {
    background: var(--color-surface-low, rgba(255, 255, 255, 0.03));
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 65%);
    border-radius: var(--radius-md, 8px);
    padding: 1.25rem 1.4rem;
    color: var(--color-text, #f8fafc);
    overflow-x: auto;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
    font-size: 0.92rem;
    line-height: 1.65;
    color: inherit;
    background: transparent;
    border: 0;
    padding: 0;
  }
</style>
