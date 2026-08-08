import React from "react";
import { Wallet, CheckCircle2, Clock } from "lucide-react";

const formatPKR = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
  }).format(value);

const BarChart = ({ color }: { color: string }) => (
  <div className="flex items-end gap-[3px] h-8">
    <div
      style={{ backgroundColor: color }}
      className="w-[5px] h-[40%] rounded-t-[1px]"
    ></div>
    <div
      style={{ backgroundColor: color }}
      className="w-[5px] h-[60%] rounded-t-[1px]"
    ></div>
    <div
      style={{ backgroundColor: color }}
      className="w-[5px] h-[100%] rounded-t-[1px]"
    ></div>
    <div
      style={{ backgroundColor: color }}
      className="w-[5px] h-[80%] rounded-t-[1px]"
    ></div>
    <div
      style={{ backgroundColor: color }}
      className="w-[5px] h-[50%] rounded-t-[1px]"
    ></div>
    <div
      style={{ backgroundColor: color }}
      className="w-[5px] h-[70%] rounded-t-[1px]"
    ></div>
  </div>
);

const LineChart = ({ color }: { color: string }) => (
  <svg
    width="45"
    height="25"
    viewBox="0 0 45 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 22 L10 16 L18 19 L26 10 L34 14 L42 2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type ReceivablesData = {
  buckets: Record<string, number>;
  totalReceivables: number;
  paidTotal: number;
};

export const ReceivablesCard = ({
  receivables,
}: {
  receivables: ReceivablesData;
}) => {
  const { totalReceivables, paidTotal } = receivables;
  const total = totalReceivables + paidTotal;

  const receivedPct = total > 0 ? Math.round((paidTotal / total) * 100) : 0;
  const remainingPct =
    total > 0 ? Math.round((totalReceivables / total) * 100) : 0;

  const summaryCards = [
    {
      label: "Total",
      value: total,
      icon: Wallet,
      badge: null,
      iconBg: "bg-[#2499F9]",
      gradient:
        "linear-gradient(108deg, #EBF0FF 0%, #EBF0FF 25%, #F2F0FF 25%, #F2F0FF 42%, #FFFFFF 42%)",
      badgeBg: "",
      chartType: "bar",
      chartColor: "#2499F9",
    },
    {
      label: "Received",
      value: paidTotal,
      icon: CheckCircle2,
      badge: `+${receivedPct}%`,
      iconBg: "bg-[#06B9CE]",
      gradient:
        "linear-gradient(108deg, #E2F9F9 0%, #E2F9F9 25%, #ECFAFA 25%, #ECFAFA 42%, #FFFFFF 42%)",
      badgeBg: "bg-[#1BD084]",
      chartType: "bar",
      chartColor: "#06B9CE",
    },
    {
      label: "Remaining",
      value: totalReceivables,
      icon: Clock,
      badge: `-${remainingPct}%`,
      iconBg: "bg-[#F54C4C]",
      gradient:
        "linear-gradient(108deg, #FFEDE8 0%, #FFEDE8 25%, #FFF2EA 25%, #FFF2EA 42%, #FFFFFF 42%)",
      badgeBg: "bg-[#F54C4C]",
      chartType: "line",
      chartColor: "#F54C4C",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-[97%] mx-auto">
      {summaryCards.map((card) => (
        <div
          key={card.label}
          className="rounded-md border border-gray-100 shadow-sm p-5 min-h-[160px] flex flex-col justify-between"
          style={{ background: card.gradient }}
        >
          <div className="flex justify-between items-start">
            <span
              className={`w-12 h-12 rounded-full flex items-center justify-center ${card.iconBg}`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </span>

            {card.badge && (
              <div className="flex flex-col items-end">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white ${card.badgeBg}`}
                >
                  {card.badge}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">
                  in last 7 Days
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-[13px] font-medium text-gray-400 mb-1">
                {card.label}
              </p>
              <p className="text-2xl sm:text-[28px] font-bold text-gray-800 tracking-tight truncate">
                {formatPKR(card.value)}
              </p>
            </div>

            <div className="mb-1">
              {card.chartType === "bar" ? (
                <BarChart color={card.chartColor} />
              ) : (
                <LineChart color={card.chartColor} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceivablesCard;
