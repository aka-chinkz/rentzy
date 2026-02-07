"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Star,
  Package,
  Calendar,
  Edit2,
  Settings,
  Camera,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Card, Avatar, Badge, Rating, Input, Textarea, Modal } from "@/components/ui";
import { ItemGrid } from "@/components/items/ItemGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Item, Profile, Review } from "@/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<(Review & { reviewer: Profile; item: Item })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function fetchData() {
      // Fetch user's items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });

      if (itemsData) {
        setItems(itemsData);
      }

      // Fetch reviews about the user
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, reviewer:profiles(*), item:items(*)")
        .eq("reviewee_id", user!.id)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData as any);
      }

      setLoading(false);
    }

    fetchData();

    if (profile) {
      setEditForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
      });
    }
  }, [user, profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await updateProfile(editForm);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      setShowEditModal(false);
    }

    setSaving(false);
  };

  if (!user || !profile) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile header */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar src={profile.avatar_url} size="xl" showGlow />
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-accent-primary text-white hover:bg-accent-secondary transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-text-primary">
                    {profile.full_name || "User"}
                  </h1>
                  <p className="text-text-secondary">{profile.email}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </Button>
              </div>

              {profile.bio && (
                <p className="text-text-secondary mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                {profile.location_name && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location_name}</span>
                  </div>
                )}
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
            My Listings ({items.length})
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
                <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No listings yet
                </h3>
                <p className="text-text-secondary mb-6">
                  Start earning by listing your first item
                </p>
                <Link href="/list-item">
                  <Button>List an Item</Button>
                </Link>
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
                    <Avatar src={review.reviewer.avatar_url} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-text-primary">
                            {review.reviewer.full_name}
                          </p>
                          <p className="text-text-muted text-sm">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Rating value={review.rating} size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-text-secondary">{review.comment}</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-border">
                        <Link
                          href={`/items/${review.item.id}`}
                          className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors"
                        >
                          {review.item.images?.[0] && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={review.item.images[0]}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm">For: {review.item.title}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <Star className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No reviews yet
                </h3>
                <p className="text-text-secondary">
                  Complete rentals to receive reviews from other users
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/my-rentals">
            <Card variant="interactive" padding="sm" className="text-center">
              <Package className="w-8 h-8 text-accent-primary mx-auto mb-2" />
              <span className="text-sm text-text-secondary">My Rentals</span>
            </Card>
          </Link>
          <Link href="/saved">
            <Card variant="interactive" padding="sm" className="text-center">
              <svg
                className="w-8 h-8 text-accent-primary mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm text-text-secondary">Saved Items</span>
            </Card>
          </Link>
          <Link href="/messages">
            <Card variant="interactive" padding="sm" className="text-center">
              <svg
                className="w-8 h-8 text-accent-primary mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm text-text-secondary">Messages</span>
            </Card>
          </Link>
          <Link href="/settings">
            <Card variant="interactive" padding="sm" className="text-center">
              <Settings className="w-8 h-8 text-accent-primary mx-auto mb-2" />
              <span className="text-sm text-text-secondary">Settings</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            placeholder="Your name"
          />
          <Input
            label="Phone Number"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
          <Textarea
            label="Bio"
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="Tell others a bit about yourself..."
            rows={3}
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
