"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface LocationContextType {
  location: { lat: number; lng: number } | null;
  locationName: string | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  calculateDistance: (lat: number, lng: number) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const address = data.address || {};
      const parts = [address.suburb || address.neighbourhood, address.city || address.town || address.village, address.state].filter(Boolean);
      setLocationName(parts.join(", ") || "Unknown Location");
    } catch {
      setLocationName("Unknown Location");
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const calculateDistance = useCallback(
    (lat: number, lng: number): number | null => {
      if (!location) return null;

      const R = 6371;
      const dLat = ((lat - location.lat) * Math.PI) / 180;
      const dLng = ((lng - location.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((location.lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    },
    [location]
  );

  useEffect(() => {
    const saved = localStorage.getItem("rentzy_location");
    if (saved) {
      try {
        const { lat, lng, name } = JSON.parse(saved);
        setLocation({ lat, lng });
        setLocationName(name);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (location && locationName) {
      localStorage.setItem("rentzy_location", JSON.stringify({ ...location, name: locationName }));
    }
  }, [location, locationName]);

  return (
    <LocationContext.Provider
      value={{ location, locationName, loading, error, requestLocation, calculateDistance }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
