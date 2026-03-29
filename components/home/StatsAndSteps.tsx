"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 12400, suffix: "+", label: "Active Users", sub: "Students & Citizens" },
  { value: 98, suffix: "%", label: "Resolution Rate", sub: "Last 30 days" },
  { value: 2847, suffix: "", label: "Complaints Filed", sub: "This month" },
  { value: 47, suffix: "h", label: "Avg Response Time", sub: "Across all categories" },
];

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up with your email OTP or Google account. Verified instantly, no password needed.",
    color: "text-indigo-400",
    bg: "from-indigo-500/20 to-transparent",
    border: "border-indigo-500/30",
  },
  {
    step: "02",
    title: "File Your Complaint",
    description: "Use our 4-step animated form. Add photos, pin your location on the map, and submit.",
    color: "text-purple-400",
    bg: "from-purple-500/20 to-transparent",
    border: "border-purple-500/30",
  },
  {
    step: "03",
    title: "Track in Real-Time",
    description: "Watch status updates live. Get notified when your complaint moves to 'In Progress'.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-transparent",
    border: "border-cyan-500/30",
  },
  {
    step: "04",
    title: "Resolution Confirmed",
    description: "Once resolved, rate the response. Your feedback improves future response times.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-transparent",
    border: "border-emerald-500/30",
  },
];

export default function StatsAndSteps() {
  return (
    <>
      {/* Stats */}
      <section id="stats" className="relative z-10 py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl border border-white/10 p-10 md:p-16 relative overflow-hidden">
            {/* Glow blob */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="text-3xl md:text-4xl font-black text-white mb-3"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Numbers that <span className="gradient-text">speak for themselves</span>
              </h2>
              <p className="text-slate-400">Real metrics from our platform</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p
                    className="text-4xl md:text-5xl font-black gradient-text mb-1"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-white font-semibold text-sm">{stat.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 mb-5">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Simple Process</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              From report to{" "}
              <span className="gradient-text">resolution</span>
            </h2>
            <p className="text-slate-400 text-lg">Four simple steps to make your voice count</p>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-emerald-500/20 hidden md:block" />

            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ x: 6 }}
                  className={`relative flex gap-6 glass border ${step.border} rounded-2xl p-6 bg-gradient-to-r ${step.bg} cursor-default`}
                >
                  {/* Step number */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl glass border ${step.border} flex items-center justify-center`}>
                    <span className={`text-xl font-black ${step.color}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                      {step.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Dot on connector */}
                  <div className={`absolute -left-[5px] top-8 w-2.5 h-2.5 rounded-full bg-gradient-to-br hidden md:block`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
