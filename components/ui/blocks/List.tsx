"use client";

import React from "react";
import Container from "@/components/layout/container";
import Card from "@/components/ui/blocks/ResourceCard";
import Button from "@/components/ui/Button";
import type { ListProps } from "@/types/resource";
import useResourceList from "@/hooks/resources/useResourceList";

const List = ({
  title,
  description,
  items,
  categories,
  baseRoute,
}: ListProps) => {
  const {
    activeCategory,
    handleCategoryChange,
    displayedItems,
    filteredItems,
    hasMore,
    handleLoadMore,
  } = useResourceList({ items });

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 font-medium">{description}</p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-5 py-2.5 cursor-pointer rounded-md text-sm font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedItems.map((item) => (
            <Card key={item.id} item={item} baseRoute={baseRoute} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-slate-500 font-medium">
            No items found in this category.
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-16 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              className="rounded-full px-8 font-semibold h-12"
            >
              Load more
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default List;
