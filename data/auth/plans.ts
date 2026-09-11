const plans = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    msgs: "1,000 msgs / mo",
    sends: "100 contacts",
    desc: "For individuals looking to explore.",
  },
  {
    id: "basic",
    name: "Basic",
    price: "$39",
    msgs: "10,000 msgs / mo",
    sends: "1,000 contacts",
    desc: "For small teams getting started.",
    recommended: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    msgs: "100,000 msgs / mo",
    sends: "10,000 contacts",
    desc: "For growing businesses.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    msgs: "Unlimited msgs",
    sends: "Unlimited contacts",
    desc: "For large scale operations.",
  }
]
export default plans