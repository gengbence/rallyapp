import type { GeoPoint } from './stage-timing';

/** Google Maps link koordinátára vagy címre (Maps URLs API, nem kell kulcs). */
export function mapsSearchUrl(target: GeoPoint | string): string {
  const query = typeof target === 'string' ? target : `${target.lat},${target.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Útvonaltervezés Google Maps-ben a megadott célhoz. */
export function mapsDirectionsUrl(target: GeoPoint | string): string {
  const dest = typeof target === 'string' ? target : `${target.lat},${target.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}
