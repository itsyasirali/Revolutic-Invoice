"use client";

import {
  KeyRound,
  Clock,
  Smartphone,
  Globe,
  Send,
  FileText,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  Search,
  MessageCircle,
  User,
} from "lucide-react";

interface AuthSlideIllustrationProps {
  slideId: string;
}

const AuthSlideIllustration: React.FC<AuthSlideIllustrationProps> = ({
  slideId,
}) => {
  switch (slideId) {
    case "automation":
      return (
        <div className="relative w-full max-w-xs h-56 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-4 bg-sky-100/60 rounded-full blur-xl pointer-events-none" />

          {/* Orbiting Feature Badges */}
          <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4" />
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <FileText className="w-4 h-4" />
          </div>
          <div className="absolute top-2 right-6 w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
            <Send className="w-4 h-4 -rotate-12" />
          </div>

          {/* Center: Floating Invoice Document */}
          <div className="relative z-10 w-32 bg-white rounded-lg border border-slate-200 shadow-xl p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="w-6 h-2 bg-primary/30 rounded" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <CheckCircle2 className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-100 rounded" />
              <div className="w-4/5 h-1.5 bg-slate-100 rounded" />
              <div className="w-3/5 h-1.5 bg-slate-100 rounded" />
            </div>
            <div className="pt-1 flex justify-between items-center text-[9px] font-bold">
              <span className="text-slate-400">Total</span>
              <span className="text-primary font-mono">$1,850</span>
            </div>
          </div>

          {/* Floating Status Pill */}
          <div className="absolute bottom-5 right-2 z-20 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md shadow-md px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-delivered</span>
          </div>

          {/* Recurring Badge */}
          <div className="absolute bottom-6 left-2 z-20 bg-white border border-slate-200 text-slate-700 rounded-md shadow-md px-2 py-1 flex items-center gap-1 text-[9px] font-medium">
            <Clock className="w-3 h-3 text-primary" />
            <span>Monthly recurring</span>
          </div>
        </div>
      );

    case "payments":
      return (
        <div className="relative w-full max-w-xs h-56 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-4 bg-emerald-100/50 rounded-full blur-xl pointer-events-none" />

          {/* Orbiting Currency Badges */}
          <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md font-bold text-xs">
            $
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md font-bold text-xs">
            €
          </div>
          <div className="absolute top-2 right-6 w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-md font-bold text-xs">
            £
          </div>

          {/* Center: Gradient Credit Card Mockup */}
          <div className="relative z-10 w-36 h-24 bg-gradient-to-tr from-primary to-blue-600 rounded-lg shadow-xl p-3 text-white flex flex-col justify-between border border-white/20">
            <div className="flex justify-between items-center">
              <CreditCard className="w-5 h-5 text-white/90" />
              <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">
                DEBIT
              </span>
            </div>
            <div className="font-mono text-[9px] tracking-widest opacity-90">
              •••• •••• •••• 4288
            </div>
            <div className="flex justify-between items-center text-[8px] opacity-80">
              <span>INVOICESMARTY</span>
              <span>12/28</span>
            </div>
          </div>

          {/* Floating Successful Payment Pill */}
          <div className="absolute bottom-5 right-1 z-20 bg-white border border-emerald-200 text-emerald-700 rounded-md shadow-md px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paid +$3,450.00</span>
          </div>

          {/* Security Badge */}
          <div className="absolute bottom-5 left-1 z-20 bg-white border border-slate-200 text-slate-700 rounded-md shadow-md px-2 py-1 flex items-center gap-1 text-[9px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Instant Payout</span>
          </div>
        </div>
      );

    case "clients":
      return (
        <div className="relative w-full max-w-xs h-56 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-4 bg-purple-100/50 rounded-full blur-xl pointer-events-none" />

          {/* Orbiting Icons */}
          <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md">
            <Users className="w-4 h-4" />
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="absolute top-2 right-6 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <DollarSign className="w-4 h-4" />
          </div>

          {/* Center: Client Profile Card */}
          <div className="relative z-10 w-36 bg-white rounded-lg border border-slate-200 shadow-xl p-3 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center mx-auto">
              AC
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">
                Acme Global Corp
              </div>
              <div className="text-[9px] text-slate-400">Verified Client</div>
            </div>
            <div className="pt-1 border-t border-slate-100 flex justify-between text-[8px]">
              <span className="text-slate-500">Invoices: 14</span>
              <span className="text-emerald-600 font-bold">Good Standing</span>
            </div>
          </div>

          {/* Floating Client Metric */}
          <div className="absolute bottom-5 right-2 z-20 bg-white border border-slate-200 rounded-md shadow-md px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>100+ Active Clients</span>
          </div>
        </div>
      );

    case "analytics":
      return (
        <div className="relative w-full max-w-xs h-56 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-4 bg-sky-100/60 rounded-full blur-xl pointer-events-none" />

          {/* Orbiting Icons */}
          <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="absolute top-2 right-6 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md font-bold text-xs">
            %
          </div>

          {/* Center: Growth Chart Card */}
          <div className="relative z-10 w-36 bg-white rounded-lg border border-slate-200 shadow-xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-semibold text-slate-500">
                Revenue
              </span>
              <span className="text-[9px] font-bold text-emerald-600 flex items-center">
                +34.8%
              </span>
            </div>
            <div className="text-sm font-extrabold text-slate-800">$48,250</div>
            {/* Mini Bar Graph */}
            <div className="flex items-end gap-1.5 h-7 pt-1">
              <div className="w-3 h-3 bg-primary/40 rounded-t" />
              <div className="w-3 h-4 bg-primary/50 rounded-t" />
              <div className="w-3 h-5 bg-primary/70 rounded-t" />
              <div className="w-3 h-7 bg-primary rounded-t" />
              <div className="w-3 h-6 bg-primary/80 rounded-t" />
            </div>
          </div>

          {/* Floating Insights Pill */}
          <div className="absolute bottom-5 right-2 z-20 bg-white border border-slate-200 rounded-md shadow-md px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Positive Cash Flow</span>
          </div>
        </div>
      );

    case "mfa":
    default:
      return (
        <div className="relative w-full max-w-xs h-56 flex items-center justify-center">
          {/* Background Soft Glow Cloud */}
          <div className="absolute inset-4 bg-slate-100/70 rounded-full blur-xl pointer-events-none" />

          {/* Orbiting App Circle Badges */}
          <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-sky-400 text-white flex items-center justify-center shadow-md">
            <Globe className="w-4 h-4" />
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 via-red-500 to-amber-400 text-white flex items-center justify-center shadow-md">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="absolute top-2 right-6 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="absolute top-20 left-2 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="absolute top-20 right-2 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
            <Search className="w-4 h-4" />
          </div>

          {/* Central Phone Mockup Device */}
          <div className="relative z-10 w-28 h-40 bg-primary rounded-xl border-4 border-slate-100 shadow-xl flex flex-col items-center justify-between p-2 text-white">
            <div className="w-6 h-1 bg-white/40 rounded-full" />
            <div className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div className="w-4 h-4 rounded-full border-2 border-dashed border-white/70 animate-spin" />
          </div>

          {/* Floating Password / OTP Pill */}
          <div className="absolute bottom-6 right-0 z-20 bg-white rounded-md shadow-lg border border-slate-100 px-3 py-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-800 font-mono text-xs font-bold tracking-widest">
              <span>***</span>
              <span>***</span>
            </div>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* User Icon */}
          <div className="absolute bottom-4 left-4 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center pointer-events-none">
            <User className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      );
  }
};

export default AuthSlideIllustration;
