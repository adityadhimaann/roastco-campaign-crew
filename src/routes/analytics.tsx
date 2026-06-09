import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Roast & Co. CRM" },
      { name: "description", content: "Campaign performance analytics for Roast & Co." },
    ],
  }),
  component: AnalyticsPage,
});

const metrics = [
  { label: "Sent", value: "847", change: "+12% vs last month", trend: "up", color: "bg-blue-50 text-blue-600" },
  { label: "Delivered", value: "721", change: "85.1% delivery rate", trend: "up", color: "bg-emerald-50 text-emerald-600" },
  { label: "Opened", value: "312", change: "43.3% open rate", trend: "up", color: "bg-purple-50 text-purple-600" },
  { label: "Clicked", value: "89", change: "28.5% click rate", trend: "right", color: "bg-amber-50 text-amber-600" },
  { label: "Orders Placed", value: "34", change: "Revenue ₹18,400", trend: "up", color: "bg-emerald-50 text-emerald-600" },
];

const lineData = [
  { day: "Mon", Sent: 110, Delivered: 92, Opened: 41 },
  { day: "Tue", Sent: 135, Delivered: 118, Opened: 52 },
  { day: "Wed", Sent: 98, Delivered: 84, Opened: 36 },
  { day: "Thu", Sent: 142, Delivered: 121, Opened: 58 },
  { day: "Fri", Sent: 128, Delivered: 109, Opened: 49 },
  { day: "Sat", Sent: 156, Delivered: 132, Opened: 61 },
  { day: "Sun", Sent: 78, Delivered: 65, Opened: 27 },
];

const pieData = [
  { name: "Delivered", value: 721, color: "#3B82F6" },
  { name: "Opened", value: 312, color: "#8B5CF6" },
  { name: "Clicked", value: 89, color: "#F59E0B" },
  { name: "Failed", value: 126, color: "#94A3B8" },
];

const campaignRows = [
  { name: "Win-back Q2", audience: 127, sent: 127, delivered: 108, opened: 47, clicked: 14, orders: 6 },
  { name: "New Menu Launch", audience: 300, sent: 298, delivered: 251, opened: 89, clicked: 22, orders: 11 },
  { name: "Loyalty Push", audience: 89, sent: 89, delivered: 76, opened: 34, clicked: 9, orders: 4 },
  { name: "Weekend Special", audience: 231, sent: 231, delivered: 196, opened: 78, clicked: 19, orders: 8 },
];

function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Track campaign performance across channels.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-sm">
          <Calendar className="h-4 w-4 text-slate-500" /> Last 30 days
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {m.label}
              </span>
              <span className={cn("h-7 w-7 rounded-md inline-flex items-center justify-center", m.color)}>
                {m.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
              </span>
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{m.value}</div>
            <div className="mt-1 text-xs text-slate-500">{m.change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Campaign Performance Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Sent" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Delivered" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Opened" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Message Status Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Recent Campaigns</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50">
              <th className="px-5 py-3 font-medium">Campaign Name</th>
              <th className="px-5 py-3 font-medium">Audience</th>
              <th className="px-5 py-3 font-medium">Sent</th>
              <th className="px-5 py-3 font-medium">Delivered</th>
              <th className="px-5 py-3 font-medium">Opened</th>
              <th className="px-5 py-3 font-medium">Clicked</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaignRows.map((c) => (
              <tr key={c.name} className="hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.audience}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.sent}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.delivered}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.opened}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.clicked}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.orders}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    Completed
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <a href="#" className="text-primary text-xs font-medium hover:underline">
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
