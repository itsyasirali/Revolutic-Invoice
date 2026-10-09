import CustomerStatementEmail from "@/components/customer/CustomerStatementEmail";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Email Statement", "Compose and send this customer's statement of account by email.");

export default function CustomerStatementEmailPage() {
  return <CustomerStatementEmail />;
}
