import { FileText, LayoutTemplate, Repeat, Bell, Globe, Users, LineChart, Calculator, Receipt, Wallet, ClipboardList, Landmark, Percent, Mail } from "lucide-react";

export const solutionData = {
  Freelancers: {
    title: "Invoice clients. Get paid faster.",
    description: "Send professional invoices in seconds, track who has paid, and spend less time on admin and more time on your craft.",
    benefits: [
      "Branded invoice templates in a few clicks",
      "Automatic reminders for overdue payments",
      "One place for all your customers and items"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
      quote: "With InvoiceSmarty, I send invoices the moment a project is done and get paid in days, not weeks.",
      author: "Sven Jaeger",
      company: "Freelance Designer"
    },
    features: [
      { icon: FileText, text: "Professional invoices in seconds" },
      { icon: LayoutTemplate, text: "Customizable branded templates" },
      { icon: Bell, text: "Automatic payment reminders" },
      { icon: Globe, text: "Multi-currency billing" },
      { icon: Mail, text: "Send invoices by email" },
    ]
  },
  Accounting: {
    title: "Books that stay balanced.",
    description: "Keep every invoice, payment and tax detail organized so month-end closing is fast and error-free.",
    benefits: [
      "Accurate taxes and discounts on every invoice",
      "Payments matched to invoices automatically",
      "Clear reports for reconciliation and audits"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      quote: "Our month-end close dropped from days to hours and we no longer chase missing payments.",
      author: "Maria Garcia",
      company: "TechFlow"
    },
    features: [
      { icon: Calculator, text: "Automatic tax calculations" },
      { icon: Receipt, text: "Complete payment history" },
      { icon: LineChart, text: "Revenue and outstanding reports" },
      { icon: ClipboardList, text: "Itemized line items" },
      { icon: Landmark, text: "Audit-ready records" },
    ]
  },
  Sales: {
    title: "Close the deal, send the invoice.",
    description: "Turn won deals into invoices instantly and keep your customer billing details in one place.",
    benefits: [
      "Create invoices from saved customers and items",
      "Recurring invoices for retainers and subscriptions",
      "See every customer's balance at a glance"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
      quote: "Invoicing right after signing a deal shaved a week off our average payment time.",
      author: "Thomas Wright",
      company: "RetailerPro"
    },
    features: [
      { icon: Users, text: "Customer profiles and contacts" },
      { icon: Repeat, text: "Recurring invoices" },
      { icon: Percent, text: "Discounts and promotions" },
      { icon: FileText, text: "Quick invoice creation" },
      { icon: LineChart, text: "Sales performance tracking" },
    ]
  },
  Finance: {
    title: "Cash flow, under control.",
    description: "Know exactly what is paid, pending and overdue so you can plan ahead with confidence.",
    benefits: [
      "Real-time view of paid, pending and overdue invoices",
      "Automated reminders reduce late payments",
      "Multi-organization support for growing teams"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      quote: "We finally have a clear picture of our receivables. Late payments are down by a third.",
      author: "Sarah Chen",
      company: "TalentHub"
    },
    features: [
      { icon: Wallet, text: "Live cash flow dashboard" },
      { icon: Bell, text: "Overdue invoice alerts" },
      { icon: LineChart, text: "Revenue overview charts" },
      { icon: Users, text: "Team roles and organizations" },
      { icon: Landmark, text: "Secure financial records" },
    ]
  }
}

export type SolutionTab = keyof typeof solutionData;
export const solutionTabs = Object.keys(solutionData) as SolutionTab[];
