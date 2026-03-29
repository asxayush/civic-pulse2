"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  MapPin, Upload, Wifi, Navigation,
  MessageSquare, BarChart3, ShieldCheck, Layers,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Interactive Map Complaints",
    description: "Pin your issue on a live map with React-Leaflet. Precise GPS location captured automatically.",
    color: "from-indigo-500 to-purple-600",
    glow: "rgba(99,102,241,0.25)",
    badge: "Core Feature",
  },
  {
    icon: Upload,
    title: "Drag & Drop Evidence Upload",
    description: "Attach photos and videos directly from your device. Stored securely in Supabase Storage.",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.25)",
    badge: "Media Support",
  },
  {
    icon: Wifi,
    title: "Real-Time Status Tracking",
    description: "Watch your complaint move Pending → In Progress → Resolved via Supabase WebSockets.",
    color: "from-purple-500 to-pink-600",
    glow: "rgba(168,85,247,0.25)",
    badge: "Live Updates",
  },
  {
    icon: Navigation,
    title: "GPS Hostel Attendance",
    description: "Haversine-formula distance verification. Must be within 10m of hostel. Only 9 PM–11 PM.",
    color: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.25)",
    badge: "GPS Verified",
  },
  {
    icon: MessageSquare,
    title: "Live Admin Support Chat",
    description: "Real-time floating chat widget connecting students to the admin support team.",
    color: "from-orange-500 to-amber-600",
    glow: "rgba(249,115,22,0.25)",
    badge: "24/7 Support",
  },
  {
    icon: BarChart3,
    title: "Admin Nerve Center",
    description: "Live complaint map, Recharts analytics, daily CSV exports, and RLS-secured data.",
    color: "from-rose-500 to-red-600",
    glow: "rgba(244,63,94,0.25)",
    badge: "Admin Only",
  },
  {
    icon: ShieldCheck,
    title: "Row-Level Security",
    description: "Supabase RLS policies ensure users only access their own data. Admins see everything.",
    color: "from-violet-500 to-purple-700",
    glow: "rgba(139,92,246,0.25)",
    badge: "Secure",
  },
  {
    icon: Layers,
    title: "Multi-Step Filing",
    description: "A beautifully animated 4-step form guides users through category, description, location, review.",
    color: "from-sky-500 to-indigo-600",
    glow: "rgba(14,165,233,0.25)",
    badge: "UX Optimized",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative z-10 py-20" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "9999px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Packed with Power
            </span>
          </div>
          <h2 style={{
            fontFamily: "Outfit, sans-serif", fontWeight: 900,
            fontSize: "clamp(28px, 5vw, 48px)", color: "#fff",
            lineHeight: 1.15, marginBottom: "16px",
          }}>
            Everything you need,{" "}
            <span className="gradient-text">nothing you don't</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "16px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            Purpose-built features for civic engagement and campus management, wrapped in a jaw-droppingly premium interface.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -6, boxShadow: `0 20px 50px ${feature.glow}` }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow 0.3s",
                }}
                className="group"
              >
                {/* Badge */}
                <span style={{
                  position: "absolute", top: "14px", right: "14px",
                  fontSize: "10px", fontWeight: 600, color: "#64748b",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "2px 8px", borderRadius: "9999px",
                }}>
                  {feature.badge}
                </span>

                {/* Icon */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: `linear-gradient(135deg, ${feature.color.replace("from-", "").replace("to-", "")})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px", boxShadow: `0 8px 24px ${feature.glow}`,
                }}
                  className={`bg-gradient-to-br ${feature.color}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.65 }}>
                  {feature.description}
                </p>

                {/* Bottom glow line on hover */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
