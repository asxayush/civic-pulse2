"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "admin";
  created_at: string;
  user_id: string;
}

interface Conversation {
  user_id: string;
  lastMsg: string;
  time: string;
  unread: number;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadConversations();
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        loadConversations();
        if (selectedUserId) loadMessages(selectedUserId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;
    const byUser: Record<string, Conversation> = {};
    data.forEach((m: Message) => {
      if (!byUser[m.user_id]) {
        byUser[m.user_id] = {
          user_id: m.user_id,
          lastMsg: m.content,
          time: m.created_at,
          unread: m.sender === "user" ? 1 : 0,
        };
      } else if (m.sender === "user") {
        byUser[m.user_id].unread++;
      }
    });
    setConversations(Object.values(byUser));
  }

  async function loadMessages(uid: string) {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  }

  const selectConversation = (uid: string) => {
    setSelectedUserId(uid);
    loadMessages(uid);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedUserId) return;
    setSending(true);
    const content = reply.trim();
    setReply("");
    await supabase.from("chat_messages").insert({
      user_id: selectedUserId,
      content,
      sender: "admin",
    });
    setSending(false);
    loadMessages(selectedUserId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          Support Inbox
        </h1>
        <p className="text-slate-400 text-sm mt-1">Real-time chat with students</p>
      </motion.div>

      <div className="glass rounded-2xl border border-white/8 flex h-[600px] overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 border-r border-white/8 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => selectConversation(conv.user_id)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 ${
                    selectedUserId === conv.user_id ? "bg-indigo-500/10 border-l-2 border-l-indigo-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                      {conv.user_id.slice(0, 8)}…
                    </span>
                    {conv.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{conv.lastMsg}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-2">
              <MessageSquare className="w-10 h-10 opacity-20" />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-slate-400">User: {selectedUserId.slice(0, 12)}…</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      m.sender === "admin"
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                        : "glass border border-white/10 text-slate-300 rounded-bl-sm"
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="px-4 py-3 border-t border-white/8 flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                  placeholder="Type your reply…"
                  className="input-glass flex-1 px-3 py-2.5 rounded-xl text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center gap-1.5 text-xs font-bold disabled:opacity-40"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
