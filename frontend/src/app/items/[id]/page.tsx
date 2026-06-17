"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Shield,
  Clock,
  Star,
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Info,
  Trash2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Card, Avatar, Badge, Rating, Modal, Textarea } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { Item, Profile, Review } from "@/types";
import { itemsAPI, rentalsAPI, usersAPI, messagesAPI } from "@/lib/api";
import { addRecentlyVisited } from "@/lib/recentlyVisited";
import toast from "react-hot-toast";
import { format, differenceInDays, addDays } from "date-fns";

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "success" },
  like_new: { label: "Like New", color: "success" },
  good: { label: "Good", color: "primary" },
  fair: { label: "Fair", color: "warning" },
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { calculateDistance, requestLocation } = useLocation();

  const [item, setItem] = useState<Item & { owner?: Profile } | null>(null);
  const [reviews, setReviews] = useState<(Review & { reviewer: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Rent request form
  const [rentForm, setRentForm] = useState({
    startDate: "",
    endDate: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [messageOwnerLoading, setMessageOwnerLoading] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const { data } = await itemsAPI.getItem(params.id as string);
        
        if (!data?.item) {
          toast.error("Item not found");
          router.push("/browse");
          return;
        }

        setItem(data.item);
        setReviews(data.reviews || []);
        setIsSaved(data.isSaved || false);
        addRecentlyVisited(data.item.id);

        // Increment views and update displayed count (per-account unique when authenticated)
        try {
          const { data: viewData } = await itemsAPI.incrementViews(params.id as string);
          if (!viewData?.alreadyViewed) {
            setItem((prev) =>
              prev ? { ...prev, views: (prev.views ?? 0) + 1 } : null
            );
          }
        } catch {
          // Non-blocking; still show item even if increment fails
        }
      } catch (error) {
        toast.error("Item not found");
        router.push("/browse");
        return;
      }

      setLoading(false);
    }

    fetchItem();
  }, [params.id, user, router]);

  const handleSaveToggle = async () => {
    if (!user) {
      toast.error("Please sign in to save items");
      return;
    }

    try {
      const { data } = await usersAPI.toggleSaveItem(item!.id);
      setIsSaved(data.saved);
      toast.success(data.message);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: item?.title,
        text: `Check out this item for rent: ${item?.title}`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRentRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to request a rental");
      router.push("/auth/login");
      return;
    }

    if (user.id === item?.owner_id) {
      toast.error("You can't rent your own item");
      return;
    }

    if (!rentForm.startDate || !rentForm.endDate) {
      toast.error("Please select rental dates");
      return;
    }

    const startDate = new Date(rentForm.startDate);
    const endDate = new Date(rentForm.endDate);
    const totalDays = differenceInDays(endDate, startDate) + 1;

    if (totalDays < item!.min_rental_days) {
      toast.error(`Minimum rental period is ${item!.min_rental_days} days`);
      return;
    }

    if (item!.max_rental_days && totalDays > item!.max_rental_days) {
      toast.error(`Maximum rental period is ${item!.max_rental_days} days`);
      return;
    }

    setSubmitting(true);

    try {
      await rentalsAPI.createRental({
        item_id: item!.id,
        start_date: rentForm.startDate,
        end_date: rentForm.endDate,
        message: rentForm.message || undefined,
      });

      toast.success("Rental request sent!");
      setShowRentModal(false);
      setRentForm({ startDate: "", endDate: "", message: "" });
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to send request";
      toast.error(msg);
    }
    setSubmitting(false);
  };

  const handleDeleteItem = async () => {
    if (!item || user?.id !== item.owner_id) return;
    setDeleting(true);
    try {
      await itemsAPI.deleteItem(item.id);
      toast.success("Listing deleted");
      router.push("/browse");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to delete listing";
      toast.error(msg);
    }
    setDeleting(false);
    setShowDeleteModal(false);
  };

  const handleMessageOwner = async () => {
    if (!user) {
      toast.error("Please sign in to message the owner");
      router.push("/auth/login");
      return;
    }
    if (!item || user.id === item.owner_id) return;
    setMessageOwnerLoading(true);
    try {
      const { data } = await messagesAPI.startConversation(
        item.owner_id,
        "Hi, I'm interested in your listing.",
        item.id
      );
      if (data?.conversation?.id) {
        router.push(`/messages/${data.conversation.id}`);
      }
    } catch (error) {
      toast.error("Could not start conversation");
    }
    setMessageOwnerLoading(false);
  };

  const distance = item
    ? calculateDistance(item.pickup_location_lat, item.pickup_location_lng)
    : null;

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-[400px] bg-surface rounded-2xl" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 bg-surface rounded w-3/4" />
                <div className="h-4 bg-surface rounded w-1/2" />
                <div className="h-32 bg-surface rounded" />
              </div>
              <div className="h-64 bg-surface rounded-2xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!item) return null;

  const condition = conditionLabels[item.condition] || { label: item.condition, color: "neutral" };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden glass">
                {item.images?.[currentImageIndex] ? (
                  <Image
                    src={item.images[currentImageIndex]}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                    <span className="text-text-muted">No image available</span>
                  </div>
                )}

                {/* Image navigation */}
                {item.images && item.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? item.images!.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === item.images!.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {item.images && item.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-full">
                    <span className="text-sm text-text-primary">
                      {currentImageIndex + 1} / {item.images.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {item.images && item.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
                  {item.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all ${
                        i === currentImageIndex
                          ? "ring-2 ring-accent-primary"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                    {item.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={condition.color as any}>{condition.label}</Badge>
                    {distance !== null ? (
                      <div className="flex items-center gap-1 text-text-secondary text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{distance.toFixed(1)} km away</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={requestLocation}
                        className="flex items-center gap-1 text-text-muted hover:text-accent-primary text-sm transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Enable location to see distance</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1 text-text-muted text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{item.views} views</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToggle}
                    className={`p-3 rounded-xl transition-all ${
                      isSaved
                        ? "bg-error/20 text-error"
                        : "glass text-text-secondary hover:text-error"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl glass text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-text-secondary whitespace-pre-wrap">{item.description}</p>
              </div>
            </div>

            {/* Rental details */}
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Rental Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-text-muted text-sm mb-1">Min. Rental</p>
                  <p className="text-text-primary font-medium">{item.min_rental_days} days</p>
                </div>
                <div>
                  <p className="text-text-muted text-sm mb-1">Max. Rental</p>
                  <p className="text-text-primary font-medium">
                    {item.max_rental_days ? `${item.max_rental_days} days` : "No limit"}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm mb-1">Available From</p>
                  <p className="text-text-primary font-medium">
                    {format(new Date(item.availability_start), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm mb-1">Available Until</p>
                  <p className="text-text-primary font-medium">
                    {item.availability_end
                      ? format(new Date(item.availability_end), "MMM d, yyyy")
                      : "Ongoing"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pickup location */}
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Pickup Location</h3>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-primary">{item.pickup_location_name}</p>
                  {item.pickup_instructions && (
                    <p className="text-text-secondary text-sm mt-1">
                      {item.pickup_instructions}
                    </p>
                  )}
                </div>
              </div>
              {/* Map placeholder */}
              <div className="h-48 rounded-xl bg-background-tertiary flex items-center justify-center">
                <p className="text-text-muted text-sm">Map view coming soon</p>
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  Reviews ({reviews.length})
                </h3>
                {item.owner && item.owner.rating != null && Number(item.owner.rating) > 0 && (
                  <Rating value={Number(item.owner.rating)} showValue totalReviews={item.owner.total_reviews} />
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const reviewerName = review.reviewer_name ?? (review as { reviewer?: { full_name?: string } }).reviewer?.full_name ?? "Anonymous";
                    const reviewerAvatar = review.reviewer_avatar ?? (review as { reviewer?: { avatar_url?: string } }).reviewer?.avatar_url;
                    return (
                    <div key={review.id} className="p-4 rounded-xl bg-background-secondary">
                      <div className="flex items-start gap-3">
                        <Avatar src={reviewerAvatar} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-text-primary">
                              {reviewerName}
                            </p>
                            <p className="text-text-muted text-sm">
                              {format(new Date(review.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Rating value={review.rating} size="sm" />
                          {review.comment && (
                            <p className="text-text-secondary mt-2">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ); })}
                </div>
              ) : (
                <p className="text-text-muted text-center py-8">No reviews yet</p>
              )}
            </Card>
          </div>

          {/* Right column - Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="glow" className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-text-primary">
                      ₹{item.rent_price_per_day}
                    </span>
                    <span className="text-text-secondary">/day</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-text-secondary">
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="text-sm">₹{item.security_deposit} security deposit</span>
                  </div>
                </div>

                <div className="divider" />

                {/* Owner info */}
                {item.owner && (
                  <Link href={`/user/${item.owner.id}`} className="flex items-center gap-3 group">
                    <Avatar src={item.owner.avatar_url} size="lg" />
                    <div>
                      <p className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                        {item.owner.full_name || "User"}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.owner.rating != null && Number(item.owner.rating) > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-warning fill-current" />
                            <span className="text-sm text-text-secondary">
                              {Number(item.owner.rating).toFixed(1)}
                            </span>
                          </div>
                        )}
                        <span className="text-text-muted text-sm">
                          • {item.owner.items_listed} items listed
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="divider" />

                {/* Availability */}
                <div className="flex items-center gap-3">
                  {item.is_available ? (
                    <>
                      <div className="status-dot-success" />
                      <span className="text-success">Available for rent</span>
                    </>
                  ) : (
                    <>
                      <div className="status-dot-warning" />
                      <span className="text-warning">Currently rented out</span>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                {user?.id !== item.owner_id ? (
                  <div className="space-y-3">
                    <Button
                      fullWidth
                      size="lg"
                      disabled={!item.is_available}
                      onClick={() => setShowRentModal(true)}
                    >
                      Request to Rent
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={handleMessageOwner}
                      disabled={messageOwnerLoading}
                      loading={messageOwnerLoading}
                    >
                      <MessageCircle className="w-5 h-5 mr-2 inline-block" />
                      Message Owner
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20">
                    <div className="flex items-center gap-2 text-accent-primary">
                      <Info className="w-5 h-5" />
                      <span className="font-medium">This is your listing</span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <Link href={`/my-items/${item.id}/edit`} className="flex-1">
                        <Button fullWidth variant="secondary">
                          Edit Listing
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2 inline-block" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Safety note */}
                <div className="p-4 rounded-xl bg-surface-elevated">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-text-muted text-sm">
                      Always meet in a safe, public location. Exchange security deposit and
                      item in person. Report any issues immediately.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Rent Request Modal */}
      <Modal
        isOpen={showRentModal}
        onClose={() => setShowRentModal(false)}
        title="Request to Rent"
        size="lg"
      >
        <form onSubmit={handleRentRequest} className="space-y-6">
          {/* Item summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-elevated">
            {item.images?.[0] && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <Image src={item.images[0]} alt="" fill className="object-cover" />
              </div>
            )}
            <div>
              <p className="font-medium text-text-primary">{item.title}</p>
              <p className="text-text-secondary">
                ₹{item.rent_price_per_day}/day • ₹{item.security_deposit} deposit
              </p>
            </div>
          </div>

          {/* Date selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={rentForm.startDate}
                onChange={(e) => setRentForm({ ...rentForm, startDate: e.target.value })}
                min={item.availability_start}
                max={item.availability_end || undefined}
                required
                className="date-input w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                End Date
              </label>
              <input
                type="date"
                value={rentForm.endDate}
                onChange={(e) => setRentForm({ ...rentForm, endDate: e.target.value })}
                min={rentForm.startDate || item.availability_start}
                max={item.availability_end || undefined}
                required
                className="date-input w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border text-text-primary"
              />
            </div>
          </div>

          {/* Price calculation */}
          {rentForm.startDate && rentForm.endDate && (
            <div className="p-4 rounded-xl bg-surface-elevated space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>
                  ₹{item.rent_price_per_day} x{" "}
                  {differenceInDays(new Date(rentForm.endDate), new Date(rentForm.startDate)) + 1}{" "}
                  days
                </span>
                <span>
                  ₹
                  {(differenceInDays(new Date(rentForm.endDate), new Date(rentForm.startDate)) + 1) *
                    Number(item.rent_price_per_day)}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Security deposit (refundable)</span>
                <span>₹{item.security_deposit}</span>
              </div>
              <div className="divider my-2" />
              <div className="flex justify-between font-semibold text-text-primary">
                <span>Total to pay at pickup</span>
                <span>
                  ₹
                  {(differenceInDays(new Date(rentForm.endDate), new Date(rentForm.startDate)) + 1) *
                    Number(item.rent_price_per_day) +
                    Number(item.security_deposit)}
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          <Textarea
            label="Message to owner (optional)"
            placeholder="Introduce yourself and let the owner know why you'd like to rent this item..."
            value={rentForm.message}
            onChange={(e) => setRentForm({ ...rentForm, message: e.target.value })}
            rows={3}
          />

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowRentModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={submitting}>
              Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete Listing"
      >
        <div className="space-y-6">
          <p className="text-text-secondary">
            Are you sure you want to delete &quot;{item?.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteItem}>
              Delete Listing
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
