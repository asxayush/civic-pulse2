"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Shield, Calendar, Edit2, CheckCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setFullName(data?.full_name ?? "");
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
    setProfile((p: any) => ({ ...p, full_name: fullName }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          My Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-white/10 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(30%, -30%)" }} />

        {/* Avatar */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 glow-primary">
            <span className="text-3xl font-black text-white">
              {(profile?.full_name ?? user?.email ?? "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-glass flex-1 px-3 py-2 rounded-xl text-sm"
                  placeholder="Full name"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl btn-shimmer text-white text-xs font-bold flex items-center gap-1"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-xl glass border border-white/10 text-xs text-slate-400">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {profile?.full_name ?? "No name set"}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                profile?.role === "admin" ? "badge-critical" : "badge-in-progress"
              }`}>
                {profile?.role === "admin" ? "Admin" : "User"}
              </span>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-emerald-400 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" /> Saved!
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: user?.email ?? "—" },
            { icon: Calendar, label: "Member Since", value: profile?.created_at ? formatDate(profile.created_at) : "—" },
            { icon: Shield, label: "Account Role", value: profile?.role === "admin" ? "Administrator" : "Standard User" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
