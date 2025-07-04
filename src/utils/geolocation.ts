
import { HUB_COORDINATES } from './constants';

// High-precision Haversine formula for distance calculation
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

export function getDistanceToHub(userLat: number, userLng: number): number {
  return calculateDistance(userLat, userLng, HUB_COORDINATES.lat, HUB_COORDINATES.lng);
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance.toFixed(1)} meters`;
  } else {
    return `${(distance / 1000).toFixed(2)} km`;
  }
}

export const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
};
