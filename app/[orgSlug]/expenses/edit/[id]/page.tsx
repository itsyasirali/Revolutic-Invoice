import ExpenseForm from "@/components/Expenses/ExpenseForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Expense", "Update this expense's amount, category, vendor and attachment.");


const ExpenseFormPage = () => <ExpenseForm />;

export default ExpenseFormPage;
