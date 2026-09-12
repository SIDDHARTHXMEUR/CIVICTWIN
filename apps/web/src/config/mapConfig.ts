// Central map configuration for CivicTwin — Jaipur, Rajasthan, India
export const JAIPUR_CENTER: [number, number] = [26.9124, 75.7873];
export const JAIPUR_ZOOM = 13;
export const JAIPUR_LABEL = "Jaipur, Rajasthan";

// Jaipur bounding box for random anomaly generation
export const JAIPUR_BOUNDS = {
  minLat: 26.82,
  maxLat: 26.98,
  minLng: 75.72,
  maxLng: 75.92,
};

export function randomJaipurCoord(): [number, number] {
  const lat = JAIPUR_BOUNDS.minLat + Math.random() * (JAIPUR_BOUNDS.maxLat - JAIPUR_BOUNDS.minLat);
  const lng = JAIPUR_BOUNDS.minLng + Math.random() * (JAIPUR_BOUNDS.maxLng - JAIPUR_BOUNDS.minLng);
  return [parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))];
}
