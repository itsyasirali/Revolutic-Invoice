"use client";

import React from "react";
import { User, Lock, Save, Camera, Mail, ShieldCheck } from "lucide-react";
import {
  PageHeader,
  Input,
  Button,
  AlertModal,
  LoadingSpinner,
} from "@/components/ui";
import useProfileView, { type TabType } from "@/hooks/profile/useProfileView";

const Profile: React.FC = () => {
  const {
    fetchLoading,
    activeTab,
    setActiveTab,
    saving,
    formData,
    alert,
    dismissAlert,
    handleChange,
    handleSave,
    userFullName,
    userInitial,
  } = useProfileView();

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader title="My Account & Profile" />

      <AlertModal
        isOpen={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={dismissAlert}
      />

      <form onSubmit={handleSave} className="flex-1 flex flex-col">
        <div className="flex-1 py-8 px-8 max-w-3xl">
          {/* User Header Info - Left Aligned */}
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
            <div className="relative group cursor-pointer shrink-0">
              <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center text-white font-bold text-2xl shadow-sm group-hover:opacity-90 transition-all">
                {userInitial}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-900">
                  {userFullName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} />
                  Active Account
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                {formData.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* Tab Switcher - Left Aligned */}
          <div className="flex border-b border-gray-200 mb-8 gap-4">
            {[
              { id: "personal", label: "Personal Details", icon: User },
              { id: "security", label: "Security", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Fields */}
          {activeTab === "personal" && (
            <div className="flex flex-col gap-y-6">
              <Input
                type="text"
                name="firstName"
                label="Name"
                placeholder="Enter full name"
                value={formData.firstName}
                onChange={handleChange}
                required
                fullWidth
              />

              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
            </div>
          )}

          {activeTab === "security" && (
            <div className="flex flex-col gap-y-6">
              <Input
                type="password"
                name="currentPassword"
                label="Current Password"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                fullWidth
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  type="password"
                  name="newPassword"
                  label="New Password"
                  placeholder="Minimum 8 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  fullWidth
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer - Left Aligned */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-4 flex justify-start gap-3 z-10">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            size="md"
            loading={saving}
            icon={<Save size={16} />}
            className="cursor-pointer"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
