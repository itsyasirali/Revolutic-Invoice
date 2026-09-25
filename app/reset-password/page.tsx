"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@/components/ui";
import useResetPasswordForm from "@/hooks/auth/useResetPasswordForm";
import useAuthRedirect from "@/hooks/auth/useAuthRedirect";

const ResetPasswordContent = () => {
  useAuthRedirect("login");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    handleSubmit,
  } = useResetPasswordForm(token, email);

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
          Reset Password
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Choose a new password for your account.
        </p>

        {!token || !email ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-medium">
            This reset link is invalid or missing required information. Please
            request a new one from the{" "}
            <Link href="/forgot-password" className="underline font-semibold">
              forgot password
            </Link>{" "}
            page.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md font-medium">
                {error}
              </div>
            )}

            {success ? (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md font-medium">
                Your password has been reset successfully. Redirecting you to
                sign in...
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
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showLabel={false}
                  fullWidth
                  helperText="At least 8 characters, with a letter and a number."
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  showLabel={false}
                  fullWidth
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  fullWidth
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </>
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

const ResetPasswordPage = () => (
  <Suspense fallback={null}>
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPasswordPage;
