const ALLOWED = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "a", "span",
  "h1", "h2", "h3", "h4", "blockquote", "pre", "code",
]);

const safeHref = (attrs: string): string | null => {
  const m = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const href = (m?.[1] ?? m?.[2] ?? "").trim();
  return /^(https?:|mailto:|tel:)/i.test(href) ? href.replace(/"/g, "&quot;") : null;
};

/**
 * Small allow-list sanitizer for rich-text (Quill) output. Keeps basic
 * formatting tags, drops every attribute except a safe <a href>, and removes
 * script/style blocks. Works on the server and in the browser.
 */
/**
 * Strips ALL HTML tags, script/style blocks, comments and HTML entities'
 * angle brackets from a plain-text field (e.g. names, free-text inputs)
 * to prevent stored XSS when the value is later rendered in the UI.
 */
export const sanitizePlainText = (value: string | null | undefined): string => {
  if (!value) return "";
  return String(value)
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
};

export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (_m, slash, tag, attrs) => {
      const name = String(tag).toLowerCase();
      if (!ALLOWED.has(name)) return "";
      if (slash) return `</${name}>`;
      if (name === "a") {
        const href = safeHref(attrs);
        return href
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer">`
          : "<a>";
      }
      return `<${name}>`;
    });
};
