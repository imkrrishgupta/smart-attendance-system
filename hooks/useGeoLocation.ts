'use client';

import { useEffect, useState } from 'react';

type GeoLocation = {
  latitude: number;
  longitude: number;
};

export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      () => {
        setError('Location permission denied');
        setLoading(false);
      }
    );
  }, []);

  return { location, error, loading };
}
