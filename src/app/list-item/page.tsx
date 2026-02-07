"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Package,
  Info,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Input, Textarea, Select, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { CreateItemForm, ItemCondition } from "@/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const categories = [
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

const conditionOptions = [
  { value: "new", label: "New - Never used, in original packaging" },
  { value: "like_new", label: "Like New - Barely used, excellent condition" },
  { value: "good", label: "Good - Some wear, fully functional" },
  { value: "fair", label: "Fair - Visible wear, works well" },
];

export default function ListItemPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { location, locationName, requestLocation } = useLocation();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    rent_price_per_day: "",
    security_deposit: "",
    condition: "" as ItemCondition | "",
    availability_start: new Date().toISOString().split("T")[0],
    availability_end: "",
    pickup_location_lat: location?.lat || 0,
    pickup_location_lng: location?.lng || 0,
    pickup_location_name: locationName || "",
    pickup_instructions: "",
    min_rental_days: "1",
    max_rental_days: "",
  });

  // Redirect if not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Card variant="glow" className="py-12">
            <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
              Sign in to list items
            </h1>
            <p className="text-text-secondary mb-6">
              You need an account to list items for rent
            </p>
            <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const img of images) {
      const fileName = `${user.id}/${Date.now()}-${img.file.name}`;
      const { error } = await supabase.storage
        .from("item-images")
        .upload(fileName, img.file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data } = supabase.storage.from("item-images").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (images.length === 0) {
        toast.error("Please add at least one image");
        setLoading(false);
        return;
      }

      if (!form.pickup_location_lat || !form.pickup_location_lng) {
        toast.error("Please set a pickup location");
        setLoading(false);
        return;
      }

      // Upload images
      const imageUrls = await uploadImages();

      if (imageUrls.length === 0) {
        toast.error("Failed to upload images");
        setLoading(false);
        return;
      }

      // Create item
      const { data, error } = await supabase
        .from("items")
        .insert({
          owner_id: user.id,
          title: form.title,
          description: form.description,
          category_id: form.category_id,
          images: imageUrls,
          rent_price_per_day: Number(form.rent_price_per_day),
          security_deposit: Number(form.security_deposit),
          condition: form.condition as ItemCondition,
          availability_start: form.availability_start,
          availability_end: form.availability_end || null,
          pickup_location_lat: form.pickup_location_lat,
          pickup_location_lng: form.pickup_location_lng,
          pickup_location_name: form.pickup_location_name,
          pickup_instructions: form.pickup_instructions || null,
          min_rental_days: Number(form.min_rental_days),
          max_rental_days: form.max_rental_days ? Number(form.max_rental_days) : null,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create listing");
        console.error(error);
        setLoading(false);
        return;
      }

      // Update profile items count
      await supabase
        .from("profiles")
        .update({ items_listed: (profile?.items_listed || 0) + 1 })
        .eq("id", user.id);

      toast.success("Item listed successfully!");
      router.push(`/items/${data.id}`);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }

    setLoading(false);
  };

  const useCurrentLocation = () => {
    if (location && locationName) {
      setForm({
        ...form,
        pickup_location_lat: location.lat,
        pickup_location_lng: location.lng,
        pickup_location_name: locationName,
      });
      toast.success("Location updated");
    } else {
      requestLocation();
      toast("Getting your location...");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
            List an Item for Rent
          </h1>
          <p className="text-text-secondary">
            Share your belongings with the community and earn extra income
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                  step >= s
                    ? "bg-accent-primary text-white"
                    : "bg-surface text-text-muted"
                }`}
              >
                {s}
              </button>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step > s ? "bg-accent-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h2 className="text-xl font-semibold text-text-primary mb-6">
                  Basic Information
                </h2>

                {/* Image upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Photos (up to 6)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                        <Image src={img.preview} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-error text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent-primary flex flex-col items-center justify-center gap-2 text-text-muted hover:text-accent-primary transition-colors"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-xs">Add</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-4">
                  <Input
                    label="Title"
                    placeholder="e.g., Sony A7III Camera with 24-70mm Lens"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />

                  <Textarea
                    label="Description"
                    placeholder="Describe your item in detail. Include features, what's included, any special instructions..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      options={categories}
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      placeholder="Select category"
                    />

                    <Select
                      label="Condition"
                      options={conditionOptions}
                      value={form.condition}
                      onChange={(e) =>
                        setForm({ ...form, condition: e.target.value as ItemCondition })
                      }
                      placeholder="Select condition"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setStep(2)}>
                  Next: Pricing
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h2 className="text-xl font-semibold text-text-primary mb-6">
                  Pricing & Availability
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Rent Price (per day)"
                      type="number"
                      min="1"
                      placeholder="25"
                      icon={<DollarSign className="w-5 h-5" />}
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
                      placeholder="100"
                      icon={<DollarSign className="w-5 h-5" />}
                      value={form.security_deposit}
                      onChange={(e) =>
                        setForm({ ...form, security_deposit: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-background-secondary">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                      <p className="text-text-secondary text-sm">
                        The security deposit is collected in person when the renter picks up
                        the item. It's returned when the item is returned in good condition.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Min. Rental Days"
                      type="number"
                      min="1"
                      placeholder="1"
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
                      placeholder="No limit"
                      value={form.max_rental_days}
                      onChange={(e) =>
                        setForm({ ...form, max_rental_days: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Available From"
                      type="date"
                      icon={<Calendar className="w-5 h-5" />}
                      value={form.availability_start}
                      onChange={(e) =>
                        setForm({ ...form, availability_start: e.target.value })
                      }
                      required
                    />

                    <Input
                      label="Available Until (optional)"
                      type="date"
                      icon={<Calendar className="w-5 h-5" />}
                      value={form.availability_end}
                      onChange={(e) =>
                        setForm({ ...form, availability_end: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Next: Location
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h2 className="text-xl font-semibold text-text-primary mb-6">
                  Pickup Location
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Location
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter pickup location"
                          icon={<MapPin className="w-5 h-5" />}
                          value={form.pickup_location_name}
                          onChange={(e) =>
                            setForm({ ...form, pickup_location_name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <Button type="button" variant="secondary" onClick={useCurrentLocation}>
                        Use Current
                      </Button>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="h-48 rounded-xl bg-background-tertiary flex items-center justify-center">
                    <p className="text-text-muted text-sm">
                      {form.pickup_location_name
                        ? `📍 ${form.pickup_location_name}`
                        : "Set location to see map preview"}
                    </p>
                  </div>

                  <Textarea
                    label="Pickup Instructions (optional)"
                    placeholder="Any specific instructions for pickup? e.g., 'Ring apartment 5B', 'Meet at the lobby'"
                    value={form.pickup_instructions}
                    onChange={(e) =>
                      setForm({ ...form, pickup_instructions: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </Card>

              {/* Review summary */}
              <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Listing Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Title</span>
                    <span className="text-text-primary">{form.title || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Daily Rate</span>
                    <span className="text-text-primary">
                      ${form.rent_price_per_day || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Security Deposit</span>
                    <span className="text-text-primary">
                      ${form.security_deposit || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Location</span>
                    <span className="text-text-primary">
                      {form.pickup_location_name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Photos</span>
                    <span className="text-text-primary">{images.length} uploaded</span>
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" loading={loading}>
                  {loading ? "Creating Listing..." : "Publish Listing"}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </MainLayout>
  );
}
