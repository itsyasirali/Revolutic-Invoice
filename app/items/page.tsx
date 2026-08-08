import { Suspense } from "react";
import ItemList from "@/components/Items/ItemList";

const ItemsPage = () => (
  <Suspense fallback={null}>
    <ItemList />
  </Suspense>
);

export default ItemsPage;
