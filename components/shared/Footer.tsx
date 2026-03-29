"use client";

import Link from "next/link";
import { Zap, Globe, Code2, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold gradient-text" style={{ fontFamily: "Outfit, sans-serif" }}>
                Civic Pulse
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              A next-generation platform for citizens and students to report issues, track resolutions, and build better communities — powered by real-time AI infrastructure.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Globe, Code2, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-500 hover:text-white hover:border-indigo-500/50 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Portal links */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Portal</p>
            <ul className="space-y-2.5">
              {["File Complaint", "Track Status", "Hostel Attendance", "My Profile"].map((item) => (
                <li key={item}>
                  <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin links */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Admin</p>
            <ul className="space-y-2.5">
              {["Nerve Center", "Complaint Management", "Support Inbox", "Attendance Export"].map((item) => (
                <li key={item}>
                  <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 Civic Pulse. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> for smarter communities
          </p>
        </div>
      </div>
    </footer>
  );
}
