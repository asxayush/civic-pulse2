"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Zap, LayoutDashboard, FileText, MapPin, User,
  LogOut, Menu, X, Bell, ChevronRight, Activity, Building2,
} from "lucide-react";
import ChatWidget from "@/components/chat/ChatWidget";

const navItems = [
  { label: "Overview",       href: "/dashboard",             icon: LayoutDashboard },
  { label: "My Complaints",  href: "/dashboard/complaints",  icon: FileText },
  { label: "Hostel Hub",     href: "/dashboard/hostel",      icon: Building2 },
  { label: "Attendance",     href: "/dashboard/attendance",  icon: MapPin },
  { label: "Profile",        href: "/dashboard/profile",     icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 18 }} className="gradient-text">
            Civic Pulse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => {
          const Icon  = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 14px", borderRadius: "12px", cursor: "pointer",
                  background: active ? "linear-gradient(90deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))" : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                  color: active ? "#fff" : "#94a3b8",
                  fontSize: 13, fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
              >
                <Icon style={{ width: 16, height: 16, color: active ? "#818cf8" : "inherit", flexShrink: 0 }} />
                {item.label}
                {active && <ChevronRight style={{ width: 12, height: 12, marginLeft: "auto", color: "#818cf8" }} />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
          padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #a855f7, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.user_metadata?.full_name ?? "User"}
            </p>
            <p style={{ fontSize: 10, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 12px", borderRadius: "8px", border: "none", background: "none", cursor: "pointer",
            fontSize: 12, color: "#64748b", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.background = "none"; }}
        >
          <LogOut style={{ width: 14, height: 14 }} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#050508", position: "relative" }}>
      {/* Bg grid */}
      <div className="bg-grid" style={{ position: "fixed", inset: 0, opacity: 0.15, pointerEvents: "none", zIndex: 0 }} />
      <div style={{
        position: "fixed", top: 0, left: 256, width: 384, height: 384, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: 256, flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 30, display: "none",
        background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }} className="md-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, width: 280,
                background: "rgba(10,10,20,0.95)", backdropFilter: "blur(40px)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, marginLeft: 0, display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 1 }} className="main-content">
        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(5,5,8,0.8)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button
            className="md-hide-hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity className="w-4 h-4 text-green-400" style={{ animation: "pulse-glow 3s infinite" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>System operational</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button style={{
              width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94a3b8", position: "relative",
            }}>
              <Bell className="w-4 h-4" />
              <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
            </button>
            <Link href="/dashboard/complaints/new" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn-shimmer"
                style={{ padding: "6px 14px", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                + New Complaint
              </motion.button>
            </Link>
          </div>
        </header>

        {/* Page */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ flex: 1, padding: "24px", position: "relative" }}
        >
          {children}
        </motion.main>
        <ChatWidget />
      </div>

      {/* ── Inject responsive CSS ── */}
      <style>{`
        @media (min-width: 768px) {
          .md-sidebar { display: block !important; }
          .main-content { margin-left: 256px !important; }
          .md-hide-hamburger { display: none !important; }
        }
        @media (max-width: 767px) {
          .md-sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
