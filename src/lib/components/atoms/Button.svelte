<script lang="ts">
  export let type: 'button' | 'submit' = 'button';
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let fullWidth = false;
  export let disabled = false;
  export let href = '';
</script>

{#if href}
  <a class={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`} {href}>
    <slot />
  </a>
{:else}
  <button class={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`} {type} {disabled} on:click>
    <slot />
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    padding: 0.55rem 1rem;
    min-height: 40px;
    cursor: pointer;
    font-size: var(--font-size-body-sm);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.01em;
    transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 100ms ease;
    text-decoration: none;
    user-select: none;
  }

  .btn:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  .btn:active:not(:disabled) {
    transform: scale(0.985);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-full {
    width: 100%;
  }

  /* Superhuman Primary: Deep, crisp indigo navy in light, radiant violet in dark */
  .btn-primary {
    color: #ffffff;
    background-color: var(--color-primary-500);
    border-color: var(--color-primary-700);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-700);
  }

  /* Superhuman Secondary: Clean tactile surface with hairline border */
  .btn-secondary {
    color: var(--color-text);
    background-color: var(--color-surface-card);
    border-color: var(--color-outline);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: var(--color-surface-low);
    border-color: color-mix(in srgb, var(--color-outline), var(--color-text) 15%);
  }

  /* Superhuman Ghost: Subdued utility action */
  .btn-ghost {
    color: var(--color-text-muted);
    background-color: transparent;
    border-color: transparent;
  }

  .btn-ghost:hover:not(:disabled) {
    color: var(--color-text);
    background-color: var(--color-surface-low);
  }
</style>
