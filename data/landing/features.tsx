import React from "react"
import { FileText, Zap, Shield, BellRing, LineChart, Globe } from "lucide-react"

const features = [
  {
    title: "Professional Invoices",
    description: "Create polished, branded invoices with line items, taxes and discounts in seconds and send them straight to your customers.",
    icon: <FileText className="h-6 w-6" />
  },
  {
    title: "Lightning Fast Setup",
    description: "Start invoicing in under 3 minutes. Add your business details, customers and items, no accounting expertise required.",
    icon: <Zap className="h-6 w-6" />
  },
  {
    title: "Bank-Grade Security",
    description: "Your financial data is protected with end-to-end encryption and strict data protection standards.",
    icon: <Shield className="h-6 w-6" />
  },
  {
    title: "Payment Tracking & Reminders",
    description: "See who has paid and who is overdue at a glance, and send automatic payment reminders to get paid faster.",
    icon: <BellRing className="h-6 w-6" />
  },
  {
    title: "Real-Time Reports",
    description: "Track revenue, outstanding balances and top customers through clear, actionable live dashboards.",
    icon: <LineChart className="h-6 w-6" />
  },
  {
    title: "Multi-Currency Billing",
    description: "Invoice international customers in their own currency and get paid from anywhere in the world.",
    icon: <Globe className="h-6 w-6" />
  }
]

export default features
