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
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<(Review & { reviewer: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  useEffect(() => {
    async function fetchProfile() {
      // Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !profileData) {
        toast.error("User not found");
        router.push("/browse");
        return;
      }

      setProfile(profileData);

      // Fetch user's items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("owner_id", params.id)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (itemsData) {
        setItems(itemsData);
      }

      // Fetch reviews about the user
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, reviewer:profiles(*)")
        .eq("reviewee_id", params.id)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData as any);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [params.id]);

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

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_1.eq.${user.id},participant_2.eq.${params.id}),and(participant_1.eq.${params.id},participant_2.eq.${user.id})`
      )
      .single();

    if (existingConv) {
      router.push(`/messages/${existingConv.id}`);
      return;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        participant_1: user.id,
        participant_2: params.id,
      })
      .select()
      .single();

    if (error || !newConv) {
      toast.error("Failed to start conversation");
      return;
    }

    router.push(`/messages/${newConv.id}`);
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
                  {profile.rating > 0 ? profile.rating.toFixed(1) : "-"}
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
              reviews.map((review) => (
                <Card key={review.id}>
                  <div className="flex items-start gap-4">
                    <Link href={`/user/${review.reviewer.id}`}>
                      <Avatar src={review.reviewer.avatar_url} size="md" />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Link
                            href={`/user/${review.reviewer.id}`}
                            className="font-medium text-text-primary hover:text-accent-primary"
                          >
                            {review.reviewer.full_name}
                          </Link>
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
              ))
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
