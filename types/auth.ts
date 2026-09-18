import type { ReactNode } from "react";
import type { User } from "@/context/AuthContext";

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthWrapperProps {
  children: ReactNode;
  initialUser?: User | null;
}

export interface LoginSignupFormProps {
  onLoginSuccess?: () => void;
  initialMode?: "login" | "signup";
}
