"use client";

import { useState } from "react";
import type {
  UseResourceListProps,
  UseResourceListReturn,
} from "@/types/resource";

const useResourceList = ({
  items,
}: UseResourceListProps): UseResourceListReturn => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter out the featured post from the grid if it's currently at the top
  const regularItems = items.filter((item) => !item.featured);

  const filteredItems =
    activeCategory === "All"
      ? regularItems
      : regularItems.filter((item) => item.category === activeCategory);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(6); // Reset pagination on filter change
  };

  return {
    activeCategory,
    handleCategoryChange,
    displayedItems,
    filteredItems,
    hasMore,
    handleLoadMore,
  };
};

export default useResourceList;
