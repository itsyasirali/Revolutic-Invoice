import React from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

// Business replies may carry basic formatting (bold, italic, underline); customer
// comments and older comments are plain text.
const looksLikeHtml = (m: string) => /<\/?[a-z][^>]*>/i.test(m);

/** Shows a comment's text: formatted HTML (sanitized) or plain text with line breaks kept. */
export const CommentBody: React.FC<{ message: string; className?: string }> = ({ message, className = "" }) =>
  looksLikeHtml(message) ? (
    <div
      className={`[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
    />
  ) : (
    <p className={`whitespace-pre-wrap ${className}`}>{message}</p>
  );

export default CommentBody;
