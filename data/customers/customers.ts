import { ResourceItem } from "@/types/resource";

const CustomerContent = `
  <p>Learn how our customers have completely transformed their communication strategy and seen massive returns on investment. Before partnering with us, they faced significant hurdles in engaging their target audience effectively and managing support requests at scale.</p>
  
  <h2>The Challenge</h2>
  <p>Before switching to our platform, the customer struggled with disconnected communication channels, leading to slow response times and frustrated clients. They needed a unified solution that could scale with their rapid growth. Their legacy systems required manual intervention for every inquiry, causing burnout among support staff and delaying critical business operations.</p>
  
  <div class="bg-[#f0f9ff] p-6 rounded-xl border border-[#bae6fd] my-8">
    <div class="flex gap-4">
      <div class="text-primary">📈</div>
      <div>
        <h4 class="font-bold text-slate-900 mb-2">Key Metric</h4>
        <p class="text-sm text-slate-700 m-0">Within 3 months of implementation, they saw a <strong>300% increase in lead conversion rates</strong> and a <strong>50% reduction in support ticket resolution time</strong>. Customer retention also improved by 25% year-over-year.</p>
      </div>
    </div>
  </div>

  <h2>The Solution and Implementation</h2>
  <p>By implementing our WhatsApp Business API integration along with automated routing, they were able to handle inquiries 24/7 without adding headcount. The implementation process was seamless and involved the following key steps:</p>
  <ul>
    <li>Integrating their existing CRM seamlessly with our WhatsApp API endpoints.</li>
    <li>Setting up AI-driven automated responses for common customer queries.</li>
    <li>Designing personalized notification templates to proactively engage users.</li>
    <li>Training the support team on the new unified inbox interface.</li>
  </ul>

  <h2>The Results and ROI</h2>
  <p>The transformation was immediate. The support team could now focus on complex, high-value interactions while the automated system handled routine queries. The company not only reduced operational costs but also unlocked new revenue streams through proactive messaging campaigns on WhatsApp.</p>
  
  <blockquote>"This platform didn't just solve our communication problem; it fundamentally improved our entire customer experience. The onboarding was incredibly smooth, and the ongoing support has been fantastic." - CEO</blockquote>

  <p>Are you looking to achieve similar results for your business? Get in touch with our team today to discover how our WhatsApp integration can be tailored to meet your specific needs and drive sustainable growth.</p>
`;

const customers: ResourceItem[] = [
  {
    id: "cust-1",
    slug: "professional-services",
    title: "Professional Services",
    description: "Discover how a top consulting firm successfully scaled their client onboarding process, automated their communication workflows, and improved overall satisfaction by integrating our state-of-the-art WhatsApp solution into their core business. This comprehensive case study explores the challenges they faced and the incredible 300% ROI they achieved.",
    category: "Professional Services",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    featured: true,
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-2",
    slug: "recruiting",
    title: "Recruiting",
    description: "Learn how automating the candidate screening process via WhatsApp helped a leading recruitment agency hire top talent faster and more efficiently.",
    category: "Professional Services",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-3",
    slug: "driving-schools",
    title: "Driving schools",
    description: "Find out how a local driving school eliminated scheduling conflicts and reduced no-shows by allowing students to book and manage lessons seamlessly over chat.",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-4",
    slug: "educational-institutions",
    title: "Educational institutions",
    description: "Explore how educational institutions are enhancing student engagement and administrative efficiency by delivering instant updates and support through WhatsApp.",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-5",
    slug: "car-dealerships",
    title: "Car dealerships",
    description: "See how car dealerships are driving more test-drive bookings and increasing sales conversions with automated follow-ups and personalized conversational commerce.",
    category: "Automotive",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-6",
    slug: "e-commerce",
    title: "E-Commerce",
    description: "Discover the strategies that top e-commerce brands use to boost revenue, recover abandoned carts, and provide proactive customer support through conversational commerce.",
    category: "Retail & E-commerce",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-7",
    slug: "media-and-radio",
    title: "Media & Radio",
    description: "Learn how media and radio companies are engaging their audience in real-time with interactive broadcasting, live polls, and instant feedback loops on WhatsApp.",
    category: "Media & Radio",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-8",
    slug: "finance-and-insurance",
    title: "Finance & Insurance",
    description: "Find out how finance and insurance firms are delivering secure, personalized financial guidance and automated claim updates directly to their clients' phones.",
    category: "Finance & Insurance",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-9",
    slug: "fitness",
    title: "Fitness",
    description: "See how fitness centers keep their members motivated and accountable with daily check-ins, automated class reminders, and personalized workout tips.",
    category: "Health & Wellness",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-10",
    slug: "ngos",
    title: "NGOs",
    description: "Explore how NGOs use WhatsApp to coordinate volunteers seamlessly, manage donations effectively, and keep their supporters updated on critical campaigns.",
    category: "Non-Profit",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-11",
    slug: "doctors-and-medical-institutions",
    title: "Doctors & Medical Institutions",
    description: "Learn how medical institutions are streamlining patient scheduling, providing telehealth support, and sending crucial appointment reminders via automated chat.",
    category: "Health & Wellness",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-12",
    slug: "local-business",
    title: "Local Business",
    description: "Discover how local businesses are building stronger connections with their community, driving local sales, and offering exceptional customer service.",
    category: "Local Business",
    image:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-13",
    slug: "opticians",
    title: "Opticians",
    description: "See how opticians use automated messaging to remind customers of upcoming eye exams, notify them of eyewear pick-ups, and answer routine questions instantly.",
    category: "Health & Wellness",
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-14",
    slug: "beauty",
    title: "Beauty",
    description: "Find out how beauty salons are managing appointments effortlessly and sharing personalized beauty tips with clients to boost retention and engagement.",
    category: "Retail & E-commerce",
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
  {
    id: "cust-15",
    slug: "marketing-agencies",
    title: "Marketing Agencies",
    description: "Learn how marketing agencies execute highly effective omni-channel campaigns for their clients, utilizing WhatsApp as a primary driver for lead generation and conversion.",
    category: "Marketing & Agencies",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    authorName: "Sarah Jenkins",
    authorAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    date: "10 Aug 2024",
    content: CustomerContent,
  },
];

export default customers;
