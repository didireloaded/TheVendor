import { useEffect, useState } from 'react';
import { DEFAULT_LOCATION, nearestLocation, type CurrentLocation } from '../utils/business';

const CACHE_KEY = 'tv_current_location_v1';
const CACHE_TTL = 1000 * 60 * 30;

interface CachedLocation extends CurrentLocation {
  cachedAt: number;
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<CurrentLocation>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as CachedLocation;
        if (Date.now() - parsed.cachedAt < CACHE_TTL) return parsed;
      }
    } catch {
      // ignore invalid cache
    }
    return DEFAULT_LOCATION;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let cancelled = false;
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async position => {
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        const fallback = nearestLocation(latitude, longitude);
        const resolved = await reverseGeocode(latitude, longitude, fallback);
        if (cancelled) return;
        setLocation(resolved);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...resolved, cachedAt: Date.now() }));
        setIsLoading(false);
      },
      () => setIsLoading(false),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: CACHE_TTL },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { location, isLoading };
}

async function reverseGeocode(latitude: number, longitude: number, fallback: CurrentLocation): Promise<CurrentLocation> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      { signal: controller.signal, headers: { Accept: 'application/json' } },
    );
    window.clearTimeout(timeout);
    if (!response.ok) return fallback;
    const data = await response.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || fallback.city;
    const suburb = address.suburb || address.neighbourhood || address.quarter || fallback.suburb;
    return {
      city,
      suburb,
      latitude,
      longitude,
      label: suburb ? `${city}, ${suburb}` : city,
    };
  } catch {
    return fallback;
  }
}
