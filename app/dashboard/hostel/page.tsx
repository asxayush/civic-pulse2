"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2, Users, User, Utensils, MapPin, AlertCircle,
  Wifi, ShowerHead, Wrench, ChevronRight, CheckCircle,
  Zap, Wind, Lock, ArrowLeft,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const boysHostels = [
  { id: "bh1", name: "Block A – Aravalli",  rooms: 120, warden: "Mr. Sharma",  color: "from-blue-500 to-indigo-600",    glow: "rgba(59,130,246,0.3)" },
  { id: "bh2", name: "Block B – Vindhya",   rooms: 90,  warden: "Mr. Verma",   color: "from-indigo-500 to-purple-600",  glow: "rgba(99,102,241,0.3)" },
  { id: "bh3", name: "Block C – Himalaya",  rooms: 80,  warden: "Mr. Gupta",   color: "from-violet-500 to-purple-700", glow: "rgba(139,92,246,0.3)" },
];

const girlsHostels = [
  { id: "gh1", name: "Block D – Saraswati", rooms: 110, warden: "Ms. Singh",   color: "from-pink-500 to-rose-600",     glow: "rgba(244,63,94,0.3)" },
  { id: "gh2", name: "Block E – Gayatri",   rooms: 95,  warden: "Ms. Patel",   color: "from-rose-500 to-orange-500",   glow: "rgba(249,115,22,0.3)" },
  { id: "gh3", name: "Block F – Lakshmi",   rooms: 85,  warden: "Ms. Kapoor",  color: "from-fuchsia-500 to-pink-600",  glow: "rgba(217,70,239,0.3)" },
];

const messIssues = [
  { id: "food_quality",    label: "Food Quality",    icon: Utensils },
  { id: "hygiene",         label: "Hygiene / Cleanliness", icon: ShowerHead },
  { id: "water_supply",    label: "Water Supply",    icon: Wind },
  { id: "electricity",     label: "Electricity",     icon: Zap },
  { id: "wifi",            label: "WiFi / Internet", icon: Wifi },
  { id: "maintenance",     label: "Maintenance",     icon: Wrench },
  { id: "security",        label: "Security / Lock", icon: Lock },
  { id: "other",           label: "Other Issue",     icon: AlertCircle },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HostelCard({
  hostel, gender, onClick,
}: {
  hostel: typeof boysHostels[0];
  gender: "boys" | "girls";
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: `0 20px 50px ${hostel.glow}` }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 16, padding: 24, cursor: "pointer",
        position: "relative", overflow: "hidden", transition: "box-shadow 0.3s",
      }}
    >
      {/* Gender badge */}
      <span style={{
        position: "absolute", top: 14, right: 14,
        fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
        background: gender === "boys" ? "rgba(59,130,246,0.15)" : "rgba(244,63,94,0.15)",
        color: gender === "boys" ? "#60a5fa" : "#fb7185",
        border: `1px solid ${gender === "boys" ? "rgba(59,130,246,0.3)" : "rgba(244,63,94,0.3)"}`,
      }}>
        {gender === "boys" ? "♂ Boys" : "♀ Girls"}
      </span>

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 8px 20px ${hostel.glow}`,
      }} className={`bg-gradient-to-br ${hostel.color}`}>
        <Building2 className="w-6 h-6 text-white" />
      </div>

      <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{hostel.name}</h3>
      <p style={{ color: "#64748b", fontSize: 12 }}>Warden: <span style={{ color: "#94a3b8" }}>{hostel.warden}</span></p>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>{hostel.rooms} rooms</p>

      <div style={{ display: "flex", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 10px", borderRadius: 8,
          background: "rgba(99,102,241,0.15)", color: "#818cf8",
          border: "1px solid rgba(99,102,241,0.25)", fontSize: 11, fontWeight: 600,
        }}>
          <Utensils className="w-3 h-3" /> File Mess Complaint
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 10px", borderRadius: 8,
          background: "rgba(16,185,129,0.15)", color: "#34d399",
          border: "1px solid rgba(16,185,129,0.25)", fontSize: 11, fontWeight: 600,
        }}>
          <MapPin className="w-3 h-3" /> Attendance
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type View = "hub" | "hostel" | "complaint-success";

export default function HostelHubPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("hub");
  const [selectedHostel, setSelectedHostel] = useState<typeof boysHostels[0] | null>(null);
  const [selectedGender, setSelectedGender] = useState<"boys" | "girls">("boys");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleHostelClick = (hostel: typeof boysHostels[0], gender: "boys" | "girls") => {
    setSelectedHostel(hostel);
    setSelectedGender(gender);
    setView("hostel");
    setSelectedIssue(null);
    setDescription("");
  };

  const handleSubmitComplaint = async () => {
    if (!selectedIssue || !description.trim()) return;
    setSubmitting(true);

    // Redirect to the standard new complaint form pre-filled with hostel category
    router.push(
      `/dashboard/complaints/new?category=hostel&hostel=${selectedHostel?.id}&issue=${selectedIssue}&hostel_name=${encodeURIComponent(selectedHostel?.name ?? "")}`
    );
  };

  const handleGoAttendance = () => {
    router.push("/dashboard/attendance");
  };

  // ── HUB VIEW ──────────────────────────────────────────────────────────────
  if (view === "hub") {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 30, color: "#fff", marginBottom: 6 }}>
            🏠 Hostel Hub
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Select your hostel to file a mess complaint or mark attendance
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12, marginBottom: 36,
          }}
        >
          {[
            { label: "File Mess Complaint", icon: Utensils, color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", desc: "Report food, hygiene, or facilities issues" },
            { label: "Mark Attendance",     icon: MapPin,   color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", desc: "GPS-verified hostel attendance (9–11 PM)" },
            { label: "View Warden Contact", icon: User,     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  desc: "Find your warden's contact information" },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                onClick={() => { if (i === 1) handleGoAttendance(); }}
                style={{
                  background: a.bg, border: `1px solid ${a.border}`,
                  borderRadius: 14, padding: "18px 20px", cursor: "pointer",
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: a.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{a.label}</p>
                  <p style={{ color: "#64748b", fontSize: 11 }}>{a.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Boys Hostels */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 99,
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
            }}>
              <Users className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
              <span style={{ color: "#60a5fa", fontWeight: 600, fontSize: 12 }}>Boys Hostels</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {boysHostels.map((h) => (
              <HostelCard key={h.id} hostel={h} gender="boys" onClick={() => handleHostelClick(h, "boys")} />
            ))}
          </div>
        </motion.div>

        {/* Girls Hostels */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 99,
              background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
            }}>
              <User className="w-3.5 h-3.5" style={{ color: "#fb7185" }} />
              <span style={{ color: "#fb7185", fontWeight: 600, fontSize: 12 }}>Girls Hostels</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {girlsHostels.map((h) => (
              <HostelCard key={h.id} hostel={h} gender="girls" onClick={() => handleHostelClick(h, "girls")} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── HOSTEL DETAIL VIEW ────────────────────────────────────────────────────
  if (view === "hostel" && selectedHostel) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 28 }}>
          <button
            onClick={() => setView("hub")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
              fontSize: 13, marginBottom: 16, padding: 0,
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hostel Hub
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 8px 24px ${selectedHostel.glow}`,
            }} className={`bg-gradient-to-br ${selectedHostel.color}`}>
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 22, color: "#fff" }}>
                {selectedHostel.name}
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Warden: {selectedHostel.warden} · {selectedHostel.rooms} rooms</p>
            </div>
          </div>
        </motion.div>

        {/* Two action cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Mark Attendance", icon: MapPin, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", action: handleGoAttendance },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <motion.button
                key={a.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={a.action}
                style={{
                  background: a.bg, border: `1px solid ${a.border}`,
                  borderRadius: 12, padding: "14px 18px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                }}
              >
                <Icon style={{ width: 18, height: 18, color: a.color, flexShrink: 0 }} />
                <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{a.label}</span>
              </motion.button>
            );
          })}
          <motion.div
            style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <Utensils style={{ width: 18, height: 18, color: "#818cf8", flexShrink: 0 }} />
            <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>File Mess Complaint</span>
          </motion.div>
        </div>

        {/* Complaint Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 28,
          }}
        >
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>🍽️ Mess / Hostel Complaint</h2>
          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>
            Select the type of issue and describe it below
          </p>

          {/* Issue Type Grid */}
          <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Issue Type
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 24 }}>
            {messIssues.map((issue) => {
              const Icon = issue.icon;
              const active = selectedIssue === issue.id;
              return (
                <motion.button
                  key={issue.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIssue(issue.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "14px 8px", borderRadius: 12, cursor: "pointer", border: "none",
                    background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                    outline: "none", transition: "all 0.2s",
                  } as any}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: active ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon style={{ width: 16, height: 16, color: active ? "#fff" : "#94a3b8" }} />
                  </div>
                  <span style={{ fontSize: 11, color: active ? "#c4b5fd" : "#64748b", fontWeight: active ? 600 : 400, textAlign: "center" }}>
                    {issue.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Description */}
          <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Description
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail…"
            rows={4}
            style={{
              width: "100%", borderRadius: 12, padding: "12px 16px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#f1f5f9", fontSize: 13, resize: "vertical", outline: "none",
              fontFamily: "Inter, sans-serif", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          />

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitComplaint}
            disabled={!selectedIssue || !description.trim() || submitting}
            className="btn-shimmer"
            style={{
              width: "100%", marginTop: 20, padding: "13px", borderRadius: 12,
              border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              opacity: (!selectedIssue || !description.trim()) ? 0.5 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {submitting ? "Redirecting…" : <><CheckCircle className="w-4 h-4" /> Submit Complaint</>}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return null;
}
