"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, Avatar, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, Profile, Item } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [conversations, setConversations] = useState<
    (Conversation & {
      other_user: Profile;
      item?: Item;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function fetchConversations() {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, participant_1_profile:profiles!conversations_participant_1_fkey(*), participant_2_profile:profiles!conversations_participant_2_fkey(*), item:items(*)")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });

      if (!error && data) {
        const formatted = data.map((conv: any) => ({
          ...conv,
          other_user:
            conv.participant_1 === user!.id
              ? conv.participant_2_profile
              : conv.participant_1_profile,
        }));
        setConversations(formatted);
      }
      setLoading(false);
    }

    fetchConversations();

    // Set up realtime subscription
    const subscription = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `participant_1=eq.${user.id}`,
        },
        () => fetchConversations()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `participant_2=eq.${user.id}`,
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.item?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUnreadCount = (conv: typeof conversations[0]) => {
    if (conv.participant_1 === user?.id) {
      return conv.unread_count_1;
    }
    return conv.unread_count_2;
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display font-bold text-text-primary">
            Messages
          </h1>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search conversations..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Conversations list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface rounded w-1/3" />
                    <div className="h-3 bg-surface rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conv) => {
              const unreadCount = getUnreadCount(conv);
              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`glass rounded-xl p-4 transition-all ${
                      unreadCount > 0
                        ? "border-accent-primary/30 shadow-glow-sm"
                        : "hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar src={conv.other_user?.avatar_url} size="lg" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-primary text-white text-xs flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-text-primary truncate">
                            {conv.other_user?.full_name || "User"}
                          </p>
                          {conv.last_message_at && (
                            <span className="text-xs text-text-muted shrink-0">
                              {formatDistanceToNow(new Date(conv.last_message_at), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                        {conv.last_message && (
                          <p
                            className={`text-sm truncate ${
                              unreadCount > 0
                                ? "text-text-primary font-medium"
                                : "text-text-secondary"
                            }`}
                          >
                            {conv.last_message}
                          </p>
                        )}
                        {conv.item && (
                          <div className="flex items-center gap-2 mt-2">
                            {conv.item.images?.[0] && (
                              <div className="relative w-8 h-8 rounded overflow-hidden">
                                <Image
                                  src={conv.item.images[0]}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-xs text-text-muted truncate">
                              {conv.item.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No messages yet
            </h3>
            <p className="text-text-secondary">
              Start a conversation by requesting to rent an item
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
