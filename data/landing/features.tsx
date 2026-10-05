import React from "react"
import { Bell, Bookmark, FileText, Globe, LineChart, Timer } from "lucide-react"

const features = [
  {
    title: "Quotes",
    description: "Outline your payment terms, deliverables, and terms of sale in a well-crafted quote. Once approved, they can automatically be converted into invoices.",
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: "Time tracking",
    description: "Track project hours and charge customers accurately. Your staff can log time from their personal devices, and InvoiceSmarty calculates the total amount owed.",
    icon: <Timer className="h-5 w-5" />
  },
  {
    title: "Expenses",
    description: "Track every penny that leaves your business's pockets. Record billable expenses like fuel charges and raw material costs, and convert them into invoices.",
    icon: <Bookmark className="h-5 w-5" />
  },
  {
    title: "Payment reminders",
    description: "Following up with customers on their due payments is awkward and time consuming. InvoiceSmarty sends payment reminders to ensure you get paid on time.",
    icon: <Bell className="h-5 w-5" />
  },
  {
    title: "Customer portal",
    description: "Your customers can log in to a portal where they can view invoices and quotes, approve quotes, pay invoices, download statements, and more.",
    icon: <Globe className="h-5 w-5" />
  },
  {
    title: "Reports",
    description: "You get a bird's-eye view of your business financials, right from the dashboard. Dive deeper with reports on best-selling products, AR aging, top customers, and more.",
    icon: <LineChart className="h-5 w-5" />
  }
]

export default features
