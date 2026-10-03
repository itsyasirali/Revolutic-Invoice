"use client";

import { useEffect, useMemo, useState } from "react";

/** Client-side pagination (lists are filtered client-side because fields are encrypted). */
const usePagination = <T,>(items: T[], pageSize = 10) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    pageItems,
    page,
    setPage,
    pagination: {
      currentPage: page,
      totalPages,
      pageSize,
      totalItems: items.length,
      onPageChange: setPage,
    },
  };
};

export default usePagination;
