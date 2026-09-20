<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';
  import Button from '$lib/components/atoms/Button.svelte';

  export let open = false;
  export let senderEmail = '';

  const dispatch = createEventDispatcher<{
    close: void;
    sent: { emailId: string };
  }>();

  let to = '';
  let subject = '';
  let text = '';
  let sending = false;
  let error = '';
  let success = '';

  function handleClose() {
    if (sending) return;
    open = false;
    error = '';
    success = '';
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open && !sending) {
      handleClose();
    }
  }

  async function handleSend() {
    error = '';
    success = '';

    const trimmedTo = to.trim();
    const trimmedSubject = subject.trim();
    const trimmedText = text.trim();

    if (!trimmedTo || !trimmedTo.includes('@')) {
      error = 'Masukkan alamat email penerima (To) yang valid.';
      return;
    }
    if (!trimmedSubject) {
      error = 'Subjek email tidak boleh kosong.';
      return;
    }
    if (!trimmedText) {
      error = 'Isi pesan email tidak boleh kosong.';
      return;
    }

    sending = true;

    try {
      const response = await fetch('/api/me/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: trimmedTo,
          subject: trimmedSubject,
          text: trimmedText
        })
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        emailId?: string;
        message?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error ?? 'Gagal mengirim email.');
      }

      success = 'Email berhasil dikirim via Resend!';
      dispatch('sent', { emailId: payload.emailId ?? '' });

      setTimeout(() => {
        to = '';
        subject = '';
        text = '';
        handleClose();
      }, 1200);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim email.';
    } finally {
      sending = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="compose-title">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="backdrop-click-target" role="presentation" on:click={handleClose}></div>
    
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-wrap"><Icon name="edit" size={20} /></span>
          <h2 id="compose-title">Tulis Email Baru</h2>
        </div>
        <button class="close-btn" type="button" aria-label="Tutup" on:click={handleClose} disabled={sending}>
          <Icon name="close" size={20} />
        </button>
      </div>

      <form class="modal-form" on:submit|preventDefault={handleSend}>
        <div class="form-row from-row">
          <label for="compose-from">Dari (Pengirim):</label>
          <div class="from-field">
            <span class="lock-icon"><Icon name="lock" size={14} /></span>
            <input
              id="compose-from"
              type="text"
              value={senderEmail}
              readonly
              disabled
              class="readonly-input"
            />
          </div>
        </div>

        <div class="form-row">
          <label for="compose-to">Kepada (To):</label>
          <input
            id="compose-to"
            type="email"
            bind:value={to}
            placeholder="contoh: penerima@domain.com"
            required
            disabled={sending}
            class="input-field"
          />
        </div>

        <div class="form-row">
          <label for="compose-subject">Subjek:</label>
          <input
            id="compose-subject"
            type="text"
            bind:value={subject}
            placeholder="Subjek email..."
            required
            disabled={sending}
            class="input-field"
          />
        </div>

        <div class="form-row textarea-row">
          <label for="compose-message">Pesan:</label>
          <textarea
            id="compose-message"
            bind:value={text}
            placeholder="Tulis pesan email Anda di sini..."
            rows="8"
            required
            disabled={sending}
            class="textarea-field"
          ></textarea>
        </div>

        {#if error}
          <div class="alert alert-error" role="alert">
            <Icon name="error" size={18} />
            <span>{error}</span>
          </div>
        {/if}

        {#if success}
          <div class="alert alert-success" role="status">
            <Icon name="check_circle" size={18} />
            <span>{success}</span>
          </div>
        {/if}

        <div class="modal-footer">
          <button type="button" class="btn-cancel" on:click={handleClose} disabled={sending}>
            Batal
          </button>
          <button type="submit" class="btn-send" disabled={sending}>
            {#if sending}
              <span class="spinner" aria-hidden="true"></span>
              <span>Mengirim via Resend...</span>
            {:else}
              <Icon name="send" size={16} />
              <span>Kirim Email</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
  }

  .backdrop-click-target {
    position: absolute;
    inset: 0;
  }

  .modal-dialog {
    position: relative;
    width: 100%;
    max-width: 620px;
    background: var(--color-surface-card);
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 50%);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-fade 180ms ease-out;
  }

  @keyframes modal-fade {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-outline), transparent 75%);
    background: color-mix(in srgb, var(--color-surface-low), transparent 25%);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .icon-wrap {
    color: var(--color-primary-500);
    display: flex;
    align-items: center;
  }

  h2 {
    margin: 0;
    font-size: 1.15rem;
    font-family: var(--font-family-headline);
    font-weight: 700;
  }

  .close-btn {
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-pill);
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover:not(:disabled) {
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-text), transparent 90%);
  }

  .modal-form {
    padding: 1.25rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .from-field {
    position: relative;
    display: flex;
    align-items: center;
  }

  .lock-icon {
    position: absolute;
    left: 0.8rem;
    color: var(--color-text-muted);
    pointer-events: none;
    display: flex;
  }

  .readonly-input {
    width: 100%;
    padding: 0.55rem 0.8rem 0.55rem 2.2rem;
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 75%);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-surface-low), transparent 40%);
    color: var(--color-text);
    font-family: var(--font-family-mono, monospace);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: not-allowed;
  }

  .input-field {
    width: 100%;
    padding: 0.6rem 0.85rem;
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 60%);
    border-radius: var(--radius-md);
    background: var(--color-surface-card);
    color: var(--color-text);
    font-size: 0.9rem;
    transition: border-color 150ms;
  }

  .input-field:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500), transparent 82%);
  }

  .textarea-field {
    width: 100%;
    padding: 0.7rem 0.85rem;
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 60%);
    border-radius: var(--radius-md);
    background: var(--color-surface-card);
    color: var(--color-text);
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    line-height: 1.5;
    transition: border-color 150ms;
  }

  .textarea-field:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500), transparent 82%);
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 0.9rem;
    border-radius: var(--radius-md);
    font-size: 0.82rem;
    font-weight: 600;
  }

  .alert-error {
    background: color-mix(in srgb, var(--color-danger), transparent 88%);
    color: var(--color-danger);
    border: 1px solid color-mix(in srgb, var(--color-danger), transparent 70%);
  }

  .alert-success {
    background: color-mix(in srgb, #10b981, transparent 88%);
    color: #059669;
    border: 1px solid color-mix(in srgb, #10b981, transparent 70%);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
    padding-top: 0.85rem;
    border-top: 1px solid color-mix(in srgb, var(--color-outline), transparent 80%);
  }

  .btn-cancel {
    padding: 0.6rem 1.1rem;
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 50%);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--color-text-muted);
    font-weight: 600;
    font-size: 0.86rem;
    cursor: pointer;
  }

  .btn-cancel:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-text), transparent 92%);
    color: var(--color-text);
  }

  .btn-send {
    padding: 0.6rem 1.4rem;
    border: 0;
    border-radius: var(--radius-pill);
    background: var(--gradient-signature);
    color: #ffffff;
    font-weight: 700;
    font-size: 0.86rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary-500), transparent 60%);
    transition: transform 120ms, opacity 120ms;
  }

  .btn-send:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary-500), transparent 50%);
  }

  .btn-send:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 0.95rem;
    height: 0.95rem;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .modal-dialog {
      max-width: 100%;
    }
    .modal-form {
      padding: 1rem;
    }
  }
</style>
