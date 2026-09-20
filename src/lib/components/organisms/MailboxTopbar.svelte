<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { darkMode } from '$lib/stores/ui.store';
  import SearchField from '$lib/components/molecules/SearchField.svelte';
  import Icon from '$lib/components/atoms/Icon.svelte';
  import BrandLogo from '$lib/components/atoms/BrandLogo.svelte';
  import ComposeModal from '$lib/components/organisms/ComposeModal.svelte';

  export let userLabel = '';
  export let userEmail = '';
  export let searchQuery = '';
  export let searchPlaceholder = 'Search emails...';
  export let searchLabel = 'Cari';
  export let onSearch: (() => void) | undefined = undefined;
  export let showSearch = true;
  export let showRefresh = true;
  export let showLogout = true;
  export let showCompose = true;

  let refreshing = false;
  let loggingOut = false;
  let composeOpen = false;

  async function handleRefresh() {
    if (refreshing || loggingOut) {
      return;
    }

    refreshing = true;
    try {
      await invalidateAll();
    } finally {
      refreshing = false;
    }
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    loggingOut = true;
    try {
      await fetch('/api/auth/logout');
    } finally {
      await goto('/auth/login');
      loggingOut = false;
    }
  }

  function handleThemeToggle() {
    darkMode.update((value) => !value);
  }
</script>

<header class="topbar">
  <div class="inner">
    <div class="left">
      <a class="brand" href="/me/inbox" aria-label="Go to inbox">
        <span class="brand-icon"><BrandLogo size={22} /></span>
        <span class="brand-name">MailFlare</span>
      </a>
      {#if showSearch}
        <div class="search">
          <SearchField
            bind:value={searchQuery}
            placeholder={searchPlaceholder}
            {searchLabel}
            {onSearch}
          />
        </div>
      {/if}
    </div>

    {#if userEmail}
      <div class="session-badge" title={`Sesi email aktif: ${userEmail}`}>
        <span class="session-status-dot" aria-hidden="true"></span>
        <span class="session-label">Sesi:</span>
        <span class="session-email">{userEmail}</span>
      </div>
    {/if}

    <div class="right">
      {#if showCompose}
        <button class="compose-btn" type="button" on:click={() => (composeOpen = true)}>
          <Icon name="edit" size={15} />
          <span>Tulis Email</span>
        </button>
      {/if}

      {#if showRefresh}
        <button class="icon-btn" type="button" aria-label="Refresh inbox" on:click={handleRefresh} disabled={refreshing || loggingOut}>
          <Icon name="refresh" size={18} />
        </button>
      {/if}

      <slot name="actions" />

      <button
        class="icon-btn"
        type="button"
        aria-label={$darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        on:click={handleThemeToggle}
      >
        <Icon name={$darkMode ? 'light_mode' : 'dark_mode'} size={18} />
      </button>

      {#if showLogout}
        <div class="divider" aria-hidden="true"></div>
        {#if userLabel}
          <span class="user">{userLabel}</span>
        {/if}
        <button class="logout" type="button" disabled={loggingOut} on:click={handleLogout}>
          <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
          <Icon name="logout" size={18} />
        </button>
      {/if}
    </div>
  </div>
</header>

<ComposeModal
  bind:open={composeOpen}
  senderEmail={userEmail}
  on:sent={handleRefresh}
/>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: color-mix(in srgb, var(--color-surface-card), transparent 18%);
    border-bottom: 1px solid color-mix(in srgb, var(--color-outline), transparent 78%);
    backdrop-filter: blur(12px);
    box-shadow: 0 20px 48px rgba(0, 61, 199, 0.06);
  }

  .inner {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0.75rem 1.25rem;
    display: flex;
    gap: var(--space-4);
    justify-content: space-between;
    align-items: center;
  }

  .left {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .brand-icon {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 0.55rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-surface-low), #ffffff 6%);
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 65%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .brand-name {
    font-family: var(--font-family-headline);
    color: var(--color-primary-500);
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .search {
    width: min(42rem, 100%);
  }

  .right {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: nowrap;
    justify-content: flex-end;
    min-width: 0;
  }

  .compose-btn {
    border: 0;
    background: var(--gradient-signature);
    color: #ffffff;
    font-weight: 700;
    font-size: 0.8rem;
    padding: 0.44rem 0.9rem;
    border-radius: var(--radius-pill);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500), transparent 65%);
    transition: transform 120ms ease, box-shadow 120ms ease;
    white-space: nowrap;
    user-select: none;
  }

  .compose-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary-500), transparent 50%);
  }

  .icon-btn {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: var(--radius-md);
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 55%);
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .icon-btn:hover {
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-surface-low), transparent 8%);
  }

  .divider {
    width: 1px;
    height: 1.8rem;
    background: color-mix(in srgb, var(--color-outline), transparent 70%);
  }

  .session-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.38rem 0.85rem;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--color-surface-card), transparent 10%);
    border: 1px solid color-mix(in srgb, var(--color-outline), transparent 55%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    white-space: nowrap;
    user-select: none;
    flex-shrink: 0;
    margin: 0 var(--space-2);
  }

  .session-status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
    animation: session-pulse 2.4s infinite ease-in-out;
  }

  @keyframes session-pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(0.85);
    }
  }

  .session-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
  }

  .session-email {
    font-family: var(--font-family-mono, monospace);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: -0.01em;
  }

  .user {
    font-family: var(--font-family-headline);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .logout {
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .logout:hover {
    color: var(--color-danger);
  }

  @media (max-width: 1100px) {
    .session-label {
      display: none;
    }
  }

  @media (max-width: 960px) {
    .inner {
      padding: 0.65rem 0.85rem;
      flex-wrap: wrap;
    }

    .left {
      width: 100%;
    }

    .session-badge {
      order: 2;
      margin: 0.25rem 0;
    }

    .search {
      width: 100%;
    }

    .right {
      width: 100%;
      order: 3;
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 0.1rem;
      scrollbar-width: thin;
    }

    .right :global(.btn),
    .icon-btn,
    .logout,
    .user {
      flex: 0 0 auto;
    }

    .divider,
    .user {
      display: none;
    }
  }
</style>
