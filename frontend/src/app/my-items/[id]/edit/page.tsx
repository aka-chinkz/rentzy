"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Input, Textarea, Select, Card, Modal } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Item, ItemCondition, Category } from "@/types";
import { Trash2 } from "lucide-react";
import { itemsAPI } from "@/lib/api";
import toast from "react-hot-toast";

const categories: { value: Category; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "tools", label: "Tools & Equipment" },
  { value: "cameras", label: "Cameras & Photo" },
  { value: "party", label: "Party & Events" },
  { value: "music", label: "Music & Audio" },
  { value: "books", label: "Books & Media" },
  { value: "fashion", label: "Fashion" },
  { value: "other", label: "Other" },
];

const conditionOptions: { value: ItemCondition; label: string }[] = [
  // Keep in sync with DB constraint
  { value: "like_new", label: "Like New - Barely used, excellent condition" },
  { value: "good", label: "Good - Some wear, fully functional" },
  { value: "fair", label: "Fair - Visible wear, works well" },
];

interface EditFormState {
  title: string;
  description: string;
  category_id: string;
  condition: ItemCondition | "";
  rent_price_per_day: string;
  security_deposit: string;
  availability_start: string;
  availability_end: string;
  min_rental_days: string;
  max_rental_days: string;
  pickup_instructions: string;
}

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);

  const itemId = params.id as string;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchItem = async () => {
      try {
        const { data } = await itemsAPI.getItem(itemId);
        const loaded: Item = data.item;

        if (!loaded) {
          toast.error("Item not found");
          router.push("/my-rentals");
          return;
        }

        if (loaded.owner_id !== user.id) {
          toast.error("You can only edit your own listings");
          router.push(`/items/${itemId}`);
          return;
        }

        setItem(loaded);
        setForm({
          title: loaded.title,
          description: loaded.description,
          category_id: loaded.category_id,
          condition: loaded.condition,
          rent_price_per_day: String(loaded.rent_price_per_day),
          security_deposit: String(loaded.security_deposit),
          availability_start: loaded.availability_start?.slice(0, 10),
          availability_end: loaded.availability_end?.slice(0, 10) || "",
          min_rental_days: String(loaded.min_rental_days),
          max_rental_days: loaded.max_rental_days != null ? String(loaded.max_rental_days) : "",
          pickup_instructions: loaded.pickup_instructions || "",
        });
      } catch (error) {
        console.error("Failed to load item for edit:", error);
        toast.error("Could not load listing");
        router.push("/my-rentals");
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [authLoading, user, itemId, router]);

  if (!user || loading || !form) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-text-secondary">Loading listing...</p>
        </div>
      </MainLayout>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await itemsAPI.deleteItem(itemId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.category_id) {
      toast.error("Please select a category");
      return;
    }

    if (!form.condition) {
      toast.error("Please select the item condition");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        condition: form.condition,
        rent_price_per_day: Number(form.rent_price_per_day),
        security_deposit: Number(form.security_deposit),
        availability_start: form.availability_start,
        availability_end: form.availability_end || null,
        min_rental_days: Number(form.min_rental_days),
        max_rental_days: form.max_rental_days ? Number(form.max_rental_days) : null,
        pickup_instructions: form.pickup_instructions || null,
      };

      await itemsAPI.updateItem(itemId, payload);
      toast.success("Listing updated");
      router.push(`/items/${itemId}`);
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string; message?: string } } })?.response
          ?.data?.error ||
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update listing";

      toast.error(msg);
      console.error("Update item error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
            Edit Listing
          </h1>
          <p className="text-text-secondary">
            Update the details of your item. Changes will be visible immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={categories}
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                />
                <Select
                  label="Condition"
                  options={conditionOptions}
                  value={form.condition}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      condition: e.target.value as ItemCondition,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Pricing & Availability
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Rent Price (per day)"
                  type="number"
                  min="1"
                  value={form.rent_price_per_day}
                  onChange={(e) =>
                    setForm({ ...form, rent_price_per_day: e.target.value })
                  }
                  required
                />
                <Input
                  label="Security Deposit"
                  type="number"
                  min="0"
                  value={form.security_deposit}
                  onChange={(e) =>
                    setForm({ ...form, security_deposit: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Available From"
                  type="date"
                  value={form.availability_start}
                  onChange={(e) =>
                    setForm({ ...form, availability_start: e.target.value })
                  }
                  required
                />
                <Input
                  label="Available Until (optional)"
                  type="date"
                  value={form.availability_end}
                  onChange={(e) =>
                    setForm({ ...form, availability_end: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min. Rental Days"
                  type="number"
                  min="1"
                  value={form.min_rental_days}
                  onChange={(e) =>
                    setForm({ ...form, min_rental_days: e.target.value })
                  }
                  required
                />
                <Input
                  label="Max. Rental Days (optional)"
                  type="number"
                  min="1"
                  value={form.max_rental_days}
                  onChange={(e) =>
                    setForm({ ...form, max_rental_days: e.target.value })
                  }
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Pickup Instructions
            </h2>
            <Textarea
              label="Pickup Instructions (optional)"
              placeholder="Any specific instructions for pickup? e.g., 'Ring apartment 5B', 'Meet at the lobby'"
              value={form.pickup_instructions}
              onChange={(e) =>
                setForm({ ...form, pickup_instructions: e.target.value })
              }
              rows={3}
            />
          </Card>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/items/${item!.id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            <div className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2 inline-block" />
                Delete Listing
              </Button>
            </div>
          </div>
        </form>

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
              <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
                Delete Listing
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

