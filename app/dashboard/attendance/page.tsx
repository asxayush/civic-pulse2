"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Navigation, MapPin, Clock, CheckCircle,
  XCircle, Lock, Loader2, AlertTriangle,
} from "lucide-react";
import {
  haversineDistance,
  isAttendanceWindowOpen,
  HOSTEL_COORDINATES,
  ATTENDANCE_RADIUS_METERS,
  formatDistance,
} from "@/lib/haversine";
import { formatDate } from "@/lib/utils";

export default function AttendancePage() {
  const [gpsState, setGpsState] = useState<"idle" | "locating" | "checking" | "success" | "error">("idle");
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [todayMarked, setTodayMarked] = useState(false);
  const supabase = createClient();
  const windowOpen = isAttendanceWindowOpen();

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("user_id", user.id)
      .order("marked_at", { ascending: false })
      .limit(10);
    setRecords(data ?? []);
    const today = new Date().toLocaleDateString("en-IN");
    setTodayMarked(
      (data ?? []).some((r) => new Date(r.marked_at).toLocaleDateString("en-IN") === today)
    );
  }

  const handleMarkAttendance = async () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation not supported by your browser.");
      setGpsState("error");
      return;
    }
    setGpsState("locating");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserPos({ lat, lon });
        setGpsState("checking");

        const dist = haversineDistance(lat, lon, HOSTEL_COORDINATES.lat, HOSTEL_COORDINATES.lon);
        setDistance(dist);

        await new Promise((r) => setTimeout(r, 800)); // dramatic pause

        if (dist > ATTENDANCE_RADIUS_METERS) {
          setErrorMsg(`You are ${formatDistance(dist)} away from the hostel. Must be within ${ATTENDANCE_RADIUS_METERS}m.`);
          setGpsState("error");
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("attendance_records").insert({
          user_id: user.id,
          latitude: lat,
          longitude: lon,
          distance_meters: dist,
          verified: true,
        });

        if (error) {
          setErrorMsg("Failed to save attendance. Try again.");
          setGpsState("error");
          return;
        }

        setGpsState("success");
        setTodayMarked(true);
        loadRecords();
      },
      (err) => {
        setErrorMsg("Location access denied. Please enable GPS.");
        setGpsState("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          Hostel Attendance
        </h1>
        <p className="text-slate-400 text-sm mt-1">GPS-verified check-in · Window: 9 PM – 11 PM</p>
      </motion.div>

      {/* Main attendance card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl border border-white/10 p-8 text-center relative overflow-hidden"
      >
        {/* BG glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: todayMarked
              ? "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)"
              : windowOpen
              ? "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(100,116,139,0.05) 0%, transparent 70%)",
          }}
        />

        {/* Status icon */}
        <AnimatePresence mode="wait">
          {todayMarked ? (
            <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto glow-secondary">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          ) : !windowOpen ? (
            <motion.div key="locked" initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-6">
              <div className="w-24 h-24 rounded-full glass border border-white/15 flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-slate-500" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="ready" initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-6">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto relative ${
                  gpsState === "error"
                    ? "bg-gradient-to-br from-red-500 to-rose-600"
                    : gpsState === "success"
                    ? "bg-gradient-to-br from-emerald-500 to-green-600"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 glow-primary"
                }`}
              >
                {gpsState === "idle" && <Navigation className="w-10 h-10 text-white" />}
                {(gpsState === "locating" || gpsState === "checking") && <Loader2 className="w-10 h-10 text-white animate-spin" />}
                {gpsState === "success" && <CheckCircle className="w-10 h-10 text-white" />}
                {gpsState === "error" && <XCircle className="w-10 h-10 text-white" />}
                {gpsState === "idle" && (
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400/40 animate-ping" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {todayMarked ? (
          <>
            <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Attendance Marked ✓
            </h2>
            <p className="text-slate-400 text-sm">You have already checked in today. See you tomorrow!</p>
          </>
        ) : !windowOpen ? (
          <>
            <h2 className="text-xl font-bold text-white mb-2">Outside Attendance Window</h2>
            <p className="text-slate-400 text-sm">
              Attendance marking is only available between <span className="text-indigo-300 font-medium">9:00 PM and 11:00 PM IST</span>.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-2">
              {gpsState === "idle" && "Ready to Check In"}
              {gpsState === "locating" && "Getting Your Location…"}
              {gpsState === "checking" && "Verifying Distance…"}
              {gpsState === "success" && "Check-in Successful!"}
              {gpsState === "error" && "Check-in Failed"}
            </h2>
            {distance !== null && (
              <p className={`text-sm mb-3 font-medium ${distance <= ATTENDANCE_RADIUS_METERS ? "text-emerald-400" : "text-red-400"}`}>
                Distance from hostel: {formatDistance(distance)}
              </p>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 text-left">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {(gpsState === "idle" || gpsState === "error") && (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99,102,241,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleMarkAttendance}
                className="px-8 py-3.5 rounded-xl btn-shimmer text-white font-bold flex items-center gap-2 mx-auto"
              >
                <MapPin className="w-4 h-4" /> Mark Attendance
              </motion.button>
            )}
          </>
        )}

        {/* Hostel info */}
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">{HOSTEL_COORDINATES.name}</span>
          <span className="text-xs text-slate-600">· Must be within {ATTENDANCE_RADIUS_METERS}m</span>
        </div>
      </motion.div>

      {/* Recent records */}
      {records.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Attendance History
          </h2>
          <div className="space-y-2">
            {records.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl border border-white/8 px-4 py-3 flex items-center gap-3"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{formatDate(r.marked_at)}</p>
                  <p className="text-xs text-slate-500">{formatDistance(r.distance_meters ?? 0)} from hostel</p>
                </div>
                <span className="text-xs badge-resolved px-2 py-0.5 rounded-full font-medium">Verified</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
