// Shared password rule used both client-side (immediate feedback) and
// server-side (source of truth) for signup and password reset.
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Returns a human-readable error message if the password is invalid,
 * or null if the password satisfies the rule:
 * - at least 8 characters
 * - at least one letter
 * - at least one number
 */
export const validatePassword = (password: string | undefined | null): string | null => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Password must contain at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
};
