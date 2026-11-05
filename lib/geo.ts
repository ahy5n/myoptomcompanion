// Small geography helpers that are safe to use in the browser.

/** Straight-line distance in km. */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = Math.PI / 180
  const h =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}
