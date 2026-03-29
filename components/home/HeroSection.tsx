"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap } from "lucide-react";

const floatingCards = [
  {
    icon: "🔥",
    label: "Critical Issue",
    sub: "Street light outage — Block C",
    color: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/20",
    delay: 0,
  },
  {
    icon: "✅",
    label: "Resolved",
    sub: "Water supply restored",
    color: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/20",
    delay: 0.15,
  },
  {
    icon: "📍",
    label: "GPS Verified",
    sub: "Attendance marked — 9:42 PM",
    color: "from-indigo-500/20 to-purple-500/10",
    border: "border-indigo-500/20",
    delay: 0.3,
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", filter: "blur(80px)", animation: "aurora-drift 12s ease-in-out infinite" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)", filter: "blur(80px)", animation: "aurora-drift-2 16s ease-in-out infinite" }} />

      {/* Floating particle dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-indigo-500/40 pointer-events-none"
          style={{ left: `${8 + i * 8}%`, top: `${20 + (i % 4) * 20}%` }}
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-indigo-500/30 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">
            Live — 2,400+ Complaints Resolved This Month
          </span>
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          <span className="text-white">Your City.</span>
          <br />
          <span className="gradient-text text-glow-primary">Your Voice.</span>
          <br />
          <span className="text-slate-400 text-4xl md:text-5xl lg:text-6xl font-bold">
            Amplified.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-10"
        >
          Report civic issues, track resolutions in real-time, and verify hostel attendance — all in one{" "}
          <span className="text-indigo-400 font-medium">high-tech command center</span>{" "}
          designed for modern communities.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99,102,241,0.6)" }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white btn-shimmer"
            >
              File a Complaint
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link href="#features">
            <motion.button
              whileHover={{ scale: 1.03, borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 0 20px rgba(99,102,241,0.15)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 glass border border-white/10"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              Explore Features
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating status cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.03 }}
              className={`glass border ${card.border} rounded-2xl px-4 py-3 flex items-center gap-3 cursor-default bg-gradient-to-br ${card.color} min-w-[200px]`}
            >
              <span className="text-xl flex-shrink-0">{card.icon}</span>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">{card.label}</p>
                <p className="text-xs text-slate-400">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-8 pt-4 border-t border-white/5"
        >
          {[
            { value: "98%", label: "Resolution Rate" },
            { value: "< 48h", label: "Avg Response Time" },
            { value: "12K+", label: "Active Users" },
            { value: "5 Cities", label: "Deployed In" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black gradient-text" style={{ fontFamily: "Outfit, sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
