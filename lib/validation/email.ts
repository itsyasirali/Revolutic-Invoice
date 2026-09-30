// Shared email format rule for client-side feedback and server-side enforcement.
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const isValidEmail = (email: string | undefined | null): boolean =>
  !!email && email.length <= 254 && EMAIL_REGEX.test(email.trim());
