import { ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricProps = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "right";
  color: string;
};

export function MetricCard({ label, value, change, trend, color }: MetricProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <span
          className={cn(
            "h-7 w-7 rounded-md inline-flex items-center justify-center",
            color
          )}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{change}</div>
    </div>
  );
}
