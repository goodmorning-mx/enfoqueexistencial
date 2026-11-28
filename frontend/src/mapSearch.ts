import type { Point } from './pricing';

export const MAP_BOUNDS: [Point, Point] = [[-99.4, 19.12], [-98.94, 19.61]];

export type AddressMatch = { label: string; point: Point; approximate: boolean };

export function isInMapBounds([lng, lat]: Point) {
  const [[west, south], [east, north]] = MAP_BOUNDS;
  return lng >= west && lng <= east && lat >= south && lat <= north;
}

function addressMatches(payload: unknown): AddressMatch[] {
  if (!payload || typeof payload !== 'object' || !('features' in payload) || !Array.isArray(payload.features)) {
    throw new Error('Invalid address search response');
  }

  const matches = new Map<string, AddressMatch>();
  for (const feature of payload.features) {
    const coords = feature?.geometry?.coordinates;
    if (feature?.geometry?.type !== 'Point' || !Array.isArray(coords)) continue;
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') continue;
    const point: Point = [lng, lat];
    if (!isInMapBounds(point)) continue;

    const properties = feature.properties;
    const field = (key: string) => typeof properties?.[key] === 'string' ? properties[key].trim() as string : '';
    const street = field('street') || (field('osm_key') === 'highway' ? field('name') : '');
    if (!street) continue;
    const number = field('housenumber');
    const locality = field('district') || field('locality');
    const label = [[street, number].filter(Boolean).join(' '), locality, field('postcode'), field('city')]
      .filter((part, index, parts) => part && parts.indexOf(part) === index).join(', ');
    if (!matches.has(label)) matches.set(label, { point, label, approximate: !number });
  }
  return [...matches.values()].sort((a, b) => Number(a.approximate) - Number(b.approximate)).slice(0, 6);
}

export async function searchAddresses(query: string, signal: AbortSignal) {
  const url = new URL('https://photon.komoot.io/api/');
  url.search = new URLSearchParams({
    q: query,
    bbox: MAP_BOUNDS.flat().join(','),
    countrycode: 'MX',
    limit: '12',
  }).toString();
  url.searchParams.append('layer', 'house');
  url.searchParams.append('layer', 'street');
  const response = await fetch(url, { signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Address search unavailable');
  return addressMatches(await response.json());
}
