/** Shared open/close animation for dropdown panels: reveals top to bottom, closes bottom to top. */
export const DROPDOWN_BASE = "transition-all duration-300 ease-in-out";

export const dropdownAnim = (open: boolean): string =>
  open
    ? "opacity-100 visible [clip-path:inset(0_-24px_-24px_-24px)]"
    : "opacity-0 invisible pointer-events-none [clip-path:inset(0_-24px_100%_-24px)]";
