import React from "react"
import { Bot, Zap, Shield, MessageSquare, LineChart, Globe } from "lucide-react"

const features = [
  {
    title: "AI-Powered Agents",
    description: "Deploy intelligent WhatsApp agents that autonomously handle 80% of routine customer inquiries 24/7.",
    icon: <Bot className="h-6 w-6" />
  },
  {
    title: "Lightning Fast Setup",
    description: "Launch your customized AI agent in under 5 minutes. No coding or complex engineering required.",
    icon: <Zap className="h-6 w-6" />
  },
  {
    title: "Bank-Grade Security",
    description: "End-to-end encryption with strict compliance to GDPR, SOC2, and ISO27001 data protection standards.",
    icon: <Shield className="h-6 w-6" />
  },
  {
    title: "Omnichannel Inbox",
    description: "Seamlessly unify WhatsApp, Messenger, and Web chat into one intuitive, high-performance dashboard.",
    icon: <MessageSquare className="h-6 w-6" />
  },
  {
    title: "Real-Time Intelligence",
    description: "Track resolution times, customer sentiment, and agent performance through actionable live analytics.",
    icon: <LineChart className="h-6 w-6" />
  },
  {
    title: "Global Translation",
    description: "Break borders with automatic, real-time message translation in over 50 languages for international reach.",
    icon: <Globe className="h-6 w-6" />
  }
]

export default features