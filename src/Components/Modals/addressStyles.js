/**
 * addressStyles.js
 *
 * Shared CSS injection for the Addresses page + AddressModal.
 * Uses the same pattern as Settings (injectSettingsStyles) so the
 * design tokens are always in sync. Import and call once at mount.
 *
 * Safe to call multiple times — idempotent via ID guard.
 */

const ADDR_STYLE_ID     = "addr-page-styles";
const ADDR_FONT_LINK_ID = "settings-google-fonts"; // reuses the same font link

export function injectAddressStyles() {
    if (document.getElementById(ADDR_STYLE_ID)) return;

    // Google Fonts — reuse if Settings already injected them
    if (!document.getElementById(ADDR_FONT_LINK_ID)) {
        const link = document.createElement("link");
        link.id   = ADDR_FONT_LINK_ID;
        link.rel  = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
        document.head.appendChild(link);
    }

    const style = document.createElement("style");
    style.id = ADDR_STYLE_ID;
    style.textContent = `

    /* ── Root / page wrapper ───────────────────────────────────── */
    .addr-root {
      --s-bg:        #F7F5F0;
      --s-surface:   #FFFFFF;
      --s-surface-2: #F2EFE9;
      --s-border:    #E4E0D8;
      --s-ink:       #1A1714;
      --s-ink-2:     #6B6660;
      --s-ink-3:     #A09B96;
      --s-accent:    #2A6B4F;
      --s-accent-bg: #E8F3EE;
      --s-accent-hi: #3D9970;
      --s-danger:    #C0392B;
      --s-danger-bg: #FDECEA;
      background: var(--s-bg);
      min-height: 100vh;
    }

    /* ── Spinner (same as settings) ────────────────────────────── */
    .addr-spinner {
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid #E4E0D8; border-top-color: #2A6B4F;
      animation: addr-spin 0.7s linear infinite;
    }
    @keyframes addr-spin { to { transform: rotate(360deg); } }

    /* ── Toast ─────────────────────────────────────────────────── */
    .addr-toast {
      position: fixed; top: 88px; right: 24px; z-index: 9999;
      background: #1A1714; color: #fff;
      padding: 12px 18px; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
      display: flex; align-items: center; gap: 9px;
      box-shadow: 0 8px 28px rgba(26,23,20,0.20);
      animation: addr-toast-in 0.26s cubic-bezier(.22,1,.36,1) both;
      pointer-events: none;
    }
    .addr-toast.success .addr-toast-dot { background: #3D9970; }
    .addr-toast.error   .addr-toast-dot { background: #C0392B; }
    .addr-toast-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    @keyframes addr-toast-in {
      from { opacity: 0; transform: translateY(-6px) scale(.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Card ──────────────────────────────────────────────────── */
    .addr-card {
      background: #fff; border: 1px solid #E4E0D8;
      border-radius: 16px; box-shadow: 0 2px 10px rgba(26,23,20,0.05);
    }

    /* ── Accent bar ────────────────────────────────────────────── */
    .addr-accent-bar {
      width: 32px; height: 3px; border-radius: 2px;
      background: #2A6B4F; margin-bottom: 18px;
    }

    /* ── Address card grid item ────────────────────────────────── */
    .addr-item {
      background: #fff; border: 1.5px solid #E4E0D8;
      border-radius: 14px; padding: 20px 22px;
      transition: box-shadow 0.16s, transform 0.16s;
      position: relative; overflow: hidden;
    }
    .addr-item::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; border-radius: 1.5px 0 0 1.5px; background: transparent;
      transition: background 0.2s;
    }
    .addr-item.is-default         { border-color: #2A6B4F; }
    .addr-item.is-default::before { background: #2A6B4F; }
    .addr-item:hover { box-shadow: 0 6px 24px rgba(26,23,20,0.09); transform: translateY(-1px); }

    /* ── Action buttons on card ────────────────────────────────── */
    .addr-item-btn {
      flex: 1; padding: 8px 10px; border-radius: 8px;
      border: 1px solid #E4E0D8; background: #F7F5F0; color: #A09B96;
      font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.13s;
      display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .addr-item-btn.default-btn:hover { background: #E8F3EE; color: #2A6B4F; border-color: #3D9970; }
    .addr-item-btn.edit-btn:hover    { background: #F2EFE9; color: #1A1714; border-color: #C8C4BE; }
    .addr-item-btn.delete-btn:hover  { background: #FDECEA; color: #C0392B; border-color: #C0392B; }
    .addr-item-btn:disabled          { opacity: 0.42; cursor: not-allowed; }

    /* ── Default badge ─────────────────────────────────────────── */
    .addr-default-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase;
      padding: 4px 9px; border-radius: 100px;
      background: #E8F3EE; color: #2A6B4F; margin-bottom: 10px;
    }
    .addr-default-badge-dot {
      width: 5px; height: 5px; border-radius: 50%; background: #2ECC71;
    }

    /* ── New address button ────────────────────────────────────── */
    .addr-new-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #1A1714; color: #fff; padding: 10px 18px;
      border-radius: 9px; border: none;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background 0.14s, transform 0.14s;
      box-shadow: 0 4px 12px rgba(26,23,20,0.16); letter-spacing: 0.01em;
    }
    .addr-new-btn:hover  { background: #2E2B28; transform: translateY(-1px); }
    .addr-new-btn:active { transform: translateY(0); }

    /* ── Empty state icon ──────────────────────────────────────── */
    .addr-empty-icon {
      width: 54px; height: 54px; border-radius: 13px;
      background: #E8F3EE; color: #2A6B4F; font-size: 22px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }

    /* ── Modal overlay + panel (identical to SupportTicketModal) ─ */
    .addr-modal-overlay {
      position: fixed; inset: 0; z-index: 9998;
      display: flex; align-items: center; justify-content: center; padding: 16px;
      background: rgba(26,23,20,0.52);
      backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
      animation: addr-fade 0.2s ease both;
    }
    @keyframes addr-fade { from { opacity: 0; } to { opacity: 1; } }

    .addr-modal-panel {
      background: #fff; border-radius: 18px;
      width: 100%; max-width: 460px;
      box-shadow: 0 20px 56px rgba(26,23,20,0.18);
      overflow: hidden; max-height: 92vh; overflow-y: auto;
      animation: addr-modal-up 0.24s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes addr-modal-up {
      from { opacity: 0; transform: translateY(16px) scale(.98); }
      to   { opacity: 1; transform: translateY(0)    scale(1);   }
    }

    .addr-modal-header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid #EBE8E2;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .addr-modal-badge {
      font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
      letter-spacing: 0.11em; text-transform: uppercase; color: #2A6B4F;
      background: #E8F3EE; padding: 3px 9px; border-radius: 100px;
      margin-bottom: 8px; display: inline-block;
    }
    .addr-modal-title {
      font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700;
      color: #1A1714; margin: 0; letter-spacing: -0.015em; line-height: 1.25;
    }
    .addr-modal-close {
      width: 34px; height: 34px; border-radius: 8px;
      border: 1px solid #E4E0D8; background: #F7F5F0;
      cursor: pointer; color: #A09B96; font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.14s; flex-shrink: 0; margin-top: 1px;
    }
    .addr-modal-close:hover { background: #1A1714; color: #fff; border-color: #1A1714; }

    .addr-modal-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 16px; }

    /* Two-column grid inside modal */
    .addr-modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 420px) { .addr-modal-grid-2 { grid-template-columns: 1fr; } }

    .addr-modal-label {
      font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 600;
      letter-spacing: 0.09em; text-transform: uppercase; color: #A09B96;
      margin-bottom: 7px; display: block;
    }

    .addr-modal-input, .addr-modal-select {
      width: 100%; padding: 12px 15px;
      border: 1.5px solid #E4E0D8; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
      color: #1A1714; background: #FAFAF8; outline: none;
      transition: border-color 0.14s, box-shadow 0.14s, background 0.14s;
      box-sizing: border-box;
    }
    .addr-modal-input::placeholder { color: #C8C4BE; }
    .addr-modal-input:focus, .addr-modal-select:focus {
      border-color: #2A6B4F; background: #fff;
      box-shadow: 0 0 0 3px rgba(42,107,79,0.09);
    }
    .addr-modal-input.err, .addr-modal-select.err { border-color: #C0392B; }
    .addr-modal-input.err:focus, .addr-modal-select.err:focus {
      box-shadow: 0 0 0 3px rgba(192,57,43,0.09);
    }
    .addr-modal-err {
      font-family: 'DM Sans', sans-serif; font-size: 11.5px;
      font-weight: 500; color: #C0392B; margin-top: 5px;
    }

    /* Checkbox row */
    .addr-modal-check-row {
      display: flex; align-items: center; gap: 9px;
      padding: 12px 15px; border: 1.5px solid #E4E0D8;
      border-radius: 10px; background: #FAFAF8; cursor: pointer;
      transition: border-color 0.14s, background 0.14s;
    }
    .addr-modal-check-row:hover { border-color: #2A6B4F; background: #fff; }
    .addr-modal-check-row input[type="checkbox"] {
      width: 15px; height: 15px; accent-color: #2A6B4F; cursor: pointer;
    }
    .addr-modal-check-label {
      font-family: 'DM Sans', sans-serif; font-size: 13.5px;
      font-weight: 500; color: #1A1714; cursor: pointer; user-select: none;
    }

    /* Footer buttons */
    .addr-modal-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }

    .addr-modal-btn-cancel {
      padding: 12px; border: 1.5px solid #E4E0D8; border-radius: 10px;
      background: transparent; color: #6B6660;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
      cursor: pointer; transition: all 0.13s;
    }
    .addr-modal-btn-cancel:hover { background: #F7F5F0; color: #1A1714; }

    .addr-modal-btn-submit {
      padding: 12px; border: none; border-radius: 10px;
      background: #1A1714; color: #fff;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
      letter-spacing: 0.01em; cursor: pointer;
      transition: background 0.13s, transform 0.13s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      box-shadow: 0 4px 12px rgba(26,23,20,0.16);
    }
    .addr-modal-btn-submit:hover:not(:disabled) { background: #2E2B28; transform: translateY(-1px); }
    .addr-modal-btn-submit:active  { transform: translateY(0); }
    .addr-modal-btn-submit:disabled { opacity: 0.48; cursor: not-allowed; transform: none; }

    /* Delete confirm modal specifics */
    .addr-delete-icon {
      width: 54px; height: 54px; border-radius: 13px;
      background: #FDECEA; color: #C0392B; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 14px;
    }
    .addr-delete-preview {
      background: #F7F5F0; border: 1px solid #E4E0D8;
      border-radius: 10px; padding: 14px 16px; text-align: left; margin: 14px 0;
    }
    .addr-delete-preview p {
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      color: #6B6660; margin: 0; line-height: 1.7;
    }
  `;
    document.head.appendChild(style);
}