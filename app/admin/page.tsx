"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FileText, Clock, CheckCircle, AlertTriangle,
  TrendingUp, Users, Download,
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/complaints/MapPicker"), { ssr: false });

// Custom Recharts tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/15 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-300 mb-1 font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

export default function AdminNerveCenterPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/complaints");
      const json = await res.json();
      setComplaints(json.complaints ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Poll every 15 seconds for new complaints
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  // Derived stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  // Category bar chart data
  const categories = ["electricity", "water", "sanitation", "hostel", "infrastructure", "internet", "safety", "other"];
  const barData = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: complaints.filter((c) => c.category === cat).length,
  }));

  // Status pie data
  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.in_progress },
    { name: "Resolved", value: stats.resolved },
    { name: "Critical", value: complaints.filter((c) => c.priority === "critical").length },
  ].filter((d) => d.value > 0);

  // Last 7 days trend
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const count = complaints.filter((c) => {
      const cd = new Date(c.created_at);
      return cd.toDateString() === d.toDateString();
    }).length;
    return { label, count };
  });

  // Map markers for complaints with location
  const mapMarkers = complaints
    .filter((c) => c.location_lat && c.location_lng)
    .map((c) => ({ lat: c.location_lat, lng: c.location_lng, title: c.title, status: c.status }));

  const statCards = [
    { label: "Total Complaints", value: stats.total, icon: FileText, color: "from-indigo-500 to-purple-600", glow: "rgba(99,102,241,0.3)" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.3)" },
    { label: "In Progress", value: stats.in_progress, icon: TrendingUp, color: "from-blue-500 to-cyan-600", glow: "rgba(59,130,246,0.3)" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-emerald-500 to-green-600", glow: "rgba(16,185,129,0.3)" },
  ];

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          🧠 Nerve Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">Real-time overview of all civic complaints</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: `0 20px 40px ${card.glow}` }}
              className="glass rounded-2xl border border-white/8 p-5 relative overflow-hidden"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
                style={{ boxShadow: `0 6px 20px ${card.glow}` }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                {loading ? "—" : card.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br ${card.color} opacity-10 -translate-y-6 translate-x-6`} />
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-white/8 p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-bold text-white mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Complaints" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-white/8 p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4">Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
        </motion.div>
      </div>

      {/* Line chart — trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl border border-white/8 p-5"
      >
        <h3 className="text-sm font-bold text-white mb-4">7-Day Complaint Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={last7}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              name="Complaints"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", r: 4 }}
              activeDot={{ r: 6, fill: "#a855f7" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Live map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl border border-white/8 p-5"
      >
        <h3 className="text-sm font-bold text-white mb-4">
          Live Complaint Map
          <span className="ml-2 text-xs text-indigo-400 font-normal">{mapMarkers.length} pinned</span>
        </h3>
        <div className="h-96 rounded-xl overflow-hidden">
          <MapPicker
            onLocationChange={() => {}}
            readonly
            markers={mapMarkers}
          />
        </div>
      </motion.div>

      {/* Recent complaints table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-2xl border border-white/8 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Complaints</h3>
          <span className="text-xs text-slate-500">{complaints.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Title", "Category", "Priority", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 10).map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3 text-slate-200 font-medium max-w-[200px] truncate">{c.title}</td>
                  <td className="px-5 py-3 text-slate-400 capitalize">{c.category}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                      c.priority === "critical" ? "badge-critical" :
                      c.priority === "high" ? "badge-in-progress" : "badge-pending"
                    }`}>{c.priority}</span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                      className="input-glass text-xs px-2 py-1 rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => updateStatus(c.id, "resolved")}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
