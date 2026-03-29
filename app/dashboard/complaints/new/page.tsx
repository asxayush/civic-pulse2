"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";
import {
  Tag, FileText, MapPin, CheckCircle,
  Upload, X, Loader2, ChevronRight, ChevronLeft,
  AlertTriangle, Home, Building2, Zap, Droplets, Trash2, Wifi,
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/complaints/MapPicker"), { ssr: false });

const CATEGORIES = [
  { id: "electricity", label: "Electricity", icon: Zap, color: "from-yellow-500 to-amber-600" },
  { id: "water", label: "Water & Sewage", icon: Droplets, color: "from-blue-500 to-cyan-600" },
  { id: "sanitation", label: "Sanitation", icon: Trash2, color: "from-green-500 to-emerald-600" },
  { id: "hostel", label: "Hostel Issue", icon: Building2, color: "from-purple-500 to-violet-600" },
  { id: "infrastructure", label: "Infrastructure", icon: Home, color: "from-orange-500 to-red-600" },
  { id: "internet", label: "Internet/WiFi", icon: Wifi, color: "from-indigo-500 to-blue-600" },
  { id: "safety", label: "Safety & Security", icon: AlertTriangle, color: "from-rose-500 to-red-700" },
  { id: "other", label: "Other", icon: FileText, color: "from-slate-500 to-slate-600" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: "text-green-400", bg: "border-green-500/30 bg-green-500/10" },
  { id: "medium", label: "Medium", color: "text-yellow-400", bg: "border-yellow-500/30 bg-yellow-500/10" },
  { id: "high", label: "High", color: "text-orange-400", bg: "border-orange-500/30 bg-orange-500/10" },
  { id: "critical", label: "Critical", color: "text-red-400", bg: "border-red-500/30 bg-red-500/10" },
];

const STEPS = [
  { label: "Category", icon: Tag },
  { label: "Details", icon: FileText },
  { label: "Location", icon: MapPin },
  { label: "Review", icon: CheckCircle },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return title.trim().length >= 5 && description.trim().length >= 10;
    if (step === 2) return !!location;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const imageUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { data } = await supabase.storage.from("complaint-images").upload(path, file);
      if (data) {
        const { data: urlData } = supabase.storage.from("complaint-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from("complaints").insert({
      user_id: user.id,
      title,
      description,
      category,
      priority,
      status: "pending",
      location_lat: location?.lat,
      location_lng: location?.lng,
      location_label: locationLabel,
      image_urls: imageUrls,
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard/complaints"), 2500);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6 glow-secondary"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            Complaint Filed!
          </h2>
          <p className="text-slate-400">
            Your complaint has been submitted. Redirecting to your complaints…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          File a Complaint
        </h1>
        <p className="text-slate-400 text-sm">Step {step + 1} of {STEPS.length}</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${i === STEPS.length - 1 ? "" : "flex-1"}`}>
                <motion.div
                  animate={{
                    scale: active ? 1.15 : 1,
                    boxShadow: active ? "0 0 20px rgba(99,102,241,0.6)" : "none",
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    done ? "bg-gradient-to-br from-emerald-500 to-green-600"
                    : active ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                    : "glass border border-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${done || active ? "text-white" : "text-slate-500"}`} />
                </motion.div>
                <span className={`text-xs font-medium ${active ? "text-white" : "text-slate-500"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all duration-500 ${done ? "bg-emerald-500/60" : "bg-white/10"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step > 0 ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: step > 0 ? -30 : 30 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 0: Category */}
          {step === 0 && (
            <div className="glass rounded-2xl border border-white/8 p-6">
              <h2 className="text-xl font-bold text-white mb-1">What type of issue?</h2>
              <p className="text-slate-400 text-sm mb-6">Select the category that best describes your complaint.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        selected
                          ? "border-indigo-500/60 bg-indigo-500/15 glow-primary"
                          : "border-white/8 glass hover:border-white/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-medium ${selected ? "text-white" : "text-slate-400"}`}>
                        {cat.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-6">
                <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Priority Level</p>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all duration-200 ${
                        priority === p.id ? p.bg : "glass border-white/8 text-slate-500"
                      } ${p.color}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="glass rounded-2xl border border-white/8 p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Describe Your Issue</h2>
                <p className="text-slate-400 text-sm">Be specific — it helps us resolve faster.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Street light broken at Block C Gate"
                  className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                />
                <p className="text-xs text-slate-600 mt-1">{title.length}/100</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. When did it start? How is it affecting you?"
                  rows={4}
                  className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>
              {/* Drop zone */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Upload Evidence (optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/15 hover:border-indigo-500/50 hover:bg-white/[0.02]"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    {isDragActive ? "Drop files here…" : "Drag & drop images/videos or click to upload"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Max 5 files · 20 MB each</p>
                </div>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((file, i) => (
                      <div key={i} className="glass rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/10">
                        <span className="text-xs text-slate-300 truncate max-w-[120px]">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="glass rounded-2xl border border-white/8 p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Pin the Location</h2>
                <p className="text-slate-400 text-sm">Click on the map to mark where the issue is located.</p>
              </div>
              <div className="h-80 rounded-xl overflow-hidden border border-white/10">
                <MapPicker onLocationChange={(lat, lng) => setLocation({ lat, lng })} />
              </div>
              {location && (
                <div className="glass rounded-lg px-4 py-2.5 flex items-center gap-2 border border-indigo-500/30">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-300">
                    Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                  </span>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Location Label (optional)</label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g. Near Block C, Main Gate"
                  className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="glass rounded-2xl border border-white/8 p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Review & Submit</h2>
                <p className="text-slate-400 text-sm">Double-check your complaint before submitting.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Category", value: CATEGORIES.find((c) => c.id === category)?.label },
                  { label: "Priority", value: PRIORITIES.find((p) => p.id === priority)?.label },
                  { label: "Title", value: title },
                  { label: "Description", value: description },
                  { label: "Location", value: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} ${locationLabel ? `(${locationLabel})` : ""}` : "—" },
                  { label: "Attachments", value: files.length > 0 ? `${files.length} file(s)` : "None" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3 border-b border-white/5">
                    <span className="text-xs text-slate-500 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(99,102,241,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-xl btn-shimmer text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Submit Complaint</>}
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-sm font-semibold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </motion.button>
        {step < STEPS.length - 1 && (
          <motion.button
            whileHover={{ scale: canNext() ? 1.03 : 1 }}
            whileTap={{ scale: canNext() ? 0.97 : 1 }}
            onClick={() => canNext() && setStep((s) => s + 1)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
              canNext() ? "btn-shimmer" : "glass border border-white/10 text-slate-500 cursor-not-allowed"
            }`}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
