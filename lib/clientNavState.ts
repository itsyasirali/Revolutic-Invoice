// React Router's <Link state> / navigate(path, { state }) has no App Router
// equivalent (next/navigation's router.push has no state option). Several
// list -> detail/edit page transitions relied on that state to avoid an
// extra fetch (there is often no GET-by-id endpoint on the backend at all).
// This sessionStorage-backed helper is the closest same-tab, no-extra-request
// substitute, keeping that behavior intact.

export const setNavState = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`nav-state:${key}`, JSON.stringify(value));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
};

export const getNavState = <T,>(key: string): T | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(`nav-state:${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};
