import { ResourceItem } from "@/types/resource";

const CustomerContent = `
  <p>See how a growing business replaced scattered spreadsheets and manual follow-ups with InvoiceSmarty, and cut the time between finishing work and getting paid.</p>

  <h2>The Challenge</h2>
  <p>Before switching, invoices were built in spreadsheets, sent late and tracked by hand. Payments were hard to match to invoices, overdue balances went unnoticed and a lot of time every week went into chasing clients and preparing statements.</p>

  <div class="bg-[#f0f9ff] p-6 rounded-xl border border-[#bae6fd] my-8">
    <div class="flex gap-4">
      <div class="text-primary">📈</div>
      <div>
        <h4 class="font-bold text-slate-900 mb-2">Key Result</h4>
        <p class="text-sm text-slate-700 m-0">Within three months, the average time to get paid dropped significantly and the team saved hours every week on billing and follow-ups.</p>
      </div>
    </div>
  </div>

  <h2>The Solution</h2>
  <p>The team moved quoting, invoicing, payments and expenses into InvoiceSmarty. Rollout was quick and followed a few simple steps:</p>
  <ul>
    <li>Importing existing customers and items.</li>
    <li>Creating branded invoice and quote templates.</li>
    <li>Sending invoices by email and tracking when they were viewed.</li>
    <li>Recording payments and sharing statements through the customer portal.</li>
  </ul>

  <h2>The Results</h2>
  <p>Invoices now go out the same day work is completed, reminders happen automatically and balances are always accurate. Reports give the owners a clear view of sales, expenses and outstanding amounts at any time.</p>

  <blockquote>"InvoiceSmarty took billing off our plate. We always know who has paid, who hasn't, and what is coming in next." - Business owner</blockquote>

  <p>Want similar results for your business? Create your free InvoiceSmarty account and send your first invoice today.</p>
`;

const customers: ResourceItem[] = [
  {
    id: "cust-1",
    slug: "professional-services",
    title: "Professional Services",
    description: "Discover how a consulting firm streamlined client billing with quotes, milestone invoices and tracked time, cutting its payment cycle and improving cash flow.",
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
    description: "Learn how a recruitment agency automated placement-fee invoices and payment reminders so revenue is collected faster and more predictably.",
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
    description: "Find out how a local driving school simplified lesson packages, deposits and recurring invoices while reducing unpaid balances.",
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
    description: "Explore how educational institutions manage tuition invoices, installment payments and statements with less administrative work.",
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
    description: "See how car dealerships handle quotes, deposits and service invoices in one place and keep every customer balance accurate.",
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
    description: "Discover how online sellers track orders, payments and expenses, and keep customer statements up to date.",
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
    description: "Learn how media and radio companies bill advertisers, track campaign invoices and follow up on overdue accounts.",
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
    description: "Find out how finance and insurance firms issue accurate recurring invoices and keep a clear audit trail of every payment.",
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
    description: "See how fitness centers bill memberships and packages, record payments and reduce overdue accounts.",
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
    description: "Explore how NGOs issue invoices for services and grants, track expenses and report clearly to their supporters.",
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
    description: "Learn how clinics and medical institutions invoice patients and insurers, record payments and send statements with ease.",
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
    description: "Discover how local businesses simplify billing, send professional invoices and get paid on time.",
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
    description: "See how opticians invoice for exams and eyewear, manage deposits and keep customer records organized.",
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
    description: "Find out how beauty salons track services, sell packages and record payments in one simple system.",
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
    description: "Learn how marketing agencies bill retainers and project work, track time and keep client billing transparent.",
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
