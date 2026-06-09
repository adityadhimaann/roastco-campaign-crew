import { createFileRoute } from "@tanstack/react-router";
import { Search, Upload, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers · Roast & Co. CRM" },
      { name: "description", content: "Customer directory and segments for Roast & Co." },
    ],
  }),
  component: CustomersPage,
});

const customers = [
  { name: "Priya Sharma", email: "priya.s@gmail.com", city: "Mumbai", orders: 8, spent: 4200, last: "3 days ago", status: "Active" },
  { name: "Rohan Mehta", email: "rohan.m@gmail.com", city: "Delhi", orders: 2, spent: 890, last: "67 days ago", status: "Lapsed" },
  { name: "Ananya Iyer", email: "ananya.i@gmail.com", city: "Bangalore", orders: 12, spent: 6100, last: "1 day ago", status: "Active" },
  { name: "Karan Patel", email: "karan.p@gmail.com", city: "Ahmedabad", orders: 1, spent: 340, last: "45 days ago", status: "At Risk" },
  { name: "Sneha Nair", email: "sneha.n@gmail.com", city: "Kochi", orders: 6, spent: 2800, last: "12 days ago", status: "Active" },
  { name: "Arjun Singh", email: "arjun.s@gmail.com", city: "Chandigarh", orders: 3, spent: 1200, last: "72 days ago", status: "Lapsed" },
  { name: "Divya Reddy", email: "divya.r@gmail.com", city: "Hyderabad", orders: 9, spent: 4600, last: "5 days ago", status: "Active" },
  { name: "Amit Joshi", email: "amit.j@gmail.com", city: "Pune", orders: 1, spent: 280, last: "38 days ago", status: "At Risk" },
];

const filters = ["All Customers", "High Value", "At Risk", "New (< 30 days)", "Lapsed (> 60 days)"];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "At Risk": "bg-amber-50 text-amber-700",
  Lapsed: "bg-red-50 text-red-600",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function CustomersPage() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">200 customers · 847 orders</p>
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
        {filters.map((f, i) => (
          <button
            key={f}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              i === 0
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            )}
          >
            {f}
          </button>
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
              <tr key={c.email} className="hover:bg-slate-50/60 transition-colors">
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
                <td className="px-5 py-3.5 text-slate-900">{c.orders}</td>
                <td className="px-5 py-3.5 text-slate-900">₹{c.spent.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.last}</td>
                <td className="px-5 py-3.5">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusStyles[c.status])}>
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
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1–8 of 200 customers</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Previous</button>
            <button className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
