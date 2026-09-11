const compareTableFeatures = [
  {
    category: "Contacts & Messages",
    items: [
      { name: "Monthly messages", free: "1,000", basic: "10,000", professional: "100,000", enterprise: "Unlimited" },
      { name: "Contacts", free: "100", basic: "1,000", professional: "10,000", enterprise: "Unlimited" },
      { name: "Users", free: "1", basic: "3", professional: "10", enterprise: "Unlimited" },
    ]
  },
  {
    category: "Features",
    items: [
      { name: "Automations", free: true, basic: true, professional: true, enterprise: true },
      { name: "Custom flows", free: false, basic: true, professional: true, enterprise: true },
      { name: "API Access", free: false, basic: false, professional: true, enterprise: true },
      { name: "Webhooks", free: false, basic: false, professional: true, enterprise: true },
      { name: "Custom domain", free: false, basic: false, professional: false, enterprise: true },
    ]
  },
  {
    category: "Support",
    items: [
      { name: "Community", free: true, basic: true, professional: true, enterprise: true },
      { name: "Email", free: false, basic: true, professional: true, enterprise: true },
      { name: "Priority", free: false, basic: false, professional: true, enterprise: true },
      { name: "24/7 Phone", free: false, basic: false, professional: false, enterprise: true },
      { name: "Dedicated Manager", free: false, basic: false, professional: false, enterprise: true },
    ]
  }
];

export default compareTableFeatures;
