import React from "react";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import DetailHero from "@/components/ui/blocks/DetailHero";
import Article from "@/components/ui/blocks/Article";
import Context from "@/components/ui/blocks/Context";
import Cta from "@/components/ui/blocks/Cta";
import Container from "@/components/layout/container";
import posts from "@/data/blog/posts";

interface ResourceDetailPageProps {
  params: Promise<{ slug: string }>;
}

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
        <Cta />
      </div>
    </MarketingLayout>
  );
};

export default ResourceDetailPage;
