"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Zap, LayoutDashboard, FileText, MessageSquare,
  CalendarCheck, LogOut, ChevronRight, Shield, Delete,
} from "lucide-react";

const adminNav = [
  { label: "Nerve Center", href: "/admin", icon: LayoutDashboard },
  { label: "Complaints", href: "/admin/complaints", icon: FileText },
  { label: "Support Inbox", href: "/admin/chat", icon: MessageSquare },
  { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
];

const ADMIN_PIN = "1234"; // In production, this comes from env/API

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pinVerified, setPinVerified] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check session storage for already-verified PIN
    const v = sessionStorage.getItem("admin_pin_verified");
    if (v === "true") setPinVerified(true);
  }, []);

  const handlePinInput = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[idx] = value;
    setPin(next);
    if (value && idx < 3) {
      document.getElementById(`admin-pin-${idx + 1}`)?.focus();
    }
    // Auto-submit when all 4 entered
    if (idx === 3 && value) {
      setTimeout(() => {
        const entered = [...next].join("");
        verifyPin(entered);
      }, 100);
    }
  };

  const handlePinKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      document.getElementById(`admin-pin-${idx - 1}`)?.focus();
    }
  };

  const verifyPin = (entered: string) => {
    if (entered === ADMIN_PIN) {
      setPinVerified(true);
      setPinError(false);
      sessionStorage.setItem("admin_pin_verified", "true");
    } else {
      setPinError(true);
      setPinShake(true);
      setPin(["", "", "", ""]);
      setTimeout(() => {
        setPinShake(false);
        document.getElementById("admin-pin-0")?.focus();
      }, 600);
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("admin_pin_verified");
    await supabase.auth.signOut();
    router.push("/login");
  };

  // PIN Gate
  if (!pinVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="fixed inset-0 bg-grid opacity-20" />
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass-strong rounded-3xl border border-white/10 p-10 w-full max-w-sm text-center glow-primary"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 glow-primary">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            Admin Portal
          </h1>
          <p className="text-slate-400 text-sm mb-8">Enter your 4-digit admin PIN to continue</p>

          <motion.div
            animate={pinShake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="flex gap-3 justify-center mb-6"
          >
            {pin.map((digit, i) => (
              <input
                key={i}
                id={`admin-pin-${i}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinInput(i, e.target.value)}
                onKeyDown={(e) => handlePinKey(i, e)}
                className={`w-14 h-14 text-center text-2xl font-black rounded-xl transition-all duration-200 ${
                  pinError
                    ? "input-glass border-red-500/60 text-red-400"
                    : digit
                    ? "input-glass border-indigo-500/60 text-white"
                    : "input-glass text-white"
                }`}
                autoFocus={i === 0}
              />
            ))}
          </motion.div>

          {pinError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs mb-4"
            >
              Incorrect PIN. Try again.
            </motion.p>
          )}

          <button
            onClick={() => verifyPin(pin.join(""))}
            className="w-full py-3 rounded-xl btn-shimmer text-white font-bold text-sm"
          >
            Verify PIN
          </button>
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050508]">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div
        className="fixed top-0 left-64 w-96 h-96 rounded-full pointer-events-none opacity-8"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      {/* Sidebar */}
      <aside className="w-64 flex flex-col fixed inset-y-0 left-0 z-30 glass border-r border-white/5">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-black gradient-text" style={{ fontFamily: "Outfit, sans-serif" }}>
              Civic Pulse
            </span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span className="text-xs text-indigo-400 font-semibold">Admin Mode</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : ""}`} />
                  {item.label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out & Lock
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 glass border-b border-white/5 px-6 py-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-300">Admin Control Panel</span>
        </header>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 p-6 relative z-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
