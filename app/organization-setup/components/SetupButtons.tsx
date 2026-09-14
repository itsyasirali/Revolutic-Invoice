import React from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui";
import type { SetupButtonsProps } from "@/types/organization";

export const SetupButtons: React.FC<SetupButtonsProps> = ({
  loading = false,
  onBack,
  submitText = "Get Started",
  backText = "Go Back",
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      {/* Primary & Secondary Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 sm:px-7 rounded-lg bg-primary hover:bg-primary/90 active:bg-primary/95 text-white font-medium text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingSpinner size="xs" color="white" />
              <span>Saving...</span>
            </>
          ) : (
            submitText
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="h-11 px-5 sm:px-6 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {backText}
        </button>
      </div>

      {/* Privacy Policy Link */}
      <Link
        href="/privacy"
        className="text-slate-600 hover:text-slate-900 underline text-sm transition-colors self-center sm:self-auto"
      >
        Privacy Policy
      </Link>
    </div>
  );
};

export default SetupButtons;
