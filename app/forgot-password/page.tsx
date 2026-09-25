"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Input } from "@/components/ui";
import useForgotPasswordForm from "@/hooks/auth/useForgotPasswordForm";
import useAuthRedirect from "@/hooks/auth/useAuthRedirect";

const ForgotPasswordPage = () => {
  useAuthRedirect("login");
  const { email, setEmail, loading, error, submitted, handleSubmit } =
    useForgotPasswordForm();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="relative z-10 w-full max-w-md bg-white rounded-md shadow-2xl shadow-slate-300/40 border border-slate-100 p-8 sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
            <Image
              src="/assets/InvoiceSmartyIcon.png"
              alt="InvoiceSmarty"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              Invoice<span className="text-primary">Smarty</span>
            </span>
          </div>
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Forgot Password?
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md font-medium">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md font-medium">
            If that email exists, a password reset link has been sent. Please
            check your inbox.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              showLabel={false}
              fullWidth
            />
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              variant="primary"
              fullWidth
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline hover:text-primary/80 font-semibold ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
