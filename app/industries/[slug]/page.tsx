import React from "react";
import { notFound } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import DetailHero from "@/components/ui/blocks/DetailHero";
import Article from "@/components/ui/blocks/Article";
import Context from "@/components/ui/blocks/Context";
import Cta from "@/components/ui/blocks/Cta";
import Container from "@/components/layout/container";
import industries from "@/data/industries/industries";

interface IndustryDetailPageProps {
  params: Promise<{ slug: string }>;
}

const IndustryDetailPage = async ({ params }: IndustryDetailPageProps) => {
  const { slug } = await params;
  const item = industries.find((i) => i.slug === slug);

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
        <Context currentItem={item} allItems={industries} baseRoute="industries" />
        <Cta />
      </div>
    </MarketingLayout>
  );
};

export default IndustryDetailPage;
