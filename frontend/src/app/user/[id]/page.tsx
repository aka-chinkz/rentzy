"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Calendar,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Card, Avatar, Rating } from "@/components/ui";
import { ItemGrid } from "@/components/items/ItemGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Profile, Item, Review } from "@/types";
import { usersAPI, messagesAPI } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<(Review & { reviewer: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await usersAPI.getProfile(params.id as string);
        
        if (!data?.profile) {
          toast.error("User not found");
          router.push("/browse");
          return;
        }

        setProfile(data.profile);
        setItems(data.items || []);
        setReviews(data.reviews || []);
      } catch (error) {
        toast.error("User not found");
        router.push("/browse");
      }

      setLoading(false);
    }

    fetchProfile();
  }, [params.id, router]);

  const startConversation = async () => {
    if (!user) {
      toast.error("Please sign in to send messages");
      router.push("/auth/login");
      return;
    }

    if (user.id === params.id) {
      toast.error("You can't message yourself");
      return;
    }

    try {
      const { data } = await messagesAPI.startConversation(
        params.id as string, 
        "Hi! I'm interested in connecting with you."
      );
      router.push(`/messages/${data.conversation.id}`);
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full bg-surface" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-surface rounded w-1/3" />
                <div className="h-4 bg-surface rounded w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-surface rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) return null;

  const isOwnProfile = user?.id === profile.id;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {/* Profile header */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar src={profile.avatar_url} size="xl" showGlow />

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-text-primary">
                    {profile.full_name || "User"}
                  </h1>
                  {profile.location_name && (
                    <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location_name}</span>
                    </div>
                  )}
                </div>

                {!isOwnProfile && (
                  <Button
                    variant="secondary"
                    icon={<MessageCircle className="w-5 h-5" />}
                    onClick={startConversation}
                  >
                    Message
                  </Button>
                )}
              </div>

              {profile.bio && (
                <p className="text-text-secondary mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(new Date(profile.created_at), "MMMM yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{profile.items_listed}</p>
              <p className="text-sm text-text-muted">Items Listed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{profile.items_rented}</p>
              <p className="text-sm text-text-muted">Items Rented</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-warning fill-current" />
                <span className="text-2xl font-bold text-text-primary">
                  {Number(profile?.rating) > 0 ? Number(profile.rating).toFixed(1) : "-"}
                </span>
              </div>
              <p className="text-sm text-text-muted">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{profile.total_reviews}</p>
              <p className="text-sm text-text-muted">Reviews</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "listings"
                ? "bg-accent-primary/20 text-accent-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Listings ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "reviews"
                ? "bg-accent-primary/20 text-accent-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "listings" && (
          <div>
            {items.length > 0 ? (
              <ItemGrid items={items} showOwner={false} columns={3} />
            ) : (
              <Card className="text-center py-12">
                <p className="text-text-secondary">
                  {profile.full_name || "This user"} hasn't listed any items yet
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => {
                const reviewerId = review.reviewer_id ?? (review as { reviewer?: { id: string } }).reviewer?.id;
                const reviewerName = review.reviewer_name ?? (review as { reviewer?: { full_name?: string } }).reviewer?.full_name ?? "Anonymous";
                const reviewerAvatar = review.reviewer_avatar ?? (review as { reviewer?: { avatar_url?: string } }).reviewer?.avatar_url;
                return (
                <Card key={review.id}>
                  <div className="flex items-start gap-4">
                    {reviewerId ? (
                      <Link href={`/user/${reviewerId}`}>
                        <Avatar src={reviewerAvatar} size="md" />
                      </Link>
                    ) : (
                      <Avatar src={reviewerAvatar} size="md" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {reviewerId ? (
                            <Link
                              href={`/user/${reviewerId}`}
                              className="font-medium text-text-primary hover:text-accent-primary"
                            >
                              {reviewerName}
                            </Link>
                          ) : (
                            <span className="font-medium text-text-primary">
                              {reviewerName}
                            </span>
                          )}
                          <p className="text-text-muted text-sm">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Rating value={review.rating} size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-text-secondary">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ); })
            ) : (
              <Card className="text-center py-12">
                <p className="text-text-secondary">No reviews yet</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
