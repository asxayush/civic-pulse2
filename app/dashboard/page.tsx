"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, Clock, CheckCircle, AlertTriangle,
  TrendingUp, Plus, ArrowRight, Zap,
} from "lucide-react";
import { formatRelativeTime, getStatusColor, getStatusLabel } from "@/lib/utils";

const statCards = [
  { label: "Total Filed", icon: FileText, color: "from-indigo-500 to-purple-600", glow: "rgba(99,102,241,0.3)", key: "total" },
  { label: "Pending", icon: Clock, color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.3)", key: "pending" },
  { label: "In Progress", icon: TrendingUp, color: "from-blue-500 to-cyan-600", glow: "rgba(59,130,246,0.3)", key: "in_progress" },
  { label: "Resolved", icon: CheckCircle, color: "from-emerald-500 to-green-600", glow: "rgba(16,185,129,0.3)", key: "resolved" },
];

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const all = data ?? [];
      setComplaints(all);
      setStats({
        total: all.length,
        pending: all.filter((c) => c.status === "pending").length,
        in_progress: all.filter((c) => c.status === "in_progress").length,
        resolved: all.filter((c) => c.status === "resolved").length,
      });
      setLoading(false);
    }
    load();
  }, []);

  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            {greeting}, {name} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here&apos;s an overview of your complaints and activity.
          </p>
        </div>
        <Link href="/dashboard/complaints/new">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99,102,241,0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-shimmer text-white font-bold text-sm"
          >
            <Plus className="w-4 h-4" /> File Complaint
          </motion.button>
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: `0 20px 40px ${card.glow}` }}
              className="glass rounded-2xl border border-white/8 p-5 relative overflow-hidden"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
                style={{ boxShadow: `0 6px 20px ${card.glow}` }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                {loading ? "—" : value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              {/* Gradient accent */}
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br ${card.color} opacity-10 -translate-y-6 translate-x-6`} />
            </motion.div>
          );
        })}
      </div>

      {/* Recent complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Recent Complaints
          </h2>
          <Link href="/dashboard/complaints">
            <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl h-16 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl border border-white/8 p-12 text-center"
          >
            <Zap className="w-12 h-12 text-indigo-500/40 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No complaints yet</p>
            <p className="text-slate-500 text-sm mb-5">File your first complaint to get started</p>
            <Link href="/dashboard/complaints/new">
              <button className="px-5 py-2.5 rounded-xl btn-shimmer text-white font-bold text-sm">
                File Now
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ x: 4 }}
                className="glass rounded-xl border border-white/8 px-5 py-4 flex items-center gap-4 cursor-pointer"
              >
                <div className="w-2 h-10 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.category} · {formatRelativeTime(c.created_at)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>
                  {getStatusLabel(c.status)}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
