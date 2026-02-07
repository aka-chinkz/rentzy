"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Send, Image as ImageIcon, Info } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Avatar, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, Message, Profile, Item } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { format, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<
    Conversation & { other_user: Profile; item?: Item }
  | null>(null);
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function fetchData() {
      // Fetch conversation
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*, participant_1_profile:profiles!conversations_participant_1_fkey(*), participant_2_profile:profiles!conversations_participant_2_fkey(*), item:items(*)")
        .eq("id", params.id)
        .single();

      if (convError || !convData) {
        toast.error("Conversation not found");
        router.push("/messages");
        return;
      }

      const otherUser =
        convData.participant_1 === user!.id
          ? convData.participant_2_profile
          : convData.participant_1_profile;

      setConversation({ ...convData, other_user: otherUser } as any);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, sender:profiles(*)")
        .eq("conversation_id", params.id)
        .order("created_at", { ascending: true });

      if (messagesData) {
        setMessages(messagesData as any);
      }

      // Mark messages as read
      const unreadColumn =
        convData.participant_1 === user!.id ? "unread_count_1" : "unread_count_2";
      await supabase
        .from("conversations")
        .update({ [unreadColumn]: 0 })
        .eq("id", params.id);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", params.id)
        .neq("sender_id", user!.id);

      setLoading(false);
    }

    fetchData();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`chat-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${params.id}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data } = await supabase
            .from("messages")
            .select("*, sender:profiles(*)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as any]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, params.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || !user) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
      setSending(false);
      return;
    }

    // Update conversation last message
    const unreadColumn =
      conversation.participant_1 === user.id ? "unread_count_2" : "unread_count_1";
    const currentUnread =
      conversation.participant_1 === user.id
        ? conversation.unread_count_2
        : conversation.unread_count_1;

    await supabase
      .from("conversations")
      .update({
        last_message: newMessage.trim(),
        last_message_at: new Date().toISOString(),
        [unreadColumn]: currentUnread + 1,
      })
      .eq("id", conversation.id);

    setNewMessage("");
    setSending(false);
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-4 h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <button
            onClick={() => router.push("/messages")}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>

          {conversation && (
            <>
              <Link
                href={`/user/${conversation.other_user.id}`}
                className="flex items-center gap-3 flex-1"
              >
                <Avatar src={conversation.other_user.avatar_url} size="md" />
                <div>
                  <p className="font-medium text-text-primary">
                    {conversation.other_user.full_name || "User"}
                  </p>
                  {conversation.item && (
                    <p className="text-sm text-text-muted">
                      About: {conversation.item.title}
                    </p>
                  )}
                </div>
              </Link>

              {conversation.item && (
                <Link
                  href={`/items/${conversation.item.id}`}
                  className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text-primary"
                >
                  <Info className="w-5 h-5" />
                </Link>
              )}
            </>
          )}
        </div>

        {/* Item preview */}
        {conversation?.item && (
          <Link
            href={`/items/${conversation.item.id}`}
            className="flex items-center gap-3 p-3 glass rounded-xl mt-4"
          >
            {conversation.item.images?.[0] && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={conversation.item.images[0]}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">
                {conversation.item.title}
              </p>
              <p className="text-sm text-text-secondary">
                ${conversation.item.rent_price_per_day}/day
              </p>
            </div>
          </Link>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-muted">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, i) => {
              const isOwn = msg.sender_id === user?.id;
              const showDate =
                i === 0 ||
                new Date(msg.created_at).toDateString() !==
                  new Date(messages[i - 1].created_at).toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-text-muted px-3 py-1 glass rounded-full">
                        {isToday(new Date(msg.created_at))
                          ? "Today"
                          : isYesterday(new Date(msg.created_at))
                          ? "Yesterday"
                          : format(new Date(msg.created_at), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        isOwn ? "order-2" : "order-1"
                      }`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          isOwn
                            ? "bg-accent-primary text-white rounded-br-md"
                            : "glass rounded-bl-md"
                        }`}
                      >
                        {msg.message_type === "system" ? (
                          <p className="text-sm italic text-text-muted">
                            {msg.content}
                          </p>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      <p
                        className={`text-xs text-text-muted mt-1 ${
                          isOwn ? "text-right" : "text-left"
                        }`}
                      >
                        {format(new Date(msg.created_at), "h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-text-muted mb-2">No messages yet</p>
              <p className="text-sm text-text-muted">
                Start the conversation!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <form onSubmit={handleSend} className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-glow"
            />
          </div>
          <Button type="submit" loading={sending} disabled={!newMessage.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
