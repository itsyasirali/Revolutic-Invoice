import type { ReactNode } from "react";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Forgot Password", "Enter your email and we will send you a link to reset your password.");

const Layout = ({ children }: { children: ReactNode }) => <>{children}</>;

export default Layout;
