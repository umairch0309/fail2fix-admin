"use client";

import { useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/paginated-list";

export function useListPagination(initialPage = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(initialPage);

  return {
    page,
    limit: pageSize,
    setPage,
    resetPage: () => setPage(1),
  };
}
