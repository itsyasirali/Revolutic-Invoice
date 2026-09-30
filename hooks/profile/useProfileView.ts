"use client";

import { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/hooks/auth/useProfile";
import axios from "@/lib/axios";
import { validatePassword } from "@/lib/validation/password";
import { isValidEmail } from "@/lib/validation/email";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
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

    const nextErrors: Record<string, string> = {};

    if (activeTab === "personal") {
      if (!formData.firstName.trim()) {
        nextErrors.firstName = "Name is required";
      }
      if (!isValidEmail(formData.email)) {
        nextErrors.email = "Please enter a valid email address";
      }
    } else {
      if (!formData.currentPassword) {
        nextErrors.currentPassword = "Current password is required";
      }
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        nextErrors.newPassword = passwordError;
      } else if (formData.newPassword === formData.currentPassword) {
        nextErrors.newPassword =
          "New password must be different from the current password";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        nextErrors.confirmPassword =
          "New password and confirm password do not match";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSaving(true);
      const payload: Record<string, any> =
        activeTab === "personal"
          ? {
              name: formData.firstName.trim(),
              email: formData.email.trim(),
            }
          : {};

      if (activeTab === "security") {
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAlert({ show: true, type: "error", message: "Please select an image file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAlert({ show: true, type: "error", message: "Image must be 2MB or smaller." });
      return;
    }

    try {
      setUploadingAvatar(true);
      const body = new FormData();
      body.append("image", file);
      const response = await axios.post("/auth/profile/avatar", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refetch();
      setAlert({
        show: true,
        type: "success",
        message: response.data?.message || "Profile picture updated successfully!",
      });
    } catch (err: any) {
      setAlert({
        show: true,
        type: "error",
        message: String(
          err.response?.data?.message ||
            "Failed to upload profile picture. Please try again.",
        ),
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // The header reflects the last *saved* profile, not unsaved form edits.
  const savedName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "";
  const userFullName = savedName || "User Profile";
  const userInitial = userFullName.charAt(0).toUpperCase();
  const userEmail = user?.email || "";
  const userImage = user?.image || null;

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
    handleAvatarChange,
    uploadingAvatar,
    errors,
    userFullName,
    userInitial,
    userEmail,
    userImage,
  };
};

export default useProfileView;
