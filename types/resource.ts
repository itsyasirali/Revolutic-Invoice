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
