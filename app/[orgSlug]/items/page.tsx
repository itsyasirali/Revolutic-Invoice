import ItemList from "@/components/Items/ItemList";
import fetchItemsForUser from "@/lib/services/itemsService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Items", "Manage the products and services you sell, with their units and selling prices.");


const ItemsPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const items = user?.id ? await fetchItemsForUser(Number(user.id), orgId) : [];

  return <ItemList initialItems={items} />;
};

export default ItemsPage;
