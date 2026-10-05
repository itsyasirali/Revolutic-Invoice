import ResourceDetailPage from "../../resources/[slug]/page";
import type { Metadata } from "next";
import { articleMeta } from "@/lib/pageMeta";
import posts from "@/data/blog/posts";

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
  const { slug } = await params;
  const item = posts.find((x) => x.slug === slug);
  if (!item) return { title: "Not Found", robots: { index: false } };
  return articleMeta(item, `/blog/${slug}`);
};


export default ResourceDetailPage;
