const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "For individuals looking to explore.",
    users: "1 user",
    contacts: "100 contacts",
    messages: "1,000 msgs",
    buttonText: "Start for free",
    buttonVariant: "outline",
    popular: false,
    features: [
      "1,000 messages /mo",
      "100 contacts",
      "1 user",
      "Basic automation",
      "Community support"
    ]
  },
  {
    name: "Basic",
    monthlyPrice: 39,
    annualPrice: 29,
    description: "For small teams getting started.",
    users: "3 users",
    contacts: "1,000 contacts",
    messages: "10,000 msgs",
    buttonText: "Start Basic",
    buttonVariant: "default",
    popular: true,
    features: [
      "10,000 messages /mo",
      "1,000 contacts",
      "3 users",
      "Advanced automation",
      "Email support"
    ]
  },
  {
    name: "Professional",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For growing businesses.",
    users: "10 users",
    contacts: "10,000 contacts",
    messages: "100,000 msgs",
    buttonText: "Start Professional",
    buttonVariant: "outline",
    popular: false,
    features: [
      "100,000 messages /mo",
      "10,000 contacts",
      "10 users",
      "Custom integrations",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    description: "For large scale operations.",
    users: "Unlimited users",
    contacts: "Unlimited contacts",
    messages: "Unlimited msgs",
    buttonText: "Contact sales",
    buttonVariant: "outline",
    popular: false,
    features: [
      "Unlimited messages",
      "Unlimited contacts",
      "Unlimited users",
      "Dedicated account manager",
      "24/7 phone support"
    ]
  }
];

export default plans;
