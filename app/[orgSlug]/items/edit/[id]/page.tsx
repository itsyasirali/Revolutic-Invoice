import ItemForm from "@/components/Items/ItemForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Item", "Update this item's name, unit, selling price and description.");


const EditItemPage = () => <ItemForm />;

export default EditItemPage;
