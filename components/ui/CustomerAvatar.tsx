import React from "react";

/**
 * Round first-letter avatar for a customer, in the primary colour. Used wherever a
 * customer is picked or listed so they all look the same.
 */
export const CustomerAvatar: React.FC<{ name?: string | null; size?: "md" | "lg" }> = ({ name, size = "md" }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white ${
      size === "lg" ? "h-10 w-10 text-base" : "h-9 w-9 text-sm"
    }`}
  >
    {(name || "?").trim().charAt(0).toUpperCase() || "?"}
  </div>
);

export default CustomerAvatar;
