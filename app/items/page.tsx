import { Suspense } from "react";
import ItemList from "@/components/Items/ItemList";
import TableSkeleton from "@/components/ui/TableSkeleton";

const ItemsPage = () => (
  <Suspense fallback={<TableSkeleton title="All Items" columns={5} rows={6} />}>
    <ItemList />
  </Suspense>
);

export default ItemsPage;
