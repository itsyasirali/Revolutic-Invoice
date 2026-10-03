"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { portalGet, portalSend, errorText } from "@/lib/portalApi";
import { ErrorNote, fieldClass, primaryBtn } from "./PortalUI";

const AuthFrame: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-[400px]">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h1 className="text-[24px] leading-[28px] font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] leading-5 text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-4 text-center text-[12px] text-slate-400">Secure customer portal</p>
    </div>
  </div>
);

export const PortalLogin: React.FC = () => {
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

  return (
    <AuthFrame title="Sign in" subtitle="Access your quotes, invoices and payments.">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNote message={error} />}
        <label className="block">
          <span className="text-[13px] font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            className={`${fieldClass} mt-1.5`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            className={`${fieldClass} mt-1.5`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-[12px] text-slate-500 text-center">
          Forgot your password? Ask your supplier to send a new invitation link.
        </p>
      </form>
    </AuthFrame>
  );
};

export const PortalAccept: React.FC = () => {
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

  if (invalid) {
    return (
      <AuthFrame title="Invitation unavailable">
        <ErrorNote message={invalid} />
      </AuthFrame>
    );
  }
  if (!info) {
    return (
      <AuthFrame title="Welcome">
        <p className="text-[14px] text-slate-500">Checking your invitation...</p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title={`Welcome to ${info.portalName || "the portal"}`}
      subtitle={`Create a password for ${info.email} to get started.`}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNote message={error} />}
        <label className="block">
          <span className="text-[13px] font-medium text-slate-700">Your name</span>
          <input className={`${fieldClass} mt-1.5`} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={`${fieldClass} mt-1.5`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-slate-700">Confirm password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            className={`${fieldClass} mt-1.5`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthFrame>
  );
};
