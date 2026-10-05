import InvoiceEmailCompose from "@/components/Invoices/InvoiceEmailCompose";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Email Invoice", "Compose and send this invoice to your customer by email.");


export default function InvoiceEmailPage() {
  return <InvoiceEmailCompose />;
}
