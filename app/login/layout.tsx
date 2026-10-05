import type { ReactNode } from "react";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("Log In", "Log in to InvoiceSmarty to manage your invoices, payments, customers and time.", "/login");

const Layout = ({ children }: { children: ReactNode }) => <>{children}</>;

export default Layout;
