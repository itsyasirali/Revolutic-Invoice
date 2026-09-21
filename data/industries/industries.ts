import { ResourceItem } from "@/types/resource";

const IndustryContent = `
  <p>InvoiceSmarty is tailored to the unique billing needs of your industry. Whether you are looking to create professional invoices, track payments, or automate reminders and get paid faster, our platform provides the tools you need.</p>
  
  <h2>Why Choose Us for Your Industry?</h2>
  <p>Different industries have different invoicing needs. A property manager bills recurring rent, while a retailer needs itemized invoices with taxes and discounts. Our invoice templates and workflows are pre-configured with industry best practices.</p>
  
  <div class="bg-[#f0f9ff] p-6 rounded-xl border border-[#bae6fd] my-8">
    <div class="flex gap-4">
      <div class="text-primary">💡</div>
      <div>
        <h4 class="font-bold text-slate-900 mb-2">Industry Standard Compliance</h4>
        <p class="text-sm text-slate-700 m-0">We ensure that your invoices, tax details and customer data are handled in line with your industry's financial and privacy regulations, giving you peace of mind.</p>
      </div>
    </div>
  </div>

  <h2>Key Benefits</h2>
  <ul>
    <li>Automated payment reminders and recurring invoices tailored to your industry.</li>
    <li>Seamless accounting integrations to keep your books synced.</li>
    <li>Custom branded templates, itemized line items, taxes and multi-currency support.</li>
  </ul>
`;

const industries: ResourceItem[] = [
  // Finance & Real Estate
  {
    id: "ind-1",
    slug: "insurance",
    title: "Insurance",
    description:
      "Streamline premium billing with professional invoices, automatic policy renewal billing, and payment reminders. Learn how InvoiceSmarty helps insurance providers cut collection time and improve retention with clear, accurate billing.",
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
      "Issue accurate invoices for fees and services, reconcile payments in real time, and keep a clear audit trail of every transaction.",
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
      "Invoice commissions, deposits and service fees in seconds, and track every payment from buyers, sellers and landlords.",
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
      "Simplify rent and maintenance billing with recurring invoices, automatic late-payment reminders and clear tenant statements.",
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
      "Generate itemized invoices with taxes and discounts for every order, and reconcile payments and refunds automatically.",
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
      "Create detailed sales, service and parts invoices, record deposits and installments, and get paid faster.",
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
      "Send clear itemized invoices for bookings and packages, collect deposits, and manage multi-currency payments.",
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
      "Manage tuition and fee invoicing, schedule installments, and send automatic reminders to parents and students.",
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
      "Bill patients quickly with professional invoices, track outstanding balances, and send timely payment reminders.",
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
      "Automate membership and class-pack invoices with recurring billing and simple payment tracking.",
    category: "Health & Lifestyle",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    content: IndustryContent,
  },
];

export default industries;
