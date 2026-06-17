"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, MessageCircle, Package, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, Badge, Card, EmptyState, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, Profile, Item } from "@/types";
import { messagesAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

type ConversationWithMeta = Conversation & {
  other_user: Profile;
  item?: Item;
};

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (!user) return;

    async function fetchConversations() {
      try {
        const { data } = await messagesAPI.getConversations();
        if (data?.conversations) {
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
      setLoading(false);
    }

    fetchConversations();

    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [authLoading, user, router]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.item?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadTotal = conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0);

  function getUnreadCount(conv: ConversationWithMeta) {
    if (conv.participant_1 === user?.id) return conv.unread_count_1;
    return conv.unread_count_2;
  }

  if (authLoading || !user) return null;

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Messages
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                {loading
                  ? "Loading conversations…"
                  : conversations.length === 0
                    ? "Your inbox is empty"
                    : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}${
                        unreadTotal > 0 ? ` · ${unreadTotal} unread` : ""
                      }`}
              </p>
            </div>
            {unreadTotal > 0 && (
              <Badge variant="primary" className="shrink-0">
                {unreadTotal} new
              </Badge>
            )}
          </div>
        </header>

        {/* Search */}
        <div className="mb-5 sm:mb-6">
          <Input
            placeholder="Search conversations…"
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border-border/60 bg-surface/80 py-3 backdrop-blur-sm placeholder:text-text-muted/80"
          />
        </div>

        {/* Conversations */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border/40 bg-surface/60 p-4 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-surface-elevated" />
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex justify-between gap-3">
                      <div className="h-4 w-28 rounded-md bg-surface-elevated" />
                      <div className="h-3 w-16 rounded-md bg-surface-elevated" />
                    </div>
                    <div className="h-3 w-full rounded-md bg-surface-elevated" />
                    <div className="h-5 w-20 rounded-full bg-surface-elevated" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-2.5">
            {filteredConversations.map((conv, index) => {
              const unreadCount = getUnreadCount(conv);
              const isUnread = unreadCount > 0;

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <Link href={`/messages/${conv.id}`} className="group block">
                    <article
                      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
                        isUnread
                          ? "border-accent-primary/25 bg-accent-primary/[0.04] shadow-glow-sm hover:border-accent-primary/40 hover:bg-accent-primary/[0.06]"
                          : "border-border/50 bg-surface/70 hover:border-border hover:bg-surface-hover/80"
                      }`}
                    >
                      {isUnread && (
                        <span
                          className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent-primary"
                          aria-hidden
                        />
                      )}

                      <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="relative shrink-0">
                          <Avatar
                            src={conv.other_user?.avatar_url}
                            alt={conv.other_user?.full_name || "User"}
                            size="lg"
                            className={
                              isUnread
                                ? "ring-2 ring-accent-primary/30 ring-offset-2 ring-offset-background"
                                : "ring-1 ring-border/60 ring-offset-2 ring-offset-background"
                            }
                          />
                          {isUnread && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-primary px-1 text-[10px] font-semibold text-white shadow-sm">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-baseline justify-between gap-3">
                            <p
                              className={`truncate ${
                                isUnread
                                  ? "font-semibold text-text-primary"
                                  : "font-medium text-text-primary"
                              }`}
                            >
                              {conv.other_user?.full_name || "User"}
                            </p>
                            {conv.last_message_at && (
                              <time
                                className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-text-muted"
                                dateTime={conv.last_message_at}
                              >
                                {formatDistanceToNow(new Date(conv.last_message_at), {
                                  addSuffix: true,
                                })}
                              </time>
                            )}
                          </div>

                          {conv.last_message && (
                            <p
                              className={`truncate text-sm leading-relaxed ${
                                isUnread ? "font-medium text-text-primary/90" : "text-text-secondary"
                              }`}
                            >
                              {conv.last_message}
                            </p>
                          )}

                          {conv.item && (
                            <div className="mt-2.5 flex items-center">
                              <Badge
                                variant="neutral"
                                size="sm"
                                className="max-w-full gap-1.5 border border-border/50 bg-surface-elevated/80 py-1 pl-1 pr-2.5"
                              >
                                {conv.item.images?.[0] ? (
                                  <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full">
                                    <Image
                                      src={conv.item.images[0]}
                                      alt=""
                                      fill
                                      className="object-cover"
                                    />
                                  </span>
                                ) : (
                                  <Package className="h-3 w-3 shrink-0 text-text-muted" />
                                )}
                                <span className="truncate">{conv.item.title}</span>
                              </Badge>
                            </div>
                          )}
                        </div>

                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-text-muted/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-text-muted"
                          aria-hidden
                        />
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : searchQuery ? (
          <Card className="border-dashed border-border/60 bg-surface/40 py-14 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-text-muted/60" />
            <h3 className="text-base font-semibold text-text-primary">No matches found</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Try a different name or item title
            </p>
          </Card>
        ) : (
          <Card className="border-dashed border-border/60 bg-surface/40 py-4">
            <EmptyState
              icon={<MessageCircle className="h-8 w-8 text-text-muted" />}
              title="No messages yet"
              description="Start a conversation by requesting to rent an item from your community"
            />
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
