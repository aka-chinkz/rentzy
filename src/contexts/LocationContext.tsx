"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { LocationCoords } from "@/types";

interface LocationContextType {
  location: LocationCoords | null;
  locationName: string | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  setManualLocation: (coords: LocationCoords, name: string) => void;
  calculateDistance: (targetLat: number, targetLng: number) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Haversine formula to calculate distance between two points
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Reverse geocoding using OpenStreetMap Nominatim (free)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        headers: {
          "User-Agent": "Rentzy App",
        },
      }
    );
    const data = await response.json();
    
    if (data.address) {
      const { city, town, village, suburb, neighbourhood, county } = data.address;
      return city || town || village || suburb || neighbourhood || county || "Unknown location";
    }
    return "Unknown location";
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "Unknown location";
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to get saved location from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rentzy_location");
    if (saved) {
      try {
        const { coords, name } = JSON.parse(saved);
        setLocation(coords);
        setLocationName(name);
      } catch (e) {
        localStorage.removeItem("rentzy_location");
      }
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);

        // Get location name
        const name = await reverseGeocode(coords.lat, coords.lng);
        setLocationName(name);

        // Save to localStorage
        localStorage.setItem(
          "rentzy_location",
          JSON.stringify({ coords, name })
        );

        setLoading(false);
      },
      (error) => {
        setError(
          error.code === 1
            ? "Location access denied. Please enable location services."
            : "Unable to get your location. Please try again."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const setManualLocation = (coords: LocationCoords, name: string) => {
    setLocation(coords);
    setLocationName(name);
    localStorage.setItem("rentzy_location", JSON.stringify({ coords, name }));
  };

  const calculateDistance = (targetLat: number, targetLng: number): number | null => {
    if (!location) return null;
    return getDistanceKm(location.lat, location.lng, targetLat, targetLng);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        locationName,
        loading,
        error,
        requestLocation,
        setManualLocation,
        calculateDistance,
      }}
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
