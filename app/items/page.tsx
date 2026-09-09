import ItemList from "@/components/Items/ItemList";
import fetchItemsForUser from "@/lib/services/itemsService";
import { getServerSessionUser } from "@/lib/session";

const ItemsPage = async () => {
  const user = await getServerSessionUser();
  const items = user?.id ? await fetchItemsForUser(Number(user.id)) : [];

  return <ItemList initialItems={items} />;
};

export default ItemsPage;
