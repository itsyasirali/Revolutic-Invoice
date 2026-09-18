import React from "react";
import Container from "@/components/layout/container";
import Card from "@/components/ui/blocks/ResourceCard";
import type { ContextProps } from "@/types/resource";

const Context = ({ currentItem, allItems, baseRoute }: ContextProps) => {
  // Find 3 other items, preferably in the same category, or just other recent items
  let Context = allItems.filter(
    (item) =>
      item.category === currentItem.category && item.id !== currentItem.id,
  );

  // If we don't have 3 in the same category, fill it up with others
  if (Context.length < 3) {
    const others = allItems.filter(
      (item) =>
        item.id !== currentItem.id && !Context.find((r) => r.id === item.id),
    );
    Context = [...Context, ...others].slice(0, 3);
  } else {
    Context = Context.slice(0, 3);
  }

  return (
    <section className="py-16">
      <Container>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-10">
          Read more
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Context.map((item) => (
            <Card key={item.id} item={item} baseRoute={baseRoute} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Context;
