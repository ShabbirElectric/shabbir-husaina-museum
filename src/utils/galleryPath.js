/**
 * Gallery Path Offset helper
 * Smoothly curves the walking trajectory around architectural centerpieces:
 * 1. The Grand Monument Statue of Shabbir & Husaina in Room 1 (Z = 3.5)
 * 2. The Feature Art Partition Wall in Room 2 (Z = -23.75)
 */
export function getGalleryPathOffset(z) {
  let offsetX = 0;

  // Detour 1: Grand Monument Statue of Shabbir & Husaina in Room 1
  // Statue center is at X = 0, Z = 3.5.
  // Smoothly curves couple and camera to the right aisle (X = +1.8m) between Z = 9.5 and Z = -2.5
  if (z <= 9.5 && z >= -2.5) {
    const midZ = 3.5;
    const halfWidth = 6.0;
    const norm = (z - midZ) / halfWidth; // -1 to +1
    const curve = Math.cos(norm * (Math.PI / 2));
    offsetX += 1.8 * Math.max(0, curve);
  }

  // Detour 2: Feature Art Partition Wall in Room 2 (Photo 8 & 9)
  // Partition wall is at Z = -23.75, width 3.6m (X = -1.8 to +1.8).
  // Smoothly curves through the spacious right gallery walkway (X = +2.0m) between Z = -18.5 and Z = -29.0
  if (z <= -18.5 && z >= -29.0) {
    const midZ = -23.75;
    const halfWidth = 5.25;
    const norm = (z - midZ) / halfWidth;
    const curve = Math.cos(norm * (Math.PI / 2));
    offsetX += 2.0 * Math.max(0, curve);
  }

  return offsetX;
}
