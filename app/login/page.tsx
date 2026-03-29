"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Zap, Mail, Globe, ArrowRight, KeyRound, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Tab = "otp" | "google";
type OtpStep = "email" | "verify";

export default function LoginPage() {
  const [tab, setTab]         = useState<Tab>("otp");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setOtpStep("verify");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) return;
    setLoading(true); setError("");
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
  };

  const handleGoogle = async () => {
    setLoading(true);
    // Use the env var for production, fall back to window.location.origin for local dev
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${baseUrl}/auth/callback` },
    });
  };

  const handleOtpInput = (idx: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#050508",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div className="bg-grid" style={{ position: "fixed", inset: 0, opacity: 0.15, pointerEvents: "none" }} />

      {/* Aurora orbs */}
      <div style={{
        position: "fixed", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
        filter: "blur(80px)", top: "10%", left: "10%", pointerEvents: "none",
        animation: "aurora-drift 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
        filter: "blur(80px)", bottom: "10%", right: "10%", pointerEvents: "none",
        animation: "aurora-drift-2 18s ease-in-out infinite",
      }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 520,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 28,
          padding: 48,
          boxShadow: "0 0 60px rgba(99,102,241,0.18), 0 40px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
            }}>
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span style={{
              fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 22,
              background: "linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Civic Pulse
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: 28,
            color: "#fff", marginBottom: 6,
          }}>
            Welcome back
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Sign in to your account to continue</p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
          padding: 5, marginBottom: 28, gap: 4,
        }}>
          {(["otp", "google"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, padding: "11px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                background: tab === t ? "linear-gradient(135deg, #6366f1, #7c3aed)" : "transparent",
                color: tab === t ? "#fff" : "#94a3b8",
                boxShadow: tab === t ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {t === "otp"
                ? <><Mail style={{ width: 15, height: 15 }} /> Email OTP</>
                : <><Globe style={{ width: 15, height: 15 }} /> Google</>}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* OTP Flow */}
          {tab === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22 }}
            >
              {otpStep === "email" ? (
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{
                      display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      style={{
                        width: "100%", padding: "13px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#f1f5f9", fontSize: 14, outline: "none",
                        boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
                        fontFamily: "Inter, sans-serif",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  {error && (
                    <div style={{
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                      color: "#f87171", fontSize: 13,
                    }}>
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 36px rgba(99,102,241,0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="btn-shimmer"
                    style={{
                      width: "100%", padding: "14px", borderRadius: 12, border: "none",
                      color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading
                      ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                      : <><Mail style={{ width: 16, height: 16 }} /> Send Magic Code</>}
                  </motion.button>
                </form>

              ) : success ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: "center", padding: "24px 0" }}
                >
                  <CheckCircle style={{ width: 64, height: 64, color: "#34d399", margin: "0 auto 16px" }} />
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Signed in!</p>
                  <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Redirecting to dashboard…</p>
                </motion.div>

              ) : (
                <motion.form
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleVerifyOtp}
                >
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                    }}>
                      <KeyRound style={{ width: 22, height: 22, color: "#818cf8" }} />
                    </div>
                    <p style={{ color: "#cbd5e1", fontSize: 13 }}>
                      We sent a 6-digit code to{" "}
                      <span style={{ color: "#818cf8", fontWeight: 600 }}>{email}</span>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKey(i, e)}
                        style={{
                          width: 52, height: 56, textAlign: "center",
                          fontSize: 20, fontWeight: 700,
                          background: "rgba(255,255,255,0.05)",
                          border: `1px solid ${digit ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 12, color: "#f1f5f9", outline: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = digit ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                      />
                    ))}
                  </div>

                  {error && (
                    <p style={{ textAlign: "center", color: "#f87171", fontSize: 13, marginBottom: 14 }}>{error}</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || otp.join("").length < 6}
                    className="btn-shimmer"
                    style={{
                      width: "100%", padding: "14px", borderRadius: 12, border: "none",
                      color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: (loading || otp.join("").length < 6) ? 0.5 : 1,
                      marginBottom: 12,
                    }}
                  >
                    {loading
                      ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                      : <>Verify &amp; Sign In <ArrowRight style={{ width: 15, height: 15 }} /></>}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => { setOtpStep("email"); setOtp(["", "", "", "", "", ""]); }}
                    style={{
                      width: "100%", textAlign: "center", fontSize: 12, color: "#64748b",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                  >
                    <ArrowLeft style={{ width: 12, height: 12 }} /> Use a different email
                  </button>
                </motion.form>
              )}
            </motion.div>
          )}

          {/* Google Flow */}
          {tab === "google" && (
            <motion.div
              key="google"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
                Sign in securely using your Google account. No password required.
              </p>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(99,102,241,0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: 12, cursor: "pointer",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f1f5f9", fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                {loading ? (
                  <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                ) : (
                  <>
                    <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </motion.button>

              <div style={{
                marginTop: 20, padding: "14px 16px", borderRadius: 10,
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
              }}>
                <p style={{ color: "#fbbf24", fontSize: 12, textAlign: "center" }}>
                  ⚡ Enable Google OAuth in Supabase → Authentication → Providers → Google
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p style={{
          textAlign: "center", fontSize: 12, color: "#475569",
          marginTop: 32, lineHeight: 1.6,
        }}>
          By signing in, you agree to our{" "}
          <span style={{ color: "#818cf8", cursor: "pointer" }}>Terms of Service</span>
          {" "}and{" "}
          <span style={{ color: "#818cf8", cursor: "pointer" }}>Privacy Policy</span>.
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
