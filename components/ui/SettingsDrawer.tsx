"use client";

import React, { useState } from "react";
import { X, Settings } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import FileUpload from "./FileUpload";

export interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "general" | "organization" | "branding"
  >("general");
  const [orgName, setOrgName] = useState("My Company");
  const [, setLogo] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 text-primary rounded-md">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Settings</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "general"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("organization")}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "organization"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Organization
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "general" && (
              <div className="space-y-4">
                <Input
                  label="Organization Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
            )}

            {activeTab === "organization" && (
              <div className="space-y-4">
                <FileUpload
                  label="Organization Logo"
                  onFileSelect={(file) => setLogo(URL.createObjectURL(file))}
                  onFileRemove={() => setLogo(null)}
                />
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <Button onClick={onClose} variant="outline" size="sm">
              Cancel
            </Button>
            <Button onClick={onClose} variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;
