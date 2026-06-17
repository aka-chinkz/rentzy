"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { Button, Card, Input } from "@/components/ui";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevResetUrl(null);

    try {
      const { data } = await authAPI.forgotPassword(email.trim());
      setSent(true);
      if (data.dev_reset_url) {
        setDevResetUrl(data.dev_reset_url);
        toast.success("Development mode: use the reset link shown below");
      } else {
        toast.success("Check your email for reset instructions");
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-accent-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <AuthBrand />
          <h1 className="mb-2 font-display text-2xl font-bold text-text-primary">Forgot Password</h1>
          <p className="text-text-secondary">
            {sent
              ? "If an account exists for that email, we've sent reset instructions."
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <Card glass className="p-8">
          {sent ? (
            <div className="space-y-6 text-center">
              {devResetUrl ? (
                <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/10 p-4 text-left">
                  <p className="mb-2 text-sm font-medium text-text-primary">
                    Email is not configured yet (local dev)
                  </p>
                  <p className="mb-3 text-xs text-text-secondary">
                    Use this one-time reset link instead:
                  </p>
                  <a
                    href={devResetUrl}
                    className="break-all text-sm text-accent-primary hover:underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Didn&apos;t receive it? Check your spam folder or try again in a few minutes.
                </p>
              )}
              <Button variant="secondary" fullWidth onClick={() => { setSent(false); setDevResetUrl(null); }}>
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail className="h-5 w-5" />}
                required
              />

              <Button type="submit" fullWidth loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}

          <Link
            href="/auth/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}
