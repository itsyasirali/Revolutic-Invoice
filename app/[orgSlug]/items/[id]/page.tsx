import ItemSplitView from "@/components/Items/ItemSplitView";
import fetchItemsForUser from "@/lib/services/itemsService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Item Details", "Item overview with sales information and the invoices and quotes that use it.");


const ItemDetailsPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const items = user?.id ? await fetchItemsForUser(Number(user.id), orgId) : [];

  return <ItemSplitView initialItems={items} />;
};

export default ItemDetailsPage;
