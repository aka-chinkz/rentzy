"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  Check,
  X,
  MessageCircle,
  Star,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Card, Avatar, Badge, Modal, Textarea, Rating } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { RentalRequest, Item, Profile, RentalStatus } from "@/types";
import { rentalsAPI, reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { format, differenceInDays, isPast } from "date-fns";

const statusConfig: Record<RentalStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "warning", icon: Clock },
  approved: { label: "Approved", color: "success", icon: Check },
  rejected: { label: "Rejected", color: "error", icon: X },
  cancelled: { label: "Cancelled", color: "neutral", icon: X },
  rented: { label: "Rented", color: "primary", icon: Package },
  returned: { label: "Returned", color: "success", icon: Check },
};

type RentalWithDetails = RentalRequest & {
  item: Item;
  renter: Profile;
  owner: Profile;
};

export default function MyRentalsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"as_renter" | "as_owner">("as_renter");
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalWithDetails | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const role = activeTab === "as_renter" ? "renter" : "owner";
      const { data } = await rentalsAPI.getRentals(role);
      if (data?.rentals) {
        setRentals(data.rentals);
      }
    } catch (error) {
      console.error("Failed to fetch rentals:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchRentals();
  }, [user, activeTab, router]);

  const handleUpdateStatus = async (rentalId: string, status: RentalStatus, response?: string) => {
    try {
      await rentalsAPI.updateRentalStatus(rentalId, status, response);
      toast.success(`Request ${status}`);
      fetchRentals();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleLeaveReview = async () => {
    if (!selectedRental || !user || reviewForm.rating === 0) return;

    setSubmittingReview(true);

    try {
      await reviewsAPI.createReview({
        rental_request_id: selectedRental.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });

      toast.success("Review submitted!");
      setShowReviewModal(false);
      setReviewForm({ rating: 0, comment: "" });
      setSelectedRental(null);
    } catch (error) {
      toast.error("Failed to submit review");
    }
    setSubmittingReview(false);
  };

  const openReviewModal = (rental: RentalWithDetails) => {
    setSelectedRental(rental);
    setShowReviewModal(true);
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-6">
          My Rentals
        </h1>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("as_renter")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "as_renter"
                ? "bg-accent-primary/20 text-accent-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Items I'm Renting
          </button>
          <button
            onClick={() => setActiveTab("as_owner")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "as_owner"
                ? "bg-accent-primary/20 text-accent-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Rental Requests
          </button>
        </div>

        {/* Rentals list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-surface rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-surface rounded w-1/2" />
                    <div className="h-4 bg-surface rounded w-1/3" />
                    <div className="h-4 bg-surface rounded w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : rentals.length > 0 ? (
          <div className="space-y-4">
            {rentals.map((rental) => {
              const status = statusConfig[rental.status];
              const StatusIcon = status.icon;
              const otherUser = activeTab === "as_renter" ? rental.owner : rental.renter;
              const canReview =
                rental.status === "returned" &&
                !isPast(new Date(rental.updated_at));

              return (
                <Card key={rental.id}>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Item image */}
                    <Link
                      href={`/items/${rental.item.id}`}
                      className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden shrink-0"
                    >
                      {rental.item.images?.[0] ? (
                        <Image
                          src={rental.item.images[0]}
                          alt={rental.item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                          <Package className="w-8 h-8 text-text-muted" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            href={`/items/${rental.item.id}`}
                            className="font-semibold text-text-primary hover:text-accent-primary transition-colors"
                          >
                            {rental.item.title}
                          </Link>
                          <Badge variant={status.color as any} className="ml-2">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-text-primary">
                          ${rental.total_price}
                        </p>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(rental.start_date), "MMM d")} -{" "}
                            {format(new Date(rental.end_date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <span>• {rental.total_days} days</span>
                      </div>

                      {/* Other user */}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar src={otherUser.avatar_url} size="sm" />
                        <div>
                          <span className="text-sm text-text-muted">
                            {activeTab === "as_renter" ? "Owner:" : "Renter:"}
                          </span>{" "}
                          <Link
                            href={`/user/${otherUser.id}`}
                            className="text-sm text-text-primary hover:text-accent-primary"
                          >
                            {otherUser.full_name}
                          </Link>
                        </div>
                      </div>

                      {/* Message */}
                      {rental.message && (
                        <p className="text-sm text-text-secondary bg-background-secondary rounded-lg p-2 mb-3">
                          "{rental.message}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {activeTab === "as_owner" && rental.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(rental.id, "approved")}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleUpdateStatus(rental.id, "rejected")}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}

                        {rental.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(rental.id, "rented")}
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Mark as Picked Up
                          </Button>
                        )}

                        {rental.status === "rented" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(rental.id, "returned")}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Mark as Returned
                          </Button>
                        )}

                        {rental.status === "returned" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openReviewModal(rental)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Leave Review
                          </Button>
                        )}

                        <Link href={`/messages/${rental.id}`}>
                          <Button size="sm" variant="ghost">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {activeTab === "as_renter" ? "No rentals yet" : "No requests yet"}
            </h3>
            <p className="text-text-secondary mb-6">
              {activeTab === "as_renter"
                ? "Browse items to start renting"
                : "List items to receive rental requests"}
            </p>
            <Link href={activeTab === "as_renter" ? "/browse" : "/list-item"}>
              <Button>
                {activeTab === "as_renter" ? "Browse Items" : "List an Item"}
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Leave a Review"
      >
        {selectedRental && (
          <div className="space-y-6">
            {/* Item info */}
            <div className="flex items-center gap-3 p-3 glass rounded-xl">
              {selectedRental.item.images?.[0] && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={selectedRental.item.images[0]}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-text-primary">
                  {selectedRental.item.title}
                </p>
                <p className="text-sm text-text-secondary">
                  Rate your experience with{" "}
                  {activeTab === "as_renter"
                    ? selectedRental.owner.full_name
                    : selectedRental.renter.full_name}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-3">
                How was your experience?
              </p>
              <Rating
                value={reviewForm.rating}
                size="lg"
                interactive
                onChange={(val) => setReviewForm({ ...reviewForm, rating: val })}
              />
            </div>

            {/* Comment */}
            <Textarea
              label="Comment (optional)"
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              rows={3}
            />

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={submittingReview}
                disabled={reviewForm.rating === 0}
                onClick={handleLeaveReview}
              >
                Submit Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
