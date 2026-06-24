"use client";

import { useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportCsvButton } from "@/components/import-csv-button";

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

export function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [currentFilter, setCurrentFilter] = useState("All Customers");
  const [searchQuery, setSearchQuery] = useState("");

  let customers = initialCustomers;

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

  // Apply Live Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      String(c.orders_count).includes(q) ||
      String(c.spent).includes(q) ||
      c.last.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">{customers.length} customers</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Live search anywhere..."
              className="pl-9 pr-3 py-2 w-full md:w-72 text-sm bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <ImportCsvButton />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setCurrentFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              currentFilter === f
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto h-[calc(100vh-220px)]">
        <table className="w-full text-sm relative">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_#e2e8f0]">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium bg-slate-50">Customer</th>
              <th className="px-5 py-3 font-medium bg-slate-50">Location</th>
              <th className="px-5 py-3 font-medium bg-slate-50">Total Orders</th>
              <th className="px-5 py-3 font-medium bg-slate-50">Total Spent</th>
              <th className="px-5 py-3 font-medium bg-slate-50">Last Order</th>
              <th className="px-5 py-3 font-medium bg-slate-50">Status</th>
              <th className="px-5 py-3 font-medium w-10 bg-slate-50"></th>
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
