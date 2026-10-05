import ExpenseList from "@/components/Expenses/ExpenseList";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Expenses", "Record and review business expenses, and bill the billable ones to customers.");


const ExpensesPage = () => <ExpenseList />;

export default ExpensesPage;
