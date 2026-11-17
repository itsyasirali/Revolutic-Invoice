"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { portalGet, portalSend, errorText } from "@/lib/portalApi";

export const usePortalLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await portalSend("POST", "/auth/login", { email, password });
      router.replace("/portal");
    } catch (err) {
      setError(errorText(err, "Failed to sign in"));
    } finally {
      setBusy(false);
    }
  };

  return { email, setEmail, password, setPassword, error, busy, submit };
};

export const usePortalAccept = () => {
  const router = useRouter();
  const token = useSearchParams()?.get("token") || "";
  const [info, setInfo] = useState<{ email: string; name?: string | null; portalName?: string } | null>(null);
  const [invalid, setInvalid] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid("This invitation link is missing its token.");
      return;
    }
    portalGet(`/auth/invite?token=${encodeURIComponent(token)}`)
      .then((d) => {
        setInfo(d);
        setName(d.name || "");
      })
      .catch((err) => setInvalid(errorText(err, "This invitation link is invalid or has expired.")));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setBusy(true);
    try {
      await portalSend("POST", "/auth/accept", { token, password, name });
      router.replace("/portal");
    } catch (err) {
      setError(errorText(err, "Failed to create your account"));
    } finally {
      setBusy(false);
    }
  };

  return { info, invalid, name, setName, password, setPassword, confirm, setConfirm, error, busy, submit };
};

export const usePortalForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await portalSend("POST", "/auth/forgot", { email });
      setSent(true);
    } catch (err) {
      setError(errorText(err, "Failed to send the reset link"));
    } finally {
      setBusy(false);
    }
  };

  return { email, setEmail, error, busy, sent, setSent, submit };
};

export const usePortalResetPassword = () => {
  const router = useRouter();
  const token = useSearchParams()?.get("token") || "";
  const [email, setEmail] = useState<string | null>(null);
  const [invalid, setInvalid] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid("This reset link is missing its token.");
      return;
    }
    portalGet(`/auth/invite?token=${encodeURIComponent(token)}`)
      .then((d) => setEmail(d.email))
      .catch(() => setInvalid("This reset link is invalid or has expired."));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setBusy(true);
    try {
      await portalSend("POST", "/auth/accept", { token, password });
      router.replace("/portal");
    } catch (err) {
      setError(errorText(err, "Failed to reset your password"));
    } finally {
      setBusy(false);
    }
  };

  return { email, invalid, password, setPassword, confirm, setConfirm, error, busy, submit };
};
