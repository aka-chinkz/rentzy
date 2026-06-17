"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Package,
  Check,
  X,
  MessageCircle,
  Star,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types";
import { notificationsAPI } from "@/lib/api";
import { formatDistanceToNow, isToday, isThisWeek } from "date-fns";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";

const notificationIcons: Record<string, LucideIcon> = {
  rental_request: Package,
  request_approved: Check,
  request_rejected: X,
  item_returned: Package,
  new_message: MessageCircle,
  new_review: Star,
};

const notificationStyles: Record<
  string,
  { icon: string; bg: string; ring: string; accentBar: string }
> = {
  rental_request: {
    icon: "text-blue-400",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
    accentBar: "bg-blue-500/50",
  },
  request_approved: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    accentBar: "bg-emerald-500/50",
  },
  request_rejected: {
    icon: "text-red-400",
    bg: "bg-red-500/10",
    ring: "ring-red-500/20",
    accentBar: "bg-red-500/50",
  },
  item_returned: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    accentBar: "bg-emerald-500/50",
  },
  new_message: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
    accentBar: "bg-violet-500/50",
  },
  new_review: {
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    accentBar: "bg-amber-500/50",
  },
};

type FilterTab = "all" | "unread";

function groupNotifications(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [
    { label: "Today", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at);
    if (isToday(date)) {
      groups[0].items.push(notification);
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      groups[1].items.push(notification);
    } else {
      groups[2].items.push(notification);
    }
  });

  return groups.filter((group) => group.items.length > 0);
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getNotifications({ limit: 50 });
      if (data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [authLoading, user, router]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification removed");
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationLink = (notification: Notification) => {
    const data = notification.data as Record<string, string> | null;
    switch (notification.type) {
      case "rental_request":
      case "request_approved":
      case "request_rejected":
      case "item_returned":
        return "/my-rentals";
      case "new_message":
        return `/messages/${data?.conversation_id || ""}`;
      case "new_review":
        return "/profile";
      default:
        return "#";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications,
    [notifications, filter]
  );

  const groupedNotifications = useMemo(
    () => groupNotifications(filteredNotifications),
    [filteredNotifications]
  );

  if (!user) return null;

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            Notifications
          </h1>
          <p className="mt-2 text-text-secondary">
            Stay updated on rentals, messages, and reviews
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-border/60 bg-surface-elevated/60 p-1">
            {(["all", "unread"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === tab
                    ? "bg-surface-elevated text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab}
                {tab === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 text-accent-primary">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border hover:bg-surface-elevated hover:text-text-primary"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface/30">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="search-suggestion-skeleton animate-pulse border-b border-border/40 last:border-b-0"
                aria-hidden
              >
                <div className="skeleton-avatar !rounded-xl" />
                <div className="skeleton-lines">
                  <div className="skeleton-line-primary" />
                  <div className="skeleton-line-secondary" />
                </div>
                <div className="skeleton-dot" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-6">
            {groupedNotifications.map((group) => (
              <section key={group.label}>
                <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {group.label}
                </h2>
                <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface/30 backdrop-blur-sm">
                  <AnimatePresence initial={false}>
                    {group.items.map((notification, index) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      const style =
                        notificationStyles[notification.type] ||
                        notificationStyles.rental_request;

                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ delay: index * 0.03 }}
                          className={`group relative border-b border-border/40 last:border-b-0 ${
                            !notification.is_read ? "bg-accent-primary/[0.03]" : ""
                          }`}
                        >
                          {!notification.is_read && (
                            <span
                              className={`absolute bottom-0 left-0 top-0 w-1 ${style.accentBar}`}
                            />
                          )}

                          <Link
                            href={getNotificationLink(notification)}
                            onClick={() =>
                              !notification.is_read && markAsRead(notification.id)
                            }
                            className="flex items-start gap-4 px-4 py-4 pr-14 transition-colors hover:bg-surface-elevated/50"
                          >
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${style.bg} ${style.ring}`}
                            >
                              <Icon className={`h-5 w-5 ${style.icon}`} strokeWidth={1.75} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p
                                  className={`font-medium leading-snug ${
                                    notification.is_read
                                      ? "text-text-secondary"
                                      : "text-text-primary"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                {!notification.is_read && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
                                )}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-muted">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-text-muted/80">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteNotification(notification.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-text-muted opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-surface/30 px-6 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-surface-elevated">
              <Bell className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              {filter === "unread" ? "You're all caught up" : "No notifications yet"}
            </h3>
            <p className="mx-auto max-w-sm text-text-secondary">
              {filter === "unread"
                ? "No unread notifications. Check back later for rental updates and messages."
                : "We'll notify you when someone requests your items or sends a message."}
            </p>
            {filter === "unread" && notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-6 text-sm text-accent-primary transition-colors hover:text-accent-secondary"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
