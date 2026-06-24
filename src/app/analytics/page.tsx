"use client";

import { useState, useEffect } from "react";
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
import { MetricCard } from "@/components/metric-card";




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

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics', { cache: 'no-store' });
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.campaigns) setCampaigns(data.campaigns);
        if (data.lineData) setChartData(data.lineData);
      } catch (err) {
        console.error("Analytics poll error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: "Sent", value: stats.sent.toString(), change: "Live tracking", trend: "up", color: "bg-blue-50 text-blue-600" },
    { label: "Delivered", value: stats.delivered.toString(), change: "Live tracking", trend: "up", color: "bg-emerald-50 text-emerald-600" },
    { label: "Opened", value: stats.opened.toString(), change: "Live tracking", trend: "up", color: "bg-purple-50 text-purple-600" },
    { label: "Clicked", value: stats.clicked.toString(), change: "Live tracking", trend: "up", color: "bg-amber-50 text-amber-600" },
    { label: "Failed", value: stats.failed.toString(), change: "Live tracking", trend: "right", color: "bg-slate-100 text-slate-500" },
  ];

  const dynamicPieData = [
    { name: "Delivered", value: stats.delivered, color: "#3B82F6" },
    { name: "Opened", value: stats.opened, color: "#8B5CF6" },
    { name: "Clicked", value: stats.clicked, color: "#F59E0B" },
    { name: "Failed", value: stats.failed, color: "#F87171" },
  ];

  // We only show data if there's actual data, otherwise the pie chart might crash if all values are 0
  const hasData = stats.sent > 0;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            change={m.change}
            trend={m.trend as "up" | "right"}
            color={m.color}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Campaign Performance Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="Sent" stroke="#94A3B8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Delivered" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Opened" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Clicked" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Failed" stroke="#F87171" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Message Status Breakdown</h3>
          <div className="h-72 flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  >
                    {dynamicPieData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <p className="text-slate-400 text-sm">No data yet. Run a campaign to see stats.</p>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
        <div className="px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-slate-900 text-sm">Recent Campaigns</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm relative">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Campaign Name</th>
                <th className="px-5 py-3 font-medium">Audience</th>
                <th className="px-5 py-3 font-medium">Created At</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No campaigns created yet. Run one with Gemini!</td></tr>
              ) : (
                campaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{c.audience_count}</td>
                    <td className="px-5 py-3.5 text-slate-600">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        Running
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
