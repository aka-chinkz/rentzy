"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  MapPin,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button, Card, Input, Modal } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { location, locationName, requestLocation } = useLocation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // In production, you would call a server action to delete the account
    toast.error("Account deletion is not implemented in demo mode");
    setDeleting(false);
    setShowDeleteModal(false);
  };

  const handleUpdateLocation = async () => {
    if (location && locationName) {
      const { error } = await updateProfile({
        location_lat: location.lat,
        location_lng: location.lng,
        location_name: locationName,
      });

      if (error) {
        toast.error("Failed to update location");
      } else {
        toast.success("Location updated");
      }
    } else {
      requestLocation();
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-8">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Account section */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-accent-primary" />
              Account
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary">Email</p>
                  <p className="text-sm text-text-muted">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary">Full Name</p>
                  <p className="text-sm text-text-muted">
                    {profile?.full_name || "Not set"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/profile")}
                >
                  Edit
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-text-primary">Phone</p>
                  <p className="text-sm text-text-muted">
                    {profile?.phone || "Not set"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/profile")}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Card>

          {/* Location section */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-primary" />
              Location
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-text-primary">Current Location</p>
                  <p className="text-sm text-text-muted">
                    {profile?.location_name || locationName || "Not set"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleUpdateLocation}>
                  {location ? "Update" : "Enable"}
                </Button>
              </div>
            </div>

            <p className="text-xs text-text-muted mt-4">
              Your location helps us show you items nearby. It's used for distance
              calculations and is visible to others as a general area.
            </p>
          </Card>

          {/* Notifications section */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent-primary" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary">Push Notifications</p>
                  <p className="text-sm text-text-muted">
                    Receive notifications in your browser
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary">Email Notifications</p>
                  <p className="text-sm text-text-muted">
                    Receive updates via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-text-primary">New Messages</p>
                  <p className="text-sm text-text-muted">
                    Get notified about new messages
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-white"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Privacy section */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-primary" />
              Privacy & Security
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary">Show phone number</p>
                  <p className="text-sm text-text-muted">
                    Visible to users you're renting with
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-text-primary">Change Password</p>
                  <p className="text-sm text-text-muted">
                    Update your account password
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="border-error/30">
            <h2 className="text-lg font-semibold text-error mb-4">Danger Zone</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary">Sign Out</p>
                  <p className="text-sm text-text-muted">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<LogOut className="w-4 h-4" />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>

              <div className="divider" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary">Delete Account</p>
                  <p className="text-sm text-text-muted">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete your account? This action cannot be
            undone. All your data, listings, and reviews will be permanently
            removed.
          </p>

          <div className="p-4 rounded-xl bg-error/10 border border-error/20">
            <p className="text-sm text-error">
              ⚠️ This will immediately delete:
            </p>
            <ul className="text-sm text-text-secondary mt-2 space-y-1">
              <li>• Your profile and account data</li>
              <li>• All your item listings</li>
              <li>• Your rental history</li>
              <li>• Reviews you've written and received</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
