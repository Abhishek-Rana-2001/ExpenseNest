import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { TrendingDown, TrendingUp } from "lucide-react";

type StatCardProps = {
  title:string;
  trend:"Up" | "Down";
  amount: number;
  period:string;
  currency?:"INR"|"USD"|"EUR"|"GBP"|"JPY"|"AUD"|"CAD"
};

const StatCard = ({ amount, title, trend, period, currency }: StatCardProps) => {
  return (
    <div className="w-full p-4 border border-gray-200 rounded-2xl">
      <div className="flex items-center justify-between">
        <p className="text-stone-950 text-sm">{title}: </p>
        <span className={`px-2 rounded-full ${trend === "Up" ? "text-green-500 bg-green-100" : ""}`}>{trend === "Up" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}</span>
      </div>
      <h2 className="text-3xl font-semibold mt-3">
        {SUPPORTED_CURRENCIES.find(cur=>cur.code === currency)?.symbol} {amount.toFixed(2)}
      </h2>
      <p className="text-sm mt-2">{period}</p>
    </div>
  );
};

export default StatCard;
