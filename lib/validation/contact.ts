// Shared email/phone validation used both client-side (immediate feedback)
// and server-side (source of truth) across organization and customer forms.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allows digits with optional leading +, spaces and dashes for formatting.
const PHONE_ALLOWED_CHARS_REGEX = /^\+?[0-9\s-]+$/;

export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

/**
 * Returns a human-readable error message if the email is invalid,
 * or null if it is valid (or empty, since email is often optional).
 */
export const validateEmail = (
  email: string | undefined | null,
  { required = false }: { required?: boolean } = {},
): string | null => {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return required ? "Email is required" : null;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address";
  }
  return null;
};

/**
 * Returns a human-readable error message if the phone number is invalid,
 * or null if it is valid (or empty, since phone is often optional).
 * A valid phone number contains only digits with optional leading '+',
 * spaces, and dashes, and has between PHONE_MIN_DIGITS and
 * PHONE_MAX_DIGITS digits.
 */
export const validatePhone = (
  phone: string | undefined | null,
  { required = false }: { required?: boolean } = {},
): string | null => {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return required ? "Phone number is required" : null;
  }
  if (!PHONE_ALLOWED_CHARS_REGEX.test(trimmed)) {
    return "Phone number can only contain digits, spaces, dashes and a leading +";
  }
  const digitCount = trimmed.replace(/[^0-9]/g, "").length;
  if (digitCount < PHONE_MIN_DIGITS || digitCount > PHONE_MAX_DIGITS) {
    return `Phone number must be between ${PHONE_MIN_DIGITS} and ${PHONE_MAX_DIGITS} digits`;
  }
  return null;
};

/** Strips characters that are not digits, '+', spaces or dashes, as the user types. */
export const sanitizePhoneInput = (value: string): string => {
  return value.replace(/[^0-9+\s-]/g, "");
};
