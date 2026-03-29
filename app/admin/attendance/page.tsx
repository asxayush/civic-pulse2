"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Download, CheckCircle, XCircle, Calendar } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { formatDistance } from "@/lib/haversine";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("attendance_records")
        .select("*, profiles(full_name, email)")
        .order("marked_at", { ascending: false });
      setRecords(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = records.filter((r) => {
    if (!dateFilter) return true;
    return new Date(r.marked_at).toISOString().slice(0, 10) === dateFilter;
  });

  const exportCsv = () => {
    const header = "User ID,Full Name,Email,Marked At,Distance (m),Verified\n";
    const rows = filtered.map((r) =>
      [
        r.user_id,
        r.profiles?.full_name ?? "",
        r.profiles?.email ?? "",
        new Date(r.marked_at).toISOString(),
        (r.distance_meters ?? 0).toFixed(2),
        r.verified ? "Yes" : "No",
      ].join(",")
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${dateFilter || "all"}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Attendance Records
          </h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} records</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={exportCsv}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-shimmer text-white font-bold text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </motion.button>
      </motion.div>

      {/* Date filter */}
      <div className="glass rounded-xl border border-white/8 p-4 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-slate-500" />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-glass px-3 py-2 rounded-lg text-sm flex-1 max-w-xs"
        />
        {dateFilter && (
          <button onClick={() => setDateFilter("")} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/8 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Student", "Email", "Marked At", "Distance", "Verified"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No records found</td></tr>
              ) : (
                filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 text-slate-200 font-medium">{r.profiles?.full_name ?? r.user_id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-slate-400">{r.profiles?.email ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-300">{formatRelativeTime(r.marked_at)}</td>
                    <td className="px-5 py-3 text-slate-300">{formatDistance(r.distance_meters ?? 0)}</td>
                    <td className="px-5 py-3">
                      {r.verified ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> No
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
