import { useEffect, useState } from 'react';

interface GeoState {
  lat?: number;
  lng?: number;
  loading: boolean;
  error?: string;
}

export function useGeoValidation() {
  const [state, setState] = useState<GeoState>({ loading: true });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ loading: false, error: 'Geolocation unavailable' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          loading: false,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setState({ loading: false, error: 'Unable to fetch GPS' }),
      { timeout: 3000 },
    );
  }, []);

  return state;
}
