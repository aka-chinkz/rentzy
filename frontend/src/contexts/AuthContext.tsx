"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, usersAPI } from "@/lib/api";
import { Profile } from "@/types";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndProfile = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.user) {
        setUser(data.user);
        setProfile(data.profile || null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("rentzy_token");
    if (token) {
      fetchUserAndProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Check URL for tokens from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlRefresh = params.get("refresh");
    if (urlToken && urlRefresh) {
      localStorage.setItem("rentzy_token", urlToken);
      localStorage.setItem("rentzy_refresh_token", urlRefresh);
      window.history.replaceState({}, "", window.location.pathname);
      fetchUserAndProfile().finally(() => setLoading(false));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await authAPI.signIn(email, password);
    localStorage.setItem("rentzy_token", data.access_token);
    localStorage.setItem("rentzy_refresh_token", data.refresh_token);
    setUser(data.user);
    setProfile(data.profile || null);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data } = await authAPI.signUp(email, password, fullName);
    localStorage.setItem("rentzy_token", data.access_token);
    localStorage.setItem("rentzy_refresh_token", data.refresh_token);
    setUser(data.user);
    setProfile(data.profile || null);
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } finally {
      localStorage.removeItem("rentzy_token");
      localStorage.removeItem("rentzy_refresh_token");
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const { data: updated } = await usersAPI.updateProfile(data);
    setProfile(updated.profile);
  };

  const refreshProfile = async () => {
    await fetchUserAndProfile();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
