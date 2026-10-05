import {
  ArrowUpRight,
  Bell,
  Bookmark,
  BarChart3,
  ChevronDown,
  CircleArrowDown,
  Clock,
  FileText,
  FolderKanban,
  Globe,
  Home,
  Layout,
  MinusCircle,
  Package,
  ScrollText,
  Search,
  Timer,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Static picture of the product dashboard for the landing hero. Everything is
 * drawn with page elements and dummy figures (no screenshot image), so it stays
 * sharp at any width and the numbers can be changed here.
 */

const NAV: { icon: LucideIcon; label: string }[] = [
  { icon: Home, label: "Dashboard" },
  { icon: User, label: "Customers" },
  { icon: Package, label: "Items" },
  { icon: FileText, label: "Quotes" },
  { icon: ScrollText, label: "Invoices" },
  { icon: CircleArrowDown, label: "Payments" },
  { icon: FolderKanban, label: "Projects" },
  { icon: Bookmark, label: "Expenses" },
  { icon: Timer, label: "Time Tracking" },
  { icon: Layout, label: "Invoice Templates" },
  { icon: BarChart3, label: "Reports" },
  { icon: Globe, label: "Customer Portal" },
];

const KPIS: {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconBg: string;
  bars: string;
}[] = [
  { label: "Total Invoices", value: "$48,250", change: "12.5%", icon: ScrollText, iconBg: "from-blue-500 to-blue-600", bars: "#1AA3FF" },
  { label: "Total Payments", value: "$36,900", change: "8.2%", icon: Wallet, iconBg: "from-cyan-500 to-cyan-600", bars: "#06B6D4" },
  { label: "Pending Invoices", value: "$11,350", change: "3.4%", icon: Clock, iconBg: "from-amber-500 to-orange-500", bars: "#F59E0B" },
  { label: "Total Expenses", value: "$14,200", change: "4.6%", icon: MinusCircle, iconBg: "from-rose-500 to-red-600", bars: "#EF4444" },
];

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const INCOME = [3200, 4100, 5200, 4800, 6300, 7400];
const EXPENSES = [1800, 2100, 2500, 2200, 2900, 3300];
const Y_MAX = 8000;
const Y_TICKS = [8000, 6000, 4000, 2000, 0];

const SALES = [
  { label: "Paid", pct: 76, amount: "$36,900", color: "#1AA3FF" },
  { label: "Partial", pct: 8, amount: "$3,850", color: "#06B6D4" },
  { label: "Unpaid", pct: 16, amount: "$7,500", color: "#F59E0B" },
];

const RECENT = [
  { no: "INV-0142", customer: "Northwind Traders", date: "12 Nov 2026", amount: "$2,450.00", status: "Paid", tone: "bg-emerald-50 text-emerald-700" },
  { no: "INV-0141", customer: "Bright Studio", date: "10 Nov 2026", amount: "$1,280.00", status: "Sent", tone: "bg-sky-50 text-sky-700" },
  { no: "INV-0140", customer: "Orbit Logistics", date: "08 Nov 2026", amount: "$3,900.00", status: "Overdue", tone: "bg-rose-50 text-rose-700" },
];

const Donut = () => {
  const r = 52;
  const c = 2 * Math.PI * r;
  // each slice starts where the previous one ended
  const slices = SALES.map((s, i) => ({
    ...s,
    len: (s.pct / 100) * c,
    start: (SALES.slice(0, i).reduce((sum, x) => sum + x.pct, 0) / 100) * c,
  }));
  return (
    <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
      {slices.map((s) => (
        <circle
          key={s.label}
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="16"
          strokeDasharray={`${s.len} ${c - s.len}`}
          strokeDashoffset={-s.start}
        />
      ))}
    </svg>
  );
};

const DashboardMockup = () => (
  <div className="flex h-full w-full select-none bg-white text-slate-800">
    {/* Sidebar */}
    <aside className="hidden w-56 shrink-0 flex-col bg-[#1B2A6B] px-3 py-4 text-white lg:flex">
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ScrollText className="h-4 w-4" />
        </div>
        <span className="text-[15px] font-bold tracking-tight">
          Invoice<span className="text-primary">Smarty</span>
        </span>
      </div>
      <nav className="space-y-0.5">
        {NAV.map((n, i) => (
          <div
            key={n.label}
            className={`flex items-center gap-3 rounded-md   px-3 py-2 text-[13px] font-semibold ${
              i === 0 ? "bg-primary text-white" : "text-white/80"
            }`}
          >
            <n.icon className="h-4 w-4 shrink-0" />
            {n.label}
          </div>
        ))}
      </nav>
    </aside>

    {/* Main */}
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 px-5">
        <div className="hidden h-9 w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 sm:flex">
          <Search className="h-3.5 w-3.5" /> Search customers...
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-700">
            Brightline Co <ChevronDown className="h-3.5 w-3.5" />
          </span>
          <Bell className="h-4 w-4 text-slate-500" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              AM
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-semibold text-slate-800">Alex Morgan</div>
              <div className="text-[10px] text-slate-400">Admin</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-hidden px-5 py-5">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">Good Evening, Alex Morgan</h3>
          <p className="text-xs text-slate-500">Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md ${k.iconBg}`}>
                  <k.icon className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-medium text-slate-500">{k.label}</div>
                  <div className="text-xl font-extrabold text-slate-900">{k.value}</div>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="font-semibold text-emerald-500">{k.change}</span> vs last period
                </div>
                <div className="flex h-6 items-end gap-0.5">
                  {["40%", "70%", "50%", "90%", "65%"].map((h, i) => (
                    <div key={i} style={{ height: h, backgroundColor: k.bars }} className="w-1 rounded-t-sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs xl:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Revenue Overview</div>
                <div className="text-[11px] text-slate-400">Total Income vs Expenses (Last 6M)</div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-blue-500" /> Income</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-500" /> Expenses</span>
              </div>
            </div>
            <div className="mt-3 flex h-44 gap-2 md:h-52">
              <div className="flex flex-col justify-between pb-5 text-[10px] text-slate-400">
                {Y_TICKS.map((t) => (
                  <span key={t}>{t === 0 ? "$0" : `$${t / 1000}k`}</span>
                ))}
              </div>
              <div className="relative flex flex-1 flex-col">
                <div className="relative flex-1 border-b border-slate-100">
                  {[0, 25, 50, 75].map((p) => (
                    <div key={p} style={{ top: `${p}%` }} className="absolute inset-x-0 border-t border-dashed border-slate-100" />
                  ))}
                  <div className="absolute inset-0 flex items-end justify-around px-2">
                    {MONTHS.map((m, i) => (
                      <div key={m} className="flex h-full items-end gap-1">
                        <div style={{ height: `${(INCOME[i] / Y_MAX) * 100}%` }} className="w-3 rounded-t bg-blue-500 md:w-4" />
                        <div style={{ height: `${(EXPENSES[i] / Y_MAX) * 100}%` }} className="w-3 rounded-t bg-red-500 md:w-4" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-around pt-1.5 text-[10px] text-slate-400">
                  {MONTHS.map((m) => (
                    <span key={m}>{m} 2026</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="text-sm font-bold text-slate-900">Sales Overview</div>
            <div className="relative mt-2 flex items-center justify-center">
              <Donut />
              <div className="absolute text-center">
                <div className="text-[10px] text-slate-400">Total Sales</div>
                <div className="text-lg font-extrabold text-slate-900">$48,250</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
              {SALES.map((s) => (
                <div key={s.label} className="text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <i className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label} <span className="font-normal text-slate-400">{s.pct}%</span>
                  </div>
                  <div className="pl-3.5 text-slate-400">{s.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent invoices (partly below the fold, like a real dashboard) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="mb-2 text-sm font-bold text-slate-900">Recent Invoices</div>
          <div className="divide-y divide-slate-100 text-xs">
            {RECENT.map((r) => (
              <div key={r.no} className="flex items-center gap-4 py-2">
                <span className="w-20 font-bold text-slate-900">{r.no}</span>
                <span className="flex-1 truncate text-slate-600">{r.customer}</span>
                <span className="hidden text-slate-400 sm:block">{r.date}</span>
                <span className="w-24 text-right font-semibold text-slate-900">{r.amount}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.tone}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardMockup;
