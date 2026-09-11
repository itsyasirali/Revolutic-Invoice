import { MessageSquare, LayoutTemplate, AtSign, Rss, ArrowRight, Headset, Users, LineChart, Megaphone, Mail, Zap, Briefcase, FileText, UserCheck } from "lucide-react";

export const solutionData = {
  Sales: {
    title: "More deals. Less effort.",
    description: "Turn conversations into conversions with WhatsApp Business. Close deals faster, wow your customers, and build lasting relationships effortlessly.",
    benefits: [
      "Boost conversions with interactive WhatsApp templates",
      "24/7 AI-powered automatic follow-ups",
      "One inbox for all customer conversations"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
      quote: "With AgentChat, we communicate efficiently and create compelling customer experiences.",
      author: "Sven Jaeger",
      company: "Allianz"
    },
    features: [
      { icon: MessageSquare, text: "Chatbots for instant lead qualification" },
      { icon: LayoutTemplate, text: "Interactive templates that sell" },
      { icon: AtSign, text: "Internal notes and @mentions for effortless teamwork" },
      { icon: Rss, text: "WhatsApp Newsletters for tailored offers" },
      { icon: ArrowRight, text: "Seamless CRM integration" },
    ]
  },
  Support: {
    title: "Support that scales with you.",
    description: "Resolve tickets faster and keep your customers happy. Automate the repetitive stuff so your team can focus on what matters.",
    benefits: [
      "Reduce resolution times with smart routing",
      "Automate FAQs with custom chatbots",
      "Collaborate seamlessly on complex issues"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      quote: "Our response time dropped by 50% and customer satisfaction is at an all-time high.",
      author: "Maria Garcia",
      company: "TechFlow"
    },
    features: [
      { icon: Headset, text: "Universal inbox for all channels" },
      { icon: Zap, text: "Automated routing and assignment" },
      { icon: Users, text: "Team collaboration tools" },
      { icon: FileText, text: "Canned responses and templates" },
      { icon: LineChart, text: "Performance analytics" },
    ]
  },
  Marketing: {
    title: "Reach customers where they are.",
    description: "Drive engagement and sales with targeted WhatsApp marketing campaigns that get read instantly.",
    benefits: [
      "98% open rates on WhatsApp campaigns",
      "Personalized bulk messaging",
      "Trackable links and rich media"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
      quote: "The engagement we get on WhatsApp newsletters completely outperforms our email campaigns.",
      author: "Thomas Wright",
      company: "RetailerPro"
    },
    features: [
      { icon: Megaphone, text: "GDPR-compliant newsletter campaigns" },
      { icon: LayoutTemplate, text: "Rich media message templates" },
      { icon: Users, text: "Advanced audience segmentation" },
      { icon: LineChart, text: "Campaign performance tracking" },
      { icon: Mail, text: "Automated opt-in flows" },
    ]
  },
  Recruiting: {
    title: "Hire faster via WhatsApp.",
    description: "Meet candidates on their favorite app. Speed up your hiring process and improve candidate experience effortlessly.",
    benefits: [
      "Reach candidates faster directly on their phones",
      "Automate initial screening questions",
      "Schedule interviews via chat"
    ],
    testimonial: {
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      quote: "Candidates love the fast, informal communication. We've hired top talent in record time.",
      author: "Sarah Chen",
      company: "TalentHub"
    },
    features: [
      { icon: UserCheck, text: "Automated candidate screening" },
      { icon: MessageSquare, text: "Instant interview scheduling" },
      { icon: Briefcase, text: "Job alert subscriptions" },
      { icon: AtSign, text: "Hiring manager collaboration" },
      { icon: LayoutTemplate, text: "Quick reply templates" },
    ]
  }
}

export type SolutionTab = keyof typeof solutionData;
export const solutionTabs = Object.keys(solutionData) as SolutionTab[];
