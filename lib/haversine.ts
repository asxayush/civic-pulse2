/**
 * Haversine formula — calculates distance between two GPS coordinates in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

/**
 * Check if the current time is within the attendance window (9PM - 11PM IST)
 */
export function isAttendanceWindowOpen(): boolean {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset - now.getTimezoneOffset() * 60 * 1000);
  const hours = istNow.getHours();
  return hours >= 21 && hours < 23;
}

/**
 * Format meters to human-readable distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

// Hostel reference coordinates (placeholder — update with actual coords)
export const HOSTEL_COORDINATES = {
  lat: 28.6139, // Delhi placeholder
  lon: 77.2090,
  name: "Main Hostel Block",
};

export const ATTENDANCE_RADIUS_METERS = 10;
