"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Plus, Search, Filter } from "lucide-react";
import { formatRelativeTime, getStatusColor, getStatusLabel } from "@/lib/utils";

const CATEGORIES = ["All", "electricity", "water", "sanitation", "hostel", "infrastructure", "internet", "safety", "other"];
const STATUSES = ["All", "pending", "in_progress", "resolved"];

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setComplaints(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || c.category === catFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>My Complaints</h1>
          <p className="text-slate-400 text-sm mt-0.5">{complaints.length} total complaint{complaints.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/complaints/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-shimmer text-white font-bold text-sm"
          >
            <Plus className="w-4 h-4" /> New
          </motion.button>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl border border-white/8 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints…"
            className="input-glass w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                statusFilter === s ? "bg-indigo-600 border-indigo-500 text-white" : "glass border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl h-20 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-white/8 p-12 text-center">
          <p className="text-slate-400">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className="glass rounded-xl border border-white/8 px-5 py-4 flex items-center gap-4 cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{c.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>
                    {getStatusLabel(c.status)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium glass border border-white/10 text-slate-400`}>
                    {c.priority}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatRelativeTime(c.created_at)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
