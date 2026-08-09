
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
