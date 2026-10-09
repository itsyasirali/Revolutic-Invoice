/** Shared open/close animation for dropdown panels: reveals top to bottom, closes bottom to top. */
export const DROPDOWN_BASE = "transition-all duration-300 ease-in-out";

// Full class names must appear literally so Tailwind can find them.
const OPEN = "opacity-100 visible [clip-path:inset(0_-24px_-24px_-24px)]";
const CLOSED = "opacity-0 invisible pointer-events-none [clip-path:inset(0_-24px_100%_-24px)]";
const OPEN_WIDE = "opacity-100 visible [clip-path:inset(0_-400px_-400px_-400px)]";
const CLOSED_WIDE = "opacity-0 invisible pointer-events-none [clip-path:inset(0_-400px_100%_-400px)]";

/**
 * `wide` is for panels that hold side submenus: the reveal clip must not cut them
 * off, so it extends far beyond the panel's own edges.
 */
export const dropdownAnim = (open: boolean, wide = false): string =>
  wide ? (open ? OPEN_WIDE : CLOSED_WIDE) : open ? OPEN : CLOSED;
