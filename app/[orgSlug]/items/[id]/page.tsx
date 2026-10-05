import ItemSplitView from "@/components/Items/ItemSplitView";
import fetchItemsForUser from "@/lib/services/itemsService";
import { getServerSessionUser } from "@/lib/session";

const ItemDetailsPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const items = user?.id ? await fetchItemsForUser(Number(user.id), orgId) : [];

  return <ItemSplitView initialItems={items} />;
};

export default ItemDetailsPage;
