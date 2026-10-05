export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const LEGAL_UPDATED = "5 October 2026";

export const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of these terms",
    paragraphs: [
      "These Terms & Conditions (the \"Terms\") govern your access to and use of InvoiceSmarty, including our website, web application, customer portal and related services (together, the \"Service\").",
      "By creating an account or using the Service you agree to these Terms. If you use the Service on behalf of a company or other organization, you confirm that you are authorized to bind it, and \"you\" includes that organization.",
    ],
  },
  {
    id: "service",
    title: "2. The Service",
    paragraphs: [
      "InvoiceSmarty provides tools for invoicing, quotes, payments, projects, expenses, time tracking and a customer portal. We may add, change or remove features from time to time.",
      "InvoiceSmarty is a software tool. It does not provide accounting, tax or legal advice, and you remain responsible for the accuracy and legal compliance of the invoices, quotes and records you create.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and organizations",
    bullets: [
      "You must provide accurate registration information and keep it up to date.",
      "You are responsible for keeping your password secure and for all activity under your account.",
      "You must tell us promptly if you suspect unauthorized access to your account.",
      "Each organization you create is a separate workspace. The account owner decides who else can access it.",
    ],
  },
  {
    id: "your-data",
    title: "4. Your data",
    paragraphs: [
      "You keep all rights to the data you put into the Service, including customer details, items, invoices, quotes, payments and documents (\"Your Data\"). You give us a limited permission to host, process and display Your Data only to run and improve the Service for you.",
      "You are responsible for having the right to enter Your Data, including personal data of your customers, and for using it lawfully. You can export Your Data from the Service at any time.",
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use",
    paragraphs: ["You agree not to:"],
    bullets: [
      "use the Service for anything unlawful, fraudulent or misleading, including issuing invoices for goods or services that do not exist;",
      "upload malware or attempt to disrupt, probe or gain unauthorized access to the Service or other users' data;",
      "reverse engineer, scrape or resell the Service except as we allow in writing;",
      "send spam or abusive messages through the invoice, reminder or portal features.",
    ],
  },
  {
    id: "customer-portal",
    title: "6. Customer portal and communications",
    paragraphs: [
      "The Service can email invoices, quotes and reminders and give your customers access to a portal. You are responsible for the content of what you send and for having your customers' permission to contact them.",
      "Comments you mark as visible to a customer can be seen by that customer.",
    ],
  },
  {
    id: "payments",
    title: "7. Payments and fees",
    paragraphs: [
      "We may offer a free trial and paid plans. Prices, billing periods and plan limits are shown at sign-up or in your account, and we will give notice before changing them for an existing plan.",
      "Recording a payment in InvoiceSmarty only records that a payment was received. We are not a bank or payment processor and are not responsible for payments between you and your customers.",
    ],
  },
  {
    id: "ip",
    title: "8. Our intellectual property",
    paragraphs: [
      "The Service, including its software, design, templates and trademarks, belongs to InvoiceSmarty and its licensors. We grant you a limited, non-exclusive, non-transferable right to use the Service under these Terms. Nothing in these Terms transfers any of our intellectual property to you.",
    ],
  },
  {
    id: "availability",
    title: "9. Availability and changes",
    paragraphs: [
      "We work to keep the Service available and secure, but we do not promise it will be uninterrupted or error-free. We may carry out maintenance, and we may update these Terms; if a change is material we will notify you in the Service or by email before it takes effect. Continuing to use the Service after that means you accept the updated Terms.",
    ],
  },
  {
    id: "termination",
    title: "10. Suspension and termination",
    paragraphs: [
      "You may stop using the Service and close your account at any time. We may suspend or end your access if you breach these Terms, put the Service or other users at risk, or fail to pay fees that are due.",
      "After termination we will keep Your Data for a reasonable period so you can export it, then delete or anonymize it unless the law requires us to keep it.",
    ],
  },
  {
    id: "disclaimer",
    title: "11. Disclaimers",
    paragraphs: [
      "The Service is provided \"as is\" and \"as available\". To the fullest extent the law allows, we disclaim all warranties, whether express or implied, including fitness for a particular purpose and non-infringement.",
    ],
  },
  {
    id: "liability",
    title: "12. Limitation of liability",
    paragraphs: [
      "To the fullest extent the law allows, InvoiceSmarty will not be liable for indirect, incidental, special or consequential damages, or for lost profits, revenue or data. Our total liability for any claim relating to the Service is limited to the amount you paid us in the twelve months before the event giving rise to the claim.",
      "Nothing in these Terms limits liability that cannot be limited by law.",
    ],
  },
  {
    id: "general",
    title: "13. General",
    bullets: [
      "These Terms are the entire agreement between you and InvoiceSmarty about the Service.",
      "If a provision is found unenforceable, the rest of the Terms stays in effect.",
      "You may not transfer your rights under these Terms without our consent. We may transfer ours as part of a merger or sale of the business.",
      "These Terms are governed by the laws of the jurisdiction in which InvoiceSmarty is established, and disputes will be handled by the courts there, unless mandatory local law says otherwise.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    paragraphs: ["If you have questions about these Terms, please contact us through the support options in your InvoiceSmarty account."],
  },
];

export const privacySections: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview",
    paragraphs: [
      "This Privacy Policy explains what personal data InvoiceSmarty collects, how we use it and the choices you have. It applies to our website, web application and customer portal.",
      "Two roles matter here. For your own account information we act as the \"controller\". For the data you enter about your customers (for example names, emails and invoices) you are the controller and we act as your \"processor\", handling that data only on your instructions.",
    ],
  },
  {
    id: "collect",
    title: "2. Data we collect",
    bullets: [
      "Account data: name, email address, password (stored hashed) and organization details such as name, address, currency and tax information.",
      "Business records you create: customers and their contacts, items, quotes, invoices, payments, projects, expenses, time entries, comments and uploaded documents.",
      "Usage and device data: pages viewed, actions in the app, browser type, IP address and basic diagnostic logs.",
      "Customer portal data: when your customer uses a portal link, we record the actions they take, such as viewing or approving a quote.",
      "Communications: messages you send to us and emails the Service sends on your behalf.",
    ],
  },
  {
    id: "use",
    title: "3. How we use data",
    bullets: [
      "To provide, secure and maintain the Service, including sending invoices, quotes and reminders you ask for.",
      "To authenticate you and keep your organization's data separate from others'.",
      "To support you, respond to requests and send important service notices.",
      "To understand how the Service is used and improve it.",
      "To detect and prevent fraud, abuse and security incidents, and to meet legal obligations.",
    ],
  },
  {
    id: "basis",
    title: "4. Legal bases",
    paragraphs: [
      "Where privacy law requires a legal basis, we rely on: performing our contract with you; our legitimate interests in running, securing and improving the Service; your consent where we ask for it; and compliance with legal obligations.",
    ],
  },
  {
    id: "sharing",
    title: "5. Who we share data with",
    paragraphs: ["We do not sell your personal data. We share it only with:"],
    bullets: [
      "service providers that help us run the Service, such as hosting, database, email delivery and error monitoring, bound by confidentiality and data-protection terms;",
      "other people in your organization, as you configure access;",
      "your customers, where you send them invoices, quotes or portal access;",
      "authorities, when the law requires it, or an acquirer if the business is sold, with notice to you.",
    ],
  },
  {
    id: "security",
    title: "6. Security",
    paragraphs: [
      "We protect data with measures such as encrypted connections, encryption of sensitive fields, hashed passwords, access controls and per-organization separation. No system is perfectly secure, so we cannot guarantee absolute security, and we will notify affected users where the law requires.",
    ],
  },
  {
    id: "retention",
    title: "7. Retention",
    paragraphs: [
      "We keep your data while your account is active. After you close your account we keep it for a limited period so you can export it, then delete or anonymize it, except where we must keep records for legal, tax or security reasons.",
    ],
  },
  {
    id: "rights",
    title: "8. Your rights",
    paragraphs: ["Depending on where you live, you may have the right to:"],
    bullets: [
      "access the personal data we hold about you and get a copy;",
      "correct inaccurate data, or delete data we no longer need;",
      "object to or restrict some processing, and withdraw consent you gave;",
      "receive your data in a portable format;",
      "complain to your local data protection authority.",
    ],
  },
  {
    id: "customers",
    title: "9. If you are a customer of one of our users",
    paragraphs: [
      "If a business sends you an invoice or portal link, that business controls your data. Please contact them for access, correction or deletion requests. We will help them respond.",
    ],
  },
  {
    id: "cookies",
    title: "10. Cookies and local storage",
    paragraphs: [
      "We use cookies and similar browser storage that are needed to sign you in, keep your session and remember basic preferences. We do not use them to build advertising profiles.",
    ],
  },
  {
    id: "transfers",
    title: "11. International transfers",
    paragraphs: [
      "Our providers may process data in countries other than your own. Where required, we use safeguards such as standard contractual clauses to protect it.",
    ],
  },
  {
    id: "children",
    title: "12. Children",
    paragraphs: ["The Service is for businesses and is not directed to children under 16. We do not knowingly collect their data."],
  },
  {
    id: "changes",
    title: "13. Changes to this policy",
    paragraphs: [
      "We may update this policy. If a change is material we will notify you in the Service or by email before it takes effect, and we will update the date at the top of this page.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    paragraphs: ["For privacy questions or to exercise your rights, please contact us through the support options in your InvoiceSmarty account."],
  },
];
