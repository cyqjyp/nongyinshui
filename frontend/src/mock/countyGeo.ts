import { villages } from './villages';

/**
 * The platform's pilot villages don't have official administrative boundary
 * GeoJSON on hand, so we synthesize a simple hexagonal "territory" polygon
 * around each village's centroid. This is purely illustrative — enough to
 * drive an extruded 3D region on the dashboard map without depending on an
 * external map-tile/GeoJSON service (keeps the demo fully offline-capable).
 */
function hexagonAround(lat: number, lng: number, radiusDeg: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    const dx = radiusDeg * Math.cos(angle) * 1.15;
    const dy = radiusDeg * Math.sin(angle);
    points.push([Number((lng + dx).toFixed(5)), Number((lat + dy).toFixed(5))]);
  }
  points.push(points[0]);
  return points;
}

export const countyGeoJson = {
  type: 'FeatureCollection' as const,
  features: villages.map((village) => ({
    type: 'Feature' as const,
    properties: { name: village.name, id: village.id },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [hexagonAround(village.location.lat, village.location.lng, 0.028)],
    },
  })),
};

export const COUNTY_MAP_NAME = 'pilotCounty';
