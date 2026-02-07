"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Package,
  Check,
  X,
  MessageCircle,
  Star,
  Trash2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const notificationIcons: Record<string, any> = {
  rental_request: Package,
  request_approved: Check,
  request_rejected: X,
  item_returned: Package,
  new_message: MessageCircle,
  new_review: Star,
};

const notificationColors: Record<string, string> = {
  rental_request: "text-accent-primary bg-accent-primary/20",
  request_approved: "text-success bg-success/20",
  request_rejected: "text-error bg-error/20",
  item_returned: "text-success bg-success/20",
  new_message: "text-accent-secondary bg-accent-secondary/20",
  new_review: "text-warning bg-warning/20",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchNotifications();

    // Set up realtime subscription
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          toast(payload.new.title, { icon: "🔔" });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user!.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationLink = (notification: Notification) => {
    const data = notification.data as any;
    switch (notification.type) {
      case "rental_request":
      case "request_approved":
      case "request_rejected":
      case "item_returned":
        return "/my-rentals";
      case "new_message":
        return `/messages/${data.conversation_id || ""}`;
      case "new_review":
        return "/profile";
      default:
        return "#";
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-text-secondary">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface rounded w-1/2" />
                    <div className="h-3 bg-surface rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || "text-text-secondary bg-surface";

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass rounded-xl p-4 transition-all ${
                    !notification.is_read
                      ? "border-accent-primary/30 shadow-glow-sm"
                      : ""
                  }`}
                >
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className="flex items-start gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={`font-medium ${
                              notification.is_read
                                ? "text-text-secondary"
                                : "text-text-primary"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-text-muted mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-text-muted">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-accent-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="absolute top-4 right-4 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-error/20 text-text-muted hover:text-error transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <Bell className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No notifications
            </h3>
            <p className="text-text-secondary">
              We'll notify you when something happens
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
