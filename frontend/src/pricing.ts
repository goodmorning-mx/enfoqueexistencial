export type Point = [longitude: number, latitude: number];
export type PlaceType = 'inside' | 'outside' | 'event';
export type Plan = 'single' | 'first' | 'monthly';

// Public reference near the Ángel de la Independencia, not a private address.
export const ORIGIN: Point = [-99.1677, 19.427];
export const INCLUDED_RADIUS = 2.5;
export const MINIMUM = 350;
export const BASE = 410;
export const PACKAGE_SIZE = 4;
export const PLACE_SURCHARGES = { inside: 0, outside: 30, event: 60 };
export const HOURS = [15, 17, 19, 21] as const;
export type Hour = (typeof HOURS)[number];
export const HOUR_SURCHARGES: Record<Hour, number> = {
  15: 0, 17: 15, 19: 30, 21: 25,
};
export const DISCOUNTS = { single: 0, first: 60, monthly: 40 };
export const LAST_MINUTE_DISCOUNT = 25;

const timeZone = 'America/Mexico_City';
const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
});
const clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
});
export const money = (value: number) => currency.format(value);
export const hourLabel = (hour: Hour) => `${hour - 12}:00 p. m.`;

export function localToday(now: Date) {
  const parts = dateFormat.formatToParts(now);
  const value = (key: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === key)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function slotKey(date: string, hour: Hour) {
  return `${date}T${hour}:00`;
}

export function minutesUntil(date: string, hour: Hour, now: Date) {
  const nowAsLocal = `${localToday(now)}T${clockFormat.format(now)}Z`;
  return (Date.parse(`${slotKey(date, hour)}:00Z`) - Date.parse(nowAsLocal)) / 60_000;
}

export function distanceKm([lng, lat]: Point) {
  const rad = Math.PI / 180;
  const deltaLat = (lat - ORIGIN[1]) * rad;
  const deltaLng = (lng - ORIGIN[0]) * rad;
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(ORIGIN[1] * rad) * Math.cos(lat * rad) * Math.sin(deltaLng / 2) ** 2;
  return 12_742 * Math.asin(Math.sqrt(a));
}

export function quoteSession(options: {
  point: Point;
  hour: Hour;
  placeType: PlaceType;
  plan: Plan;
  ticket: number;
  lastMinute: boolean;
}) {
  const distance = distanceKm(options.point);
  // Approximate incremental travel cost, rounded to the nearest peso.
  const travel = Math.round(Math.max(0, distance - INCLUDED_RADIUS) * 22);
  const hour = HOUR_SURCHARGES[options.hour];
  const place = PLACE_SURCHARGES[options.placeType];
  const ticket = options.placeType === 'event' ? options.ticket : 0;
  const subtotal = BASE + travel + hour + place;
  const followup = Math.max(MINIMUM, subtotal - DISCOUNTS[options.plan]);
  const first = Math.max(MINIMUM, followup - (options.lastMinute ? LAST_MINUTE_DISCOUNT : 0));
  const sessions = options.plan === 'monthly' ? PACKAGE_SIZE : 1;
  const total = first + (sessions - 1) * followup + sessions * ticket;
  return { distance, travel, hour, place, ticket, discount: subtotal - first, total, perSession: total / sessions };
}
