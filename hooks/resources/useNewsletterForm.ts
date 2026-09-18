"use client";

import { useState } from "react";
import type { UseNewsletterFormReturn } from "@/types/resource";

const useNewsletterForm = (): UseNewsletterFormReturn => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return {
    subscribed,
    email,
    setEmail,
    handleSubmit,
  };
};

export default useNewsletterForm;
