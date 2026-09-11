import { ResourceItem } from "@/types/resource";

const BlogContent = `
  <p>If you're reading this, you probably already know that WhatsApp is the most popular messaging app in the world. But did you know that businesses are increasingly relying on it to drive sales and support customers? In this guide, we dive deep into the strategies that separate the best from the rest.</p>
  
  <h2>Why WhatsApp Business?</h2>
  <p>The standard WhatsApp application is great for personal use, but as your company scales, you need professional tools. The WhatsApp Business API allows you to integrate messaging directly into your CRM, automate responses, and handle thousands of conversations simultaneously.</p>
  
  <div class="bg-[#f0f9ff] p-6 rounded-xl border border-[#bae6fd] my-8">
    <div class="flex gap-4">
      <div class="text-primary">💡</div>
      <div>
        <h4 class="font-bold text-slate-900 mb-2">Pro Tip</h4>
        <p class="text-sm text-slate-700 m-0">Always ensure you have explicit opt-in from your customers before sending promotional messages on WhatsApp. Failure to do so can result in your number being blocked or banned by Meta.</p>
      </div>
    </div>
  </div>

  <h2>Setting up for Success</h2>
  <p>Getting started with the API used to take weeks. Now, with verified Business Solution Providers (BSPs) like AgentChat, you can get approved and running in a matter of minutes. Here are the steps to follow:</p>
  <ul>
    <li>Register a new phone number that isn't currently active on standard WhatsApp.</li>
    <li>Connect your Meta Business Manager account.</li>
    <li>Create message templates for your most common notifications.</li>
    <li>Build automation flows to qualify leads instantly.</li>
  </ul>

  <h2>Measuring ROI</h2>
  <p>Our customers consistently report open rates above 90% and conversion rates that dwarf traditional email marketing. The key is to be conversational. Don't just blast promotional flyers; ask questions, provide value, and be available to answer queries in real-time.</p>
  
  <blockquote>"Switching our main support channel to WhatsApp increased our customer satisfaction score by 40% in just two months." - Happy Customer</blockquote>

  <p>Ready to get started? Check out our platform and book a demo today. We'll guide you through the entire process and share best practices specific to your industry.</p>
`;

const blogPosts: ResourceItem[] = [
  {
    id: "featured-1",
    slug: "how-to-use-whatsapp-business-for-customer-support",
    title: "How to use WhatsApp Business for Customer Support",
    description:
      "Learn the best strategies and tools to scale your customer support using WhatsApp Business API. Discover how leading brands are transforming their support.",
    category: "Best Practices",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    authorName: "Deniz Yilmaz",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    date: "12 Oct 2024",
    content: BlogContent,
  },
  {
    id: "post-1",
    slug: "understanding-whatsapp-api-pricing-in-2024",
    title: "Understanding WhatsApp API Pricing in 2024",
    description:
      "A comprehensive guide to the latest changes in WhatsApp Business API pricing and how to optimize your messaging costs.",
    category: "WhatsApp API",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "05 Oct 2024",
    content: BlogContent,
  },
  {
    id: "post-2",
    slug: "new-features-release-ai-chatbot-builder",
    title: "New Features Release: AI Chatbot Builder",
    description:
      "We are thrilled to announce our new drag-and-drop AI chatbot builder. See what's new and how you can use it.",
    category: "Product Updates",
    readTime: "3 min read",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    authorName: "Alex Chen",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    date: "28 Sep 2024",
    content: BlogContent,
  },
  {
    id: "post-3",
    slug: "how-e-commerce-brands-use-whatsapp",
    title: "How e-commerce brands use WhatsApp",
    description:
      "Discover how top e-commerce companies use WhatsApp to drive sales, recover abandoned carts, and provide support.",
    category: "Industries",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
    authorName: "Deniz Yilmaz",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    date: "15 Sep 2024",
    content: BlogContent,
  },
  {
    id: "post-4",
    slug: "the-ultimate-guide-to-whatsapp-marketing",
    title: "The Ultimate Guide to WhatsApp Marketing",
    description:
      "Everything you need to know to build a successful WhatsApp marketing strategy from scratch.",
    category: "Tutorials",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=800&q=80",
    authorName: "Elena Rodriguez",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    date: "02 Sep 2024",
    content: BlogContent,
  },
  {
    id: "post-5",
    slug: "agentchat-raises-series-a-funding",
    title: "AgentChat raises Series A funding",
    description:
      "We are excited to share that we have raised our Series A to further our mission of connecting businesses and people.",
    category: "Company",
    readTime: "2 min read",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    authorName: "Michael Chang",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    date: "20 Aug 2024",
    content: BlogContent,
  },
  {
    id: "post-6",
    slug: "automating-lead-qualification-via-chat",
    title: "Automating Lead Qualification via Chat",
    description:
      "Learn how to capture and qualify leads automatically using conversational AI on WhatsApp.",
    category: "Best Practices",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: BlogContent,
  },
  {
    id: "post-7",
    slug: "setting-up-whatsapp-message-templates",
    title: "Setting up WhatsApp message templates",
    description:
      "A step-by-step tutorial on how to create, submit, and manage WhatsApp message templates.",
    category: "Tutorials",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    authorName: "Alex Chen",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    date: "05 Aug 2024",
    content: BlogContent,
  },
  {
    id: "post-8",
    slug: "whatsapp-api-vs-whatsapp-business-app",
    title: "WhatsApp API vs WhatsApp Business App",
    description:
      "Not sure which WhatsApp solution is right for your business? We compare the App and the API.",
    category: "WhatsApp API",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=800&q=80",
    authorName: "Deniz Yilmaz",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    date: "25 Jul 2024",
    content: BlogContent,
  },
  {
    id: "post-9",
    slug: "why-conversational-commerce-is-the-future",
    title: "Why conversational commerce is the future",
    description:
      "Explore the trends driving the shift towards chat-based shopping and customer interactions.",
    category: "Best Practices",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80",
    authorName: "Elena Rodriguez",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    date: "12 Jul 2024",
    content: BlogContent,
  },
];

export default blogPosts;
