"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Aurora blobs */}
      <div className="absolute inset-0">
        {/* Blob 1 — Indigo */}
        <div
          className="animate-aurora absolute -top-1/3 -left-1/4 w-[80vw] h-[80vh] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.8) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Blob 2 — Purple */}
        <div
          className="animate-aurora-2 absolute -top-1/4 -right-1/4 w-[70vw] h-[70vh] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Blob 3 — Cyan */}
        <div
          className="animate-aurora-3 absolute -bottom-1/3 left-1/4 w-[60vw] h-[60vh] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0.2) 40%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Scan line effect */}
      <div
        className="absolute inset-x-0 h-px opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)",
          animation: "scan-line 8s linear infinite",
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(5,5,8,0.8) 100%)",
        }}
      />
    </div>
  );
}
