"use client";

import { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/hooks/auth/useProfile";
import axios from "@/lib/axios";

export type TabType = "personal" | "security";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  bio: string;
  companyName: string;
  taxId: string;
  currency: string;
  address: string;
  website: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  emailNotifications: boolean;
  weeklyReports: boolean;
}

export interface ProfileAlertState {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

export const useProfileView = () => {
  const { user, loading: fetchLoading, refetch } = useProfile();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    bio: "",
    companyName: "",
    taxId: "",
    currency: "PKR",
    address: "",
    website: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    weeklyReports: false,
  });

  const [alert, setAlert] = useState<ProfileAlertState>({
    show: false,
    type: "info",
    message: "",
  });

  const dismissAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, show: false }));
  }, []);

  // Sync profile data from hook into form state
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || user.firstName || "").split(" ");
      const fName = user.firstName || nameParts[0] || "";
      const lName = user.lastName || nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        firstName: fName,
        lastName: lName,
        email: user.email || "",
        companyName: user.companyName || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUpdatingPassword = Boolean(formData.newPassword);

    if (activeTab === "security") {
      if (!formData.newPassword) {
        setAlert({
          show: true,
          type: "error",
          message: "Please enter a new password to update.",
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setAlert({
          show: true,
          type: "error",
          message: "New password and confirm password do not match.",
        });
        return;
      }
    }

    try {
      setSaving(true);
      const payload: Record<string, any> = {
        name: formData.firstName.trim(),
        email: formData.email.trim(),
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const response = await axios.put("/auth/profile", payload);

      await refetch();

      const successText = isUpdatingPassword
        ? "Password updated successfully!"
        : "Profile updated successfully!";

      setAlert({
        show: true,
        type: "success",
        message: response.data?.message || successText,
      });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      const errorMsg = err.response?.data?.message || "Failed to update profile. Please try again.";
      setAlert({
        show: true,
        type: "error",
        message: String(errorMsg),
      });
    } finally {
      setSaving(false);
    }
  };

  const userFullName =
    `${formData.firstName} ${formData.lastName}`.trim() || user?.name || "User Profile";
  const userInitial = (formData.firstName || userFullName || "U").charAt(0).toUpperCase();

  return {
    user,
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
  };
};

export default useProfileView;
