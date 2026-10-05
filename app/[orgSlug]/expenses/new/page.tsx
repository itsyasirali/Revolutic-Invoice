import ExpenseForm from "@/components/Expenses/ExpenseForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Expense", "Record an expense with category, vendor, tax, payment details and an attachment.");


const ExpenseFormPage = () => <ExpenseForm />;

export default ExpenseFormPage;
