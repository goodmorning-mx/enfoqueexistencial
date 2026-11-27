import { useEffect, useRef, useState } from 'react';
import Radar from './effects/Radar.jsx';
import { INCLUDED_RADIUS, ORIGIN, type Point } from './pricing';

const BOUNDS: [Point, Point] = [[-99.4, 19.12], [-98.94, 19.61]];
const mapModule = 'https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs';
const boundsPoint = (point: Point): Point => [
  Math.min(BOUNDS[1][0], Math.max(BOUNDS[0][0], point[0])),
  Math.min(BOUNDS[1][1], Math.max(BOUNDS[0][1], point[1])),
];

type LngLat = { lng: number; lat: number };
interface MapView {
  once(event: 'load', handler: () => void): void;
  on(event: 'click', handler: (event: { lngLat: LngLat }) => void): void;
  on(event: 'error', handler: () => void): void;
  getCenter(): LngLat;
  addSource(id: string, source: object): void;
  addLayer(layer: object): void;
  zoomIn(options: { duration: number }): void;
  zoomOut(options: { duration: number }): void;
  resize(): void;
  remove(): void;
}
interface MapMarker {
  setLngLat(point: Point): MapMarker;
  addTo(map: MapView): MapMarker;
  getLngLat(): LngLat;
  on(event: 'drag' | 'dragend', handler: () => void): void;
  remove(): void;
}
type MapModule = {
  Map: new (options: object) => MapView;
  Marker: new (options: object) => MapMarker;
};
const pointOf = ({ lng, lat }: LngLat): Point => [lng, lat];

function includedArea() {
  const [lng, lat] = ORIGIN;
  const latitudeRadius = INCLUDED_RADIUS / 111.195;
  const longitudeRadius = latitudeRadius / Math.cos(lat * Math.PI / 180);
  return Array.from({ length: 65 }, (_, index) => {
    const angle = (index % 64) * 2 * Math.PI / 64;
    return [lng + longitudeRadius * Math.cos(angle), lat + latitudeRadius * Math.sin(angle)];
  });
}

export default function SessionMap({ point, price, onPoint, reducedMotion }: {
  point: Point;
  price: string;
  onPoint: (point: Point) => void;
  reducedMotion: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapView | null>(null);
  const marker = useRef<MapMarker | null>(null);
  const markerLabel = useRef<HTMLSpanElement | null>(null);
  const initial = useRef({ point, price, onPoint });
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let active = true;
    let loaded = false;
    const timeout = window.setTimeout(() => {
      if (!loaded) setStatus('fallback');
    }, 10_000);
    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(host);

    void import(/* @vite-ignore */ mapModule).then((module: MapModule) => {
      if (!active) return;
      const view = new module.Map({
        container: host,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: ORIGIN,
        zoom: 11.6,
        minZoom: 10,
        maxZoom: 17,
        maxBounds: BOUNDS,
        renderWorldCopies: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: false },
      });
      map.current = view;
      view.on('error', () => {
        if (!loaded && active) setStatus('fallback');
      });
      view.once('load', () => {
        if (!active) return;
        loaded = true;
        window.clearTimeout(timeout);
        view.addSource('included-area', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [includedArea()] } },
        });
        view.addLayer({ id: 'included-fill', type: 'fill', source: 'included-area', paint: { 'fill-color': '#c6ff65', 'fill-opacity': 0.085 } });
        view.addLayer({ id: 'included-edge', type: 'line', source: 'included-area', paint: { 'line-color': '#c6ff65', 'line-opacity': 0.8, 'line-width': 1.5, 'line-dasharray': [2, 3] } });
        const element = document.createElement('div');
        element.className = 'quote-marker';
        element.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        label.textContent = initial.current.price;
        element.append(label);
        markerLabel.current = label;
        const pin = new module.Marker({ element, anchor: 'bottom', draggable: true, offset: [0, 4] })
          .setLngLat(initial.current.point).addTo(view);
        marker.current = pin;
        const move = () => {
          const next = boundsPoint(pointOf(pin.getLngLat()));
          initial.current.onPoint(next);
        };
        pin.on('drag', move);
        pin.on('dragend', move);
        view.on('click', event => initial.current.onPoint(boundsPoint(pointOf(event.lngLat))));
        setStatus('ready');
      });
    }).catch(() => {
      if (active) setStatus('fallback');
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      observer.disconnect();
      marker.current?.remove();
      map.current?.remove();
      marker.current = null;
      markerLabel.current = null;
      map.current = null;
    };
  }, []);

  useEffect(() => {
    initial.current = { point, price, onPoint };
    marker.current?.setLngLat(point);
    if (markerLabel.current) markerLabel.current.textContent = price;
  }, [point, price, onPoint]);

  return (
    <div className="map-shell" data-map-status={status}>
      <div ref={container} className="map-base" aria-label="Mapa interactivo de Ciudad de México" />
      <div className="map-radar" aria-hidden="true">
        {!reducedMotion && <Radar color="#bcff67" scale={0.9} speed={0.34} ringCount={4}
          spokeCount={8} targets={0} clutter={0} ticks={false} grain={0} glow={0.6}
          mouseInteraction={false} intro={false} dpr={1} />}
      </div>
      <div className="map-top">
        <span className="map-led"><i /> CDMX</span>
      </div>
      {status !== 'ready' && <p className="map-fallback" role="status">
        {status === 'loading' ? 'Cargando mapa de la ciudad…' : 'Mapa no disponible por el momento.'}
      </p>}
      {status === 'ready' && (
        <div className="map-controls">
          <button type="button" title="Cotizar en el centro del mapa" aria-label="Cotizar en el centro del mapa" onClick={() => {
            if (map.current) onPoint(boundsPoint(pointOf(map.current.getCenter())));
          }}>⌖</button>
          <button type="button" aria-label="Acercar mapa" onClick={() => map.current?.zoomIn({ duration: reducedMotion ? 0 : 240 })}>+</button>
          <button type="button" aria-label="Alejar mapa" onClick={() => map.current?.zoomOut({ duration: reducedMotion ? 0 : 240 })}>−</button>
        </div>
      )}
      {status === 'ready' && <span className="map-crosshair" aria-hidden="true">+</span>}
    </div>
  );
}
