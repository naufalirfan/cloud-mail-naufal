<script lang="ts">
  export let id = '';
  export let value = '';
  export let placeholder = '';
  export let type: 'text' | 'password' | 'email' | 'search' = 'text';
  export let readonly = false;
  export let name = '';
  export let required = false;
</script>

<input
  class="input"
  {id}
  {name}
  {type}
  bind:value
  {placeholder}
  {readonly}
  {required}
/>

<style>
  .input {
    width: 100%;
    border: 1px solid var(--color-outline);
    background: var(--color-surface-card);
    color: var(--color-text);
    padding: 0.625rem 0.875rem;
    min-height: 40px;
    border-radius: var(--radius-md);
    font-size: var(--font-size-body-sm);
    letter-spacing: -0.01em;
    transition: border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease;
  }

  .input::placeholder {
    color: var(--color-text-muted);
    opacity: 0.7;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500), transparent 82%);
  }

  .input:read-only {
    background: var(--color-surface-low);
    cursor: default;
  }
</style>
