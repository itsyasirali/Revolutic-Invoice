"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { portalGet, portalSend, errorText } from "@/lib/portalApi";
import { Eye, EyeOff, FileText, CreditCard, ClipboardCheck, FolderKanban, FileDown, MessageSquare } from "lucide-react";
import AuthLayout, { type AuthPanelContent } from "@/components/auth/AuthLayout";
import { Button, Input } from "@/components/ui";
import { ErrorNote } from "./PortalUI";

const PORTAL_CONTENT: AuthPanelContent = {
  eyebrow: "Customer portal",
  headline: ["Your invoices.", "One secure place."],
  text: "Review quotes, pay invoices and keep track of every payment and project with your supplier, any time you need.",
  stats: [
    { value: "Quotes", label: "Review & approve" },
    { value: "Invoices", label: "View & pay online" },
    { value: "Statements", label: "Download any time" },
  ],
  features: [
    { icon: FileText, title: "View Invoices", text: "See what you owe and what is paid." },
    { icon: ClipboardCheck, title: "Approve Quotes", text: "Accept or decline in a click." },
    { icon: CreditCard, title: "Payment History", text: "Every payment, receipt and balance." },
    { icon: FolderKanban, title: "Projects", text: "Follow progress on your projects." },
    { icon: FileDown, title: "Statements & Documents", text: "Download PDFs whenever you need." },
    { icon: MessageSquare, title: "Comments", text: "Message your supplier on any document." },
  ],
};

/** Same two-column layout and heading style as the main /login page. */
const AuthFrame: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <AuthLayout content={PORTAL_CONTENT}>
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl xl:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm xl:text-base text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  </AuthLayout>
);

/** Password input with the show/hide eye, as on /login. */
const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
}> = ({ value, onChange, placeholder, autoComplete, minLength }) => {
  const [show, setShow] = useState(false);
  return (
    <Input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      minLength={minLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      showLabel={false}
      fullWidth
      suffix={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
          aria-label="Toggle password visibility"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
};

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
    <AuthFrame title="Sign in" subtitle="to access your customer portal">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNote message={error} />}
        <Input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          showLabel={false}
          fullWidth
        />
        <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" />
        <div className="flex justify-end py-1">
          <Link
            href="/portal/forgot-password"
            className="text-sm xl:text-[15px] font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" disabled={busy} loading={busy} variant="primary" fullWidth className="mt-2">
          {busy ? "Processing..." : "Sign in"}
        </Button>
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
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          showLabel={false}
          fullWidth
        />
        <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="new-password" minLength={8} />
        <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm password" autoComplete="new-password" />
        <Button type="submit" disabled={busy} loading={busy} variant="primary" fullWidth className="mt-4">
          {busy ? "Processing..." : "Create account"}
        </Button>
      </form>
    </AuthFrame>
  );
};

const BackToSignIn: React.FC = () => (
  <p className="mt-6 text-center text-sm xl:text-[15px] text-slate-500">
    Remembered it?{" "}
    <Link href="/portal/login" className="font-semibold text-primary hover:underline hover:text-primary/80">
      Back to sign in
    </Link>
  </p>
);

/** Step 1: ask for a reset link. The answer is the same whether or not the email has an account. */
export const PortalForgotPassword: React.FC = () => {
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

  if (sent) {
    return (
      <AuthFrame title="Check your email" subtitle={`We sent instructions to ${email}`}>
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md font-medium">
          If that email has a customer portal account, a link to reset the password is on its way. It expires in 1 hour,
          so please use it soon.
        </div>
        <p className="mt-4 text-sm xl:text-[15px] text-slate-500">
          Nothing arrived? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-medium text-primary hover:underline cursor-pointer"
          >
            try again
          </button>
          . You can also ask your supplier to send a new invitation.
        </p>
        <BackToSignIn />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Forgot password?" subtitle="Enter your email and we'll send you a link to reset your password">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNote message={error} />}
        <Input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          showLabel={false}
          fullWidth
        />
        <Button type="submit" disabled={busy} loading={busy} variant="primary" fullWidth className="mt-2">
          {busy ? "Processing..." : "Send reset link"}
        </Button>
      </form>
      <BackToSignIn />
    </AuthFrame>
  );
};

/** Step 2: the emailed link. Checks the token, then sets the new password and signs the customer in. */
export const PortalResetPassword: React.FC = () => {
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

  if (invalid) {
    return (
      <AuthFrame title="Link unavailable" subtitle="Reset links work once and expire after 1 hour.">
        <ErrorNote message={invalid} />
        <Button variant="primary" fullWidth className="mt-4" asChild>
          <Link href="/portal/forgot-password">Request a new link</Link>
        </Button>
        <BackToSignIn />
      </AuthFrame>
    );
  }
  if (email === null) {
    return (
      <AuthFrame title="Reset password">
        <p className="text-sm text-slate-500">Checking your link...</p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Reset password" subtitle={`Choose a new password for ${email}`}>
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNote message={error} />}
        <PasswordInput value={password} onChange={setPassword} placeholder="New password" autoComplete="new-password" minLength={8} />
        <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm new password" autoComplete="new-password" />
        <p className="text-xs xl:text-sm text-slate-500">Use at least 8 characters.</p>
        <Button type="submit" disabled={busy} loading={busy} variant="primary" fullWidth className="mt-2">
          {busy ? "Processing..." : "Reset password"}
        </Button>
      </form>
      <BackToSignIn />
    </AuthFrame>
  );
};
