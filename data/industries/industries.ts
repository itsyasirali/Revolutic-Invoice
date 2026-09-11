import { ResourceItem } from "@/types/resource";

const IndustryContent = `
  <p>Our conversational AI and WhatsApp Business integration is specifically tailored to meet the unique challenges of your industry. Whether you are looking to automate lead generation, improve customer support, or drive sales directly through chat, our platform provides the tools you need.</p>
  
  <h2>Why Choose Us for Your Industry?</h2>
  <p>Different industries have different communication needs. A real estate agent needs to qualify leads and schedule viewings, while a retail store needs to process orders and handle returns. Our templates and AI bots are pre-configured with industry best practices.</p>
  
  <div class="bg-[#f0f9ff] p-6 rounded-xl border border-[#bae6fd] my-8">
    <div class="flex gap-4">
      <div class="text-primary">💡</div>
      <div>
        <h4 class="font-bold text-slate-900 mb-2">Industry Standard Compliance</h4>
        <p class="text-sm text-slate-700 m-0">We ensure that all our communication flows comply with your industry's strict data protection and privacy regulations, giving you peace of mind.</p>
      </div>
    </div>
  </div>

  <h2>Key Benefits</h2>
  <ul>
    <li>Automated 24/7 responses tailored to common industry questions.</li>
    <li>Seamless CRM integrations to keep your data synced.</li>
    <li>Rich media support for sending catalogs, documents, and videos.</li>
  </ul>
`;

const industries: ResourceItem[] = [
  // Finance & Real Estate
  {
    id: "ind-1",
    slug: "insurance",
    title: "Insurance",
    description:
      "Streamline your insurance operations by automating tedious claims processing, proactively sending policy renewal reminders, and offering instant, secure 24/7 support via WhatsApp. Learn how our tailored AI solutions help leading insurance providers reduce wait times by up to 80% and drastically improve customer retention rates.",
    category: "Finance & Real Estate",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    featured: true,
    content: IndustryContent,
  },
  {
    id: "ind-2",
    slug: "banks",
    title: "Banks",
    description:
      "Provide your clients with secure, instant customer support for banking inquiries, account updates, and fraud alerts directly through chat.",
    category: "Finance & Real Estate",
    image:
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
  {
    id: "ind-3",
    slug: "real-estate",
    title: "Real Estate",
    description:
      "Enable agents to schedule viewings seamlessly, share high-quality property listings, and nurture prospective buyers efficiently.",
    category: "Finance & Real Estate",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
  {
    id: "ind-4",
    slug: "property-management",
    title: "Property Management",
    description:
      "Simplify property management by handling tenant requests, scheduling maintenance updates, and sending rent reminders automatically.",
    category: "Finance & Real Estate",
    image:
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },

  // Commerce & Services
  {
    id: "ind-5",
    slug: "e-commerce",
    title: "E-Commerce",
    description:
      "Boost your online sales by recovering abandoned carts with personalized offers and providing real-time order tracking updates.",
    category: "Commerce & Services",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
  {
    id: "ind-6",
    slug: "car-dealerships",
    title: "Car Dealerships",
    description:
      "Drive more foot traffic to your showroom by allowing customers to book test drives easily and instantly receive digital vehicle brochures.",
    category: "Commerce & Services",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
  {
    id: "ind-7",
    slug: "travel-agencies",
    title: "Travel Agencies",
    description:
      "Enhance the traveler experience by sending comprehensive itineraries, instant flight alerts, and personalized booking recommendations.",
    category: "Commerce & Services",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
  {
    id: "ind-8",
    slug: "educational-institutions",
    title: "Educational Institutions",
    description:
      "Foster a more connected school community by keeping students and parents informed on admissions, campus events, and emergency alerts.",
    category: "Commerce & Services",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    content: IndustryContent,
  },

  // Health & Lifestyle
  {
    id: "ind-9",
    slug: "doctors",
    title: "Doctors",
    description:
      "Improve patient care and reduce no-shows by managing appointments effectively and sending automated, timely patient reminders.",
    category: "Health & Lifestyle",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
  {
    id: "ind-10",
    slug: "fitness",
    title: "Fitness",
    description:
      "Keep your gym members engaged by sharing customized workout plans, daily class schedules, and motivational check-ins effortlessly.",
    category: "Health & Lifestyle",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
];

export default industries;
