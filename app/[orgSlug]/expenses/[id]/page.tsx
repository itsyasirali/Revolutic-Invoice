import ExpenseSplitView from "@/components/Expenses/ExpenseSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Expense Details", "Expense overview with amount breakdown, vendor, customer and activity.");


const DetailsPage = () => <ExpenseSplitView />;

export default DetailsPage;
