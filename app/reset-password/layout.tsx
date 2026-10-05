import type { ReactNode } from "react";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Reset Password", "Choose a new password for your InvoiceSmarty account.");

const Layout = ({ children }: { children: ReactNode }) => <>{children}</>;

export default Layout;
