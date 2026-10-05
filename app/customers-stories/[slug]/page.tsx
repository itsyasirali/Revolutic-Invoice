import React from "react";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import DetailHero from "@/components/ui/blocks/DetailHero";
import Article from "@/components/ui/blocks/Article";
import Context from "@/components/ui/blocks/Context";
import Cta from "@/components/ui/blocks/Cta";
import Container from "@/components/layout/container";
import customers from "@/data/customers/customers";
import type { CustomerStoryDetailPageProps } from "@/types/resource";
import type { Metadata } from "next";
import { articleMeta } from "@/lib/pageMeta";

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params;
  const item = customers.find((x) => x.slug === slug);
  if (!item) return { title: "Not Found", robots: { index: false } };
  return articleMeta(item, `/customers-stories/${slug}`);
};


const CustomerStoryDetailPage = async ({ params }: CustomerStoryDetailPageProps) => {
  const { slug } = await params;
  const item = customers.find((c) => c.slug === slug);

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
        <Context currentItem={item} allItems={customers} baseRoute="customers-stories" />
        <Cta />
      </div>
    </MarketingLayout>
  );
};

export default CustomerStoryDetailPage;
