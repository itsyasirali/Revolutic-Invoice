import React from "react";
import TableSkeleton from "@/components/ui/TableSkeleton";

const Loading = () => {
  return <TableSkeleton title="Loading..." columns={5} rows={6} />;
};

export default Loading;
