import Link from "next/link";
import { Search, Upload, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Disable caching so it's always fresh

const filters = ["All Customers", "High Value", "At Risk", "New (< 30 days)", "Lapsed (> 60 days)"];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "At Risk": "bg-amber-50 text-amber-700",
  Lapsed: "bg-red-50 text-red-600",
  New: "bg-blue-50 text-blue-700",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const currentFilter = searchParams.filter || "All Customers";

  const { data: customersData, error } = await supabase
    .from("customers")
    .select("*, orders(amount, ordered_at)")
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
  }

  let customers = (customersData || []).map((c: any) => {
    const totalOrders = c.orders?.length || 0;
    const spent = c.orders?.reduce((acc: number, o: any) => acc + Number(o.amount), 0) || 0;
    
    const lastOrderDates = c.orders?.map((o: any) => new Date(o.ordered_at).getTime()) || [];
    const maxDate = lastOrderDates.length ? Math.max(...lastOrderDates) : null;
    const daysAgo = maxDate ? Math.floor((Date.now() - maxDate) / (1000 * 60 * 60 * 24)) : null;
    
    let last = 'Never';
    let status = "New";
    if (daysAgo !== null) {
      last = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;
      if (daysAgo > 60) status = "Lapsed";
      else if (daysAgo > 30) status = "At Risk";
      else status = "Active";
    }

    return {
      id: c.id,
      name: c.name,
      email: c.email || "No email",
      city: c.city || "Unknown",
      orders_count: totalOrders,
      spent,
      last,
      status
    };
  });

  // Apply Filter
  if (currentFilter === "High Value") {
    customers = customers.filter(c => c.spent > 3000);
  } else if (currentFilter === "At Risk") {
    customers = customers.filter(c => c.status === "At Risk");
  } else if (currentFilter === "New (< 30 days)") {
    customers = customers.filter(c => c.status === "New" || c.last === 'Never');
  } else if (currentFilter === "Lapsed (> 60 days)") {
    customers = customers.filter(c => c.status === "Lapsed");
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">{customers.length} customers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by name, email…"
              className="pl-9 pr-3 py-2 w-72 text-sm bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/customers?filter=${encodeURIComponent(f)}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              currentFilter === f
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Total Orders</th>
              <th className="px-5 py-3 font-medium">Total Spent</th>
              <th className="px-5 py-3 font-medium">Last Order</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                      {initials(c.name)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{c.city}</td>
                <td className="px-5 py-3.5 text-slate-900">{c.orders_count}</td>
                <td className="px-5 py-3.5 text-slate-900">₹{c.spent.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.last}</td>
                <td className="px-5 py-3.5">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusStyles[c.status] || "bg-slate-100 text-slate-700")}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="h-7 w-7 rounded-md hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
