export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  featured?: boolean;
  content: string;
  authorName?: string;
  authorAvatar?: string;
  authorImage?: string;
  date?: string;
  author?: {
    name: string;
    role: string;
    image?: string;
  };
  publishedAt?: string;
  readTime?: string;
}

export interface ArticleProps {
  item: ResourceItem;
}

export interface ContextProps {
  currentItem: ResourceItem;
  allItems: ResourceItem[];
  baseRoute: string;
}

export interface DetailHeroProps {
  item: ResourceItem;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  featuredItem: ResourceItem;
  baseRoute: string;
}

export interface ListProps {
  title: string;
  description: string;
  items: ResourceItem[];
  categories: string[];
  baseRoute: string;
}

export interface ResourceCardProps {
  item: ResourceItem;
  baseRoute: string;
}

export interface ResourceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export interface IndustryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export interface CustomerStoryDetailPageProps {
  params: Promise<{ slug: string }>;
}
