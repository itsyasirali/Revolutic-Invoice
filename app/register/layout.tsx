import type { ReactNode } from "react";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta("Create Your Account", "Create your free InvoiceSmarty account and send your first invoice in minutes.", "/register");

const Layout = ({ children }: { children: ReactNode }) => <>{children}</>;

export default Layout;
