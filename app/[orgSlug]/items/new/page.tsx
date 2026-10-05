import ItemForm from "@/components/Items/ItemForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Item", "Add a product or service with its unit, selling price and description.");


const NewItemPage = () => <ItemForm />;

export default NewItemPage;
