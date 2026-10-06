import React from "react";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import DetailHero from "@/components/ui/blocks/DetailHero";
import Article from "@/components/ui/blocks/Article";
import Context from "@/components/ui/blocks/Context";
import Container from "@/components/layout/container";
import posts from "@/data/blog/posts";
import type { ResourceDetailPageProps } from "@/types/resource";
import type { Metadata } from "next";
import { articleMeta } from "@/lib/pageMeta";

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params;
  const item = posts.find((x) => x.slug === slug);
  if (!item) return { title: "Not Found", robots: { index: false } };
  return articleMeta(item, `/resources/${slug}`);
};


const ResourceDetailPage = async ({ params }: ResourceDetailPageProps) => {
  const { slug } = await params;
  const item = posts.find((p) => p.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <MarketingLayout>
      <div className="w-full">
        <DetailHero item={item} />
        <section className="py-12">
          <Container>
            <div className="max-w-4xl mx-auto">
              <Article item={item} />
            </div>
          </Container>
        </section>
        <Context currentItem={item} allItems={posts} baseRoute="resources" />
      </div>
    </MarketingLayout>
  );
};

export default ResourceDetailPage;
